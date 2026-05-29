import React from 'react';
import { ShieldCheck, ArrowUp, Radar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-[#1E293B] bg-[#020617] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 group cursor-pointer">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-shadow overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <Radar className="w-6 h-6 text-white relative z-10" strokeWidth={2.5}/>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.2)]">TraceNet</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase -mt-1">Public Portal</span>
              </div>
            </div>
            <p className="text-[#64748B] text-sm font-medium leading-relaxed max-w-sm">
              Global Intelligence. Human Impact. Empowering communities to securely report and track crucial information to aid in general investigations.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><button onClick={() => window.scrollTo({ top: document.getElementById('report')?.offsetTop || 0, behavior: 'smooth' })} className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors">Report a Tip</button></li>
              <li><button onClick={() => window.scrollTo({ top: document.getElementById('track')?.offsetTop || 0, behavior: 'smooth' })} className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors">Track Case</button></li>
              <li><button onClick={() => window.scrollTo({ top: document.getElementById('alerts')?.offsetTop || 0, behavior: 'smooth' })} className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors">Alerts</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/resources" className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors block">Safety Tips</Link></li>
              <li><Link to="/resources" className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors block">Guidelines</Link></li>
              <li><Link to="/resources" className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors block">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors block">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use" className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors block">Terms of Use</Link></li>
              <li><Link to="/resources" className="text-[#CBD5E1] hover:text-cyan-400 text-sm transition-colors block">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1E293B]">
          <p className="text-[#64748B] text-xs font-medium mb-4 md:mb-0">
            © {new Date().getFullYear()} TraceNet Intelligence Network. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <button onClick={scrollToTop} className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform ml-4">
               <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
