/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import HomePage from './components/HomePage';
import { FileItem, ChatMessage, TabMode } from './types';
import { generateGameCode, getPlan } from './services/geminiService';
import { Globe, Code2, Home } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'home' | 'workspace'>('home');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TabMode>('chat');

  const activeFile = files.find(f => f.id === activeFileId) || null;

  const startProject = (type: '2d' | '3d') => {
    const initialFiles: FileItem[] = [];
    
    if (type === '3d') {
      initialFiles.push({
        id: '1',
        name: 'main.js',
        language: 'javascript',
        content: `// 3D Basic Scene with Three.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.z = 5;

function resize() {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener('resize', resize);
resize(); // Initialize dimensions

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();`
      });
      initialFiles.push({
        id: '2',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
  </style>
</head>
<body>
  <script type="module" src="main.js"></script>
</body>
</html>`
      });
    } else {
      initialFiles.push({
        id: '1',
        name: 'main.js',
        language: 'javascript',
        content: `// 2D Canvas Basic Setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

let x = window.innerWidth / 2;
let y = window.innerHeight / 2;
let dx = 2;
let dy = -2;
const radius = 20;

function resize() {
    canvas.width = window.innerWidth || 1;
    canvas.height = window.innerHeight || 1;
    
    // Ensure the ball stays within bounds after resize
    if(x > canvas.width - radius) x = canvas.width - radius;
    if(y > canvas.height - radius) y = canvas.height - radius;
    if(x < radius) x = radius;
    if(y < radius) y = radius;
}

window.addEventListener('resize', resize);
resize(); // Initialize dimensions

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
    
    // Boundary collision detection
    if(x + dx > canvas.width-radius || x + dx < radius) {
        dx = -dx;
    }
    if(y + dy > canvas.height-radius || y + dy < radius) {
        dy = -dy;
    }
    
    x += dx;
    y += dy;
    
    requestAnimationFrame(draw);
}

draw();`
      });
      initialFiles.push({
        id: '2',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #111; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="main.js"></script>
</body>
</html>`
      });
    }

    setFiles(initialFiles);
    setActiveFileId('1');
    setView('workspace');
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: `Initialized ${type.toUpperCase()} workspace. How should we customize this starter?`,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = async (text: string, mode: TabMode) => {
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      let responseText = "";
      
      if (mode === 'plan') {
        responseText = (await getPlan(text)) || "I couldn't generate a plan right now.";
      } else {
        const fileContext = files.map(f => `FILE: ${f.name}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');
        const contextPrompt = `Workspace Context:\n${fileContext}\n\nUser Request: ${text}`;
        
        responseText = (await generateGameCode(contextPrompt, messages)) || "I'm sorry, I couldn't process that.";
      }

      // Improved parsing: Look for FILE: filename then code block
      const fileUpdateRegex = /FILE:\s*([\w.]+)\s*[\s\S]*?```(?:javascript|js|html|css)?\s*([\s\S]*?)```/g;
      let match;
      let hasUpdates = false;
      const updatedFiles = [...files];

      while ((match = fileUpdateRegex.exec(responseText)) !== null) {
        const fileName = match[1].trim();
        const newCode = match[2].trim();
        const fileIndex = updatedFiles.findIndex(f => f.name === fileName);
        
        if (fileIndex !== -1) {
          const oldFile = updatedFiles[fileIndex];
          const history = oldFile.history || [oldFile.content];
          const historyIndex = oldFile.historyIndex ?? 0;
          const newHistory = [...history.slice(0, historyIndex + 1), newCode];

          updatedFiles[fileIndex] = { 
            ...oldFile, 
            content: newCode,
            history: newHistory,
            historyIndex: newHistory.length - 1
          };
          hasUpdates = true;
        } else {
          updatedFiles.push({
            id: Date.now().toString() + Math.random().toString(),
            name: fileName,
            content: newCode,
            language: fileName.endsWith('.js') ? 'javascript' : fileName.endsWith('.html') ? 'html' : 'css',
            history: [newCode],
            historyIndex: 0
          });
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        setFiles(updatedFiles);
      } else if (mode === 'code' || (mode === 'chat' && responseText.includes('```'))) {
        // Fallback to updating active file if no FILE: tag found but code blocks exist
        const codeBlockRegex = /```(?:javascript|js|html|css)?\s*([\s\S]*?)```/g;
        const simpleMatches = [...responseText.matchAll(codeBlockRegex)];
        if (simpleMatches.length > 0 && activeFileId) {
          setFiles(currentFiles => currentFiles.map(f => 
            f.id === activeFileId ? { ...f, content: simpleMatches[0][1].trim() } : f
          ));
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `System Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewFile = () => {
    const name = prompt("Enter file name:");
    if (!name) return;
    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      content: '// Start coding...',
      language: name.endsWith('.js') ? 'javascript' : name.endsWith('.html') ? 'html' : 'css'
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    setFiles(files.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(files[0].id);
  };

  const handleUpdateFileContent = (content: string) => {
    if (!activeFileId) return;
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id === activeFileId) {
        return { ...f, content };
      }
      return f;
    }));
  };

  const handleSaveHistory = (content: string) => {
    if (!activeFileId) return;
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id === activeFileId) {
        const history = f.history || [f.content];
        const historyIndex = f.historyIndex ?? 0;
        if (history[historyIndex] === content) return f;
        const newHistory = [...history.slice(0, historyIndex + 1), content];
        return { ...f, history: newHistory, historyIndex: newHistory.length - 1 };
      }
      return f;
    }));
  };

  const handleUndo = () => {
    if (!activeFileId) return;
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id === activeFileId) {
        const historyIndex = f.historyIndex ?? 0;
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          return { ...f, content: f.history![newIndex], historyIndex: newIndex };
        }
      }
      return f;
    }));
  };

  const handleRedo = () => {
    if (!activeFileId) return;
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id === activeFileId) {
        const history = f.history || [];
        const historyIndex = f.historyIndex ?? 0;
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          return { ...f, content: history[newIndex], historyIndex: newIndex };
        }
      }
      return f;
    }));
  };

  const handleDownloadGame = async () => {
    // Single HTML export for easy playing on PC and Mobile
    const indexHtml = files.find(f => f.name === 'index.html')?.content || '<!DOCTYPE html><html><body></body></html>';
    const mainJs = files.find(f => f.name === 'main.js')?.content || '';
    const stylesCss = files.find(f => f.name.endsWith('.css'))?.content || '';

    let bundledHtml = indexHtml;
    
    // Inject CSS
    if (stylesCss && !bundledHtml.includes(stylesCss.substring(0, 50))) {
       bundledHtml = bundledHtml.replace('</head>', `<style>${stylesCss}</style></head>`);
    }

    // Inject JS
    const isModule = mainJs.includes('import ') || mainJs.includes('export ') || indexHtml.includes('type="module"');
    const scriptTag = isModule ? '<script type="module">' : '<script>';
    
    const scriptRegex = /<script\b[^>]*src=["']\s*([^"'>]*)\s*["'][^>]*><\/script>/gi;
    let replaced = false;
    
    bundledHtml = bundledHtml.replace(scriptRegex, (match, src) => {
      if (src.includes('main.js')) {
        replaced = true;
        return `${scriptTag}\n${mainJs}\n</script>`;
      }
      return match;
    });

    if (!replaced) {
      bundledHtml = bundledHtml.replace('</body>', `${scriptTag}\n${mainJs}\n</script></body>`);
    }

    // Update THREE.js CDN to a reliable one if used
    bundledHtml = bundledHtml.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/[\d.]+\/three\.module\.js/g, 'https://unpkg.com/three@0.160.0/build/three.module.js');

    const blob = new Blob([bundledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gameweaver-game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (view === 'home') {
    return <HomePage onStart={startProject} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-[#e0e0e0] overflow-hidden selection:bg-white/20 font-sans relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      </div>

      <Sidebar 
        files={files} 
        activeFileId={activeFileId}
        onSelectFile={setActiveFileId}
        onNewFile={handleNewFile}
        onDeleteFile={handleDeleteFile}
        onDownload={handleDownloadGame}
      />

      <main className="flex-1 flex gap-2 p-2 overflow-hidden relative z-10">
        {/* AI Control Center */}
        <div className="w-[400px] flex h-full">
          <ChatPanel 
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeMode={activeMode}
            onModeChange={setActiveMode}
          />
        </div>

        {/* Workspace Center */}
        <div className="flex-1 flex flex-col gap-2 h-full min-w-0">
          <div className="flex-[1.5] min-h-0">
            <PreviewPanel files={files} />
          </div>

          <div className="flex-1 min-h-0">
            <EditorPanel 
              file={activeFile}
              onContentChange={handleUpdateFileContent}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSaveHistory={handleSaveHistory}
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-8 flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl z-50 shadow-2xl group transition-all hover:border-white/20">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-2 pr-4 border-r border-white/10 hover:text-white transition-colors group/home"
        >
          <Home className="w-3.5 h-3.5 text-brand-secondary group-hover/home:text-white" />
          <span className="micro-label tracking-[0.2em] opacity-60 group-hover/home:opacity-100">Esc to Studio</span>
        </button>
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-sm rounded-full animate-pulse" />
            <div className="relative w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
          </div>
          <span className="micro-label tracking-[0.2em] opacity-60">Engine v1.4.2</span>
        </div>
        <div className="flex gap-5">
          <Globe className="w-4 h-4 text-brand-secondary hover:text-white cursor-pointer transition-all hover:scale-110" />
          <Code2 className="w-4 h-4 text-brand-secondary hover:text-white cursor-pointer transition-all hover:scale-110" />
        </div>
      </div>
    </div>
  );
}
