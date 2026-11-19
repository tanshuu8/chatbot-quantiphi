import React from 'react';
import { useChat } from '../hooks/useChat';
import { useAutoScroll } from '../hooks/useAutoScroll';
import MessageBubble from './MessageBubble';
import StreamingMessageBubble from './StreamingMessageBubble';
import MessageComposer from './MessageComposer';
import EmptyState from './EmptyState';
import { AlertCircle, ArrowDown, X, Loader2 } from 'lucide-react';

export default function ChatArea() {
  const {
    messages,
    isStreaming,
    streamingContent,
    isLoading,
    error,
    clearError,
    sendMessage,
  } = useChat();

  const { containerRef, handleScroll, scrollToBottom, shouldAutoScroll } =
    useAutoScroll([messages, streamingContent]);

  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#fafafa] relative">
      {/* Ambient Apple Intelligence Glowing Orbs */}
      <div className="ambient-glow-orange" />
      <div className="ambient-glow-yellow" />
      <div className="ambient-glow-blue" />

      {/* Scrollable messages container with unified centered reading column */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-8 scroll-smooth relative z-10"
      >
        <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-blue-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-orange-500/20 animate-spin">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Connecting to Spark AI...</p>
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            <EmptyState onSelectPrompt={(prompt) => sendMessage(prompt)} />
          ) : (
            <div className="flex-1 flex flex-col justify-end">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  isLastAssistantMessage={index === lastAssistantIndex}
                />
              ))}

              {isStreaming && (
                <StreamingMessageBubble content={streamingContent} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating scroll-to-bottom button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-6 w-9 h-9 rounded-full bg-white border-2 border-slate-900 shadow-md text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all z-30 hover:scale-105"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Error Banner */}
      {error && (
        <div className="max-w-3xl mx-auto px-4 w-full mb-2 relative z-20">
          <div className="p-3 bg-red-50 border-2 border-red-600 rounded-2xl flex items-center justify-between text-xs text-red-950 shadow-sm animate-in fade-in slide-in-from-bottom-2 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 rounded-lg hover:bg-red-100 text-red-700 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Composer (Bottom fixed) */}
      <MessageComposer onSendMessage={sendMessage} />
    </div>
  );
}
