import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  // type can be 'status', 'priority', 'workload'
  
  const getStyles = () => {
    if (type === 'priority') {
      switch (status) {
        case 'High':
        case 'Critical': return "bg-rose-950/40 text-rose-400 border-rose-500/30";
        case 'Medium':
        case 'Elevated': return "bg-amber-950/40 text-amber-400 border-amber-500/30";
        case 'Low':
        case 'Standard': return "bg-blue-950/40 text-blue-400 border-blue-500/30";
        default: return "bg-slate-800 text-slate-400 border-slate-700";
      }
    }
    
    if (type === 'workload') {
      switch (status) {
        case 'Overloaded': return "bg-rose-950/50 text-rose-400 border-rose-500/30";
        case 'Heavy': return "bg-amber-950/50 text-amber-400 border-amber-500/30";
        case 'Normal': return "bg-teal-950/50 text-teal-400 border-teal-500/30";
        case 'Low': return "bg-blue-950/50 text-blue-400 border-blue-500/30";
        default: return "bg-slate-800 text-slate-400 border-slate-700";
      }
    }

    // Default status styles
    switch (status) {
      case 'Closed': return "bg-teal-950/50 text-teal-400 border-teal-500/30";
      case 'In Progress': return "bg-cyan-950/50 text-cyan-400 border-cyan-500/30";
      case 'Evidence Verified': return "bg-cyan-950/50 text-cyan-400 border-cyan-500/30";
      case 'Submitted': return "bg-[#1E293B] text-[#CBD5E1] border-[#334155]";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStyles()}`}>
      {status || 'Unknown'}
    </span>
  );
}
