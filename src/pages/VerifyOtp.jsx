import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck, Mail, Smartphone, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import OtpInput from '../components/auth/OtpInput';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function VerifyOtp({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const phone = location.state?.phone || 'your device';

  const [step, setStep] = useState('email'); // 'email', 'phone', 'success'
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!userId) {
      toast.error('Invalid verification session.');
      navigate('/');
    }
  }, [userId, navigate]);

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]); // reset timer when step changes

  const handleOtpComplete = async (otpValue) => {
    try {
      setLoading(true);
      if (step === 'email') {
        const { data } = await api.post('/auth/verify-email', { userId, otp: otpValue });
        toast.success(data.message);
        setStep('phone');
        setTimer(60);
      } else if (step === 'phone') {
        const { data } = await api.post('/auth/verify-phone', { userId, otp: otpValue });
        toast.success(data.message);
        setStep('success');
        
        // Auto-login if token provided (it is provided after successful phone verification if email was already verified)
        if (data.token) {
          localStorage.setItem('cis_token', data.token);
          localStorage.setItem('cis_role', data.role);
          setTimeout(() => {
            if (onLogin) onLogin({ role: data.role });
            else navigate(data.role === 'admin' ? '/admin' : data.role === 'investigator' ? '/investigator' : '/');
          }, 1500);
        } else {
           setTimeout(() => navigate('/'), 1500);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      const { data } = await api.post('/auth/resend-otp', { userId, type: step });
      toast.success(data.message);
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <AuthLayout>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      
      <AuthCard 
        title={step === 'email' ? "Email Verification" : step === 'phone' ? "Device Verification" : "Clearance Granted"} 
        subtitle={step === 'email' ? "Enter the 6-digit code sent to your registered email." : step === 'phone' ? `Enter the 6-digit code sent to ${phone}.` : "Your identity has been fully verified."}
        showLogo={false}
      >
        
        {/* Stepper Visualizer */}
        <div className="flex justify-between items-center mb-8 px-2 relative">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2"></div>
           
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-900 flex items-center justify-center font-bold border-4 border-slate-950 z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                <CheckCircle size={16} />
             </div>
             <span className="text-[10px] font-bold mt-2 text-cyan-400">Created</span>
           </div>
           
           <div className="flex flex-col items-center">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-950 z-10 transition-colors duration-500 ${step === 'phone' || step === 'success' ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                {step === 'phone' || step === 'success' ? <CheckCircle size={16} /> : <Mail size={14} />}
             </div>
             <span className={`text-[10px] font-bold mt-2 transition-colors duration-500 ${step === 'phone' || step === 'success' ? 'text-cyan-400' : 'text-slate-500'}`}>Email</span>
           </div>
           
           <div className="flex flex-col items-center">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-950 z-10 transition-colors duration-500 ${step === 'success' ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                {step === 'success' ? <CheckCircle size={16} /> : <Smartphone size={14} />}
             </div>
             <span className={`text-[10px] font-bold mt-2 transition-colors duration-500 ${step === 'success' ? 'text-cyan-400' : 'text-slate-500'}`}>Phone</span>
           </div>
           
           <div className="flex flex-col items-center">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-950 z-10 transition-colors duration-500 ${step === 'success' ? 'bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                <ShieldCheck size={14} />
             </div>
             <span className={`text-[10px] font-bold mt-2 transition-colors duration-500 ${step === 'success' ? 'text-emerald-400' : 'text-slate-500'}`}>Access</span>
           </div>
        </div>

        {step !== 'success' ? (
          <>
            <div className="mb-8 flex justify-center">
              <OtpInput length={6} onComplete={handleOtpComplete} disabled={loading} />
            </div>

            <div className="text-center mb-8">
              {timer > 0 ? (
                <p className="text-slate-400 text-sm font-medium">
                  Resend code in <span className="text-cyan-400 font-bold">{timer}s</span>
                </p>
              ) : (
                <button 
                  onClick={handleResend}
                  disabled={loading}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-sm transition-colors"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
            
            <div className="flex justify-center">
               <button 
                 disabled={true} // Auto-submits on 6th digit via OtpInput
                 className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-400 font-semibold py-3.5 rounded-xl transition-all border border-slate-700 opacity-50 cursor-not-allowed"
               >
                 {loading ? 'Verifying Identity...' : 'Awaiting 6-Digit Code'} 
               </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", stiffness: 200, damping: 20 }}
               className="mx-auto w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
               <ShieldCheck size={40} className="text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Network Connection Established</h3>
            <p className="text-slate-400 text-sm">Redirecting to secure dashboard...</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Cancel Verification
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
