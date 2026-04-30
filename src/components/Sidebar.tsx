import { FileCode, FolderOpen, Plus, Trash2, Settings, Download } from 'lucide-react';
import { FileItem } from '../types';

interface SidebarProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onDeleteFile: (id: string) => void;
  onDownload: () => void;
}

export default function Sidebar({ files, activeFileId, onSelectFile, onNewFile, onDeleteFile, onDownload }: SidebarProps) {
  return (
    <div className="w-11 h-full bg-[#151515] border-r border-[#222] flex flex-col items-center py-4 gap-4 shrink-0 shadow-2xl z-20">
      <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center border border-white/10 mb-2">
        <FolderOpen className="w-3.5 h-3.5 text-white/60" />
      </div>

      <div className="flex-1 flex flex-col gap-2 w-full items-center">
        {files.map((file) => (
          <div key={file.id} className="relative group w-full flex justify-center">
            <div
              onClick={() => onSelectFile(file.id)}
              title={file.name}
              className={`
                w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-200
                ${activeFileId === file.id 
                  ? 'bg-white text-black' 
                  : 'text-[#666] hover:bg-white/5 hover:text-white'}
              `}
            >
              <FileCode className="w-3.5 h-3.5" />
            </div>
            
            {/* Tooltip & Delete Button */}
            <div className="absolute left-[100%] ml-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#222] rounded flex items-center gap-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 whitespace-nowrap shadow-xl">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#aaa]">{file.name}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
                className="text-red-500/40 hover:text-red-500 transition-colors"
                title="Delete File"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={onNewFile}
          className="w-8 h-8 rounded border border-[#222] flex items-center justify-center text-[#444] hover:text-white hover:bg-white/5 transition-all mt-2"
          title="New Script"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4">
        <button 
          onClick={onDownload}
          className="w-8 h-8 rounded border border-[#222] flex items-center justify-center text-[#444] hover:text-white hover:bg-white/5 transition-all"
          title="Download Code"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="opacity-10">
          <Settings className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}
