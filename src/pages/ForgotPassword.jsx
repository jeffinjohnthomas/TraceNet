import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import OtpInput from '../components/auth/OtpInput';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email', 'otp'
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (step === 'otp') {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', { identifier: email });
      toast.success(data.message || 'OTP dispatched. Please check your inbox.');
      setStep('otp');
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending request.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (otpValue) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/verify-forgot-password-otp', { identifier: email, otp: otpValue });
      toast.success('Identity verified.');
      // Pass the reset token and identifier to the ResetPassword page
      setTimeout(() => {
        navigate('/reset-password', { state: { resetToken: data.resetToken, identifier: email } });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      // Re-trigger the forgot-password endpoint to get a new OTP
      const { data } = await api.post('/auth/forgot-password', { identifier: email });
      toast.success(data.message || 'New OTP dispatched.');
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      
      <AuthCard 
        title={step === 'email' ? "Recover Secure Access" : "Verify Identity"} 
        subtitle={step === 'email' ? "Enter your registered email to receive a secure OTP" : `Enter the 6-digit OTP sent to ${email}`}
        showLogo={false}
      >
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Professional Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 outline-none transition-all shadow-sm placeholder-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 hover:brightness-110 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Sending Request...' : 'Send Secure OTP'} 
              <ArrowRight size={18} />
            </button>
            
            <div className="text-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                <ArrowLeft size={16} className="mr-1.5" /> Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
             <div className="flex justify-center mb-4">
                <div className="bg-cyan-900/50 border border-cyan-500/30 p-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                   <ShieldCheck size={40} className="text-cyan-400" />
                </div>
             </div>
             
             <OtpInput length={6} onComplete={handleOtpComplete} disabled={loading} />
             
             <div className="text-center mb-8">
               {timer > 0 ? (
                 <p className="text-slate-400 text-sm font-medium mt-4">
                   Resend code in <span className="text-cyan-400 font-bold">{timer}s</span>
                 </p>
               ) : (
                 <button 
                   onClick={handleResend}
                   disabled={loading}
                   className="text-cyan-400 hover:text-cyan-300 font-bold text-sm transition-colors mt-4"
                 >
                   Resend OTP
                 </button>
               )}
             </div>

             <div className="pt-4">
               <button 
                 onClick={() => setStep('email')}
                 className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all"
               >
                 <ArrowLeft size={18} /> Change Email
               </button>
             </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
