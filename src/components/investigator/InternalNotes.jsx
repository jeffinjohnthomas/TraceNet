import React from 'react';
import { MessageSquare, Lock, Globe, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InternalNotes({ 
  newNote, setNewNote, noteIsPrivate, setNoteIsPrivate, handleAddNote, activeNotes 
}) {
  return (
    <div className="w-full lg:w-1/3 flex flex-col bg-[#020617] border-l border-[#1E293B]">
      <div className="p-6 md:p-8 border-b border-[#1E293B] bg-[rgba(15,23,42,0.4)] shrink-0">
        <h3 className="text-lg font-black text-white mb-4 flex items-center tracking-tight">
          <MessageSquare className="w-5 h-5 text-cyan-400 mr-2"/> Encrypted Field Notes
        </h3>
        
        <textarea 
          value={newNote} onChange={e => setNewNote(e.target.value)}
          placeholder="Draft secure field note or intelligence update..."
          className="w-full h-32 p-5 bg-[#0F172A]/50 border border-[#334155] rounded-xl text-sm text-[#F8FAFC] focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none resize-none transition-all shadow-inner placeholder-[#64748B]"
        ></textarea>
        
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setNoteIsPrivate(true)} 
              className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all border ${noteIsPrivate ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/30 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]' : 'bg-[#1E293B] text-[#64748B] border-[#334155] hover:bg-[#334155] hover:text-[#CBD5E1]'}`}
            >
              <Lock className="w-3 h-3 mr-1.5"/> Internal
            </button>
            <button 
              onClick={() => setNoteIsPrivate(false)} 
              className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!noteIsPrivate ? 'bg-teal-900/40 text-teal-400 border-teal-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' : 'bg-[#1E293B] text-[#64748B] border-[#334155] hover:bg-[#334155] hover:text-[#CBD5E1]'}`}
            >
              <Globe className="w-3 h-3 mr-1.5"/> Public
            </button>
          </div>
          <button 
            onClick={handleAddNote} 
            disabled={!newNote.trim()} 
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:border-slate-600 border border-cyan-400/30"
          >
            Commit Log
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-4 bg-[#020617]/50">
        {activeNotes.length > 0 ? activeNotes.map((note, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={note._id || note.id} 
            className="p-5 bg-[rgba(15,23,42,0.6)] border border-[#1E293B] rounded-2xl shadow-sm relative group hover:border-[#334155] transition-colors"
          >
             <span className={`absolute top-5 right-5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${note.visibility==='private' ? 'bg-[#0F172A] text-[#64748B] border-[#334155]' : 'bg-teal-950/50 text-teal-400 border-teal-500/30'}`}>
               {note.visibility || 'private'}
             </span>
             <div className="flex items-center mb-4">
               <div className="w-10 h-10 bg-cyan-950/50 border border-cyan-500/30 rounded-xl flex items-center justify-center mr-3 shadow-inner">
                 <User className="w-5 h-5 text-cyan-400" />
               </div>
               <div>
                 <p className="text-sm font-bold text-[#F8FAFC]">{note.author || 'Analyst'}</p>
                 <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mt-0.5">{new Date(note.createdAt).toLocaleString()}</p>
               </div>
             </div>
             <p className="text-sm text-[#CBD5E1] leading-relaxed font-medium">{note.text}</p>
          </motion.div>
        )) : (
          <div className="text-center py-16 text-[#64748B] text-sm font-bold tracking-wide uppercase">
            Data stream empty. No active logs.
          </div>
        )}
      </div>
    </div>
  );
}
