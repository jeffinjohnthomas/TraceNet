import React from 'react';
import { Search, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function PriorityBadge({ priority }) {
  const styles = { 
    High: "bg-rose-950/50 text-rose-400 border-rose-500/30", 
    Medium: "bg-amber-950/50 text-amber-400 border-amber-500/30", 
    Low: "bg-teal-950/50 text-teal-400 border-teal-500/30" 
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[priority] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>{priority || 'Pending'}</span>;
}

function StatusBadge({ status }) {
  const styles = { 
    'Closed': "bg-teal-950/50 text-teal-400 border border-teal-500/30", 
    'In Progress': "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30", 
    'Evidence Verified': "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30",
    'Submitted': "bg-[#1E293B] text-[#CBD5E1] border border-[#334155]"
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-800 text-slate-400'}`}>{status || 'Submitted'}</span>;
}

export default function OperationsRegistry({ 
  search, setSearch, filterStatus, setFilterStatus, filterPriority, setFilterPriority, 
  paginatedCases, page, setPage, totalPages, setSelectedCaseId, setCurrentView 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full"
    >
      <div className="bg-[rgba(15,23,42,0.75)] backdrop-blur-md rounded-t-[2rem] border border-[#1E293B] shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-0">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" placeholder="Search ID or Alias" 
            value={search} onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-12 pr-4 py-3.5 bg-[#020617]/50 border border-[#334155] rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none placeholder-[#64748B] transition-all shadow-inner" 
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 sm:flex-none px-4 py-3.5 bg-[#020617]/50 border border-[#334155] rounded-xl text-sm font-bold text-[#CBD5E1] focus:ring-2 focus:ring-cyan-500/50 outline-none shadow-inner appearance-none cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Evidence Verified">Evidence Verified</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="flex-1 sm:flex-none px-4 py-3.5 bg-[#020617]/50 border border-[#334155] rounded-xl text-sm font-bold text-[#CBD5E1] focus:ring-2 focus:ring-cyan-500/50 outline-none shadow-inner appearance-none cursor-pointer">
            <option value="All">All Priorities</option>
            <option value="High">Critical</option>
            <option value="Medium">Elevated</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex-1 bg-[rgba(15,23,42,0.75)] backdrop-blur-md border border-[#1E293B] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative rounded-b-[2rem]">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F172A] border-b border-[#1E293B] z-10 shadow-sm">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-[#64748B] uppercase tracking-wider">Tracking ID</th>
                <th className="px-8 py-5 text-xs font-bold text-[#64748B] uppercase tracking-wider">Victim Profile</th>
                <th className="px-8 py-5 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status Phase</th>
                <th className="px-8 py-5 text-xs font-bold text-[#64748B] uppercase tracking-wider">Priority</th>
                <th className="px-8 py-5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {paginatedCases.map((c) => (
                <tr key={c.id} className="hover:bg-[#1E293B]/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-[#F8FAFC] tracking-wide">{c.id}</div>
                    <div className="text-xs font-bold text-[#64748B] mt-1.5 uppercase tracking-wider">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-[#CBD5E1] flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-cyan-400" /> {c.subjectName}
                    </div>
                    <div className="text-sm font-medium text-[#64748B] mt-1 pl-7">{c.age} years old</div>
                  </td>
                  <td className="px-8 py-6"><StatusBadge status={c.status} /></td>
                  <td className="px-8 py-6"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => { setSelectedCaseId(c.id); setCurrentView('casedetail'); }} className="inline-flex items-center justify-center px-6 py-2.5 bg-[rgba(30,41,59,0.55)] border border-[#334155] text-[#CBD5E1] hover:text-white hover:border-cyan-500 hover:bg-cyan-600 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95">
                      Open Operation
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedCases.length === 0 && (
                <tr><td colSpan="5" className="px-8 py-16 text-center text-[#64748B] font-medium text-lg">No operations found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-[#1E293B] bg-[#0F172A] flex items-center justify-between shrink-0">
          <p className="text-sm text-[#64748B] font-bold tracking-wide">Showing page {page} of {totalPages || 1}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={()=>setPage(page-1)} className="p-2.5 bg-[#1E293B] border border-[#334155] rounded-xl text-[#64748B] disabled:opacity-50 hover:bg-[#334155] hover:text-white transition-colors shadow-sm"><ChevronLeft className="w-5 h-5"/></button>
            <button disabled={page===totalPages||totalPages===0} onClick={()=>setPage(page+1)} className="p-2.5 bg-[#1E293B] border border-[#334155] rounded-xl text-[#64748B] disabled:opacity-50 hover:bg-[#334155] hover:text-white transition-colors shadow-sm"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
