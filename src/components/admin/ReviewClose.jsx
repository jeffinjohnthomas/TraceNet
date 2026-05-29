import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import GlassCard from '../shared/GlassCard';

export default function ReviewClose({ cases, handleGenerateReport, handleCloseCase, currentView, noteForm, setNoteForm, handlePostNote }) {
  const activeCases = cases.filter(c => c.status !== 'Closed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#F8FAFC]">Compliance & Closure Review</h3>
          <p className="text-xs text-[#64748B] mt-1">Audit active cases and authorize operational closure.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {activeCases.map((c, index) => (
          <GlassCard key={c.id} delay={0.05 * index} className="p-0">
            {/* Header */}
            <div className="p-6 border-b border-[#1E293B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#020617]/30">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-[#F8FAFC] text-lg tracking-tight">{c.id}</h4>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm text-[#CBD5E1] mb-1 font-medium">Subject: {c.subjectName}</p>
                <p className="text-xs text-[#64748B]">
                  Assigned to: <span className="font-bold text-cyan-400">{c.investigator}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleGenerateReport(c.id)} 
                  className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#F8FAFC] rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2 text-cyan-400"/> Download Brief
                </button>
                <button 
                  onClick={() => handleCloseCase(c)} 
                  className="px-4 py-2 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/50 text-teal-400 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2"/> Authorize Closure
                </button>
              </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
               <div className="p-6 border-r border-[#1E293B]">
                 <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-4">Operational Timeline</h5>
                 <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[0.35rem] before:-translate-x-px before:h-full before:w-px before:bg-[#334155]">
                    {c.updates && c.updates.length > 0 ? (
                       c.updates.map((u, i) => (
                         <div key={i} className="relative flex items-start text-sm">
                           <div className="w-3 h-3 rounded-full bg-[#020617] mt-1 absolute left-0 ring-2 ring-cyan-500 flex items-center justify-center">
                             <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                           </div>
                           <div className="ml-8">
                             <p className="font-bold text-[#F8FAFC] flex items-center gap-2">
                               {u.status} 
                               <span className="text-[9px] font-bold text-[#64748B] bg-[#020617] px-1.5 py-0.5 rounded border border-[#1E293B]">
                                 {new Date(u.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                             </p>
                             <p className="text-xs text-[#CBD5E1] font-medium mt-1.5 leading-relaxed">{u.message}</p>
                           </div>
                         </div>
                       ))
                    ) : (
                       <p className="text-xs text-[#64748B] italic font-medium ml-4">Timeline array natively empty.</p>
                    )}
                 </div>
               </div>

               <div className="p-6 bg-[#020617]/50 flex flex-col">
                 <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-4">Admin Oversight Notes</h5>
                 <textarea 
                   value={currentView==='review' ? noteForm.text : ''} 
                   onChange={e=>setNoteForm({...noteForm, text: e.target.value})} 
                   className="w-full flex-1 min-h-[120px] text-sm p-4 rounded-xl border border-[#334155] bg-[#0F172A] mb-4 outline-none focus:border-cyan-500 resize-none text-[#F8FAFC] placeholder-[#64748B] shadow-inner transition-colors" 
                   placeholder="Document admin directives or review notes..."
                 />
                 <div className="flex justify-between items-center mt-auto">
                    <select 
                      value={noteForm.visibility} 
                      onChange={e=>setNoteForm({...noteForm, visibility: e.target.value})} 
                      className="bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-xs font-bold text-[#CBD5E1] outline-none cursor-pointer"
                    >
                       <option value="private">Internal Clearance Only</option>
                       <option value="public">Publicly Visible</option>
                    </select>
                    <button 
                      onClick={()=>handlePostNote(c._id || c.id)} 
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 uppercase tracking-wider"
                    >
                      Log Directive
                    </button>
                 </div>
               </div>
            </div>
          </GlassCard>
        ))}
        {activeCases.length === 0 && (
          <GlassCard noPadding className="flex items-center justify-center p-12 bg-transparent border-dashed border-[#334155]">
            <p className="text-sm font-bold text-[#64748B]">No active cases pending review.</p>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
