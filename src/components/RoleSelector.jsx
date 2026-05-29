import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function RoleSelector({ value, onChange, roles }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-3 pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 outline-none text-sm text-gray-800 appearance-none cursor-pointer"
      >
        <option value="" disabled>Select Role</option>
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
