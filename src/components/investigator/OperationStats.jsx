import React from 'react';
import { motion } from 'framer-motion';

export default function OperationStats({ cases }) {
  const stats = [
    { label: 'Total Operations', value: cases.length, color: 'from-cyan-400 to-cyan-400', border: 'border-cyan-500/30', shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.1)]' },
    { label: 'Critical Priority', value: cases.filter(c => c.priority === 'High' && c.status !== 'Closed').length, color: 'from-rose-400 to-red-500', border: 'border-rose-500/30', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]' },
    { label: 'Elevated Priority', value: cases.filter(c => c.priority === 'Medium' && c.status !== 'Closed').length, color: 'from-amber-400 to-orange-500', border: 'border-amber-500/30', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]' },
    { label: 'Active Operations', value: cases.filter(c => c.status === 'In Progress').length, color: 'from-teal-400 to-teal-400', border: 'border-teal-500/30', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((metric, idx) => (
        <motion.div 
          key={idx} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * idx }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`p-6 rounded-[1.5rem] bg-[rgba(15,23,42,0.75)] backdrop-blur-md border ${metric.border} ${metric.shadow} relative overflow-hidden group`}
        >
          {/* Hover Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          
          <div className="relative z-10">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">{metric.label}</p>
            <h3 className={`text-5xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent drop-shadow-sm pb-1`}>
              {metric.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
