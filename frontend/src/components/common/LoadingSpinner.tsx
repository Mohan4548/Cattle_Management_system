import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`${sizeClasses} border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin`}
      />
    </div>
  );
};

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-emerald-400 text-xl">
          FE
        </div>
      </div>
      <h2 className="text-xl font-bold tracking-wider text-slate-200 animate-pulse">
        FARMEASE
      </h2>
      <p className="text-xs text-slate-400 mt-1">Smart Cattle Management System</p>
    </div>
  );
};
