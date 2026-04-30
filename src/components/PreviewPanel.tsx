import React, { useMemo } from 'react';
import { Play, RotateCcw, Maximize2 } from 'lucide-react';
import { FileItem } from '../types';

interface PreviewPanelProps {
  files: FileItem[];
}

export default function PreviewPanel({ files }: PreviewPanelProps) {
  const [key, setKey] = React.useState(0);

  const srcDoc = useMemo(() => {
    // Basic logic to find index.html and inject other files
    const indexHtml = files.find(f => f.name === 'index.html');
    const mainJs = files.find(f => f.name === 'main.js' || f.name === 'game.js');
    const stylesCss = files.find(f => f.name === 'styles.css' || f.name === 'style.css');

    if (!indexHtml) {
      const isModule = mainJs?.content.includes('import ') || mainJs?.content.includes('export ');
      const scriptTag = isModule ? '<script type="module">' : '<script>';
      
      // Create a default one if it doesn't exist
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; overflow: hidden; }
            canvas { display: block; }
            ${stylesCss?.content || ''}
          </style>
        </head>
        <body>
          <canvas id="gameCanvas"></canvas>
          ${scriptTag}
            ${mainJs?.content || '// No game logic found.'}
          </script>
        </body>
        </html>
      `;
    }

    // Replace script tags and link tags with inline content for preview simplicity
    let html = indexHtml.content;
    
    if (mainJs) {
      // Check if the script should be a module (detected by imports or explicit type="module" in index.html)
      const isModule = mainJs.content.includes('import ') || mainJs.content.includes('export ') || indexHtml.content.includes('type="module"');
      const scriptTag = isModule ? '<script type="module">' : '<script>';
      
      // Replace existing script tags that point to current file
      const scriptRegex = /<script\b[^>]*src=["']\s*([^"'>]*)\s*["'][^>]*><\/script>/gi;
      let replaced = false;
      
      html = html.replace(scriptRegex, (match, src) => {
        if (src.includes(mainJs.name)) {
          replaced = true;
          return `${scriptTag}${mainJs.content}</script>`;
        }
        return match;
      });

      // If no script tag found, append it
      if (!replaced && !html.includes(mainJs.content.substring(0, 50))) {
        html = html.replace('</body>', `${scriptTag}${mainJs.content}</script></body>`);
      }
    }

    if (stylesCss) {
      html = html.replace(/<link.*href=["'].*["'].*>/i, `<style>${stylesCss.content}</style>`);
      if (!html.includes('<style>')) {
        html = html.replace('</head>', `<style>${stylesCss.content}</style></head>`);
      }
    }

    return html;
  }, [files, key]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#000] border border-[#222] overflow-hidden group/preview">
      <div className="h-9 px-3 border-b border-[#222] flex items-center justify-between bg-[#151515]">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_white]" />
          <span className="text-[10px] text-[#aaa] font-bold uppercase tracking-widest">Viewport</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setKey(k => k + 1)}
            className="p-1 hover:bg-white/5 rounded transition-all text-[#666] hover:text-white flex items-center gap-2"
            title="Restart Runtime"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <div className="h-3 w-px bg-[#222] mx-1" />
          <button 
            onClick={toggleFullscreen}
            className="p-1 hover:bg-white/5 rounded transition-all text-[#666] hover:text-white"
            title="Maxmize View"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-black relative">
        <iframe
          key={key}
          title="Game Preview"
          srcDoc={srcDoc}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals"
        />
        
        {files.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/80 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full border border-brand-border flex items-center justify-center group cursor-pointer hover:border-white transition-all">
              <Play className="w-6 h-6 text-brand-secondary group-hover:text-white transition-all" />
            </div>
            <p className="micro-label opacity-40">Ready for Code</p>
          </div>
        )}
      </div>
    </div>
  );
}
