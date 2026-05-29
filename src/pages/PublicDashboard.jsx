import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/public/AnimatedBackground';
import PublicNavbar from '../components/public/PublicNavbar';
import HeroSection from '../components/public/HeroSection';
import MetricsSection from '../components/public/MetricsSection';
import HowItWorks from '../components/public/HowItWorks';
import PublicReportForm from '../components/public/PublicReportForm';
import TrackStatus from '../components/public/TrackStatus';
import PublicHeatmap from '../components/public/PublicHeatmap';
import PublicAlerts from '../components/public/PublicAlerts';
import PublicCTA from '../components/public/PublicCTA';
import PublicFooter from '../components/public/PublicFooter';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function PublicDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState('home');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/cases').then(res => {
      const allUpdates = [];
      res.data.forEach(c => {
        if (c.updates) {
          c.updates.forEach(u => allUpdates.push({ ...u, caseId: c.caseId, location: c.location }));
        }
      });
      allUpdates.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(allUpdates);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('cis_token');
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }

    // Socket.io Real-time Notifications
    const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'));
    
    socket.on('new_case', (newCase) => {
      // Only show popup if this public user reported it
      if (newCase.reporterId?._id !== userId && newCase.reporterId !== userId) return;

      if (newCase.updates && newCase.updates.length > 0) {
        const latest = newCase.updates[newCase.updates.length - 1];
        setNotifications(prev => [{ ...latest, caseId: newCase.caseId, location: newCase.location }, ...prev]);
      }

      toast.custom((t) => (
        <div className={`max-w-sm w-full bg-[#0F172A] border border-[#1E293B] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl pointer-events-auto flex transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <ShieldCheck className="h-10 w-10 text-cyan-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">New Intelligence Report</p>
                <p className="mt-1 text-sm text-[#CBD5E1]">A new tip has been securely submitted from {newCase.location || 'an unknown location'}.</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    socket.on('case_updated', (updatedCase) => {
      // Only show popup if this public user reported it
      if (updatedCase.reporterId?._id !== userId && updatedCase.reporterId !== userId) return;

      if (updatedCase.updates && updatedCase.updates.length > 0) {
        const latest = updatedCase.updates[updatedCase.updates.length - 1];
        setNotifications(prev => [{ ...latest, caseId: updatedCase.caseId, location: updatedCase.location }, ...prev]);
      }

      toast.custom((t) => (
        <div className={`max-w-sm w-full bg-[#0F172A] border border-[#1E293B] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl pointer-events-auto flex transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertTriangle className="h-10 w-10 text-amber-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Case Status Update</p>
                <p className="mt-1 text-sm text-[#CBD5E1]">Case {updatedCase.caseId} has been updated to {updatedCase.status}.</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Add smooth scrolling to HTML element for native anchor behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Intersection Observer to update active Nav Item
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3 });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(s => observer.observe(s));

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      sections.forEach(s => observer.unobserve(s));
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80; // Offset for sticky navbar
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200 bg-[#020617] text-[#F8FAFC] overflow-x-hidden">
      <Toaster position="bottom-right" />
      <AnimatedBackground />
      
      <PublicNavbar 
        onLogout={onLogout} 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
        notifications={notifications}
      />

      <main className="relative z-10 flex flex-col gap-12 md:gap-24">
        <HeroSection scrollToSection={scrollToSection} />
        <MetricsSection />
        
        <div className="bg-[rgba(15,23,42,0.4)] border-y border-[#1E293B] backdrop-blur-md">
          <HowItWorks scrollToSection={scrollToSection} />
        </div>

        <PublicReportForm />
        
        <div className="bg-[rgba(15,23,42,0.4)] border-y border-[#1E293B] backdrop-blur-md">
          <TrackStatus />
        </div>
        
        <PublicHeatmap />
        <PublicAlerts />
        <PublicCTA scrollToSection={scrollToSection} />
      </main>

      <PublicFooter />
    </div>
  );
}
