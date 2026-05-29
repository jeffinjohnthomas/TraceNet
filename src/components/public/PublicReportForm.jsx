import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, MapPin, Upload, AlertTriangle, CheckCircle, Fingerprint, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function PublicReportForm() {
  const [subjectName, setSubjectName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [location, setLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState('');
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  
  const fileInputRef = useRef(null);

  // Strict File Validation Logic
  const handleFileChange = (e) => {
    setFileError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Invalid type! Please upload JPG, PNG, MP4, or PDF.');
      setFile(null);
      e.target.value = '';
      return;
    }

    if (selectedFile.size > maxSize) {
      setFileError('File too large! Max allowed is 10MB.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const finalLocation = location === 'Other Zone' ? otherLocation : location;
      
      const caseRes = await api.post('/cases', { subjectName, age, gender, location: finalLocation, description });
      const newCase = caseRes.data;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', newCase._id);
        await api.post('/evidence/upload', formData);
      }
      
      // Emit event so TrackStatus knows to refresh the user's cases from the backend
      window.dispatchEvent(new Event('cis_recent_cases_updated'));

      setSuccessId(newCase.caseId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Ensure network is active.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessId('');
    setSubjectName('');
    setAge('');
    setGender('Male');
    setLocation('');
    setOtherLocation('');
    setDescription('');
    setFile(null);
  };

  if (successId) {
    return (
      <section id="report" className="relative z-10 max-w-4xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[rgba(15,23,42,0.85)] p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#1E293B] text-center relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10 border border-teal-400/50">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight relative z-10">Transmission Secured</h2>
          <p className="text-[#CBD5E1] font-medium mb-10 max-w-lg mx-auto text-lg leading-relaxed relative z-10">
            Your intelligence report has been cryptographically signed and routed to available investigative personnel.
          </p>
          
          <div className="bg-[#020617] border border-[#334155] p-8 rounded-2xl inline-block shadow-inner relative z-10">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-[0.2em] mb-3 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 mr-2 text-cyan-400" /> Official Tracking ID
            </p>
            <p className="text-4xl md:text-6xl font-black text-teal-400 tracking-tighter select-all drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{successId}</p>
          </div>
          <p className="mt-8 text-sm text-[#64748B] font-bold relative z-10 uppercase tracking-widest mb-10">Saved securely to your local tracking history.</p>

          <button
            onClick={resetForm}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] border border-cyan-400/30 relative z-10"
          >
            Submit Another Tip
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="report" className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Submit Intelligence</h2>
        <p className="text-[#CBD5E1] font-medium max-w-xl mx-auto">Fill out the fields below. Provide as much detail as possible. Your identity will remain fully encrypted and anonymous.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <AnimatePresence>
          {error && (
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="p-4 bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30 rounded-2xl text-sm flex items-center backdrop-blur-md">
               <AlertTriangle className="w-5 h-5 mr-3 shrink-0"/> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Subject */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[rgba(15,23,42,0.65)] rounded-3xl border border-[#1E293B] backdrop-blur-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-[rgba(30,41,59,0.5)] border-b border-[#1E293B] px-8 py-5 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center mr-4 border border-cyan-500/30">
               <User className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">Subject Identification</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Subject Name / Alias / Entity</label>
                <input required type="text" value={subjectName} onChange={e=>setSubjectName(e.target.value)} className="w-full p-4 bg-[#020617] border border-[#334155] rounded-xl text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] placeholder-[#334155] transition-all shadow-inner" placeholder="e.g. John Doe, Unknown, or Company Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Estimated Age Bracket (Optional)</label>
                <select value={age} onChange={e=>setAge(e.target.value)} className="w-full p-4 bg-[#020617] border border-[#334155] rounded-xl text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] transition-all appearance-none shadow-inner cursor-pointer">
                  <option value="" disabled>Select Age Group</option>
                  <option value="0-5 Years">0-5 Years (Toddler/Pre-School)</option>
                  <option value="6-10 Years">6-10 Years (Primary)</option>
                  <option value="11-15 Years">11-15 Years (Middle/High)</option>
                  <option value="16-18 Years">16-18 Years (Late Teen)</option>
                  <option value="Unknown">Unknown Age</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Perceived Gender (Optional)</label>
                <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full p-4 bg-[#020617] border border-[#334155] rounded-xl text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] transition-all appearance-none shadow-inner cursor-pointer">
                   <option>Male</option><option>Female</option><option>Unknown</option><option>N/A (Organization)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Location & Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[rgba(15,23,42,0.65)] rounded-3xl border border-[#1E293B] backdrop-blur-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-[rgba(30,41,59,0.5)] border-b border-[#1E293B] px-8 py-5 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
               <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">Incident Context</h3>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Jurisdiction Zone</label>
              <select required value={location} onChange={e=>setLocation(e.target.value)} className="w-full p-4 bg-[#020617] border border-[#334155] rounded-xl text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] transition-all appearance-none shadow-inner cursor-pointer">
                <option value="" disabled>Select Reporting District</option>
                <option value="Bangalore Urban">Bangalore Urban</option>
                <option value="Bangalore Rural">Bangalore Rural</option>
                <option value="Mysore">Mysore</option>
                <option value="Mangalore">Mangalore</option>
                <option value="Hubli-Dharwad">Hubli-Dharwad</option>
                <option value="Delhi Central">Delhi Central</option>
                <option value="Mumbai Metropolitan">Mumbai Metropolitan</option>
                <option value="Chennai">Chennai</option>
                <option value="Other Zone">Other Unlisted Zone</option>
              </select>
            </div>
            
            {location === 'Other Zone' && (
              <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Manual Zone Entry</label>
                <input required type="text" value={otherLocation} onChange={e=>setOtherLocation(e.target.value)} className="w-full p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-[#F8FAFC] transition-all shadow-inner placeholder-cyan-900/50" placeholder="Specify region..." />
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Detailed Observation Report</label>
              <textarea required rows="5" value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-4 bg-[#020617] border border-[#334155] rounded-xl text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-[#F8FAFC] leading-relaxed transition-all shadow-inner placeholder-[#334155]" placeholder="Describe exactly what you saw..."></textarea>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Evidence */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[rgba(15,23,42,0.65)] rounded-3xl border border-[#1E293B] backdrop-blur-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-[rgba(30,41,59,0.5)] border-b border-[#1E293B] px-8 py-5 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center mr-4 border border-teal-500/30">
                 <Upload className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Secure Media Upload</h3>
            </div>
            <span className="text-[10px] font-bold text-[#64748B] bg-[#020617] px-2 py-1 rounded border border-[#334155] uppercase tracking-widest">Optional</span>
          </div>
          <div className="p-8">
            <AnimatePresence>
              {fileError && (
                <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="mb-6 p-4 bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30 rounded-xl text-sm flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-3 shrink-0"/> {fileError}
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              className={`w-full border-2 border-dashed ${fileError ? 'border-rose-500/50 bg-rose-950/10' : 'border-[#334155] bg-[#020617] hover:border-cyan-500/50 hover:bg-[rgba(30,41,59,0.3)]'} rounded-2xl p-10 text-center relative group cursor-pointer overflow-hidden transition-all duration-300`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,video/mp4,application/pdf" />
              <div className="w-16 h-16 bg-[#0F172A] rounded-full shadow-inner border border-[#1E293B] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-transform duration-500">
                <Upload className={`w-6 h-6 ${fileError ? 'text-rose-400' : 'text-cyan-400'}`} />
              </div>
              <p className="text-base font-bold text-white mb-2">{file ? file.name : 'Tap to Select File'}</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{file ? 'Ready to encrypt' : 'Max 10MB (JPG, PNG, MP4, PDF)'}</p>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting} 
          className="w-full flex items-center justify-center py-5 bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-lg font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-cyan-400/30 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin"/> : (
            <><ShieldCheck className="w-6 h-6 mr-3"/> Encrypt & Transmit Report</>
          )}
        </motion.button>
      </form>
    </section>
  );
}
