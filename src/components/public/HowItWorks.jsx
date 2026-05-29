import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, Bell, Heart, ArrowRight } from 'lucide-react';

export default function HowItWorks({ scrollToSection }) {
  const steps = [
    {
      num: "01",
      title: "Submit a Tip",
      desc: "Share any information you have seen or heard anonymously.",
      icon: ShieldCheck,
      color: "text-violet-400",
      bg: "bg-violet-500/20",
      border: "border-violet-500/40"
    },
    {
      num: "02",
      title: "We Investigate",
      desc: "Our team verifies and forwards to the right authorities.",
      icon: Search,
      color: "text-cyan-400",
      bg: "bg-cyan-500/20",
      border: "border-cyan-500/40"
    },
    {
      num: "03",
      title: "Track Updates",
      desc: "Stay informed about the progress of your encrypted report.",
      icon: Bell,
      color: "text-teal-400",
      bg: "bg-teal-500/20",
      border: "border-teal-500/40"
    },
    {
      num: "04",
      title: "Bring Them Home",
      desc: "Your tip could help resolve critical investigations.",
      icon: Heart,
      color: "text-amber-400",
      bg: "bg-amber-500/20",
      border: "border-amber-500/40"
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left: Timeline */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold text-white mb-2">How You Can Help</h2>
            <p className="text-[#64748B] font-medium">Simple steps that make a massive difference in our intelligence network.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            {/* Dotted Connecting Line (Hidden on mobile) */}
            <div className="hidden sm:block absolute top-10 left-10 right-10 border-t-2 border-dashed border-[#334155] z-0"></div>

            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative z-10 flex flex-col items-start sm:items-center text-left sm:text-center group"
              >
                <div className={`w-20 h-20 rounded-full bg-[#0F172A] border-4 border-[#020617] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-transform duration-300`}>
                  <div className={`w-14 h-14 rounded-full ${step.bg} ${step.border} border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-black ${step.color} mb-1 drop-shadow-sm`}>{step.num}</p>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-[#64748B] font-medium leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: CTA Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 blur-[80px] rounded-full group-hover:bg-violet-600/30 transition-colors"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">Be the Reason<br/>They Come Home</h3>
            <p className="text-[#CBD5E1] text-sm leading-relaxed mb-8 font-medium">
              Your information, no matter how small, can be the missing piece in the puzzle for law enforcement.
            </p>
            <button 
              onClick={() => scrollToSection('report')}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-violet-400/30"
            >
              Submit a Tip Now <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
