import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageLayout = ({ title, icon: Icon, children }) => (
  <div className="min-h-screen bg-[#020617] text-[#F8FAFC] p-6 md:p-12 relative overflow-hidden">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div className="max-w-4xl mx-auto relative z-10">
      <Link to="/" className="inline-flex items-center text-[#64748B] hover:text-cyan-400 font-bold mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Return to Dashboard
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[rgba(15,23,42,0.65)] backdrop-blur-xl border border-[#1E293B] rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#1E293B]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-900 flex items-center justify-center border border-cyan-500/30">
             <Icon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">{title}</h1>
        </div>
        <div className="prose prose-invert max-w-none text-[#CBD5E1]">
          {children}
        </div>
      </motion.div>
    </div>
  </div>
);

export const ResourcesPage = () => (
  <PageLayout title="Public Safety Resources" icon={BookOpen}>
    <h3 className="text-xl font-bold text-white mb-4">Guidelines & Safety Tips</h3>
    <p className="mb-4 text-sm leading-relaxed text-[#CBD5E1]">
      TraceNet provides resources to help you stay vigilant and safe while assisting investigations.
    </p>
    <ul className="space-y-4">
      <li className="bg-[#0F172A] p-4 rounded-xl border border-[#334155]">
        <strong className="text-cyan-400 block mb-1">Stay Anonymous</strong>
        Never confront a suspect directly. Use this portal to securely encrypt and transmit your observations to authorities.
      </li>
      <li className="bg-[#0F172A] p-4 rounded-xl border border-[#334155]">
        <strong className="text-cyan-400 block mb-1">Details Matter</strong>
        When reporting, focus on distinct clothing, vehicle license plates, specific geographical markers, and timestamps.
      </li>
    </ul>
  </PageLayout>
);

export const PrivacyPolicy = () => (
  <PageLayout title="Privacy Policy" icon={Lock}>
    <p className="mb-4 text-sm leading-relaxed text-[#CBD5E1]">
      Your privacy and security are our highest priority. All data transmitted through the TraceNet portal is cryptographically secured.
    </p>
    <div className="space-y-6">
       <div>
         <h4 className="font-bold text-white mb-2">1. Information Collection</h4>
         <p className="text-sm">We collect only necessary information to verify intelligence tips. If you choose to remain anonymous, IP stripping protocols are engaged to protect your origin point.</p>
       </div>
       <div>
         <h4 className="font-bold text-white mb-2">2. Data Storage</h4>
         <p className="text-sm">Reports are stored in isolated databases accessible only to verified Central Intelligence investigators and administrators.</p>
       </div>
    </div>
  </PageLayout>
);

export const TermsOfUse = () => (
  <PageLayout title="Terms of Use" icon={FileText}>
    <p className="mb-4 text-sm leading-relaxed text-[#CBD5E1]">
      By accessing the TraceNet Public Portal, you agree to assist in lawful intelligence gathering under the established legal frameworks.
    </p>
    <div className="space-y-6">
       <div>
         <h4 className="font-bold text-white mb-2">1. False Reporting</h4>
         <p className="text-sm text-rose-300">Intentionally submitting false reports or doctored evidence is a federal offense and will be traced.</p>
       </div>
       <div>
         <h4 className="font-bold text-white mb-2">2. Portal Availability</h4>
         <p className="text-sm">We strive for 100% uptime, but system maintenance may occasionally cause brief connectivity interruptions.</p>
       </div>
    </div>
  </PageLayout>
);
