import React from 'react';
import { Activity, ShieldAlert, MapPin, ChevronRight } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

export default function AIRoutingPanel({ cases, setCurrentView }) {
  // Find high priority unassigned
  const highPriority = cases.find(c => c.priority === 'High' && c.investigator === 'Unassigned');

  return (
    <GlassCard delay={0.2} className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-cyan-950/40 flex items-center justify-center border border-cyan-500/20 shadow-inner">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-[#F8FAFC] tracking-tight">Smart Auto-Priority & AI Routing</h3>
          <p className="text-xs text-[#64748B]">System-detected intelligence and recommendations</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {highPriority && (
          <div className="p-4 bg-[rgba(244,63,94,0.05)] border border-rose-500/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start">
              <ShieldAlert className="w-5 h-5 text-rose-400 mr-3 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#F8FAFC]">Target {highPriority.id} flagged Critical Priority</p>
                <p className="text-xs text-[#CBD5E1] font-medium mt-1">Trigger: Automated risk assessment threshold exceeded.</p>
              </div>
            </div>
            <button onClick={() => setCurrentView('assign')} className="text-xs font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 px-3 py-1.5 rounded-lg border border-rose-500/30 transition-colors shrink-0">
              Dispatch
            </button>
          </div>
        )}

        <div className="p-4 bg-[rgba(245,158,11,0.05)] border border-amber-500/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-amber-400 mr-3 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#F8FAFC]">Regional Cluster Detected: Bangalore Zone</p>
              <p className="text-xs text-[#CBD5E1] font-medium mt-1">Multiple operations open. Recommend immediate assignment balancing.</p>
            </div>
          </div>
          <button onClick={() => setCurrentView('map')} className="text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors shrink-0">
            View Heatmap
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
