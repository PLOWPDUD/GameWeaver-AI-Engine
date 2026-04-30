import React, { useRef } from 'react';
import { FileCode, Settings2, Copy, Check, Undo2, Redo2 } from 'lucide-react';
import { FileItem } from '../types';

interface EditorPanelProps {
  file: FileItem | null;
  onContentChange: (content: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveHistory?: (content: string) => void;
}

export default function EditorPanel({ file, onContentChange, onUndo, onRedo, onSaveHistory }: EditorPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = () => {
    if (!file) return;
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onContentChange(newContent);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onSaveHistory) onSaveHistory(newContent);
    }, 1000);
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-brand-secondary/40 space-y-4">
        <FileCode className="w-12 h-12 opacity-20" />
        <p className="micro-label">No file selected</p>
      </div>
    );
  }

  const canUndo = (file.historyIndex ?? 0) > 0;
  const canRedo = file.history ? (file.historyIndex ?? 0) < file.history.length - 1 : false;

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] border border-[#222] overflow-hidden shadow-2xl">
      <div className="h-9 px-3 border-b border-[#222] flex items-center justify-between bg-[#151515]">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-3 h-3 text-[#666]" />
          <span className="text-[11px] text-[#aaa] font-bold uppercase tracking-wider">{file.name}</span>
          <div className="px-1 py-0.5 rounded-sm bg-white/5 text-[8px] text-[#666] uppercase tracking-widest font-bold border border-white/5">
            {file.language}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded transition-all ${canUndo ? 'text-[#666] hover:text-white hover:bg-white/5' : 'text-[#333] cursor-not-allowed'}`}
            title="Undo"
          >
            <Undo2 className="w-3 h-3" />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1 rounded transition-all ${canRedo ? 'text-[#666] hover:text-white hover:bg-white/5' : 'text-[#333] cursor-not-allowed'}`}
            title="Redo"
          >
            <Redo2 className="w-3 h-3" />
          </button>
          <div className="h-3 w-px bg-[#222] mx-1" />
          <button 
            onClick={handleCopy}
            className="p-1 hover:bg-white/5 rounded transition-all text-[#666] hover:text-white"
            title="Copy Source"
          >
            {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
          </button>
          <div className="h-3 w-px bg-[#222] mx-1" />
          <button className="p-1 hover:bg-white/5 rounded transition-all text-[#666] hover:text-white">
            <Settings2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 relative font-mono text-[13px] bg-[#0d0d0d]">
        <textarea
          value={file.content}
          onChange={handleChange}
          className="w-full h-full bg-transparent p-6 pl-12 outline-none resize-none text-[#ccc] leading-relaxed font-mono selection:bg-white/10"
          spellCheck={false}
        />
        <div className="absolute top-0 left-0 bottom-0 w-10 bg-[#111] border-r border-[#222] pointer-events-none p-6 text-right select-none">
          {Array.from({ length: file.content.split('\n').length }).map((_, i) => (
            <div key={i} className="leading-relaxed h-[19.5px] text-[10px] text-white/5">{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
