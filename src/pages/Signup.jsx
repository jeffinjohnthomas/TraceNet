import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import PasswordStrength from '../components/auth/PasswordStrength';
import OtpInput from '../components/auth/OtpInput';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  
  // Inline Verification States
  const [emailState, setEmailState] = useState('idle'); // idle | loading | otp | verified
  const [emailOtpToken, setEmailOtpToken] = useState(null);
  const [emailVerifiedToken, setEmailVerifiedToken] = useState(null);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (emailState === 'otp') {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailState]);

  const sendOtp = async (type, identifier) => {
    if (!identifier) return toast.error(`Please enter a valid ${type}`);
    const setState = setEmailState;
    const setToken = setEmailOtpToken;
    
    try {
      setState('loading');
      const { data } = await api.post('/auth/send-pre-otp', { type, identifier });
      setToken(data.otpToken);
      setState('otp');
      setTimer(60);
      toast.success(data.message);
      if (data.simulatedOtp) {
        toast.success(`Simulated SMS: Your OTP is ${data.simulatedOtp}`, { duration: 8000, icon: '📱' });
      }
    } catch (err) {
      setState('idle');
      toast.error(err.response?.data?.message || `Failed to send ${type} OTP`);
    }
  };

  const verifyOtp = async (type, otpValue) => {
    const setState = setEmailState;
    const setVerifiedToken = setEmailVerifiedToken;
    const otpToken = emailOtpToken;

    try {
      setState('loading');
      const { data } = await api.post('/auth/verify-pre-otp', { otpToken, otp: otpValue });
      setVerifiedToken(data.verifiedToken);
      setState('verified');
      toast.success(`${type === 'email' ? 'Email' : 'Phone'} verified!`);
    } catch (err) {
      setState('otp');
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (emailState !== 'verified') {
      toast.error('You must verify your email before registering.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'public',
        emailVerifiedToken
      });
      
      toast.success('Profile created successfully! Please log in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      
      <AuthCard title="Join TraceNet" subtitle="Create a secure public observer account" showLogo={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-slate-500" />
              </div>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 outline-none transition-all shadow-sm placeholder-slate-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          


          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Professional Email</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 outline-none transition-all shadow-sm placeholder-slate-500 disabled:opacity-50"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={emailState === 'otp' || emailState === 'verified'}
                />
              </div>
              {emailState === 'idle' && (
                <button type="button" onClick={() => sendOtp('email', formData.email)} className="px-4 bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 rounded-xl text-cyan-400 font-bold transition-all text-sm">
                  Verify
                </button>
              )}
              {emailState === 'loading' && (
                <div className="px-4 flex items-center border border-slate-700 rounded-xl text-slate-400 text-sm">...</div>
              )}
              {emailState === 'verified' && (
                <div className="px-3 flex items-center bg-teal-900/20 border border-teal-900 rounded-xl text-teal-400">
                  <CheckCircle size={20} />
                </div>
              )}
            </div>
            {emailState === 'otp' && (
              <div className="mt-3 p-4 border border-cyan-900/50 bg-cyan-900/10 rounded-xl animate-in fade-in zoom-in duration-300">
                 <p className="text-xs text-cyan-400 mb-3 text-center font-semibold">Enter the secure code sent to your email</p>
                 <OtpInput length={6} onComplete={(val) => verifyOtp('email', val)} />
                 <div className="text-center mt-3">
                   {timer > 0 ? (
                     <p className="text-slate-400 text-xs font-medium">
                       Resend code in <span className="text-cyan-400 font-bold">{timer}s</span>
                     </p>
                   ) : (
                     <button 
                       type="button"
                       onClick={() => sendOtp('email', formData.email)}
                       disabled={loading}
                       className="text-cyan-400 hover:text-cyan-300 font-bold text-xs transition-colors"
                     >
                       Resend OTP
                     </button>
                   )}
                 </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 outline-none transition-all shadow-sm placeholder-slate-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && <PasswordStrength password={formData.password} />}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 outline-none transition-all shadow-sm placeholder-slate-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-start mb-4 mt-2">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" required className="w-4 h-4 bg-slate-900 border-slate-700 rounded focus:ring-cyan-400 focus:ring-2 text-cyan-500" />
            </div>
            <label htmlFor="terms" className="ml-2 text-xs font-medium text-slate-400">
              I agree to the <a href="#" className="text-cyan-400 hover:underline">terms of service</a> and <a href="#" className="text-cyan-400 hover:underline">privacy policy</a>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || emailState !== 'verified'}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 hover:brightness-110 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] mt-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Create Secure Profile'} 
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center w-full">
            <GoogleLogin
               onSuccess={async (credentialResponse) => {
                  try {
                    const { data } = await api.post('/auth/google', {
                      credential: credentialResponse.credential,
                      role: 'public' // Default role for standard signups
                    });
                    
                    localStorage.setItem('cis_token', data.token);
                    localStorage.setItem('cis_role', data.role);
                    
                    toast.success('Signup successful');
                    onLogin({ role: data.role });
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Signup failed');
                  }
               }}
               onError={() => toast.error('Signup failed')}
               useOneTap
               theme="filled_black"
               size="large"
               width="100%"
               shape="pill"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors">
              Login Instead
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
