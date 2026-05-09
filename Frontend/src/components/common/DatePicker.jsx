import React from 'react';
export const DatePicker = ({ value, onChange, placeholder = 'Select date', min, max, disabled = false, className = '', }) => {
    return (<input type="date" value={value} onChange={(e) => onChange?.(e.target.value)} min={min} max={max} disabled={disabled} placeholder={placeholder} className={`
        px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
        bg-white dark:bg-slate-900 text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}/>);
};

