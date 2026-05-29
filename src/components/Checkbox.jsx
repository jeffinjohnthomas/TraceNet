import React from 'react';

export default function Checkbox({ label, checked, onChange, id }) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer transition-colors"
      />
      <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
}
