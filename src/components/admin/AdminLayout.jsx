import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AnimatedBackground from '../shared/AnimatedBackground';

export default function AdminLayout({ children, currentView, setCurrentView, onLogout, user, auditLogs, cases }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#020617] font-sans overflow-hidden text-[#F8FAFC] selection:bg-cyan-500/30">
      <AnimatedBackground />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#020617]/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <AdminSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={onLogout}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <AdminHeader setIsMobileMenuOpen={setIsMobileMenuOpen} user={user} auditLogs={auditLogs} cases={cases} />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
           {children}
        </div>
      </div>
    </div>
  );
}
