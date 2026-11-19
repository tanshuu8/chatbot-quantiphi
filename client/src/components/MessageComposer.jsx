import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { ArrowUp, Square } from 'lucide-react';

const TONE_BADGE_STYLE = {
  Professional: 'text-blue-800 bg-blue-50 border-slate-900',
  Casual: 'text-orange-800 bg-orange-50 border-slate-900',
  Concise: 'text-amber-800 bg-amber-50 border-slate-900',
};

export default function MessageComposer({ onSendMessage }) {
  const { isStreaming, stopStreaming, tone } = useChat();
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      stopStreaming();
      return;
    }

    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const badgeStyle = TONE_BADGE_STYLE[tone] || TONE_BADGE_STYLE.Professional;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pb-5 pt-1 relative z-20">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl border-2 border-slate-900 shadow-md focus-within:ring-2 focus-within:ring-slate-900/30 transition-all duration-150"
      >
        <div className="flex items-end px-4 py-2.5 gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask Spark AI (${tone} tone)...`}
            className="w-full resize-none bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none max-h-36 py-1 leading-relaxed font-sans font-medium"
          />

          <div className="shrink-0 mb-0.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs active:scale-95 border border-slate-900"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-xs border border-slate-900 ${
                  inputText.trim()
                    ? 'bg-slate-900 hover:bg-black text-white cursor-pointer active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-300'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 pb-2 pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900/20 bg-slate-50/50 rounded-b-xl">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-900 text-slate-900 font-mono text-[10px] font-bold">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-900 text-slate-900 font-mono text-[10px] font-bold">Shift + Enter</kbd> for new line
          </span>
          <span className="hidden sm:inline font-semibold text-slate-700">
            Tone:{' '}
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeStyle}`}>
              {tone}
            </span>
          </span>
        </div>
      </form>
    </div>
  );
}
