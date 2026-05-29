import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileSearch, Lock, CheckCircle, Map as MapIcon, Bell } from 'lucide-react';

export default function InvestigativeModules() {
  const modules = [
    { title: 'Priority Tagging', desc: 'Visual badges for High/Medium/Low case assessment.', icon: AlertTriangle, color: 'text-rose-400', border: 'border-rose-500/30' },
    { title: 'Evidence Timeline', desc: 'Chronological tracking of submitted multimedia.', icon: FileSearch, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { title: 'Role-Based Notes', desc: 'Private internal notes vs visible public updates.', icon: Lock, color: 'text-purple-400', border: 'border-purple-500/30' },
    { title: 'Progress Tracker', desc: 'Step-by-step lifecycle tracking mechanisms.', icon: CheckCircle, color: 'text-teal-400', border: 'border-teal-500/30' },
    { title: 'Map & Geo-Tagging', desc: 'Identify risk clusters geographically.', icon: MapIcon, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { title: 'Alert Escalation', desc: 'Notify networks of critical status changes.', icon: Bell, color: 'text-amber-400', border: 'border-amber-500/30' },
  ];

  return (
    <div className="bg-[rgba(15,23,42,0.5)] backdrop-blur-sm rounded-[2rem] border border-[#1E293B] shadow-sm p-8">
      <h3 className="text-xl font-black text-white mb-6 tracking-tight">Investigative Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((feature, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -2 }}
            className="flex gap-4 p-5 rounded-2xl bg-[#020617]/40 border border-[#1E293B] hover:border-[#334155] hover:bg-[#0F172A] transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(30,41,59,0.55)] border border-[#334155] group-hover:${feature.border} shadow-inner transition-colors`}>
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
            </div>
            <div>
              <h4 className="font-bold text-[#F8FAFC] mb-1 group-hover:text-white transition-colors">{feature.title}</h4>
              <p className="text-xs text-[#CBD5E1] leading-relaxed font-medium">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
