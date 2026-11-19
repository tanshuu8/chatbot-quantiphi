import React from 'react';
import { Sparkles } from 'lucide-react';

export default function StreamingMessageBubble({ content }) {
  return (
    <div className="flex justify-start gap-3.5 group mb-6 pl-2 sm:pl-4">
      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs animate-pulse">
        <Sparkles className="w-4 h-4 animate-spin text-orange-400" />
      </div>

      <div className="flex flex-col items-start max-w-[90%] sm:max-w-[82%] md:max-w-[78%]">
        <div className="flex items-center gap-2 mb-1 px-0.5">
          <span className="text-xs font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">
            Spark AI
          </span>
          <span className="text-[10px] text-orange-600 font-bold animate-pulse">streaming response...</span>
        </div>

        <div className="bg-white text-slate-900 border-2 border-slate-900 px-5 py-4 rounded-2xl rounded-tl-xs text-sm shadow-xs relative leading-relaxed">
          {content ? (
            <div className="whitespace-pre-wrap">
              {content}
              <span className="cursor-blink" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-1 px-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
