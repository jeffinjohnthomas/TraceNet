import React from 'react';
import { 
  LayoutDashboard, List, FileSearch, Map as MapIcon, 
  ShieldCheck, LogOut, Radar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvestigatorSidebar({ 
  currentView, setCurrentView, setSelectedCaseId, setIsMobileMenuOpen, onLogout 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Command Hub', icon: LayoutDashboard },
    { id: 'caselist', label: 'Operations Registry', icon: List },
    { id: 'map', label: 'Geo-Radar', icon: MapIcon },
    { id: 'vault', label: 'Evidence Secure', icon: FileSearch },
  ];

  return (
    <div className="w-72 h-full bg-[rgba(15,23,42,0.75)] backdrop-blur-md text-white flex flex-col shrink-0 z-50 border-r border-[#1E293B] shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-6 border-b border-[#1E293B] flex items-center space-x-3 shrink-0 group cursor-pointer">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-shadow overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <Radar className="w-6 h-6 text-white relative z-10" strokeWidth={2.5}/>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.2)]">TraceNet</span>
          <span className="text-[9px] font-bold text-[#64748B] tracking-[0.2em] uppercase -mt-1">Terminal</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2 px-3 mt-4">Nav Systems</p>
        
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <motion.button 
              key={item.id} 
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setCurrentView(item.id); setSelectedCaseId(null); setIsMobileMenuOpen(false); }} 
              className={`relative w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]' : 'text-[#64748B] hover:bg-[#1E293B] hover:text-[#CBD5E1] border border-transparent'}`}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              )}
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-cyan-400' : ''}`} /> 
              {item.label}
            </motion.button>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-[#1E293B]">
        <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-3 text-[#64748B] hover:bg-rose-900/20 hover:text-rose-400 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-rose-500/30">
          <LogOut className="w-4 h-4 mr-2" /> Disconnect
        </button>
      </div>
    </div>
  );
}
