import React from 'react';

export default function FormInput({ label, type = "text", placeholder, value, onChange, options = [], rows = 4, error }) {
  const baseClasses = "w-full px-3.5 py-2.5 bg-gray-50/80 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-sm text-gray-800 placeholder-gray-400";
  const borderClass = error ? "border-red-300 ring-1 ring-red-100" : "border-gray-200 hover:border-gray-300";

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {type === 'textarea' ? (
        <textarea
          rows={rows}
          className={`${baseClasses} ${borderClass} resize-none`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            className={`${baseClasses} ${borderClass} appearance-none pr-10`}
            value={value}
            onChange={onChange}
          >
            <option value="" disabled>{placeholder || "Select option"}</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      ) : (
        <input
          type={type}
          className={`${baseClasses} ${borderClass}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
      {error && <span className="text-xs text-red-500 font-medium pl-1">{error}</span>}
    </div>
  );
}
