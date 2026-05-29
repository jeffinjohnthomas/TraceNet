import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

// New Modular Components
import InvestigatorSidebar from '../components/investigator/InvestigatorSidebar';
import { Search, Filter, AlertTriangle, LogOut, LayoutDashboard, Radar, Shield, List, Activity, Loader2 } from 'lucide-react';
import InvestigatorHeader from '../components/investigator/InvestigatorHeader';
import CommandHero from '../components/investigator/CommandHero';
import OperationStats from '../components/investigator/OperationStats';
import AnalyticsDashboard from '../components/investigator/AnalyticsDashboard';
import InvestigativeModules from '../components/investigator/InvestigativeModules';
import OperationsRegistry from '../components/investigator/OperationsRegistry';
import CaseDetailWorkspace from '../components/investigator/CaseDetailWorkspace';
import GeoRadar from '../components/investigator/GeoRadar';
import EvidenceVault from '../components/investigator/EvidenceVault';

import AnimatedBackground from '../components/public/AnimatedBackground';

export default function CaseManagementDashboard({ onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [vaultFile, setVaultFile] = useState(null);
  const [vaultCaseId, setVaultCaseId] = useState('');

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const selectedCase = cases.find(c => c._id === selectedCaseId || c.id === selectedCaseId);

  const [activeNotes, setActiveNotes] = useState([]);
  const [activeTimeline, setActiveTimeline] = useState([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 8;

  const [detailsTab, setDetailsTab] = useState('evidence');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteIsPrivate, setNoteIsPrivate] = useState(true);

  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    fetchActiveCases();
    fetchProfile();

    const socket = io('http://localhost:5000');

    socket.on('new_case', (newCase) => {
      const c = { ...newCase, id: newCase.caseId };
      setCases((prev) => [c, ...prev]);
      toast.success(`New Incident Reported: Case ${c.caseId}`, { style: { background: '#0F172A', color: '#F8FAFC', border: '1px solid #1E293B' } });
    });

    socket.on('case_updated', (updatedCase) => {
      const updated = { ...updatedCase, id: updatedCase.caseId };
      setCases((prev) => prev.map(c => (c._id === updated._id || c.id === updated.id) ? updated : c));
      toast.success(`Case ${updated.caseId} updated to ${updated.status}`, { style: { background: '#0F172A', color: '#F8FAFC', border: '1px solid #1E293B' } });
    });

    socket.on('live_gps_update', (data) => {
      setCases(prev => prev.map(c => {
        if (c._id === data.id || c.id === data.caseId) {
          return { ...c, latitude: data.latitude, longitude: data.longitude };
        }
        return c;
      }));
    });

    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setIsEditingProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const fetchActiveCases = async () => {
    try {
      const { data } = await api.get('/cases');
      const normalizedData = data.map(c => ({ ...c, id: c.caseId, subjectName: c.subjectName, age: c.age, location: c.location, priority: c.priority, status: c.status }));
      setCases(normalizedData);
    } catch (err) {
      toast.error('Error retrieving database sync link.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setEditName(res.data.name || '');
      setEditPhone(res.data.phone || '');
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put('/users/profile', { name: editName, phone: editPhone });
      setUser(res.data);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    if (selectedCaseId && selectedCase) fetchCaseIntel();
  }, [selectedCaseId]);

  const fetchCaseIntel = async () => {
    try {
      const dbId = selectedCase._id || selectedCaseId;
      const notesRes = await api.get(`/notes/${dbId}`).catch(() => ({ data: [] }));
      const evRes = await api.get(`/evidence/${dbId}`).catch(() => ({ data: [] }));
      setActiveNotes(notesRes.data);
      setActiveTimeline(evRes.data);
    } catch (e) { }
  };

  const filteredCases = cases.filter(c => {
    const safeStr = c.id || c.subjectName || "";
    const mSearch = safeStr.toLowerCase().includes(search.toLowerCase());
    const mStatus = filterStatus === 'All' || c.status === filterStatus;
    const mPriority = filterPriority === 'All' || c.priority === filterPriority;
    return mSearch && mStatus && mPriority;
  });

  const paginatedCases = filteredCases.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredCases.length / limit);

  const handleUpdateStatus = async (directStatus) => {
    const statusToApply = typeof directStatus === 'string' ? directStatus : statusUpdate;
    if (!statusToApply || !selectedCase) return;
    try {
      const targetId = selectedCase._id || selectedCase.id;
      await api.put(`/cases/${targetId}/status`, { status: statusToApply });
      setStatusUpdate('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Compliance restriction triggered');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCase) return;
    try {
      const targetId = selectedCase._id || selectedCase.id;
      const res = await api.post('/notes', {
        caseId: targetId,
        text: newNote,
        visibility: noteIsPrivate ? 'private' : 'public'
      });

      toast.success('Note saved.');
      setActiveNotes([res.data, ...activeNotes]);
      setNewNote('');
    } catch (err) {
      toast.error('Failed to save note.');
    }
  };

  const handleActivateGPS = async () => {
    try {
      await api.post(`/cases/${selectedCase._id || selectedCase.id}/activate-gps`);
      toast.success('Live GPS Beacon Activated');
    } catch (err) {
      toast.error('Failed to activate GPS');
    }
  };

  const handleVaultUpload = async (e) => {
    e.preventDefault();
    if (!vaultFile || !vaultCaseId) return toast.error('Please select a file and enter a valid Case ID.');
    const formData = new FormData();
    formData.append('file', vaultFile);
    formData.append('caseId', vaultCaseId);

    try {
      await api.post('/evidence/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Evidence uploaded successfully.');
      setVaultFile(null);
      setVaultCaseId('');
    } catch (err) {
      toast.error('Evidence upload rejected.');
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] font-sans overflow-hidden text-[#F8FAFC] relative">
      {/* Darkened Animated Background for tactical feel */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <AnimatedBackground />
      </div>

      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0F172A', color: '#F8FAFC', border: '1px solid #1E293B' } }} />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - fixed on mobile, relative on desktop */}
      <div className={`fixed inset-y-0 left-0 z-[60] transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out h-full`}>
        <InvestigatorSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          setSelectedCaseId={setSelectedCaseId}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onLogout={onLogout}
        />
      </div>

      <div className="flex-1 flex flex-col relative h-full overflow-hidden z-10 w-full">
        <InvestigatorHeader
          user={user}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          profileMenuRef={profileMenuRef}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          editName={editName}
          setEditName={setEditName}
          editPhone={editPhone}
          setEditPhone={setEditPhone}
          handleUpdateProfile={handleUpdateProfile}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 overflow-y-auto relative">
          {currentView === 'casedetail' && selectedCaseId ? (
            <CaseDetailWorkspace
              selectedCase={selectedCase}
              setCurrentView={setCurrentView}
              setSelectedCaseId={setSelectedCaseId}
              handleActivateGPS={handleActivateGPS}
              statusUpdate={statusUpdate}
              setStatusUpdate={setStatusUpdate}
              handleUpdateStatus={handleUpdateStatus}
              detailsTab={detailsTab}
              setDetailsTab={setDetailsTab}
              activeTimeline={activeTimeline}
              newNote={newNote}
              setNewNote={setNewNote}
              noteIsPrivate={noteIsPrivate}
              setNoteIsPrivate={setNoteIsPrivate}
              handleAddNote={handleAddNote}
              activeNotes={activeNotes}
            />
          ) : currentView === 'caselist' ? (
            <OperationsRegistry
              search={search}
              setSearch={setSearch}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              paginatedCases={paginatedCases}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              setSelectedCaseId={setSelectedCaseId}
              setCurrentView={setCurrentView}
            />
          ) : currentView === 'dashboard' ? (
            <div className="p-6 md:p-8 animate-in fade-in max-w-7xl mx-auto w-full">
              <CommandHero cases={cases} setCurrentView={setCurrentView} />
              <OperationStats cases={cases} />
              <AnalyticsDashboard cases={cases} />
              <InvestigativeModules />
            </div>
          ) : currentView === 'map' ? (
            <GeoRadar cases={cases} />
          ) : currentView === 'vault' ? (
            <EvidenceVault
              handleVaultUpload={handleVaultUpload}
              vaultCaseId={vaultCaseId}
              setVaultCaseId={setVaultCaseId}
              vaultFile={vaultFile}
              setVaultFile={setVaultFile}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[#64748B] font-bold text-xl tracking-tight">Module Offline</div>
          )}
        </div>
      </div>
    </div>
  );
}
