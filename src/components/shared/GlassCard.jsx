import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', animate = true, delay = 0, noPadding = false }) {
  const baseClasses = `bg-[rgba(15,23,42,0.78)] backdrop-blur-md border border-[#1E293B] shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] relative overflow-hidden ${noPadding ? '' : 'p-6'}`;
  
  if (!animate) {
    return (
      <div className={`${baseClasses} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
}
