import React from 'react';
import { useClipboard } from '../hooks/useClipboard';
import { useChat } from '../hooks/useChat';
import { Sparkles, User, Copy, Check, RotateCw } from 'lucide-react';

export default function MessageBubble({ message, isLastAssistantMessage }) {
  const isUser = message.role === 'user';
  const { copied, copyToClipboard } = useClipboard();
  const { regenerateResponse, isStreaming } = useChat();

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const renderContent = (content) => {
    if (!content) return null;

    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        value: match[2],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex),
      });
    }

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-900 text-slate-100 text-xs font-mono shadow-md">
            {part.language && (
              <div className="px-3.5 py-1.5 bg-slate-800 text-[10px] font-bold text-slate-400 font-sans border-b border-slate-700 uppercase tracking-widest flex items-center justify-between">
                <span>{part.language}</span>
                <span className="text-[9px] text-orange-400">code</span>
              </div>
            )}
            <pre className="p-3.5 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{part.value}</code>
            </pre>
          </div>
        );
      }

      return (
        <div key={idx} className="whitespace-pre-wrap leading-relaxed">
          {part.value}
        </div>
      );
    });
  };

  // User Message - Aligned to the RIGHT side with comfortable margin
  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group mb-5 pr-2 sm:pr-4">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
          <div className="bg-slate-900 text-white border border-slate-900 px-5 py-3 rounded-2xl rounded-tr-xs text-sm shadow-xs font-medium leading-relaxed">
            {renderContent(message.content)}
          </div>
          {formattedTime && (
            <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
              {formattedTime}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-900 flex items-center justify-center text-slate-900 shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Message - Aligned to the LEFT side with comfortable margin
  return (
    <div className="flex justify-start gap-3.5 group mb-6 pl-2 sm:pl-4">
      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex flex-col items-start max-w-[90%] sm:max-w-[82%] md:max-w-[78%]">
        <div className="flex items-center gap-2 mb-1 px-0.5">
          <span className="text-xs font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">
            Spark AI
          </span>
          {formattedTime && (
            <span className="text-[10px] text-slate-400 font-mono">{formattedTime}</span>
          )}
        </div>

        <div className="bg-white text-slate-900 border-2 border-slate-900 px-5 py-4 rounded-2xl rounded-tl-xs text-sm shadow-xs relative leading-relaxed font-normal">
          {renderContent(message.content)}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 mt-2 px-1">
          {/* Copy Button */}
          <button
            type="button"
            onClick={() => copyToClipboard(message.content)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:text-slate-950 border border-slate-900/30 hover:border-slate-900 bg-white hover:bg-slate-50 transition shadow-2xs"
            title="Copy response to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Regenerate Button */}
          {isLastAssistantMessage && (
            <button
              type="button"
              disabled={isStreaming}
              onClick={regenerateResponse}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-900/30 transition shadow-2xs ${
                isStreaming
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'text-slate-700 hover:text-slate-950 hover:border-slate-900 bg-white hover:bg-slate-50 cursor-pointer'
              }`}
              title="Regenerate this response"
            >
              <RotateCw className={`w-3 h-3 ${isStreaming ? 'animate-spin text-orange-500' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
