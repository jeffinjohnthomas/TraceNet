import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function PublicAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/cases');
        // Map recent cases to alert objects
        const mappedAlerts = data.map(c => {
          let type = "New Tip";
          let icon = Bell;
          let color = "text-cyan-400";
          let bg = "bg-cyan-500/10";
          let border = "border-cyan-500/30";
          let badge = "INFO";
          let badgeColor = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
          let title = `Case reported in ${c.location}`;

          if (c.priority === 'High') {
            type = "High Priority";
            icon = AlertTriangle;
            color = "text-rose-400";
            bg = "bg-rose-500/10";
            border = "border-rose-500/30";
            badge = "URGENT";
            badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";
            title = `High priority case reported in ${c.location}`;
          } else if (c.updates && c.updates.length > 0) {
            type = "Case Update";
            icon = ShieldCheck;
            color = "text-teal-400";
            bg = "bg-teal-500/10";
            border = "border-teal-500/30";
            badge = "UPDATE";
            badgeColor = "bg-teal-500/20 text-teal-400 border-teal-500/30";
            title = `Authorities investigating leads in ${c.location}`;
          }

          return {
            id: c.caseId,
            type,
            title,
            time: formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true }),
            icon, color, bg, border, badge, badgeColor
          };
        });
        
        setAlerts(mappedAlerts);
      } catch (err) {
        console.error("Failed to load alerts", err);
      }
    };
    fetchAlerts();
  }, []);

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 5);

  return (
    <section id="alerts" className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[rgba(15,23,42,0.65)] backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-center mb-8 border-b border-[#1E293B] pb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">My Case Updates</h2>
          {alerts.length > 5 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="px-5 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-xs font-bold text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-all"
            >
              {showAll ? 'View Less' : 'View All'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {displayedAlerts.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">No recent alerts found.</div>
          ) : (
            displayedAlerts.map((alert, idx) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('track_case_request', { detail: alert.id }));
                  const el = document.getElementById('track');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-between p-5 bg-[#020617] border border-[#1E293B] rounded-2xl hover:border-cyan-500/50 transition-all group cursor-pointer shadow-inner hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-full ${alert.bg} ${alert.border} border flex items-center justify-center shrink-0`}>
                    <alert.icon className={`w-5 h-5 ${alert.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold text-white">{alert.type}</p>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${alert.badgeColor}`}>
                        {alert.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] font-medium">{alert.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[#64748B] hidden sm:block">{alert.time}</span>
                  <ChevronRight className="w-5 h-5 text-[#334155] group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </section>
  );
}
