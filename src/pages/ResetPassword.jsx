import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Lock, KeyRound, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import PasswordStrength from '../components/auth/PasswordStrength';

export default function ResetPassword() {
  const location = useLocation();
  const token = location.state?.resetToken;
  const identifier = location.state?.identifier;
  
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !identifier) {
      toast.error('Invalid secure session.');
      navigate('/forgot-password');
    }
  }, [token, identifier, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { identifier, resetToken: token, newPassword: formData.password });
      toast.success(res.data.message || 'Password successfully updated.');
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Secure reset failed. Session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      
      <AuthCard title="Reset Cryptography" subtitle="Set a new secure password for your account" showLogo={false}>
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-slate-500" />
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
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 hover:brightness-110 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] mt-2 disabled:opacity-70"
            >
              {loading ? 'Encrypting...' : 'Encrypt & Finalize'} 
              <ArrowRight size={18} />
            </button>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                <ArrowLeft size={16} className="mr-1.5" /> Abort & Return to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
             <div className="p-4 bg-teal-900/30 rounded-xl border border-teal-500/50 inline-block">
               <CheckCircle size={48} className="text-teal-400 mx-auto" />
             </div>
             <p className="text-slate-300">
               Your password has been securely reset. You will be redirected to the login terminal shortly.
             </p>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
