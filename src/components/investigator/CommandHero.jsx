import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, List, Map as MapIcon } from 'lucide-react';

export default function CommandHero({ cases, setCurrentView }) {
  const criticalCases = cases.filter(c => c.priority === 'High' && c.status !== 'Closed').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-950 via-slate-900 to-[#0F172A] border border-[#1E293B] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8"
    >
      {/* Background Radar Effect */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDEwaDQwdjJIMHoiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iLjIiLz4KPHBhdGggZD0iTTEwIDB2NDBoLTJWMHoiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iLjIiLz4KPC9zdmc+')] opacity-20 pointer-events-none mix-blend-overlay [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] -translate-y-1/2 translate-x-1/4"></div>
      
      {/* Glowing Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl">
        {criticalCases > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-rose-950/50 border border-rose-500/30 backdrop-blur-md shadow-[0_4px_20px_rgba(244,63,94,0.3)]"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 mr-2" />
            <span className="text-xs font-bold text-rose-200 uppercase tracking-widest">{criticalCases} Critical case{criticalCases > 1 ? 's' : ''} requires review</span>
          </motion.div>
        )}

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1] text-white">
          Active <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]">Intelligence Grid</span>
        </h1>
        
        <p className="text-base text-[#CBD5E1] font-medium max-w-xl mb-8 leading-relaxed">
          Monitor incoming reports, coordinate field agents, and track live geographic telemetry. Ensure timely escalation of critical priority targets.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => setCurrentView('caselist')}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center border border-cyan-400/30"
          >
            <List className="w-4 h-4 mr-2" /> View Assigned Cases
          </button>
          
          <button 
            onClick={() => setCurrentView('map')}
            className="w-full sm:w-auto px-6 py-3.5 bg-[rgba(30,41,59,0.55)] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] rounded-xl font-bold text-sm transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center backdrop-blur-sm"
          >
            <MapIcon className="w-4 h-4 mr-2 text-cyan-400" /> Open Geo-Radar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
