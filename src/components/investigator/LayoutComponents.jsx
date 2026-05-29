import React, { useState, useEffect, useRef } from 'react';
import { Activity, LayoutDashboard, Folders, Map as MapIcon, FileText, Bell, Search, User, LogOut, FileSearch, Edit2, Check, X } from 'lucide-react';
import api from '../../services/api';

export function Sidebar({ currentView, setCurrentView, onLogout }) {
  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases & Assignments', icon: Folders },
    { id: 'evidence', label: 'Evidence Timeline', icon: FileSearch },
    { id: 'map', label: 'Geo-Map View', icon: MapIcon },
    { id: 'reports', label: 'Generated Reports', icon: FileText }
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 relative z-20">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-white font-bold text-xl tracking-tight flex items-center">
          <Activity className="text-blue-500 mr-2 w-6 h-6" strokeWidth={2.5}/>
          CIS <span className="text-slate-500 font-medium ml-1">Portal</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Investigator Unit</p>
      </div>

      {/* Nav */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === item.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_4px_0_0_rgba(59,130,246,1)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${currentView === item.id ? 'text-blue-400' : 'text-slate-500'}`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all">
          <LogOut className="w-5 h-5 mr-3 text-slate-500" />
          Secure Logout
        </button>
      </div>
    </div>
  );
}

import { io } from 'socket.io-client';

export function TopBar({ searchQuery, setSearchQuery }) {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setIsEditing(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setEditName(res.data.name || '');
      setEditPhone(res.data.phone || '');
      fetchNotifications();
      setupSocket(res.data._id);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const setupSocket = (userId) => {
    const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'));
    socket.on('new_notification', (notif) => {
      if (notif.userId === userId) {
        setNotifications(prev => [notif, ...prev]);
        // Also emit a browser notification or custom toast if needed
      }
    });
  };

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      setNotifications(res.data);
      setShowNotifMenu(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put('/users/profile', { name: editName, phone: editPhone });
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 relative">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="relative w-96 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by Case ID, Subject Name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
        />
      </div>

      <div className="flex items-center space-x-5 relative">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs font-bold text-blue-600 hover:text-blue-700">Mark all read</button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm font-medium">No recent notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${notif.type === 'alert' ? 'text-red-500' : 'text-blue-500'}`}>
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                        {notif.message}
                      </p>
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif._id)} className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200"></div>
        <div className="relative" ref={menuRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {user ? user.name : 'Loading...'}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user ? user.role : 'User'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && user && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-5 bg-slate-50 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Analyst Profile</h3>
                <p className="text-xs text-slate-500 mt-1">Manage your professional details</p>
              </div>
            
            <div className="p-5">
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Identity</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact Number</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">{user.phone || 'Not provided'}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile Details
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Email (Read Only)</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      value={editPhone} 
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={handleUpdateProfile}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
