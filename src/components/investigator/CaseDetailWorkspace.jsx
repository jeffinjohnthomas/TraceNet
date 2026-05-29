import React from 'react';
import { Map as MapIcon, ChevronLeft, CheckCircle, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import InternalNotes from './InternalNotes';

function PriorityBadge({ priority }) {
  const styles = { 
    High: "bg-rose-950/50 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]", 
    Medium: "bg-amber-950/50 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]", 
    Low: "bg-teal-950/50 text-teal-400 border-teal-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
  };
  return <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${styles[priority] || 'bg-[#1E293B] text-[#CBD5E1] border-[#334155]'}`}>{priority || 'Pending'} Priority</span>;
}

function StatusBadge({ status }) {
  const styles = { 
    'Closed': "bg-teal-950/50 text-teal-400 border border-teal-500/30", 
    'In Progress': "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30", 
    'Evidence Verified': "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30",
    'Submitted': "bg-[#1E293B] text-[#CBD5E1] border border-[#334155]"
  };
  return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${styles[status] || 'bg-slate-800 text-slate-400'}`}>{status || 'Submitted'}</span>;
}

function StatusStepper({ currentStatus, onStatusChange }) {
  const steps = ["Submitted", "Evidence Verified", "In Progress", "Closed"];
  const currentIdx = Math.max(0, steps.indexOf(currentStatus));
  const percentage = Math.max(0, (currentIdx / (steps.length - 1)) * 100);

  return (
    <div className="relative w-full py-8 px-4 mb-4">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1E293B] rounded-full"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{ width: `${percentage}%` }}></div>
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const completed = idx <= currentIdx;
          const current = idx === currentIdx;
          return (
            <div key={idx} 
                 onClick={() => onStatusChange && step !== currentStatus && onStatusChange(step)}
                 className={`flex flex-col items-center relative ${step === currentStatus ? 'cursor-default' : 'cursor-pointer'} group`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 transition-all duration-500 ${completed ? 'bg-cyan-500 border-[#020617] shadow-[0_0_15px_rgba(99,102,241,0.5)]' + (step !== currentStatus ? ' group-hover:bg-cyan-400' : '') : 'bg-[#0F172A] border-[#1E293B]' + (step !== currentStatus ? ' group-hover:border-cyan-500/50' : '')} ${current ? 'ring-4 ring-cyan-500/30 scale-125' : ''}`}>
                {completed ? <CheckCircle className="text-[#020617] w-4 h-4" /> : <div className={`w-2 h-2 bg-[#334155] rounded-full transition-colors ${step !== currentStatus ? 'group-hover:bg-cyan-500/50' : ''}`}></div>}
              </div>
              <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider w-24 text-center transition-colors duration-500 ${current ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : completed ? 'text-[#CBD5E1]' + (step !== currentStatus ? ' group-hover:text-white' : '') : 'text-[#64748B]' + (step !== currentStatus ? ' group-hover:text-cyan-400' : '')}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CaseDetailWorkspace({
  selectedCase, setCurrentView, setSelectedCaseId,
  handleActivateGPS, statusUpdate, setStatusUpdate, handleUpdateStatus,
  detailsTab, setDetailsTab, activeTimeline,
  newNote, setNewNote, noteIsPrivate, setNoteIsPrivate, handleAddNote, activeNotes
}) {
  if (!selectedCase) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col p-6 animate-in fade-in"
    >
      <div className="bg-[rgba(15,23,42,0.75)] backdrop-blur-xl rounded-[2rem] border border-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="p-6 md:p-8 bg-[#0F172A] border-b border-[#1E293B] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="relative z-10">
            <button onClick={() => {setCurrentView('caselist'); setSelectedCaseId(null);}} className="flex items-center text-xs font-bold text-[#64748B] hover:text-cyan-400 transition-colors mb-3 uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4 mr-1" /> Return to Registry
            </button>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{selectedCase.id}</h2>
              <PriorityBadge priority={selectedCase.priority} />
            </div>
          </div>
          
          <div className="relative z-10">
            {selectedCase.latitude ? (
               <div className="inline-flex items-center px-5 py-3 bg-teal-950/50 text-teal-400 rounded-xl text-sm font-bold border border-teal-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]">
                 <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping mr-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> GPS Signal Locked
               </div>
            ) : (
               <button onClick={handleActivateGPS} className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-95 border border-cyan-400/30">
                 <MapIcon className="w-5 h-5 mr-2" /> Initialize Tracker
               </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Left Panel: Tracker & Details */}
          <div className="w-full lg:w-2/3 flex flex-col overflow-y-auto border-r border-[#1E293B] p-6 md:p-8 bg-[#020617]/50">
            
            <div className="bg-[#0F172A]/80 border border-[#334155] rounded-[1.5rem] p-8 shadow-inner mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="font-black text-lg text-white tracking-tight">Operation Lifecycle</h3>
                <StatusBadge status={selectedCase.status} />
              </div>
              
              <div className="relative z-10 mb-8 pb-4">
                <StatusStepper currentStatus={selectedCase.status} onStatusChange={handleUpdateStatus} />
                <p className="text-[10px] text-[#64748B] mt-12 text-center font-bold tracking-widest uppercase">Interactive node controls enabled. Click a phase to mutate state.</p>
              </div>
            </div>

            <div className="flex gap-8 border-b border-[#1E293B] mb-8 shrink-0">
               <button onClick={()=>setDetailsTab('evidence')} className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${detailsTab === 'evidence' ? 'border-cyan-500 text-cyan-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'border-transparent text-[#64748B] hover:text-[#CBD5E1]'}`}>Evidence Repository</button>
               <button onClick={()=>setDetailsTab('updates')} className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${detailsTab === 'updates' ? 'border-cyan-500 text-cyan-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'border-transparent text-[#64748B] hover:text-[#CBD5E1]'}`}>Audit Logs</button>
            </div>

            {detailsTab === 'evidence' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activeTimeline.filter(t => t.type !== 'doc').length > 0 ? activeTimeline.filter(t => t.type !== 'doc').map((file, idx) => {
                  const isImage = file.fileType?.startsWith('image/') || file.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/) != null;
                  const fullUrl = file.fileUrl?.startsWith('http') ? file.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${file.fileUrl}`;
                  return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    onClick={() => { window.open(fullUrl, '_blank'); }} 
                    className="relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border border-[#1E293B] hover:border-cyan-500/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all bg-[#0F172A] flex flex-col justify-end"
                  >
                    {isImage ? (
                      <img src={fullUrl} alt="Evidence" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors">
                         <ImageIcon className="w-12 h-12 text-[#64748B] group-hover:text-cyan-400 transition-colors" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80"></div>
                    <div className="relative p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                        <h4 className="text-xs font-bold text-white truncate drop-shadow-md">{file.title || 'Artifact'}</h4>
                      </div>
                      <p className="text-[9px] text-cyan-200 uppercase tracking-widest font-black opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(file.timestamp || file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                )}) : (
                  <div className="col-span-full text-center py-16 bg-[#0F172A]/50 rounded-2xl border border-[#1E293B] border-dashed text-[#64748B] font-bold text-sm tracking-wide uppercase">
                    No visual evidence artifacts appended.
                  </div>
                )}
              </div>
            )}
            
            {detailsTab === 'updates' && (
              <div className="flex flex-col gap-5">
                 {activeTimeline.map((item, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     key={item._id || item.id} 
                     className="p-6 bg-[rgba(15,23,42,0.6)] border border-[#1E293B] rounded-2xl border-l-4 border-l-cyan-500 shadow-sm"
                   >
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-black text-white">{item.title || 'Status Update'}</p>
                        <span className="text-[10px] font-bold text-[#CBD5E1] bg-[#020617] px-2.5 py-1 rounded-md border border-[#334155] uppercase tracking-widest shadow-inner">
                          {new Date(item.timestamp || item.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed font-medium">Documentary Source Protocol Logs automatically generated by system state change.</p>
                   </motion.div>
                 ))}
                 {activeTimeline.length === 0 && (
                   <div className="text-center py-16 bg-[#0F172A]/50 rounded-2xl border border-[#1E293B] border-dashed text-[#64748B] font-bold text-sm tracking-wide uppercase">
                     No timeline entries recorded in system.
                   </div>
                 )}
              </div>
            )}
          </div>

          <InternalNotes 
            newNote={newNote} setNewNote={setNewNote}
            noteIsPrivate={noteIsPrivate} setNoteIsPrivate={setNoteIsPrivate}
            handleAddNote={handleAddNote} activeNotes={activeNotes}
          />

        </div>
      </div>
    </motion.div>
  );
}
