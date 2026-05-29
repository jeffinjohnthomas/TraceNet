import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldCheck, FileCheck, CheckCircle, Search, Video, Image as ImageIcon, FileText, Lock, Globe } from 'lucide-react';

export function PriorityBadge({ priority }) {
  const styles = {
    High: "bg-rose-950/40 text-rose-400 border-rose-500/30",
    Medium: "bg-amber-950/40 text-amber-400 border-amber-500/30",
    Low: "bg-teal-950/40 text-teal-400 border-teal-500/30"
  };
  const icon = {
    High: <AlertTriangle size={14} className="mr-1" strokeWidth={2.5}/>,
    Medium: <Clock size={14} className="mr-1" strokeWidth={2.5}/>,
    Low: <ShieldCheck size={14} className="mr-1" strokeWidth={2.5}/>
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[priority] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {icon[priority]} {priority}
    </span>
  );
}

export function ProgressStepper({ status, onChangeStatus }) {
  const steps = ["Submitted", "In Progress", "Evidence Verified", "Subject Interviewed", "Report Filed", "Closed"];
  const currentStep = steps.indexOf(status);

  return (
    <div className="relative w-full py-4 my-2">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full"></div>
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-500 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        style={{ width: `${Math.max(0, currentStep / (steps.length - 1)) * 100}%` }}
      ></div>
      
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const completed = idx <= currentStep;
          const current = idx === currentStep;
          return (
            <div key={idx} onClick={() => onChangeStatus && onChangeStatus(step)} className="flex flex-col items-center cursor-pointer group relative">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all ${completed ? 'bg-cyan-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-900 border-2 border-slate-700'} ${current ? 'ring-4 ring-cyan-500/30 scale-110' : ''}`}>
                {completed ? <CheckCircle className="text-slate-900 w-3 h-3" /> : null}
              </div>
              <div className="absolute top-8 text-[10px] font-bold text-center w-24 bg-slate-800 text-slate-200 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-slate-700 shadow-lg">
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TimelineItem({ item }) {
  const icon = {
    video: <Video size={16} className="text-purple-400" />,
    image: <ImageIcon size={16} className="text-cyan-400" />,
    doc: <FileText size={16} className="text-amber-400" />,
    default: <FileCheck size={16} className="text-slate-400" />
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center z-10 shadow-inner">
          {icon[item.type] || icon.default}
        </div>
        <div className="flex-1 w-px bg-slate-800 my-2"></div>
      </div>
      <div className="flex-1 pb-6">
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner hover:border-cyan-500/50 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{item.status || item.title || 'Status Update'}</h4>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{new Date(item.time || item.timestamp).toLocaleString()}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            {item.message}
          </p>
          {item.investigatorName && (
             <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-wider flex items-center">
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-1.5"></span>
               Logged by {item.investigatorName}
             </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotesPanel({ notes = [], onPostNote, isLoading }) {
  const [newNote, setNewNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const handlePost = () => {
    if(!newNote.trim()) return;
    onPostNote(newNote, isPrivate ? 'private' : 'public');
    setNewNote('');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-800 bg-slate-900 shrink-0">
        <h3 className="text-base font-bold text-white mb-4 flex items-center"><FileText className="w-5 h-5 text-cyan-400 mr-2"/> Investigator Notes</h3>
        <textarea 
          placeholder="Add an observation..."
          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none resize-none transition-all shadow-inner placeholder-slate-600"
          rows="3"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
        ></textarea>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button onClick={() => setIsPrivate(true)} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${isPrivate ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'}`}>
              <Lock size={12} className="mr-1" /> Internal
            </button>
            <button onClick={() => setIsPrivate(false)} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${!isPrivate ? 'bg-teal-900/40 text-teal-400 border-teal-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'}`}>
              <Globe size={12} className="mr-1" /> Public
            </button>
          </div>
          <button onClick={handlePost} disabled={!newNote.trim()} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none border border-cyan-500">
            Post Note
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-950">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm font-medium">Loading logs...</div>
        ) : !notes || notes.length === 0 ? (
          <div className="text-center py-10 border-2 border-slate-800 border-dashed rounded-2xl bg-slate-900/50 text-slate-500 text-sm font-medium">Data stream empty. No logs yet.</div>
        ) : (
          notes.map(note => (
            <div key={note._id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner relative group">
              <span className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${note.visibility === 'private' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-900/30 text-blue-400 border-blue-500/30'}`}>
                {note.visibility}
              </span>
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold text-slate-200 flex items-center">
                   <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center mr-2 border border-slate-700"><Lock size={10} className="text-slate-400"/></div>
                   {note.author}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium pl-8 border-l-2 border-slate-800">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
