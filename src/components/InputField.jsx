import React from 'react';

export default function InputField({ icon: Icon, type = "text", placeholder, value, onChange, secondaryIcon: SecondaryIcon, onSecondaryIconClick }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} ${SecondaryIcon ? 'pr-10' : 'pr-3'} py-3 bg-gray-50/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {SecondaryIcon && (
        <button
          type="button"
          onClick={onSecondaryIconClick}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        >
          <SecondaryIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
