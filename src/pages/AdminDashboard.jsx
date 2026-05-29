import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';

// Components
import AdminLayout from '../components/admin/AdminLayout';
import AdminHero from '../components/admin/AdminHero';
import AdminMetrics from '../components/admin/AdminMetrics';
import AIRoutingPanel from '../components/admin/AIRoutingPanel';
import InvestigatorLoadBalancer from '../components/admin/InvestigatorLoadBalancer';
import AssignDispatch from '../components/admin/AssignDispatch';
import ReviewClose from '../components/admin/ReviewClose';
import AuditLogs from '../components/admin/AuditLogs';
import AdminGeoHeatmap from '../components/admin/AdminGeoHeatmap';

export default function AdminDashboard({ onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [stats, setStats] = useState({ totalCases: 0, openCases: 0, highPriority: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const [noteForm, setNoteForm] = useState({ text: '', visibility: 'private' });
  const [newInvForm, setNewInvForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchAdminData();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const dbStats = await api.get('/admin/dashboard').catch(()=>({data: { totalCases: 0, openCases: 0, highPriority: 0 }}));
      const caseList = await api.get('/cases').catch(()=>({data: []}));
      const logs = await api.get('/admin/audit-logs').catch(()=>({data:[]}));
      const invs = await api.get('/admin/investigators').catch(()=>({data: []}));
      
      const normalizedCases = caseList.data?.map(c => ({...c, id: c.caseId, subjectName: c.subjectName, investigator: c.assignedInvestigator?.name || 'Unassigned', investigatorId: c.assignedInvestigator?._id}));
      setCases(normalizedCases || []);
      setStats(dbStats.data || dbStats);
      setAuditLogs(logs.data || []);
      setInvestigators(invs.data || []);
    } catch (e) {
      showToast('Network disruption. Syncing local cache...', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAssign = async (caseId, investigatorId) => {
    try {
      if(!investigatorId) return showToast('Please select a valid investigator logic match.', 'error');
      await api.post('/admin/assign', { caseId: caseId, investigatorId: investigatorId });
      showToast(`Database synced: Target assigned.`);
      fetchAdminData();
    } catch (e) {
      showToast(`Assignment push failed.`, 'error');
    }
  };

  const handlePriorityOverride = async (caseId, priorityLevel) => {
    try {
      await api.put(`/cases/${caseId}/priority`, { priority: priorityLevel });
      showToast(`Priority securely overwritten to ${priorityLevel}.`);
      fetchAdminData();
    } catch (e) {
      showToast('Priority overwrite blocked by server constraints.', 'error');
    }
  };

  const handlePostNote = async (caseId) => {
    if(!noteForm.text) return;
    try {
      await api.post('/notes', { caseId: caseId, text: noteForm.text, visibility: noteForm.visibility });
      showToast(`Note rigidly logged. (${noteForm.visibility})`);
      setNoteForm({ text: '', visibility: 'private' });
      fetchAdminData();
    } catch (err) {
      showToast('Transmission failure inserting note payload.', 'error');
    }
  };

  const handleCloseCase = async (c) => {
    try {
      await api.put(`/cases/${c._id || c.id}/status`, { status: 'Closed' });
      showToast(`Case ${c.id} successfully closed and archived securely.`);
      fetchAdminData();
    } catch (e) {
      showToast(e.response?.data?.message || `System reports missing critical evidence!`, 'error');
    }
  };

  const handleCreateInvestigator = async (e) => {
    e.preventDefault();
    if(!newInvForm.name || !newInvForm.email || !newInvForm.password) return showToast('Fill all officer fields', 'error');
    try {
       await api.post('/admin/investigators', newInvForm);
       showToast(`Officer ${newInvForm.name} securely provisioned.`);
       setNewInvForm({ name: '', email: '', password: '' });
       fetchAdminData();
    } catch (err) {
       showToast(err.response?.data?.message || 'Provisioning sequence failed mathematically.', 'error');
    }
  };

  const handleGenerateReport = async (caseId) => {
    try {
      showToast(`Generating report for ${caseId}...`, 'success');
      const response = await api.get(`/reports/${caseId}`, { responseType: 'blob' });
      
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', `CIS_Report_${caseId}.pdf`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.parentNode.removeChild(fileLink);
      
      showToast(`PDF Compiled and Downloaded for ${caseId}`, 'success');
    } catch (err) {
      showToast(`Failed to generate report for ${caseId}. Check permissions.`, 'error');
    }
  };

  return (
    <AdminLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={onLogout} user={user} auditLogs={auditLogs} cases={cases}>
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-[fade-in_0.3s_ease-out] flex items-center p-4 bg-[rgba(15,23,42,0.9)] text-[#F8FAFC] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#1E293B] min-w-80 backdrop-blur-md">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${toast.type === 'error' ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-teal-500/20 border border-teal-500/50'}`}>
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400"/> : <CheckCircle className="w-4 h-4 text-teal-400" />}
          </div>
          <div><p className="font-bold text-sm tracking-wide text-[#F8FAFC]">{toast.message}</p></div>
        </div>
      )}

      {currentView === 'dashboard' && (
        <div className="animate-in fade-in duration-500">
          <AdminHero setCurrentView={setCurrentView} hasAlert={cases.some(c => c.priority === 'High')} />
          <AdminMetrics cases={cases} investigators={investigators} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIRoutingPanel cases={cases} setCurrentView={setCurrentView} />
            <InvestigatorLoadBalancer 
              investigators={investigators} 
              handleCreateInvestigator={handleCreateInvestigator} 
              newInvForm={newInvForm} 
              setNewInvForm={setNewInvForm} 
            />
          </div>
        </div>
      )}

      {currentView === 'assign' && (
        <div className="animate-in fade-in duration-500">
          <AssignDispatch 
            cases={cases} 
            investigators={investigators} 
            handleAssign={handleAssign} 
            handlePriorityOverride={handlePriorityOverride} 
          />
        </div>
      )}

      {currentView === 'review' && (
        <div className="animate-in fade-in duration-500">
          <ReviewClose 
            cases={cases} 
            currentView={currentView}
            noteForm={noteForm}
            setNoteForm={setNoteForm}
            handleGenerateReport={handleGenerateReport}
            handleCloseCase={handleCloseCase}
            handlePostNote={handlePostNote}
          />
        </div>
      )}

      {currentView === 'audit' && (
        <div className="animate-in fade-in h-full duration-500">
          <AuditLogs auditLogs={auditLogs} />
        </div>
      )}

      {currentView === 'map' && (
        <div className="animate-in fade-in h-full duration-500">
          <AdminGeoHeatmap cases={cases} />
        </div>
      )}
    </AdminLayout>
  );
}
