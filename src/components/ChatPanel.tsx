import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, Sparkles, Layout, Code2, Bot } from 'lucide-react';
import { ChatMessage, TabMode } from '../types';
import { motion } from 'motion/react';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mode: TabMode) => void;
  isLoading: boolean;
  activeMode: TabMode;
  onModeChange: (mode: TabMode) => void;
}

export default function ChatPanel({ messages, onSendMessage, isLoading, activeMode, onModeChange }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, activeMode);
    setInput('');
  };

  const modes: { id: TabMode; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <Hash className="w-3.5 h-3.5" /> },
    { id: 'ask', label: 'Ask', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'plan', label: 'Plan', icon: <Layout className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  const renderMessage = (text: string) => {
    const parts = [];
    const fileUpdateRegex = /FILE:\s*([\w.]+)\s*```(?:javascript|js|html|css)?\s*[\s\S]*?```|```(?:javascript|js|html|css)?\s*[\s\S]*?```/g;
    let lastIndex = 0;
    let match;

    while ((match = fileUpdateRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      
      const filename = match[1];
      if (filename) {
        parts.push(
          <div key={`code-${match.index}`} className="my-2 p-2 bg-[#1a1a1a] border border-[#333] rounded flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#aaa]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Updated {filename}</span>
          </div>
        );
      } else {
        parts.push(
          <div key={`code-${match.index}`} className="my-2 p-2 bg-[#1a1a1a] border border-[#333] rounded flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#aaa]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Updated code</span>
          </div>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="flex flex-col h-full bg-[#111] border border-[#222] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#222] p-1 bg-[#151515]">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300
              ${activeMode === mode.id 
                ? 'bg-[#222] text-white shadow-sm border border-white/5' 
                : 'text-[#666] hover:text-white hover:bg-white/5'}
            `}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[#0a0a0a]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#151515] border border-[#222] flex items-center justify-center shadow-2xl">
              <Bot className="w-6 h-6 text-[#666]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ready for instructions</h3>
              <p className="text-[11px] text-[#555] leading-relaxed max-w-[200px]">
                Enter a generation seed or task to begin.
              </p>
            </div>
          </div>
        )}

       {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 px-1">
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-20">{msg.role === 'user' ? 'Local.Terminal' : 'AI.Node'}</span>
            </div>
            <div className={`
              max-w-[100%] px-3 py-2 border text-[12px] leading-relaxed tracking-tight
              ${msg.role === 'user' 
                ? 'bg-[#1a1a1a] text-white border-[#333]' 
                : 'bg-[#000] border-[#222] text-[#ccc]'}
            `}>
              {msg.role === 'model' ? renderMessage(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[8px] font-bold uppercase tracking-widest animate-pulse opacity-40">AI.Node is thinking...</span>
            </div>
            <div className="w-full h-1 bg-[#151515] overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-1/2 h-full bg-white/20"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-[#151515] border-t border-[#222]">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type command..."
            className="flex-1 bg-[#0a0a0a] border border-[#222] px-3 py-1.5 text-[12px] placeholder-[#444] text-[#ccc] focus:outline-none focus:border-[#444] transition-all font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-1.5 bg-[#222] hover:bg-[#333] border border-white/5 rounded text-white disabled:opacity-30 transition-all shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
