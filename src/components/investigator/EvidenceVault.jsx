import React from 'react';
import { FileSearch, Check, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EvidenceVault({ 
  handleVaultUpload, vaultCaseId, setVaultCaseId, vaultFile, setVaultFile 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col p-6 sm:p-10 max-w-4xl mx-auto w-full min-h-full justify-center"
    >
      <div className="mb-8 text-center shrink-0">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[rgba(15,23,42,0.75)] border border-[#1E293B] shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6">
          <FileSearch className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Central Evidence Vault</h2>
        <p className="text-[#CBD5E1] text-sm sm:text-lg font-medium max-w-xl mx-auto leading-relaxed">
          Securely upload multimedia evidence, documents, and CCTV footage. All assets are cryptographically linked to active tracking operations.
        </p>
      </div>
      
      <div className="bg-[rgba(15,23,42,0.75)] backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] border border-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-12 relative overflow-hidden shrink-0">
        {/* Glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 blur-[120px] pointer-events-none rounded-full"></div>

        <form onSubmit={handleVaultUpload} className="space-y-8 relative z-10">
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3 pl-1">Target Operation ID</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-[#020617]/50 border border-[#334155] rounded-2xl text-white text-base font-medium focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all shadow-inner placeholder-[#64748B]" 
              value={vaultCaseId} onChange={e => setVaultCaseId(e.target.value)} 
              placeholder="e.g. CIS-2026-1234" required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3 pl-1">Digital Asset Payload</label>
            <div className="relative w-full group">
              <input 
                type="file" 
                onChange={e => setVaultFile(e.target.files[0])} 
                required 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className={`w-full px-6 py-12 bg-[#020617]/50 border-2 border-dashed ${vaultFile ? 'border-teal-500/50 bg-teal-950/10' : 'border-[#334155] group-hover:border-cyan-500/50 group-hover:bg-cyan-950/10'} rounded-2xl flex flex-col items-center justify-center transition-all shadow-inner text-center`}>
                {vaultFile ? (
                   <>
                     <div className="w-16 h-16 bg-teal-950/50 rounded-full flex items-center justify-center mb-4 border border-teal-500/30">
                       <Check className="w-8 h-8 text-teal-400" />
                     </div>
                     <p className="text-teal-400 font-bold text-lg mb-1">{vaultFile.name}</p>
                     <p className="text-[#64748B] font-medium text-sm">{(vaultFile.size / 1024 / 1024).toFixed(2)} MB ready for secure transmission</p>
                   </>
                ) : (
                   <>
                     <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-8 h-8 text-cyan-400" />
                     </div>
                     <p className="text-[#CBD5E1] font-bold text-lg mb-1">Click or drag file to this area to upload</p>
                     <p className="text-[#64748B] font-medium text-sm">Supports JPG, PNG, PDF, and MP4 (Max 50MB)</p>
                   </>
                )}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-2xl text-base sm:text-lg font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-95 border border-cyan-400/30 mt-6 sm:mt-4">
            <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Submit Evidence to Vault
          </button>
        </form>
      </div>
    </motion.div>
  );
}
