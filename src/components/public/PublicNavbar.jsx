import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Bell, User, Radar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { formatDistanceToNow } from 'date-fns';

export default function PublicNavbar({ onLogout, activeSection, scrollToSection, notifications = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastRead, setLastRead] = useState(() => parseInt(localStorage.getItem('last_read_notifications') || '0', 10));
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report' },
    { id: 'track', label: 'Track' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'resources', label: 'Resources', isRoute: true }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[rgba(15,23,42,0.85)] backdrop-blur-xl border-b border-[#1E293B] py-3' : 'bg-transparent py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => scrollToSection('home')}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-shadow overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <Radar className="w-6 h-6 text-white relative z-10" strokeWidth={2.5}/>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.2)]">TraceNet</span>
            <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase -mt-1">Public Portal</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => item.isRoute ? navigate(`/${item.id}`) : scrollToSection(item.id)}
              className="relative text-sm font-semibold tracking-wide text-[#CBD5E1] hover:text-white transition-colors py-2 group"
            >
              {item.label}
              {activeSection === item.id && !item.isRoute && (
                <motion.div 
                  layoutId="activeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-[#CBD5E1] hover:text-white transition-colors rounded-full hover:bg-[rgba(30,41,59,0.55)] border border-transparent hover:border-[#334155]"
            >
               <Bell className="w-5 h-5" />
               {notifications.filter(n => new Date(n.time).getTime() > lastRead).length > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(244,63,94,0.8)]"></span>
               )}
            </button>

            {/* Notifications Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border border-[#334155] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#1E293B] bg-[#020617] flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  <div className="flex items-center gap-3">
                    {notifications.filter(n => new Date(n.time).getTime() > lastRead).length > 0 && (
                      <button 
                        onClick={() => {
                          const now = Date.now();
                          setLastRead(now);
                          localStorage.setItem('last_read_notifications', now.toString());
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                    <span className="text-xs text-cyan-400 font-semibold">{notifications.length} Total</span>
                  </div>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-[#64748B]">No notifications yet.</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setShowDropdown(false);
                          if (n.caseId) {
                            window.dispatchEvent(new CustomEvent('track_case_request', { detail: n.caseId }));
                            setTimeout(() => {
                              const el = document.getElementById('track');
                              if (el) {
                                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            }, 100);
                          }
                        }}
                        className="px-4 py-3 border-b border-[#1E293B] hover:bg-[rgba(30,41,59,0.5)] transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${n.status === 'Submitted' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-teal-500/20 text-teal-400'}`}>
                            {n.status}
                          </span>
                          <span className="text-[10px] text-[#64748B] group-hover:text-[#CBD5E1] transition-colors">
                            {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-[#CBD5E1] leading-relaxed mt-1.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={onLogout} className="flex items-center px-5 py-2.5 bg-[rgba(30,41,59,0.55)] border border-[#334155] rounded-xl text-sm font-bold text-white hover:bg-[#1E293B] hover:border-cyan-500/50 transition-all group shadow-sm">
             <User className="w-4 h-4 mr-2 text-cyan-400 group-hover:text-cyan-300 transition-colors" /> Secure Exit
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
