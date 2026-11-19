import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import * as conversationService from '../services/conversationService.js';
import { createChatCompletionStream } from '../services/openaiService.js';

/**
 * Helper to write SSE data formatted cleanly for clients
 */
const sendSSE = (res, type, payload) => {
  res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
  if (res.flush) res.flush();
};

/**
 * Handle POST /api/chat/:id - Send message & Stream AI response
 */
export const sendMessageStream = async (req, res) => {
  const { id } = req.params;
  const { message, tone } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid conversation ID format',
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message content is required and cannot be empty',
    });
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found',
    });
  }

  // Update tone if valid tone provided
  const validTones = ['Professional', 'Casual', 'Concise'];
  if (tone && validTones.includes(tone)) {
    conversation.tone = tone;
  }

  // 1. Save user message to database
  const userMessage = await conversationService.saveMessage(
    conversation._id,
    'user',
    message.trim()
  );

  // 2. Automatically generate title if default 'New Chat'
  await conversationService.updateTitleIfDefault(conversation._id, message.trim());
  await conversation.save();

  // 3. Prepare SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // 4. Send initial SSE event with user message confirmation
  sendSSE(res, 'user_message', { message: userMessage });

  // 5. Setup AbortController for client disconnect
  const abortController = new AbortController();
  let clientDisconnected = false;

  req.on('close', () => {
    clientDisconnected = true;
    abortController.abort();
  });

  let fullAssistantText = '';

  try {
    // 6. Retrieve recent message history for context
    const history = await conversationService.getMessagesForContext(conversation._id, 20);

    // 7. Request OpenAI streaming completion
    const stream = await createChatCompletionStream({
      tone: conversation.tone,
      history,
      signal: abortController.signal,
    });

    for await (const chunk of stream) {
      if (clientDisconnected) break;

      const delta = chunk.choices?.[0]?.delta?.content || '';
      if (delta) {
        fullAssistantText += delta;
        sendSSE(res, 'chunk', { content: delta });
      }
    }

    if (!clientDisconnected) {
      // 8. Save completed assistant response to MongoDB
      const savedAssistantMessage = await conversationService.saveMessage(
        conversation._id,
        'assistant',
        fullAssistantText
      );

      const refreshedConversation = await Conversation.findById(conversation._id).lean();

      // 9. Send stream completion event
      sendSSE(res, 'done', {
        message: savedAssistantMessage,
        conversation: refreshedConversation,
      });

      res.end();
    }
  } catch (error) {
    console.error('[ChatController] Streaming error:', error.message);

    if (!clientDisconnected) {
      sendSSE(res, 'error', {
        error: error.message || 'An error occurred while streaming the AI response.',
      });
      res.end();
    }
  }
};

/**
 * Handle POST /api/chat/:id/regenerate - Regenerate previous assistant response
 */
export const regenerateResponseStream = async (req, res) => {
  const { id } = req.params;
  const { tone } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid conversation ID format',
    });
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found',
    });
  }

  const validTones = ['Professional', 'Casual', 'Concise'];
  if (tone && validTones.includes(tone)) {
    conversation.tone = tone;
    await conversation.save();
  }

  try {
    // Remove last assistant message to prepare for regeneration
    await conversationService.prepareForRegeneration(conversation._id);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send regenerate_started event so frontend knows previous assistant response is discarded
  sendSSE(res, 'regenerate_started', {});

  const abortController = new AbortController();
  let clientDisconnected = false;

  req.on('close', () => {
    clientDisconnected = true;
    abortController.abort();
  });

  let fullAssistantText = '';

  try {
    const history = await conversationService.getMessagesForContext(conversation._id, 20);

    const stream = await createChatCompletionStream({
      tone: conversation.tone,
      history,
      signal: abortController.signal,
    });

    for await (const chunk of stream) {
      if (clientDisconnected) break;

      const delta = chunk.choices?.[0]?.delta?.content || '';
      if (delta) {
        fullAssistantText += delta;
        sendSSE(res, 'chunk', { content: delta });
      }
    }

    if (!clientDisconnected) {
      const savedAssistantMessage = await conversationService.saveMessage(
        conversation._id,
        'assistant',
        fullAssistantText
      );

      const refreshedConversation = await Conversation.findById(conversation._id).lean();

      sendSSE(res, 'done', {
        message: savedAssistantMessage,
        conversation: refreshedConversation,
      });

      res.end();
    }
  } catch (error) {
    console.error('[ChatController] Regenerate error:', error.message);

    if (!clientDisconnected) {
      sendSSE(res, 'error', {
        error: error.message || 'An error occurred while regenerating the AI response.',
      });
      res.end();
    }
  }
};
