import React from 'react';
import { Database, Activity, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import GlassCard from '../shared/GlassCard';

export default function AdminMetrics({ cases, investigators }) {
  const metrics = [
    {
      label: 'Total System Cases',
      value: cases.length,
      icon: Database,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    },
    {
      label: 'Open / Active',
      value: cases.filter(c => c.status !== 'Closed').length,
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    },
    {
      label: 'Critical Priority',
      value: cases.filter(c => c.priority === 'High' && c.status !== 'Closed').length,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    },
    {
      label: 'Successfully Closed',
      value: cases.filter(c => c.status === 'Closed').length,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((m, i) => (
        <GlassCard key={i} delay={0.1 * i} className="group hover:-translate-y-1 transition-transform cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center border ${m.border}`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <span className={`text-xs font-bold ${m.color}`}>↑ Live</span>
          </div>
          <h3 className="text-3xl font-black text-[#F8FAFC] tracking-tight">{m.value}</h3>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mt-1">{m.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}
