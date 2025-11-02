import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  small?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, small }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 text-slate-300"
    >
      <svg
        className={`${small ? 'h-4 w-4' : 'h-6 w-6'} animate-spin`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      {message && <span className="text-sm md:text-base">{message}</span>}
    </div>
  );
};
