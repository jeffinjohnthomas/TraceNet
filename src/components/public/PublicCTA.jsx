import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function PublicCTA({ scrollToSection }) {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-900 via-violet-900 to-[#0F172A] border border-cyan-500/30 p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/50 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-[#020617]/50 border border-cyan-400/30 backdrop-blur-md items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">See Something? Say Something.</h2>
            <p className="text-cyan-200 text-base font-medium">Your identity is completely safe. Your tip is powerful.</p>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={() => scrollToSection('report')}
            className="w-full md:w-auto px-8 py-4 bg-[#020617]/40 hover:bg-[#020617]/60 text-white backdrop-blur-md border border-cyan-400/50 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center group"
          >
            Report Anonymously <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
