import React from 'react';
import { ShieldAlert, Crosshair, Map } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import { motion } from 'framer-motion';

export default function AdminHero({ setCurrentView, hasAlert }) {
  return (
    <GlassCard className="mb-6 relative">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at center, #22d3ee 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent pb-1 tracking-tight">
            Central Command Center
          </h2>
          <p className="text-[#64748B] text-sm mt-1 max-w-xl font-medium">
            Central Command manages case flow, investigator workload, audit integrity, and regional risk intelligence across the CPIS network.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={() => setCurrentView('assign')} className="px-4 py-2 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/60 rounded-xl text-cyan-400 text-sm font-bold flex items-center transition-all">
            <Crosshair className="w-4 h-4 mr-2" /> Assign Case
          </button>
          <button onClick={() => setCurrentView('map')} className="px-4 py-2 bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/60 rounded-xl text-indigo-400 text-sm font-bold flex items-center transition-all">
            <Map className="w-4 h-4 mr-2" /> Open Heatmap
          </button>
        </div>
      </div>
      
      {hasAlert && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start"
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
          <p className="text-sm font-bold text-amber-200">New regional cluster requires admin review.</p>
        </motion.div>
      )}
    </GlassCard>
  );
}
