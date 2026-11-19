import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const createConversation = async ({ title = 'New Chat', tone = 'Professional' } = {}) => {
  const conversation = await Conversation.create({ title, tone });
  return conversation;
};

export const listConversations = async () => {
  return Conversation.find().sort({ updatedAt: -1 }).lean();
};

export const getConversationWithMessages = async (id) => {
  const conversation = await Conversation.findById(id).lean();
  if (!conversation) return null;

  const messages = await Message.find({ conversationId: id })
    .sort({ createdAt: 1 })
    .lean();

  return {
    ...conversation,
    messages,
  };
};

export const deleteConversation = async (id) => {
  const conversation = await Conversation.findByIdAndDelete(id);
  if (!conversation) return null;

  // Also delete all associated messages
  await Message.deleteMany({ conversationId: id });
  return conversation;
};

export const updateConversation = async (id, updateData) => {
  const allowed = {};
  if (updateData.title !== undefined) allowed.title = updateData.title.trim();
  if (updateData.tone !== undefined) allowed.tone = updateData.tone;

  const conversation = await Conversation.findByIdAndUpdate(
    id,
    { $set: allowed },
    { new: true, runValidators: true }
  ).lean();

  return conversation;
};

export const saveMessage = async (conversationId, role, content) => {
  const message = await Message.create({
    conversationId,
    role,
    content,
  });

  // Touch conversation's updatedAt
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { updatedAt: new Date() },
  });

  return message;
};

export const getMessagesForContext = async (conversationId, limit = 20) => {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Reverse so they are in chronological order
  return messages.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));
};

/**
 * Remove the last assistant message from a conversation so regenerate can rerun
 * the prompt without creating duplicate assistant messages or duplicating user messages.
 */
export const prepareForRegeneration = async (conversationId) => {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(2);

  if (!messages || messages.length === 0) {
    throw new Error('No messages found to regenerate.');
  }

  let lastUserMessage = null;

  if (messages[0].role === 'assistant') {
    // Delete the last assistant message
    await Message.findByIdAndDelete(messages[0]._id);
    if (messages[1] && messages[1].role === 'user') {
      lastUserMessage = messages[1];
    } else {
      // Find the most recent user message
      lastUserMessage = await Message.findOne({
        conversationId,
        role: 'user',
      }).sort({ createdAt: -1 });
    }
  } else if (messages[0].role === 'user') {
    // If last was user message (e.g. streaming failed earlier before assistant message saved)
    lastUserMessage = messages[0];
  }

  if (!lastUserMessage) {
    throw new Error('No user message found to regenerate response for.');
  }

  return lastUserMessage;
};

/**
 * Automatically update conversation title if it is default 'New Chat'
 */
export const updateTitleIfDefault = async (conversationId, firstMessageText) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return null;

  if (conversation.title === 'New Chat') {
    // Generate clean concise title from user's message
    const clean = firstMessageText.replace(/\s+/g, ' ').trim();
    const title = clean.length > 36 ? `${clean.slice(0, 36)}...` : clean;
    conversation.title = title || 'New Chat';
    await conversation.save();
  }
  return conversation;
};
