import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { conversationApi } from '../services/api';
import { streamChatResponse } from '../services/sseStream';

const ChatContext = createContext(null);

export const TONES = {
  Professional: {
    label: 'Professional',
    description: 'Structured, clear & formal',
    systemInstruction: 'Respond in a professional, structured, and clear manner.',
  },
  Casual: {
    label: 'Casual',
    description: 'Friendly, conversational & natural',
    systemInstruction: 'Respond naturally, conversationally, and in a friendly tone.',
  },
  Concise: {
    label: 'Concise',
    description: 'Brief, direct & essential',
    systemInstruction: 'Respond briefly, directly, and focus on essential information.',
  },
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tone, setTone] = useState('Professional');
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  /**
   * Load all conversations on mount
   */
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      // Load sidebar history without selecting any conversation
      const list = await conversationApi.list();
      setConversations(list);

      // Always start fresh on load/refresh — show empty New Chat hero
      setCurrentConversationId(null);
      setCurrentConversation(null);
      setTone('Professional');
      setMessages([]);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /**
   * Select and load an existing conversation
   */
  const selectConversation = async (id) => {
    if (id === currentConversationId) return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
    }

    try {
      setError(null);
      setIsLoading(true);
      const data = await conversationApi.get(id);
      setCurrentConversationId(data._id);
      setCurrentConversation(data);
      setTone(data.tone || 'Professional');
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new blank conversation and set it as the active view.
   * @param {string} [preferredTone] - Initial tone; defaults to the current tone
   * @returns {Promise<Object|undefined>} The newly created conversation object
   */
  const createNewConversation = async (preferredTone = tone) => {
    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
    }

    try {
      setError(null);
      const newConv = await conversationApi.create({
        title: 'New Chat',
        tone: preferredTone,
      });

      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(newConv._id);
      setCurrentConversation(newConv);
      setTone(newConv.tone || 'Professional');
      setMessages([]);
      return newConv;
    } catch (err) {
      setError(err.message || 'Failed to create new conversation');
    }
  };

  /**
   * Delete a conversation
   */
  const deleteConversation = async (id, e) => {
    if (e) e.stopPropagation();

    try {
      setError(null);
      await conversationApi.delete(id);

      const remaining = conversations.filter((c) => c._id !== id);
      setConversations(remaining);

      if (id === currentConversationId) {
        // After deleting the active conversation, return to empty New Chat state
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsStreaming(false);
          setStreamingContent('');
        }
        setCurrentConversationId(null);
        setCurrentConversation(null);
        setTone('Professional');
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete conversation');
    }
  };

  /**
   * Change tone for active conversation
   */
  const changeTone = async (newTone) => {
    if (!TONES[newTone]) return;
    setTone(newTone);

    if (currentConversationId) {
      try {
        const updated = await conversationApi.update(currentConversationId, { tone: newTone });
        setCurrentConversation(updated);
        setConversations((prev) =>
          prev.map((c) => (c._id === updated._id ? { ...c, tone: updated.tone } : c))
        );
      } catch (err) {
        console.error('Failed to update tone in database:', err);
      }
    }
  };

  /**
   * Send a user message and stream the AI response via SSE.
   * Creates a new conversation automatically if none is active.
   * @param {string} messageText - The user's input text
   */
  const sendMessage = async (messageText) => {
    if (!messageText || !messageText.trim() || isStreaming) return;
    const cleanText = messageText.trim();
    setError(null);

    let convId = currentConversationId;

    // If no active conversation, create one first
    if (!convId) {
      const created = await createNewConversation();
      if (!created) return;
      convId = created._id;
    }

    setIsStreaming(true);
    setStreamingContent('');

    // Optimistically add user message placeholder while SSE initializes
    const tempUserId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { _id: tempUserId, role: 'user', content: cleanText, createdAt: new Date().toISOString() },
    ]);

    const controller = streamChatResponse(
      `/api/chat/${convId}`,
      { message: cleanText, tone },
      {
        onUserMessage: (savedUserMsg) => {
          // Replace optimistic user message with database saved message
          setMessages((prev) =>
            prev.map((m) => (m._id === tempUserId ? savedUserMsg : m))
          );
        },
        onChunk: (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        onDone: ({ message: savedAssistantMsg, conversation: updatedConv }) => {
          setIsStreaming(false);
          setStreamingContent('');
          setMessages((prev) => [...prev, savedAssistantMsg]);

          if (updatedConv) {
            setCurrentConversation(updatedConv);
            setConversations((prev) => {
              const without = prev.filter((c) => c._id !== updatedConv._id);
              return [updatedConv, ...without];
            });
          }
        },
        onError: (errorMsg) => {
          setIsStreaming(false);
          setStreamingContent('');
          setError(errorMsg);
        },
      }
    );

    abortControllerRef.current = controller;
  };

  /**
   * Regenerate previous assistant response
   */
  const regenerateResponse = async () => {
    if (isStreaming || !currentConversationId || messages.length === 0) return;
    setError(null);

    setIsStreaming(true);
    setStreamingContent('');

    const controller = streamChatResponse(
      `/api/chat/${currentConversationId}/regenerate`,
      { tone },
      {
        onRegenerateStarted: () => {
          // Remove the previous assistant message from UI
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return prev.slice(0, -1);
            }
            return prev;
          });
        },
        onChunk: (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        onDone: ({ message: savedAssistantMsg, conversation: updatedConv }) => {
          setIsStreaming(false);
          setStreamingContent('');
          setMessages((prev) => [...prev, savedAssistantMsg]);

          if (updatedConv) {
            setCurrentConversation(updatedConv);
            setConversations((prev) => {
              const without = prev.filter((c) => c._id !== updatedConv._id);
              return [updatedConv, ...without];
            });
          }
        },
        onError: (errorMsg) => {
          setIsStreaming(false);
          setStreamingContent('');
          setError(errorMsg);
        },
      }
    );

    abortControllerRef.current = controller;
  };

  /**
   * Stop active streaming response
   */
  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const clearError = () => setError(null);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        currentConversation,
        messages,
        tone,
        isLoading,
        isStreaming,
        streamingContent,
        error,
        selectConversation,
        createNewConversation,
        deleteConversation,
        changeTone,
        sendMessage,
        regenerateResponse,
        stopStreaming,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
