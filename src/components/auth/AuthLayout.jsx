import React from 'react';
import AuthBackground from './AuthBackground';
import AuthVisualPanel from './AuthVisualPanel';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-200">
      
      {/* Left Column: TraceNet Visual Panel */}
      <AuthVisualPanel />

      {/* Right Column: Form Area */}
      <div className="w-full md:w-1/2 relative flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-950 overflow-hidden min-h-screen md:min-h-0">
        <AuthBackground />
        
        <div className="relative z-20 w-full max-w-md">
           {children}
        </div>
      </div>
    </div>
  );
}
