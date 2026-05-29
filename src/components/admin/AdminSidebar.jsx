import React from 'react';
import { 
  LayoutDashboard, Users, FileCheck, History,
  Map, LogOut, Radar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSidebar({ currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'assign', label: 'Assign & Dispatch', icon: Users },
    { id: 'review', label: 'Review & Close', icon: FileCheck },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'map', label: 'Geo-Heatmap', icon: Map }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[rgba(11,17,32,0.95)] backdrop-blur-xl border-r border-[#1E293B] flex flex-col h-full shrink-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1E293B] flex items-center space-x-4 group cursor-pointer shrink-0">
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <Radar className="w-7 h-7 text-white relative z-10 animate-[spin_10s_linear_infinite]" strokeWidth={2}/>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-400 drop-shadow-sm">TraceNet</span>
          <span className="text-[9px] font-bold text-cyan-400 tracking-[0.2em] uppercase mt-0.5">Central Command</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-4 px-3">Oversight Protocols</p>
        {navItems.map((item, index) => {
          const isActive = currentView === item.id;
          return (
            <motion.button 
              key={item.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden group ${isActive ? 'text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#CBD5E1] hover:bg-[#1E293B]/50'}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 to-transparent"></div>
              )}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
              )}
              <item.icon className={`w-5 h-5 mr-3 shrink-0 relative z-10 transition-colors ${isActive ? 'text-cyan-400' : 'text-[#64748B] group-hover:text-cyan-400'}`} strokeWidth={2.5} /> 
              <span className="relative z-10 tracking-wide">{item.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-5 border-t border-[#1E293B] shrink-0 bg-[#020617]/50">
        <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-3 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 text-sm font-bold tracking-wide rounded-xl transition-all border border-rose-500/20 shadow-sm active:scale-95 group">
          <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
      </div>
    </div>
  );
}
