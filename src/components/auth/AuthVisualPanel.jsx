import React from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Activity, Users, Radar } from 'lucide-react';
import TraceNetAnimatedBackground from '../shared/TraceNetAnimatedBackground';

export default function AuthVisualPanel() {
  return (
    <div className="hidden md:flex md:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden border-r border-slate-800/60 shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-10">
      
      {/* Animated Background */}
      <TraceNetAnimatedBackground />
      
      <div className="relative z-20 p-8 lg:p-12 text-white max-w-lg w-full">
        
        {/* TraceNet Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center space-x-4 mb-10"
        >
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <Radar className="w-8 h-8 text-white relative z-10" strokeWidth={2.5}/>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.2)]">TraceNet</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-0.5">Intelligence Gateway</span>
          </div>
        </motion.div>
        
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl lg:text-5xl font-black mb-6 leading-tight drop-shadow-lg text-white"
        >
          Secure Access to <br/>
          <span className="bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent pb-2 block">
            Central Intelligence
          </span>
        </motion.h1>
        
        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-slate-300/90 leading-relaxed font-medium mb-12 border-l-2 border-cyan-500/50 pl-4"
        >
          Report, track, and coordinate verified case intelligence through a protected civilian network.
        </motion.p>
        
        {/* Feature Cards */}
        <div className="space-y-4">
          <StatCard icon={<LockKeyhole size={20} />} text="Encrypted Reports" delay={0.4} />
          <StatCard icon={<Activity size={20} />} text="Verified Case Tracking" delay={0.5} />
          <StatCard icon={<Users size={20} />} text="Role-Based Access" delay={0.6} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, text, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      className="flex items-center gap-4 bg-slate-900/60 border border-slate-700/50 backdrop-blur-md p-4 rounded-xl max-w-sm shadow-lg group hover:border-cyan-500/30 transition-colors"
    >
      <div className="text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 p-2.5 rounded-lg group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
        {icon}
      </div>
      <span className="font-semibold text-slate-200 tracking-wide text-sm">{text}</span>
    </motion.div>
  );
}
