import React from 'react';
import { motion } from 'framer-motion';
import { Map, MapPin } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

export default function AdminGeoHeatmap({ cases }) {
  const locCounts = cases.reduce((acc, c) => {
    const l = c.location || 'Unknown';
    acc[l] = (acc[l] || 0) + 1;
    return acc;
  }, {});

  const maxDensity = Math.max(...Object.values(locCounts), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#F8FAFC]">Regional Geo-Heatmap Density</h3>
          <p className="text-xs text-[#64748B] mt-1">Live satellite mapping of incident clusters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <GlassCard className="flex flex-col">
           <h4 className="font-bold text-[#F8FAFC] flex items-center text-sm uppercase tracking-wider mb-6">
             <Map className="w-4 h-4 text-cyan-400 mr-2"/> Density Metrics
           </h4>
           <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {Object.entries(locCounts).sort((a,b)=>b[1]-a[1]).map(([loc, count], idx) => {
               const percentage = (count / maxDensity) * 100;
               return (
                 <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-bold text-[#F8FAFC]">{loc}</span>
                       <span className="text-xs font-bold text-[#CBD5E1]">{count} Active Incidents</span>
                    </div>
                    <div className="h-2 w-full bg-[#0F172A] rounded-full overflow-hidden shadow-inner border border-[#1E293B]">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         transition={{ duration: 1.5, delay: idx * 0.1, ease: "easeOut" }}
                         className={`h-full rounded-full transition-colors ${
                           percentage > 70 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 
                           percentage > 30 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 
                           'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                         }`} 
                       />
                    </div>
                 </div>
               )
             })}
             {Object.keys(locCounts).length===0 && (
               <p className="text-sm text-[#64748B] font-medium italic text-center py-10">No regional arrays populated yet.</p>
             )}
           </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
           {/* Decorative Abstract Radar Mapping */}
           <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at center, #22d3ee 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
           
           <div className="relative flex items-center justify-center w-full h-full">
             <div className="w-72 h-72 border border-cyan-500/20 rounded-full animate-[ping_4s_ease-in-out_infinite] absolute mix-blend-screen"></div>
             <div className="w-52 h-52 border-2 border-cyan-500/30 rounded-full absolute shadow-[0_0_30px_rgba(34,211,238,0.15)]"></div>
             <div className="w-24 h-24 bg-cyan-900/20 rounded-full animate-pulse absolute"></div>
             <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,1)] z-10 absolute"></div>
             <MapPin className="text-[#F8FAFC] w-8 h-8 z-10 absolute -top-8 animate-bounce" />
           </div>

           <div className="absolute bottom-6 left-6 bg-[#020617]/80 backdrop-blur-md border border-[#1E293B] px-4 py-2.5 rounded-xl flex items-center shadow-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping mr-3"></div>
              <p className="text-[10px] font-bold text-[#F8FAFC] uppercase tracking-widest">Live Satellite Scan Active</p>
           </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
