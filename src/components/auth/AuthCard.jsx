import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function AuthCard({ children, title, subtitle, showLogo = true }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl shadow-black/50"
    >
      <div className="text-center md:text-left mb-8">
        {showLogo && (
          <div className="md:hidden flex justify-center mb-6">
             <div className="bg-cyan-900/50 border border-cyan-500/30 p-3 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)]">
               <ShieldCheck size={32} className="text-cyan-400" />
             </div>
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </motion.div>
  );
}
