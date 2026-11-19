import React from 'react';
import { useChat } from '../hooks/useChat';
import { Terminal, FileText, Cpu, Lightbulb, ArrowUpRight } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: FileText,
    title: 'Executive Brief',
    description: 'Draft a formal project kick-off announcement for stakeholders',
    prompt: 'Draft a formal project kick-off announcement for executive stakeholders outlining scope, timeline, and key milestones.',
    tone: 'Professional',
    badge: 'bg-blue-50 text-blue-800 border-slate-900',
    iconColor: 'text-blue-600 bg-blue-50 border border-slate-900/30',
  },
  {
    icon: Lightbulb,
    title: 'Intuitive Analogy',
    description: 'Explain quantum computing and superposition simply',
    prompt: 'Explain quantum computing and superposition using a simple, relatable everyday analogy.',
    tone: 'Casual',
    badge: 'bg-orange-50 text-orange-800 border-slate-900',
    iconColor: 'text-orange-600 bg-orange-50 border border-slate-900/30',
  },
  {
    icon: Cpu,
    title: 'Architecture Tradeoffs',
    description: 'Compare PostgreSQL vs MongoDB for high-throughput writes',
    prompt: 'Compare PostgreSQL vs MongoDB for high-write telemetry workloads, focusing on latency, indexing, and scaling tradeoffs.',
    tone: 'Concise',
    badge: 'bg-amber-50 text-amber-800 border-slate-900',
    iconColor: 'text-amber-600 bg-amber-50 border border-slate-900/30',
  },
  {
    icon: Terminal,
    title: 'Engineering Review',
    description: '3 architectural patterns for real-time SSE streaming',
    prompt: 'Provide 3 proven architectural patterns for resilient Server-Sent Events (SSE) streaming in Node.js applications.',
    tone: 'Professional',
    badge: 'bg-blue-50 text-blue-800 border-slate-900',
    iconColor: 'text-blue-600 bg-blue-50 border border-slate-900/30',
  },
];

export default function EmptyState({ onSelectPrompt }) {
  const { tone, changeTone } = useChat();

  const handleCardClick = (suggestion) => {
    if (suggestion.tone && suggestion.tone !== tone) {
      changeTone(suggestion.tone);
    }
    onSelectPrompt(suggestion.prompt);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center relative z-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
        How can <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">Spark AI</span> assist you?
      </h1>
      <p className="text-sm text-slate-600 font-medium max-w-md mb-8 leading-relaxed">
        Experience real-time streaming with selectable tones. Choose a suggested prompt below or compose your own.
      </p>

      {/* Suggested Prompts Grid with Crisp Dark Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleCardClick(item)}
              className="group p-4 bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between cursor-pointer border-2 border-slate-900 active:scale-[0.98] hover:bg-slate-50"
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className={`p-2 rounded-xl transition duration-200 ${item.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badge}`}>
                    {item.tone}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[2.5]" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 transition mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
