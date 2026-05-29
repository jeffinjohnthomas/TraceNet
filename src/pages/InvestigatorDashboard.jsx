import React, { useState, useEffect } from 'react';
import { Sidebar, TopBar } from '../components/investigator/LayoutComponents';
import { PriorityBadge, ProgressStepper, TimelineItem, NotesPanel } from '../components/investigator/SharedUI';
import { Users, AlertTriangle, ShieldAlert, LineChart, FileText, X, Globe, Video, Image as ImageIcon, CheckCircle, MapPin, Search, User, Loader2, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

export default function InvestigatorDashboard({ onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLang, setSummaryLang] = useState('en');

  // Live Data State
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  useEffect(() => {
    fetchCases();
    
    // Initialize Socket
    const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'));
    
    socket.on('new_case', (newCase) => {
      setCases((prev) => [newCase, ...prev]);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-blue-100`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-900">New Incident Reported</p>
                <p className="mt-1 text-xs text-slate-500">Case {newCase.caseId} registered for {newCase.subjectName}.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-200">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    socket.on('case_updated', (updatedCase) => {
      setCases((prev) => prev.map(c => c._id === updatedCase._id ? updatedCase : c));
      if (selectedCase && selectedCase._id === updatedCase._id) {
        setSelectedCase(updatedCase);
      }
      toast.success(`Case ${updatedCase.caseId} updated to ${updatedCase.status}`, {
        iconTheme: { primary: '#2563eb', secondary: '#fff' },
        style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '14px' }
      });
    });

    return () => socket.disconnect();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/cases');
      setCases(res.data || []);
      setError('');
    } catch (err) {
      setError('Failed to securely pull case files from the central database.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaseDetails = async (c) => {
    setSelectedCase(c);
    fetchNotes(c._id);
  };

  const fetchNotes = async (caseId) => {
    try {
      setIsNotesLoading(true);
      const res = await api.get(`/notes/${caseId}`);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if(!selectedCase) return;
    try {
       await api.put(`/cases/${selectedCase._id}/status`, { status: newStatus });
       // Optimistic update handled via socket mostly, but can do it here too
    } catch (err) {
       toast.error("Failed to update case status. Ensure network connection.");
    }
  };

  const handlePostNote = async (text, visibility) => {
    if(!selectedCase || !text) return;
    try {
      await api.post('/notes', { caseId: selectedCase._id, text, visibility });
      fetchNotes(selectedCase._id); // Reload notes
    } catch (err) {
      toast.error("Failed to securely post observation.");
    }
  };

  // Computed data
  const filteredCases = cases.filter(c => 
    (c.caseId && c.caseId.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (c.subjectName && c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const highPriority = cases.filter(c => c.priority === 'High' && c.status !== 'Closed').length;
  const medPriority = cases.filter(c => c.priority === 'Medium' && c.status !== 'Closed').length;
  const lowPriority = cases.filter(c => c.priority === 'Low' && c.status !== 'Closed').length;
  const activeCasesCount = cases.filter(c => c.status !== 'Closed').length;

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Active Cases</p>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Users className="w-5 h-5" /></div>
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 relative z-10 tracking-tight">{activeCasesCount}</h2>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-white/50 backdrop-blur-xl border border-red-100 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-red-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">High Priority</p>
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm"><AlertTriangle className="w-5 h-5" strokeWidth={2.5}/></div>
        </div>
        <h2 className="text-4xl font-extrabold text-red-800 relative z-10 tracking-tight">{highPriority}</h2>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-white/50 backdrop-blur-xl border border-orange-100 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-widest">Medium Priority</p>
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm"><LineChart className="w-5 h-5" strokeWidth={2.5}/></div>
        </div>
        <h2 className="text-4xl font-extrabold text-orange-800 relative z-10 tracking-tight">{medPriority}</h2>
      </div>
      <div className="bg-gradient-to-br from-teal-50 to-white/50 backdrop-blur-xl border border-teal-100 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">Low Priority</p>
          <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm"><ShieldAlert className="w-5 h-5" strokeWidth={2.5}/></div>
        </div>
        <h2 className="text-4xl font-extrabold text-teal-800 relative z-10 tracking-tight">{lowPriority}</h2>
      </div>
    </div>
  );

  const renderCaseList = () => (
    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-xl overflow-hidden flex-1 flex flex-col relative before:absolute before:inset-0 before:pointer-events-none before:border before:border-slate-200/50 before:rounded-3xl">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white/30">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Active Operations Pipeline</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time sync enabled</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchCases} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md text-slate-700 transition-all active:scale-95 shadow-sm">Sync Now</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold">
              <Loader2 className="w-10 h-10 mb-4 animate-spin text-blue-500" />
              Establishing Secure Connection...
           </div>
        ) : error ? (
           <div className="p-6 bg-red-50 text-red-600 font-bold border border-red-200 rounded-2xl text-sm text-center flex items-center justify-center shadow-sm">
             <AlertTriangle className="w-6 h-6 mr-3"/> {error}
           </div>
        ) : filteredCases.map(c => (
          <div 
            key={c._id} 
            onClick={() => loadCaseDetails(c)}
            className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:bg-gradient-to-r hover:from-white hover:to-blue-50/30 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mr-5 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                 <User className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 flex items-center tracking-tight">
                  {c.caseId} 
                  <span className="mx-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 
                  <span className="text-slate-700">{c.subjectName}</span>
                </h4>
                <div className="text-xs text-slate-500 mt-1.5 flex items-center font-medium">
                  {c.age} years old <span className="mx-2 w-1 h-1 bg-slate-300 rounded-full"></span> {c.location}
                </div>
                {/* Reporter Snippet */}
                {c.reporterId && (
                  <div className="text-[10px] text-slate-400 mt-1.5 font-semibold flex items-center uppercase tracking-wide">
                    <User className="w-3 h-3 mr-1 opacity-70" /> Reported by: {c.reporterId.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
              <PriorityBadge priority={c.priority} />
              <div className="flex items-center mt-0 sm:mt-2.5">
                <div className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse"></div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{c.status}</p>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !error && filteredCases.length === 0 && (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-sm font-semibold tracking-wide">No operations matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCaseDetail = () => {
    if(!selectedCase) return null;
    return (
      <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center mb-2">
              <button 
                onClick={() => setSelectedCase(null)} 
                className="mr-4 p-2 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200 transition-all active:scale-95"
                title="Back to queue"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mr-4">{selectedCase.caseId}</h2>
              <PriorityBadge priority={selectedCase.priority} />
            </div>
            <p className="text-sm text-slate-500 ml-[3.25rem] font-medium flex items-center">
              Timestamp: {new Date(selectedCase.createdAt).toLocaleString()} <span className="mx-2 w-1 h-1 bg-slate-300 rounded-full"></span> Zone: {selectedCase.location}
            </p>
          </div>
          <button 
            onClick={() => setShowSummaryModal(true)}
            className="mt-4 md:mt-0 relative z-10 flex items-center px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            <FileText className="w-4 h-4 mr-2" /> Generate Report
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col xl:flex-row gap-8 bg-slate-50/50">
          <div className="flex-1 space-y-8">
            {/* Intel Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Victim Profile */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center">
                  <User className="w-3.5 h-3.5 mr-2" /> Victim Identity
                </h3>
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                     <User className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-800 tracking-tight">{selectedCase.subjectName}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{selectedCase.age} years old <span className="mx-1.5">&bull;</span> {selectedCase.gender || 'Unspecified'}</p>
                  </div>
                </div>
              </div>

              {/* Reporter Details (NEW FEATURE) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Incident Reporter
                </h3>
                {selectedCase.reporterId ? (
                  <div className="space-y-2">
                    <p className="text-base font-bold text-slate-800">{selectedCase.reporterId.name}</p>
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" /> {selectedCase.reporterId.email}
                    </div>
                    {selectedCase.reporterId.phone && (
                      <div className="flex items-center text-sm text-slate-600 font-medium mt-1">
                        <Phone className="w-4 h-4 mr-2 text-slate-400" /> {selectedCase.reporterId.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">System Auto-Generated / Anonymous</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Field Notes & Description</h3>
               <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                 {selectedCase.description}
               </p>
            </div>

            {/* Tracker */}
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 ml-2">Investigation Protocol Status</h3>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <ProgressStepper status={selectedCase.status} onChangeStatus={handleStatusChange} />
                 <p className="text-[10px] text-slate-400 mt-6 text-center font-bold tracking-wide uppercase">Interactive node controls enabled. Click to mutate state.</p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-6 ml-2">Audit & Evidence Timeline</h3>
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-slate-200 before:to-transparent">
                {selectedCase.updates && [...selectedCase.updates].reverse().map(item => <TimelineItem key={item._id} item={item} />)}
                {(!selectedCase.updates || selectedCase.updates.length === 0) && (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-semibold">
                    No timeline events recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full xl:w-96 shrink-0 h-[600px] xl:h-auto">
             <NotesPanel notes={notes} onPostNote={handlePostNote} isLoading={isNotesLoading} />
          </div>
        </div>
      </div>
    );
  };

  const renderMapView = () => {
    // Basic loc to mapX mapY conversion for known cities
    const mapCoordinates = {
       "Bangalore Urban": {x: '50%', y: '60%'},
       "Mysore": {x: '40%', y: '80%'},
       "Mangalore": {x: '20%', y: '50%'},
       "Delhi Central": {x: '40%', y: '20%'},
       "Mumbai Metropolitan": {x: '25%', y: '40%'},
       "Chennai": {x: '60%', y: '75%'},
       "Other Zone": {x: '80%', y: '50%'}
    };

    return (
      <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-700">
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800">
          <h3 className="text-2xl font-bold text-white tracking-tight">Geospatial Intelligence Map</h3>
          <p className="text-sm text-slate-300 mt-1 font-medium">Real-time mapping of submitted intelligence nodes.</p>
        </div>
        <div className="flex-1 relative bg-slate-100 p-2 lg:p-4">
           {/* Fake Map Container */}
           <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-slate-300 to-slate-400 rounded-2xl relative overflow-hidden shadow-inner border border-slate-300/50">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath stroke='%23000' stroke-width='1' d='M0 0l60 60M60 0L0 60'/%3E%3C/svg%3E")`, backgroundSize: '60px 60px' }}></div>
              
              {/* Map markers */}
              {cases.filter(c => c.status !== 'Closed').map(c => {
                const coords = mapCoordinates[c.location] || {x: `${Math.random()*60 + 20}%`, y: `${Math.random()*60 + 20}%`};
                return (
                <div key={c._id} className="absolute group cursor-pointer transition-transform hover:scale-125 hover:z-50" style={{ top: coords.y, left: coords.x }}>
                   <div className="relative flex justify-center items-center">
                      <div className={`absolute w-14 h-14 rounded-full animate-ping opacity-30 ${c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-teal-500'}`}></div>
                      <MapPin className={`w-10 h-10 relative z-10 drop-shadow-xl ${c.priority === 'High' ? 'text-red-500 fill-red-50' : c.priority === 'Medium' ? 'text-orange-500 fill-orange-50' : 'text-teal-500 fill-teal-50'}`} />
                   </div>
                   <div className="hidden group-hover:block w-64 absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-white p-4 rounded-2xl shadow-2xl z-20">
                      <div className="flex justify-between items-start mb-2">
                         <p className="font-bold text-sm tracking-wide">{c.caseId}</p>
                         <div className={`w-2 h-2 rounded-full ${c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-teal-500'}`}></div>
                      </div>
                      <p className="text-slate-300 text-xs font-medium leading-relaxed">{c.subjectName} ({c.age || 'Unknown'} years) <br/> {c.location}</p>
                   </div>
                </div>
              )})}
  
              {/* Legend */}
              <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white min-w-40">
                 <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Risk Matrix</h4>
                 <div className="space-y-3 text-xs font-bold text-slate-700">
                   <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-red-500 border-2 border-white mr-3 shadow-md"></span> Critical Alert</div>
                   <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white mr-3 shadow-md"></span> Medium Priority</div>
                   <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-teal-500 border-2 border-white mr-3 shadow-md"></span> Monitored Node</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Sidebar currentView={currentView} setCurrentView={(v) => {setCurrentView(v); setSelectedCase(null);}} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          {selectedCase ? (
            renderCaseDetail()
          ) : currentView === 'map' ? (
            renderMapView()
          ) : (
            <div className="max-w-7xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderSummaryCards()}
              <div className="flex-1 min-h-[500px]">
                {renderCaseList()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] scale-in-center">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-800 flex items-center tracking-tight">
                <FileText className="w-6 h-6 mr-3 text-blue-600" /> Executive Case Summary
              </h2>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-4 space-x-2">
              <button onClick={() => setSummaryLang('en')} className={`px-5 py-3 text-sm font-bold flex items-center border-b-2 transition-colors rounded-t-xl ${summaryLang === 'en' ? 'border-blue-600 text-blue-700 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>English</button>
              <button onClick={() => setSummaryLang('kn')} className={`px-5 py-3 text-sm font-bold flex items-center border-b-2 transition-colors rounded-t-xl ${summaryLang === 'kn' ? 'border-blue-600 text-blue-700 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>ಕನ್ನಡ ಅನುವಾದ</button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white flex-1">
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-sm text-slate-700 leading-relaxed font-medium shadow-inner">
                 {summaryLang === 'en' ? (
                   <>
                    <p className="mb-5 text-base"><strong className="text-slate-900 font-extrabold uppercase tracking-wide text-xs block mb-1">Case Reference:</strong> {selectedCase.caseId}</p>
                    <p className="mb-5 text-base"><strong className="text-slate-900 font-extrabold uppercase tracking-wide text-xs block mb-1">Current Status:</strong> <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">{selectedCase.status}</span></p>
                    <p className="text-base leading-loose">The subject, identified as <strong className="text-slate-900">{selectedCase.subjectName}</strong> ({selectedCase.age || 'Unknown'} of age), was reported at the <strong>{selectedCase.location}</strong> vicinity. The present risk profile is determined as <strong className={`${selectedCase.priority === 'High' ? 'text-red-600' : selectedCase.priority === 'Medium' ? 'text-orange-600' : 'text-teal-600'}`}>{selectedCase.priority}</strong>.</p>
                    <p className="mt-5 text-base leading-loose">Preliminary investigative actions have been initiated in accordance with the SOP protocol. Further review of digital or physical evidence is currently underway to ascertain the veracity of the claim.</p>
                   </>
                 ) : (
                   <div className="text-base font-sans leading-loose">
                    <p className="mb-5"><strong className="text-slate-900 font-extrabold uppercase tracking-wide text-xs block mb-1">ದೂರು ಉಲ್ಲೇಖ (Case ID):</strong> {selectedCase.caseId}</p>
                    <p className="mb-5"><strong className="text-slate-900 font-extrabold uppercase tracking-wide text-xs block mb-1">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ (Status):</strong> <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">{selectedCase.status === 'Submitted' ? 'ಸಲ್ಲಿಸಲಾಗಿದೆ' : selectedCase.status === 'Closed' ? 'ಮುಚ್ಚಲಾಗಿದೆ' : 'ಪ್ರಗತಿಯಲ್ಲಿದೆ'}</span></p>
                    <p className="mt-4">ವಿಷಯವನ್ನು <strong>{selectedCase.subjectName}</strong> ({selectedCase.age || 'Unknown'} ವಯಸ್ಸು) ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ, ಇದನ್ನು <strong>{selectedCase.location}</strong> ಸುತ್ತಮುತ್ತ ವರದಿ ಮಾಡಲಾಗಿದೆ. ಪ್ರಸ್ತುತ ಅಪಾಯದ ಪ್ರೊಫೈಲ್ ಅನ್ನು <strong className={`${selectedCase.priority === 'High' ? 'text-red-600' : selectedCase.priority === 'Medium' ? 'text-orange-600' : 'text-teal-600'}`}>{selectedCase.priority === 'High' ? 'ಹೆಚ್ಚು (High)' : selectedCase.priority === 'Medium' ? 'ಮಧ್ಯಮ (Medium)' : 'ಕಡಿಮೆ (Low)'}</strong> ಎಂದು ನಿರ್ಧರಿಸಲಾಗಿದೆ.</p>
                    <p className="mt-5">ಎಸ್ಒಪಿ ಪ್ರೋಟೋಕಾಲ್ ಪ್ರಕಾರ ಪ್ರಾಥಮಿಕ ತನಿಖಾ ಕ್ರಮಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ. ಪುರಾವೆಗಳ ಪರಿಶೀಲನೆ ಪ್ರಸ್ತುತ ಪ್ರಗತಿಯಲ್ಲಿದೆ.</p>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button onClick={() => setShowSummaryModal(false)} className="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95">Acknowledge & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
