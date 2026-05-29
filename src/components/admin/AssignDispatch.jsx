import React from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';
import GlassCard from '../shared/GlassCard';

export default function AssignDispatch({ cases, investigators, handleAssign, handlePriorityOverride }) {
  const unassignedCases = cases.filter(c => c.investigator === 'Unassigned');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#F8FAFC]">Pending Assignments</h3>
          <p className="text-xs text-[#64748B] mt-1">Review and dispatch operations to field officers.</p>
        </div>
        <div className="px-3 py-1.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-400 uppercase tracking-widest">
          {unassignedCases.length} Targets Awaiting Dispatch
        </div>
      </div>

      <div className="grid gap-4">
        {unassignedCases.map((c, index) => (
          <GlassCard key={c.id} delay={0.05 * index} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-bold text-[#F8FAFC] text-lg tracking-tight">{c.id}</h4>
                <StatusBadge status={c.priority} type="priority" />
              </div>
              <p className="text-sm text-[#CBD5E1] mb-1">
                <span className="text-[#64748B]">Subject:</span> {c.subjectName} <span className="text-[#64748B] text-xs">({c.age || 'Unknown'}y)</span>
                <span className="mx-2 text-[#334155]">|</span>
                <span className="text-[#64748B]">Zone:</span> {c.location}
              </p>
              <p className="text-xs text-[#64748B] font-medium">
                Reported by {c.reporterId?.name || 'Unknown'} on {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 bg-[#020617]/50 p-3 rounded-xl border border-[#1E293B]">
              <select 
                className="w-full sm:w-auto bg-[#0F172A] border border-[#334155] rounded-lg p-2.5 text-xs font-bold text-[#CBD5E1] outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                onChange={(e) => { if (e.target.value) handlePriorityOverride(c._id || c.id, e.target.value); }}
              >
                 <option value="">Set Priority...</option>
                 <option value="High">Force High</option>
                 <option value="Medium">Force Medium</option>
                 <option value="Low">Force Low</option>
              </select>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  id={`assign-${c.id}`}
                  className="flex-1 sm:w-48 bg-[#0F172A] border border-[#334155] rounded-lg p-2.5 text-xs font-bold text-[#CBD5E1] outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                >
                  <option value="">Select Investigator...</option>
                  {investigators.map(inv => (
                    <option key={inv._id || inv.id} value={inv._id || inv.id}>
                      {inv.name} ({inv.activeCases} active)
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    const val = document.getElementById(`assign-${c.id}`).value;
                    if (val) handleAssign(c._id || c.id, val);
                  }} 
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm active:scale-95 transition-all shrink-0"
                >
                  Dispatch
                </button>
              </div>
            </div>
          </GlassCard>
        ))}

        {unassignedCases.length === 0 && (
          <GlassCard noPadding className="flex items-center justify-center p-12 bg-transparent border-dashed border-[#334155]">
            <p className="text-sm font-bold text-[#64748B]">All active operations are currently assigned and balanced.</p>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
