import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { TONES } from '../state/ChatContext';
import { Briefcase, Sparkles, Zap, ChevronDown, Check } from 'lucide-react';

const TONE_CONFIG = {
  Professional: {
    icon: Briefcase,
    label: 'Professional',
    badge: 'bg-blue-50 text-blue-800 border-slate-900',
    activePill: 'bg-white text-slate-950 border-2 border-slate-900 shadow-xs',
    iconColor: 'text-blue-600',
  },
  Casual: {
    icon: Sparkles,
    label: 'Casual',
    badge: 'bg-orange-50 text-orange-800 border-slate-900',
    activePill: 'bg-white text-slate-950 border-2 border-slate-900 shadow-xs',
    iconColor: 'text-orange-500',
  },
  Concise: {
    icon: Zap,
    label: 'Concise',
    badge: 'bg-amber-50 text-amber-800 border-slate-900',
    activePill: 'bg-white text-slate-950 border-2 border-slate-900 shadow-xs',
    iconColor: 'text-amber-600',
  },
};

export default function ToneSelector() {
  const { tone, changeTone, isStreaming } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentConfig = TONE_CONFIG[tone] || TONE_CONFIG.Professional;
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Desktop Apple-style Glass Segmented Control with Crisp Dark Border */}
      <div className="hidden sm:inline-flex items-center p-1 bg-slate-50 border border-slate-900 rounded-full shadow-xs">
        {Object.entries(TONES).map(([key, item]) => {
          const isSelected = tone === key;
          const config = TONE_CONFIG[key];
          const Icon = config.icon;

          return (
            <button
              key={key}
              type="button"
              disabled={isStreaming}
              onClick={() => changeTone(key)}
              title={item.description}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all duration-150 ${
                isSelected
                  ? config.activePill + ' font-bold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60 font-medium'
              } ${isStreaming ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? config.iconColor : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Button with Crisp Dark Border */}
      <div className="sm:hidden">
        <button
          type="button"
          disabled={isStreaming}
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-900 rounded-full text-xs font-bold shadow-xs hover:bg-slate-50 transition ${currentConfig.badge}`}
        >
          <CurrentIcon className={`w-3.5 h-3.5 ${currentConfig.iconColor}`} />
          <span>{tone}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-2 border-slate-900 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-900/20">
              Response Tone
            </div>
            {Object.entries(TONES).map(([key, item]) => {
              const isSelected = tone === key;
              const config = TONE_CONFIG[key];
              const Icon = config.icon;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    changeTone(key);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 text-xs transition ${
                    isSelected ? 'bg-slate-100 font-bold border-l-4 border-slate-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 ${config.iconColor}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.label}</span>
                      {isSelected && <Check className={`w-3.5 h-3.5 ${config.iconColor}`} />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
