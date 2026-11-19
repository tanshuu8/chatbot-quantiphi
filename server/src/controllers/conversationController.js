import * as conversationService from '../services/conversationService.js';
import mongoose from 'mongoose';

export const createConversationController = async (req, res, next) => {
  try {
    const { title = 'New Chat', tone = 'Professional' } = req.body;
    const validTones = ['Professional', 'Casual', 'Concise'];
    const chosenTone = validTones.includes(tone) ? tone : 'Professional';

    const conversation = await conversationService.createConversation({
      title: title.trim() || 'New Chat',
      tone: chosenTone,
    });

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const listConversationsController = async (req, res, next) => {
  try {
    const conversations = await conversationService.listConversations();
    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format',
      });
    }

    const conversation = await conversationService.getConversationWithMessages(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format',
      });
    }

    const deleted = await conversationService.deleteConversation(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation and messages deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

export const updateConversationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, tone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format',
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (tone !== undefined) {
      const validTones = ['Professional', 'Casual', 'Concise'];
      if (!validTones.includes(tone)) {
        return res.status(400).json({
          success: false,
          error: `Tone must be one of: ${validTones.join(', ')}`,
        });
      }
      updateData.tone = tone;
    }

    const updated = await conversationService.updateConversation(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
