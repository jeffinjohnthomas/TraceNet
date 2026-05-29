import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ShieldCheck, Check, LogOut, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

export default function AdminHeader({ setIsMobileMenuOpen, user, auditLogs, cases }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (cases && cases.length > 0) {
      let allUpdates = [];
      cases.forEach(c => {
        if (c.updates && c.updates.length > 0) {
          c.updates.forEach((u, i) => {
            allUpdates.push({
              id: `${c.id}-${i}-${u.time}`,
              message: `Case ${c.id}: ${u.message}`,
              type: u.status,
              time: u.time,
              read: false
            });
          });
        }
      });
      
      // Sort updates by time descending
      allUpdates.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      // Take the 10 most recent updates
      setNotifications(allUpdates.slice(0, 10));
    }
  }, [cases]);

  useEffect(() => {
    const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'));
    
    // Listen to ALL global events since this is the Admin Command Center
    socket.on('new_case', (newCase) => {
      setNotifications(prev => [{
        id: Date.now().toString(),
        message: `New Incident Reported: Case ${newCase.caseId}`,
        type: 'Alert',
        time: new Date().toISOString(),
        read: false
      }, ...prev]);
    });

    socket.on('case_updated', (updatedCase) => {
      setNotifications(prev => [{
        id: Date.now().toString(),
        message: `Case ${updatedCase.caseId} updated to ${updatedCase.status}`,
        type: 'Status',
        time: new Date().toISOString(),
        read: false
      }, ...prev]);
    });
    
    // If backend pushes explicit system notifications
    socket.on('new_notification', (notif) => {
      setNotifications(prev => [{
        id: notif._id || Date.now().toString(),
        message: notif.message,
        type: notif.type || 'System',
        time: notif.createdAt || new Date().toISOString(),
        read: false
      }, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setShowNotifMenu(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-20 bg-[rgba(11,17,32,0.85)] backdrop-blur-xl border-b border-[#1E293B] flex items-center justify-between px-6 md:px-8 shrink-0 z-40 relative shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight drop-shadow-sm flex items-center bg-gradient-to-r from-[#F8FAFC] to-[#CBD5E1] bg-clip-text text-transparent">
             Central Command
          </h2>
          <p className="text-[10px] md:text-xs text-[#64748B] font-bold tracking-wide mt-0.5 hidden sm:block">
            System-wide oversight for investigations, assignments, audit trails, and field operations.
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-4">
         <div className="hidden sm:flex items-center px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-full shadow-inner mr-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Network Secure</span>
         </div>
         
         {/* Notification Dropdown */}
         <div className="relative" ref={notifRef}>
           <button 
             onClick={() => setShowNotifMenu(!showNotifMenu)}
             className="w-10 h-10 bg-[#1E293B]/50 hover:bg-[#1E293B] rounded-full flex items-center justify-center transition-colors border border-[#334155] relative group"
           >
             <Bell className="w-5 h-5 text-[#64748B] group-hover:text-cyan-400 transition-colors" />
             {unreadCount > 0 && (
               <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 rounded-full border border-[#0F172A] shadow-[0_0_8px_rgba(244,63,94,0.8)] flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
             )}
           </button>
           
           <AnimatePresence>
             {showNotifMenu && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.2 }}
                 className="absolute top-14 right-0 mt-3 w-80 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border border-[#334155] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
               >
                 <div className="p-4 bg-[#020617] border-b border-[#1E293B] flex justify-between items-center">
                   <div>
                     <h3 className="text-sm font-bold text-[#F8FAFC]">System Alerts</h3>
                     <p className="text-xs text-[#64748B] mt-0.5">{unreadCount} unread alerts</p>
                   </div>
                   {unreadCount > 0 && (
                     <button onClick={markAllAsRead} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest">Mark all read</button>
                   )}
                 </div>
                 
                 <div className="max-h-80 overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="p-6 text-center text-[#64748B] text-sm font-medium">No recent intelligence alerts</div>
                   ) : (
                     notifications.map(notif => (
                       <div key={notif.id} className={`p-4 border-b border-[#1E293B] hover:bg-[#1E293B]/50 transition-colors ${!notif.read ? 'bg-cyan-950/10' : ''}`}>
                         <div className="flex justify-between items-start mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${notif.type === 'Alert' ? 'text-rose-500' : 'text-cyan-400'}`}>
                             {notif.type}
                           </span>
                           <span className="text-[10px] text-[#64748B] font-medium">
                             {new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </span>
                         </div>
                         <p className={`text-sm ${!notif.read ? 'font-bold text-[#F8FAFC]' : 'font-medium text-[#CBD5E1]'}`}>
                           {notif.message}
                         </p>
                         {!notif.read && (
                           <button onClick={() => markAsRead(notif.id)} className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center">
                             <Check className="w-3 h-3 mr-1" /> Mark as read
                           </button>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
         
         {/* Profile Dropdown */}
         <div className="relative" ref={profileRef}>
           <button 
             onClick={() => setShowProfileMenu(!showProfileMenu)}
             className="w-10 h-10 bg-gradient-to-br from-indigo-900 to-cyan-900 border border-cyan-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all overflow-hidden"
           >
             <ShieldCheck className="w-5 h-5 text-cyan-300 relative z-10" />
           </button>
           
           <AnimatePresence>
             {showProfileMenu && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.2 }}
                 className="absolute top-14 right-0 mt-3 w-72 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border border-[#334155] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
               >
                 <div className="p-6">
                   <div className="space-y-4">
                     <div>
                       <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Admin Identity</p>
                       <p className="font-bold text-[#F8FAFC] text-lg">{user ? user.name : 'Central Admin'}</p>
                       <p className="text-xs text-[#CBD5E1] font-medium mt-0.5">{user ? user.email : 'admin@tracenet.org'}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Clearance Level</p>
                       <p className="font-bold text-cyan-400 capitalize drop-shadow-sm flex items-center text-sm">
                         <ShieldCheck className="w-4 h-4 mr-1.5" /> {user ? user.role : 'Admin'}
                       </p>
                     </div>
                     <div className="pt-4 border-t border-[#1E293B] mt-4 flex items-center justify-between text-xs text-[#64748B] font-bold">
                       <span className="flex items-center"><Activity className="w-3 h-3 mr-1 text-emerald-400"/> System Online</span>
                     </div>
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
