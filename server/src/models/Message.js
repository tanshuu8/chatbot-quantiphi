import mongoose from 'mongoose';

/**
 * Message — a single chat turn belonging to a Conversation.
 * role is 'user' | 'assistant' | 'system'; content is the full message text.
 */
const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying messages within a conversation ordered by time
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', MessageSchema);
