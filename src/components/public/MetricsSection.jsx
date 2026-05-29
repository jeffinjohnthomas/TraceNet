import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, CheckCircle, Users } from 'lucide-react';
import api from '../../services/api';

export default function MetricsSection() {
  const [liveData, setLiveData] = useState({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    totalUsers: 0
  });

  useEffect(() => {
    api.get('/public/metrics')
       .then(res => setLiveData(res.data))
       .catch(err => console.error('Failed to load metrics:', err));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const metrics = [
    { 
      label: "Total Tips Submitted", 
      value: liveData.totalCases.toLocaleString(), 
      growth: "Real-time", 
      icon: ShieldCheck, 
      color: "text-violet-400", 
      bg: "bg-violet-500/10", 
      border: "border-violet-500/20" 
    },
    { 
      label: "Active Investigations", 
      value: liveData.activeCases.toLocaleString(), 
      growth: "Real-time", 
      icon: Search, 
      color: "text-cyan-400", 
      bg: "bg-cyan-500/10", 
      border: "border-cyan-500/20" 
    },
    { 
      label: "Cases Closed/Found", 
      value: liveData.closedCases.toLocaleString(), 
      growth: "Real-time", 
      icon: CheckCircle, 
      color: "text-teal-400", 
      bg: "bg-teal-500/10", 
      border: "border-teal-500/20" 
    },
    { 
      label: "Registered Users", 
      value: liveData.totalUsers.toLocaleString(), 
      growth: "Real-time", 
      icon: Users, 
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20" 
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 -mt-10">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className={`bg-[rgba(15,23,42,0.75)] backdrop-blur-lg border border-[#1E293B] hover:border-[#334155] rounded-2xl p-6 flex items-center transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group overflow-hidden relative`}
          >
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${m.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className={`w-14 h-14 rounded-xl ${m.bg} ${m.border} border flex items-center justify-center mr-5 shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
              <m.icon className={`w-7 h-7 ${m.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">{m.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{m.value}</h3>
              <p className="text-xs font-semibold text-teal-400 mt-1 flex items-center">
                 <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1.5 animate-pulse"></span> {m.growth} Data 
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
