import React from 'react';
import { motion } from 'framer-motion';
import { History, ShieldAlert } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

export default function AuditLogs({ auditLogs }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#F8FAFC]">System Audit Trails</h3>
          <p className="text-xs text-[#64748B] mt-1">Immutable cryptographic log of all system actions.</p>
        </div>
        <div className="px-3 py-1.5 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-3 h-3" /> Integrity Verified
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="p-5 border-b border-[#1E293B] bg-[#020617]/50 flex justify-between items-center shrink-0">
           <h4 className="font-bold text-[#F8FAFC] flex items-center text-sm uppercase tracking-wider"><History className="w-4 h-4 text-cyan-400 mr-2"/> Action History</h4>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px before:h-full before:w-px before:bg-[#334155]">
            {auditLogs.slice(0, 50).map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="relative flex items-start group"
              >
                 <div className="w-3 h-3 rounded-full bg-[#1E293B] border-2 border-[#020617] absolute -left-1 top-2.5 shadow-sm group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all"></div>
                 <div className="ml-8 border border-[#1E293B] bg-[#0F172A]/80 p-4 rounded-xl w-full group-hover:border-[#334155] transition-colors">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                     <p className="text-sm font-bold text-[#F8FAFC]">{log.action}</p>
                     <span className="text-[10px] font-bold text-[#64748B] bg-[#020617] border border-[#1E293B] px-2.5 py-1 rounded-md shadow-inner shrink-0">
                       {new Date(log.createdAt).toLocaleString()}
                     </span>
                   </div>
                   <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E293B]/50">
                     <p className="text-xs font-semibold text-[#64748B]">
                       Actor: <span className="text-cyan-400 font-bold ml-1">{log.performedBy || 'System Protocol'}</span>
                     </p>
                     <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold">Trace ID: {log._id?.substring(0,8) || 'SYS-INT'}</span>
                   </div>
                 </div>
              </motion.div>
            ))}
            {auditLogs.length === 0 && (
              <div className="ml-8 text-sm text-[#64748B] italic">Audit array natively empty. No logs recorded yet.</div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
