import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import CaseManagementDashboard from './pages/CaseManagementDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicDashboard from './pages/PublicDashboard';
import ResetPassword from './pages/ResetPassword';
import { ResourcesPage, PrivacyPolicy, TermsOfUse } from './pages/StaticPages';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent JWT
    const token = localStorage.getItem('cis_token');
    const role = localStorage.getItem('cis_role');
    
    if (token && role) {
      setCurrentUser({ role });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cis_token');
    localStorage.removeItem('cis_role');
    setCurrentUser(null);
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center font-bold text-slate-500 text-lg">Establishing Secure Link...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!currentUser ? <Login onLogin={(u) => setCurrentUser(u)} /> : <Navigate to={`/${currentUser.role}`} />} 
        />
        <Route 
          path="/signup" 
          element={!currentUser ? <Signup onLogin={(u) => setCurrentUser(u)} /> : <Navigate to={`/${currentUser.role}`} />} 
        />
        <Route 
          path="/forgot-password" 
          element={!currentUser ? <ForgotPassword /> : <Navigate to={`/${currentUser.role}`} />} 
        />
        <Route 
          path="/verify-otp" 
          element={!currentUser ? <VerifyOtp /> : <Navigate to={`/${currentUser.role}`} />} 
        />
        
        <Route 
          path="/public" 
          element={currentUser?.role === 'public' ? <PublicDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/investigator" 
          element={currentUser?.role === 'investigator' ? <CaseManagementDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/admin" 
          element={currentUser?.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
      </Routes>
    </Router>
  );
}
