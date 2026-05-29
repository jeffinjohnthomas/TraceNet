import React from 'react';
import { motion } from 'framer-motion';

export default function TraceNetAnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950 flex items-center justify-center pointer-events-none">
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #22d3ee 1px, transparent 1px),
            linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Cyber/Network Glowing Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/30 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px]"
      />

      {/* Radar Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ 
              width: ['0%', '150%'], 
              height: ['0%', '150%'], 
              opacity: [0.8, 0] 
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Subtle Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth / 2 : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              x: [null, (Math.random() - 0.5) * 100]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Connection Nodes (SVG Lines) */}
      <svg className="absolute inset-0 w-full h-full opacity-40">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1"/>
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <motion.line x1="10%" y1="20%" x2="90%" y2="80%" stroke="url(#lineGrad)" strokeWidth="1" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.line x1="80%" y1="15%" x2="15%" y2="85%" stroke="url(#lineGrad)" strokeWidth="1" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
        />
        <motion.line x1="50%" y1="5%" x2="40%" y2="95%" stroke="url(#lineGrad)" strokeWidth="1" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
        />
      </svg>
      
      {/* Vignette Overlay for Depth */}
      <div 
        className="absolute inset-0 z-10"
        style={{ background: 'radial-gradient(circle, transparent 20%, #020617 120%)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent z-10" />
    </div>
  );
}
