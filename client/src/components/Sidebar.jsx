import React, { useState, useMemo } from 'react';
import { useChat } from '../hooks/useChat';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  X,
} from 'lucide-react';

const TONE_BADGE_STYLE = {
  Professional: 'bg-blue-50 text-blue-700 border-slate-900/40',
  Casual: 'bg-orange-50 text-orange-700 border-slate-900/40',
  Concise: 'bg-amber-50 text-amber-800 border-slate-900/40',
};

export default function Sidebar({ isOpen, onClose }) {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    isStreaming,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.tone && c.tone.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const handleSelect = (id) => {
    if (isStreaming) return;
    selectConversation(id);
    if (onClose) onClose();
  };

  const handleNewChat = () => {
    if (isStreaming) return;
    createNewConversation();
    if (onClose) onClose();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id, e);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container with black vertical border separator */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-slate-900 flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with black border bottom */}
        <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between bg-white shrink-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent font-extrabold truncate">
                Spark AI
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-900 tracking-normal shrink-0">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Intelligent Assistant</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isStreaming}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border border-slate-900 shadow-xs ${
              isStreaming
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300'
                : 'bg-slate-900 hover:bg-black text-white cursor-pointer active:scale-[0.98]'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search */}
        {conversations.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-900/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition"
              />
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            History ({filteredConversations.length})
          </div>

          {filteredConversations.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-900/20 text-slate-500 flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-700 font-medium">No conversations yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Start chatting with Spark AI</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv._id === currentConversationId;
              const isDeleting = deletingId === conv._id;
              const toneKey = conv.tone || 'Professional';
              const badgeStyle = TONE_BADGE_STYLE[toneKey] || TONE_BADGE_STYLE.Professional;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelect(conv._id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-50 text-slate-950 font-bold border-2 border-slate-900 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-transparent hover:border-slate-900/30'
                  } ${isDeleting ? 'opacity-30 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <div className="truncate flex-1">
                      <div className="truncate">{conv.title || 'Untitled Chat'}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-normal">
                        <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-semibold ${badgeStyle}`}>
                          {toneKey}
                        </span>
                        <span>•</span>
                        <span>{formatDate(conv.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(conv._id, e)}
                    title="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-300 transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer with black top border */}
        <div className="p-3 border-t border-slate-900 bg-white">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-700/50" />
              <span className="font-semibold text-slate-800">MongoDB Online</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono border border-slate-900 font-medium">
              SSE Streaming
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
