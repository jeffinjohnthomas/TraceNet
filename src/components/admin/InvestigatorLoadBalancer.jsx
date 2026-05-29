import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import StatusBadge from '../shared/StatusBadge';

export default function InvestigatorLoadBalancer({ investigators, handleCreateInvestigator, newInvForm, setNewInvForm }) {
  
  const getWorkload = (count) => {
    if (count >= 5) return 'Overloaded';
    if (count >= 3) return 'Heavy';
    if (count > 0) return 'Normal';
    return 'Low';
  };

  return (
    <GlassCard delay={0.3} className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-950/40 flex items-center justify-center border border-indigo-500/20 shadow-inner">
          <Users className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-[#F8FAFC] tracking-tight">Investigator Load Balancer</h3>
          <p className="text-xs text-[#64748B]">Active field officer assignments</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-56">
        {investigators.map(inv => {
          const workload = getWorkload(inv.activeCases);
          return (
            <div key={inv._id || inv.id} className="flex justify-between items-center p-3 border border-[#1E293B] rounded-xl bg-[#020617]/50 hover:bg-[#1E293B]/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-[#F8FAFC]">{inv.name}</p>
                <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-0.5">{inv.email}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-[#CBD5E1]">{inv.activeCases} Cases</span>
                <StatusBadge status={workload} type="workload" />
              </div>
            </div>
          )
        })}
        {investigators.length === 0 && (
          <div className="text-center py-6 text-[#64748B] text-sm font-medium">No officers provisioned.</div>
        )}
      </div>

      <div className="mt-auto pt-5 border-t border-[#1E293B]">
        <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3 flex items-center">
          <UserPlus className="w-3 h-3 mr-1.5" /> Provision New Officer
        </h4>
        <form onSubmit={handleCreateInvestigator} className="space-y-3">
          <input 
            required 
            type="text" 
            placeholder="Officer Name (e.g. Inv. Smith)" 
            value={newInvForm.name} 
            onChange={e=>setNewInvForm({...newInvForm, name: e.target.value})} 
            className="w-full text-sm p-3 bg-[#020617] border border-[#334155] rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] placeholder-[#64748B] transition-all shadow-inner" 
          />
          <div className="flex gap-2">
            <input 
              required 
              type="email" 
              placeholder="Official Email" 
              value={newInvForm.email} 
              onChange={e=>setNewInvForm({...newInvForm, email: e.target.value})} 
              className="w-1/2 text-sm p-3 bg-[#020617] border border-[#334155] rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] placeholder-[#64748B] transition-all shadow-inner" 
            />
            <input 
              required 
              type="password" 
              placeholder="Temp Access Key" 
              value={newInvForm.password} 
              onChange={e=>setNewInvForm({...newInvForm, password: e.target.value})} 
              className="w-1/2 text-sm p-3 bg-[#020617] border border-[#334155] rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] placeholder-[#64748B] transition-all shadow-inner" 
            />
          </div>
          <button type="submit" className="w-full py-3 mt-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98]">
            Authorize Clearance
          </button>
        </form>
      </div>
    </GlassCard>
  );
}
