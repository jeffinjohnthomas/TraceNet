import React from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
        
        {/* Fill track */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-teal-500 rounded-full z-0 transition-all duration-700 ease-in-out" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-teal-500 border-teal-500 text-white scale-100' : isCurrent ? 'bg-white border-teal-500 text-teal-600 font-bold shadow-lg shadow-teal-500/20 scale-110' : 'bg-white border-gray-200 text-gray-400 scale-100'}`}>
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={3}/> : <span className="text-sm">{idx + 1}</span>}
              </div>
              <span className={`absolute top-10 text-xs font-semibold w-24 text-center transition-colors duration-300 ${isCurrent ? 'text-teal-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8"></div>{/* Spacer for absolute text */}
    </div>
  );
}
