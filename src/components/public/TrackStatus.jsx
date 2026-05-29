import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Clock, ShieldCheck, User, Info, CheckCircle, AlertTriangle, FileSearch } from 'lucide-react';
import api from '../../services/api';

export default function TrackStatus() {
  const [trackingId, setTrackingId] = useState('');
  const [activePollId, setActivePollId] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => {
    const fetchUserCases = async () => {
      try {
        const { data } = await api.get('/cases');
        // Sort newest first, then take top 5
        const sortedCases = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const userCaseIds = sortedCases.map(c => c.caseId).slice(0, 5);
        setRecentCases(userCaseIds);
      } catch (err) {
        console.error("Failed to load user cases", err);
      }
    };
    
    fetchUserCases();
    
    // Refresh cases if a new one is submitted during this session
    window.addEventListener('cis_recent_cases_updated', fetchUserCases);
    
    const handleTrackRequest = (e) => {
      const id = e.detail;
      setTrackingId(id.trim().toUpperCase());
      setActivePollId(id.trim().toUpperCase());
    };
    window.addEventListener('track_case_request', handleTrackRequest);

    return () => {
      window.removeEventListener('cis_recent_cases_updated', fetchUserCases);
      window.removeEventListener('track_case_request', handleTrackRequest);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (activePollId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/cases/${activePollId}`);
          setCaseData(response.data);
          const notesRes = await api.get(`/notes/${response.data._id}`);
          setNotes(notesRes.data);
          setError('');
        } catch (err) {
          setError(err.response?.data?.message || 'Case ID Not Found in registry.');
          setCaseData(null);
          setActivePollId('');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
      interval = setInterval(fetchData, 5000);
    }
    return () => clearInterval(interval);
  }, [activePollId]);

  const handleTrack = (e) => {
    e.preventDefault();
    setActivePollId(trackingId.trim().toUpperCase());
  };

  const resetTracking = () => {
    setCaseData(null);
    setActivePollId('');
    setTrackingId('');
    setError('');
  };

  return (
    <section id="track" className="relative z-10 max-w-5xl mx-auto px-4 py-20">
      
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Track a Case</h2>
        <p className="text-[#CBD5E1] font-medium max-w-xl mx-auto">Enter your encrypted Tracking ID to view real-time status updates and authorized public notes from our investigators.</p>
      </div>

      {/* Sleek Search Bar */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onSubmit={handleTrack} 
        className="bg-[rgba(15,23,42,0.75)] p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#334155] mb-10 flex flex-col sm:flex-row items-center focus-within:ring-1 focus-within:ring-cyan-500 transition-all duration-300 backdrop-blur-md max-w-3xl mx-auto gap-3"
      >
        <div className="relative flex-1 w-full group ml-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] group-focus-within:text-cyan-400 transition-colors" />
          <input 
            required 
            type="text" 
            value={trackingId} 
            onChange={e=>setTrackingId(e.target.value)} 
            placeholder="e.g. CIS-2026-X123" 
            className="w-full pl-12 pr-4 py-4 bg-transparent text-lg font-bold outline-none text-white tracking-wider placeholder-[#334155]" 
          />
        </div>
        <button 
          disabled={isLoading} 
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center shrink-0 border border-cyan-400/30"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Authenticate'}
        </button>
      </motion.form>

      {/* Recent Cases Section (always show if there's no caseData) */}
      {!caseData && recentCases.length > 0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-3xl mx-auto mb-10 text-center">
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Your Recent Reports</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {recentCases.map(id => (
              <button 
                key={id} 
                onClick={() => {setTrackingId(id); setActivePollId(id);}} 
                className="px-5 py-2.5 bg-[rgba(30,41,59,0.5)] border border-[#334155] rounded-full shadow-sm hover:border-cyan-500/50 hover:bg-[#1E293B] text-sm font-bold text-[#CBD5E1] transition-all flex items-center backdrop-blur-sm"
              >
                <Clock className="w-4 h-4 mr-2 text-[#64748B]" /> {id}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="max-w-3xl mx-auto p-6 bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30 rounded-2xl text-sm text-center flex items-center justify-center shadow-sm backdrop-blur-md mb-10">
          <AlertTriangle className="w-6 h-6 mr-3"/> {error}
        </motion.div>
      )}

      {/* Case Result Panel */}
      {caseData && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[rgba(15,23,42,0.85)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#1E293B] overflow-hidden backdrop-blur-xl"
        >
           {/* Header */}
           <div className="p-10 bg-gradient-to-b from-[#0F172A] to-[rgba(15,23,42,0)] flex flex-col md:flex-row justify-between items-start md:items-center text-white relative border-b border-[#1E293B] gap-6">
              <div className="relative z-10 flex-1">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2 flex items-center"><ShieldCheck className="w-4 h-4 mr-2"/> Verified Target Pull</p>
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">{caseData.caseId}</h2>
                   <button onClick={resetTracking} className="px-6 py-2.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-600/40 hover:text-white transition-all text-sm font-bold flex items-center self-start md:self-auto">
                     Track Another Case
                   </button>
                 </div>
                 <p className="text-xs text-[#64748B] mt-3 font-medium tracking-widest uppercase">Reported: {new Date(caseData.createdAt).toLocaleString()}</p>
              </div>
              <div className="md:text-right relative z-10 bg-[#020617] border border-[#334155] p-5 rounded-2xl shadow-inner">
                 <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">Lead Assigned Officer</p>
                 <p className="font-bold flex items-center text-lg text-[#F8FAFC]">
                    <User className="w-5 h-5 mr-3 text-cyan-400"/> {caseData.investigator?.name || 'Pending Dispatch'}
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-[#1E293B]">
             
             {/* Left: Timeline Graphic */}
             <div className="md:col-span-5 p-10 bg-[rgba(2,6,23,0.5)] border-r border-[#1E293B]">
               <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-10 flex items-center"><Clock className="w-4 h-4 mr-2"/> Lifecycle Status</h3>
               
               <div className="relative pl-6 space-y-12 before:absolute before:inset-0 before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-[#334155]">
                  {["Submitted", "Evidence Verified", "In Progress", "Closed"].map((s, i) => {
                     const currentIdx = ["Submitted", "Evidence Verified", "In Progress", "Closed"].indexOf(caseData.status !== 'Closed' && caseData.status !== 'In Progress' && caseData.status !== 'Evidence Verified' ? 'Submitted' : caseData.status);
                     const isDone = i <= currentIdx;
                     const isCurrent = i === currentIdx;
                     
                     return (
                        <div key={i} className="relative flex items-center group">
                          {/* Node */}
                          <div className={`w-5 h-5 rounded-full absolute -left-[2.1rem] flex items-center justify-center border-4 border-[#020617] ${isDone ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-[#334155]'}`}>
                             {isCurrent && <div className="absolute w-8 h-8 rounded-full bg-cyan-500 opacity-30 animate-ping"></div>}
                             {isDone && !isCurrent && <CheckCircle className="w-3 h-3 text-[#020617]" />}
                          </div>
                          
                          {/* Label */}
                          <div className={`transition-all duration-300 ${isCurrent ? 'scale-105 origin-left' : ''}`}>
                             <span className={`text-base font-bold tracking-wide ${isCurrent ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : isDone ? 'text-white' : 'text-[#64748B]'}`}>{s}</span>
                             {isCurrent && <p className="text-xs font-semibold text-cyan-800 mt-1 uppercase tracking-widest">Active Phase</p>}
                          </div>
                        </div>
                     )
                  })}
               </div>
             </div>

             {/* Right: Audit Logs */}
             <div className="md:col-span-7 p-10 bg-transparent">
               <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-8">Encrypted Audit Trail</h3>
               <div className="space-y-6">
                  {caseData.updates && [...caseData.updates].reverse().map((upd, idx) => (
                    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:idx*0.1}} key={idx} className="flex items-start group">
                       <div className={`w-12 h-12 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-center shrink-0 mr-5 transition-colors ${idx===0 ? 'border-cyan-500/50 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : ''}`}>
                          <CheckCircle className={`w-6 h-6 ${idx===0 ? 'text-cyan-400' : 'text-[#64748B]'}`} />
                       </div>
                       <div className="pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <p className="text-base font-bold text-white">{upd.status}</p>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] bg-[#020617] border border-[#1E293B] px-2.5 py-1 rounded-md">{new Date(upd.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-sm font-medium text-[#CBD5E1] leading-relaxed mb-2">{upd.message}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold flex items-center"><User className="w-3 h-3 mr-1.5"/> Logged via: {upd.investigatorName || 'System'}</p>
                       </div>
                    </motion.div>
                  ))}
               </div>
             </div>
           </div>

           {/* Public Transmissions */}
           <div className="p-10 bg-[#0F172A]">
             <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-8 flex items-center"><Info className="w-5 h-5 mr-3 text-cyan-400"/> Authorized Public Transmissions</h3>
             <div className="grid grid-cols-1 gap-5">
               {notes.length === 0 ? (
                 <div className="p-10 border-2 border-[#1E293B] border-dashed rounded-2xl bg-[#020617] text-center flex flex-col items-center justify-center">
                    <FileSearch className="w-10 h-10 text-[#334155] mb-4" />
                    <p className="text-[#64748B] text-sm font-bold tracking-wide uppercase">No official transmissions have been cleared for public viewing.</p>
                 </div>
               ) : (
                 notes.map((note, idx) => (
                   <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:idx*0.1}} key={note._id} className="p-8 bg-[#020617] border border-[#1E293B] rounded-2xl shadow-inner transition-all hover:border-cyan-500/30">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-bold text-[#CBD5E1] uppercase tracking-wider flex items-center">
                           <div className="w-6 h-6 rounded-full bg-cyan-900/50 flex items-center justify-center mr-2 border border-cyan-500/30">
                             <User className="w-3 h-3 text-cyan-400"/>
                           </div>
                           {note.author}
                        </p>
                        <span className="text-[10px] font-bold text-[#64748B] bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-lg">
                           {new Date(note.timestamp).toLocaleDateString()}
                        </span>
                     </div>
                     <p className="text-[#F8FAFC] font-medium text-base leading-relaxed pl-8 border-l-2 border-[#1E293B]">{note.text}</p>
                   </motion.div>
                 ))
               )}
             </div>
           </div>

        </motion.div>
      )}
    </section>
  );
}
