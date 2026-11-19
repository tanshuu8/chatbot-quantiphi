import React from 'react';
import { useChat } from '../hooks/useChat';
import ToneSelector from './ToneSelector';
import { Menu } from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  const { currentConversation, tone } = useChat();

  const getToneDotColor = () => {
    if (tone === 'Casual') return 'bg-orange-500 border border-slate-900';
    if (tone === 'Concise') return 'bg-amber-500 border border-slate-900';
    return 'bg-blue-600 border border-slate-900';
  };

  return (
    <header className="h-14 border-b-2 border-slate-900 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg border border-slate-900 text-slate-800 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full ${getToneDotColor()} hidden sm:inline-block`} />
          <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs md:max-w-md lg:max-w-lg tracking-tight">
            {currentConversation?.title || 'New Chat'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ToneSelector />
      </div>
    </header>
  );
}
