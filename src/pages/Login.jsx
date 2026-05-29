import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await api.post('/auth/login', {
        identifier: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('cis_token', data.token);
      localStorage.setItem('cis_role', data.role);
      
      toast.success('Authentication successful');
      onLogin({ role: data.role });
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed.';
      if (msg.toLowerCase().includes('password')) {
        setPasswordError('Invalid password please try again');
      } else if (msg.toLowerCase().includes('account not found')) {
        setEmailError(msg); // Keep the exact "Account not found" message
      } else if (msg.toLowerCase().includes('email')) {
        setEmailError('Please enter a valid email');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      
      <AuthCard title="Welcome Back" subtitle="Sign in to continue to your secure portal">
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className={`w-full pl-11 pr-4 py-3 bg-slate-950/70 border ${emailError ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' : 'border-slate-700 focus:ring-cyan-400/40 focus:border-cyan-400'} rounded-xl text-slate-100 text-sm focus:ring-2 outline-none transition-all shadow-sm placeholder-slate-500`}
                value={formData.email}
                onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailError(''); }}
              />
            </div>
            {emailError && <p className="text-red-400 text-xs mt-1.5 font-medium ml-1">{emailError}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
               <label className="block text-sm font-semibold text-slate-300">Password</label>
               <Link to="/forgot-password" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                 Forgot password?
               </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className={`w-full pl-11 pr-12 py-3 bg-slate-950/70 border ${passwordError ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' : 'border-slate-700 focus:ring-cyan-400/40 focus:border-cyan-400'} rounded-xl text-slate-100 text-sm focus:ring-2 outline-none transition-all shadow-sm placeholder-slate-500`}
                value={formData.password}
                onChange={(e) => { setFormData({...formData, password: e.target.value}); setPasswordError(''); }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && <p className="text-red-400 text-xs mt-1.5 font-medium ml-1">{passwordError}</p>}
          </div>

          {/* ReCAPTCHA removed for testing purposes */}          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 hover:brightness-110 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Authenticate Access'} 
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8">
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
                      credential: credentialResponse.credential
                    });
                    
                    localStorage.setItem('cis_token', data.token);
                    localStorage.setItem('cis_role', data.role);
                    
                    toast.success('Login successful');
                    onLogin({ role: data.role });
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Login failed');
                  }
               }}
               onError={() => toast.error('Login failed')}
               useOneTap
               theme="filled_black"
               size="large"
               width="100%"
               shape="pill"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors">
              Request Access
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
