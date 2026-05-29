import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search } from 'lucide-react';

export default function HeroSection({ scrollToSection }) {
  return (
    <section id="home" className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 pt-24 pb-12 z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-[rgba(15,23,42,0.75)] border border-[#334155] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <ShieldCheck className="w-4 h-4 text-violet-400 mr-2" />
          <span className="text-xs font-bold text-[#CBD5E1] uppercase tracking-widest">Together, We Can Bring Them Home</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.1] text-white"
        >
          Every Tip Can <br/>
          <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]">Save a Life</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-[#CBD5E1] font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Join TraceNet. Report observations anonymously, track verified case progress, and help law enforcement bring cases to a successful close.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => scrollToSection('report')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 flex items-center justify-center border border-cyan-400/30"
          >
            <ShieldCheck className="w-5 h-5 mr-2" /> Report a Tip
          </button>
          
          <button 
            onClick={() => scrollToSection('track')}
            className="w-full sm:w-auto px-8 py-4 bg-[rgba(30,41,59,0.55)] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] rounded-xl font-bold text-base transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center backdrop-blur-sm"
          >
            <Search className="w-5 h-5 mr-2 text-cyan-400" /> Track a Case
          </button>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-6 text-xs text-[#64748B] font-medium uppercase tracking-wider flex items-center justify-center"
        >
          <Lock className="w-3 h-3 mr-1"/> Your identity is protected. All reports are encrypted.
        </motion.p>
      </div>

    </section>
  );
}

const Lock = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const AlertTriangle = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
