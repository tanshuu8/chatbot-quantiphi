import mongoose from 'mongoose';

/**
 * Conversation — stores the chat session title, selected tone, and timestamps.
 * Messages are stored separately in the Message collection.
 */
const ConversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: 'New Chat',
      maxLength: 100,
    },
    tone: {
      type: String,
      enum: ['Professional', 'Casual', 'Concise'],
      default: 'Professional',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch recent conversations
ConversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
