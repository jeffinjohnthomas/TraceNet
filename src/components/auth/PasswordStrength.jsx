import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function PasswordStrength({ password }) {
  const criteria = useMemo(() => [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special char', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password) }
  ], [password]);

  const score = criteria.filter(c => c.met).length;
  
  const getStrengthColor = () => {
    if (score === 0) return 'bg-slate-700';
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][score] || 'Very Weak';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Password Strength</span>
        <span className={`font-bold ${
          score <= 2 ? 'text-red-400' : score <= 4 ? 'text-yellow-400' : 'text-teal-400'
        }`}>
          {password ? strengthLabel : ''}
        </span>
      </div>
      
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-full flex-1 rounded-full bg-slate-800 overflow-hidden">
             <motion.div 
               initial={{ width: '0%' }}
               animate={{ width: score >= index ? '100%' : '0%' }}
               transition={{ duration: 0.3 }}
               className={`h-full ${getStrengthColor()}`}
             />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-y-1 mt-2">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center text-xs">
            {c.met ? (
              <Check size={12} className="text-teal-400 mr-1.5 shrink-0" />
            ) : (
              <X size={12} className="text-slate-600 mr-1.5 shrink-0" />
            )}
            <span className={c.met ? 'text-slate-300' : 'text-slate-500'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
