import React from 'react';
import { motion } from 'motion/react';
import { Box, Layers, Sparkles, ArrowRight, Github } from 'lucide-react';

interface HomePageProps {
  onStart: (type: '2d' | '3d') => void;
}

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <div className="min-h-screen w-full bg-[#0c0c0c] flex flex-col items-center justify-center relative overflow-hidden p-6 font-mono">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/[0.03]" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-white/[0.03]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-4xl w-full flex flex-col items-center"
      >
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-[#111] border border-[#333] flex items-center justify-center shadow-2xl mb-10"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase">
            GAMEWEAVER<span className="text-[#333]">.</span>
          </h1>
          <p className="text-[12px] text-[#666] max-w-md leading-relaxed uppercase tracking-[0.2em] font-bold">
            Autonomous Development Environment for Interactive Systems
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
          <ProjectCard 
            title="Module 2D"
            description="Standard HTML5 Canvas integration for high-performance 2D raster operations."
            icon={<Layers className="w-5 h-5 text-[#666]" />}
            onClick={() => onStart('2d')}
          />
          <ProjectCard 
            title="Module 3D"
            description="Hardware-accelerated Three.js spatial engine with real-time rendering."
            icon={<Box className="w-5 h-5 text-[#666]" />}
            onClick={() => onStart('3d')}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex items-center gap-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 animate-pulse shadow-[0_0_10px_green]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#444]">System Ready</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Github className="w-3.5 h-3.5 text-[#333] group-hover:text-white transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#333] group-hover:text-white transition-colors underline underline-offset-4">Kernel.Docs</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProjectCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ backgroundColor: '#151515' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col p-8 bg-[#0d0d0d] border border-[#222] cursor-pointer overflow-hidden transition-colors"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
      
      <div className="w-10 h-10 border border-[#222] bg-[#111] flex items-center justify-center mb-10 transition-colors group-hover:border-white/20">
        {icon}
      </div>
      
      <h3 className="text-sm font-bold mb-4 tracking-[0.2em] uppercase text-[#888] group-hover:text-white transition-colors">{title}</h3>
      <p className="text-[11px] text-[#444] group-hover:text-[#666] leading-relaxed transition-colors font-sans mb-8">
        {description}
      </p>
      
      <div className="mt-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#333] group-hover:text-white transition-colors">
        Mount Partition <ArrowRight className="w-2 h-2" />
      </div>
    </motion.div>
  );
}
