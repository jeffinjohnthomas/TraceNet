import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Edit2, CheckCircle, Menu, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { io } from 'socket.io-client';

export default function InvestigatorHeader({
  user, showProfileMenu, setShowProfileMenu, profileMenuRef,
  isEditingProfile, setIsEditingProfile, editName, setEditName,
  editPhone, setEditPhone, handleUpdateProfile,
  isMobileMenuOpen, setIsMobileMenuOpen
}) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
      const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'));
      socket.on('new_notification', (notif) => {
        if (notif.userId === user._id) {
          setNotifications(prev => [notif, ...prev]);
        }
      });
      return () => socket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {}
  };

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      setNotifications(res.data);
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      setNotifications(res.data);
      setShowNotifMenu(false);
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-20 bg-[rgba(15,23,42,0.85)] backdrop-blur-xl border-b border-[#1E293B] flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 shadow-sm relative">
      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 -ml-2 text-[#CBD5E1] hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-lg bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none">
            Field Ops Command
          </h2>
          <p className="text-xs text-[#CBD5E1] hidden lg:block font-medium mt-0.5">
            Live investigation workspace for assigned cases, evidence review, and geo-intelligence.
          </p>
        </div>
        
        <div className="hidden lg:flex px-3 py-1.5 bg-[#020617]/50 border border-teal-500/30 rounded-full shadow-inner items-center backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">Network Secure</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 relative" ref={profileMenuRef}>
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-[#64748B] hover:text-cyan-400 transition-colors"
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-rose-500 rounded-full border-2 border-[#0F172A] shadow-[0_0_8px_rgba(244,63,94,0.8)] flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
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
                    <h3 className="text-sm font-bold text-[#F8FAFC]">Notifications</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">{unreadCount} unread alerts</p>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest">Mark all read</button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] text-sm font-medium">No recent intelligence alerts</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif._id} className={`p-4 border-b border-[#1E293B] hover:bg-[#1E293B]/50 transition-colors ${!notif.read ? 'bg-cyan-950/20' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${notif.type === 'alert' ? 'text-rose-500' : 'text-cyan-400'}`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-medium">
                            {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className={`text-sm ${!notif.read ? 'font-bold text-[#F8FAFC]' : 'font-medium text-[#CBD5E1]'}`}>
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <button onClick={() => markAsRead(notif._id)} className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center">
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
        <div className="w-px h-8 bg-[#1E293B] hidden sm:block"></div>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#F8FAFC] group-hover:text-cyan-400 transition-colors">{user ? user.name : 'Authenticating...'}</p>
            <div className="flex items-center justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5"></span>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">On Duty</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[rgba(30,41,59,0.55)] border border-[#334155] flex items-center justify-center group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all shadow-inner">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <AnimatePresence>
          {showProfileMenu && user && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-0 w-80 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border border-[#334155] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
            >
              <div className="p-6">
                {!isEditingProfile ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Analyst ID</p>
                      <p className="font-bold text-[#F8FAFC] text-lg">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Clearance Level</p>
                      <p className="font-bold text-cyan-400 capitalize drop-shadow-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1.5" /> {user.role}
                      </p>
                    </div>
                    <button onClick={() => setIsEditingProfile(true)} className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-[rgba(30,41,59,0.55)] hover:bg-[#1E293B] text-[#CBD5E1] rounded-xl text-sm font-bold transition-all border border-[#334155]">
                      <Edit2 className="w-4 h-4 mr-2"/> Modify Credentials
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input type="text" className="w-full px-4 py-3 bg-[#020617] border border-[#334155] rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-cyan-500/50 outline-none shadow-inner transition-all" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
                    <input type="text" className="w-full px-4 py-3 bg-[#020617] border border-[#334155] rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-cyan-500/50 outline-none shadow-inner transition-all" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Encrypted Phone" />
                    <div className="flex gap-2 mt-4">
                      <button onClick={handleUpdateProfile} className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all border border-cyan-400/30 shadow-md">Update</button>
                      <button onClick={() => setIsEditingProfile(false)} className="px-4 py-3 bg-[rgba(30,41,59,0.55)] hover:bg-[#1E293B] text-[#CBD5E1] rounded-xl text-sm font-bold transition-all border border-[#334155]">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
