import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]">
      {/* Deep Navy/Black Base */}
      <div className="absolute inset-0 bg-[#0F172A] opacity-50 mix-blend-multiply"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Radial Gradient Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/30 blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/20 blur-[150px]"
      />

      {/* Pulsing Radar Rings (Subtle) */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-cyan-500/10 rounded-full animate-[ping_8s_ease-out_infinite] mix-blend-screen"></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] border border-cyan-500/5 rounded-full animate-[ping_12s_ease-out_infinite] mix-blend-screen delay-1000"></div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth, opacity: Math.random() * 0.5 + 0.1 }}
          animate={{ y: [null, Math.random() * window.innerHeight], x: [null, Math.random() * window.innerWidth] }}
          transition={{ duration: Math.random() * 20 + 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
        />
      ))}
    </div>
  );
}
