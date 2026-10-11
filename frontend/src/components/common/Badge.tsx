import React from 'react';

interface BadgeProps {
  variant?: 'healthy' | 'sick' | 'under_treatment' | 'quarantined' | 'pregnant' | 'urgent' | 'high' | 'medium' | 'low' | 'completed' | 'todo' | 'in_progress' | 'admin' | 'farmer' | 'veterinarian' | 'worker';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'healthy', children, className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'healthy':
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'sick':
      case 'urgent':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'under_treatment':
      case 'in_progress':
      case 'high':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'pregnant':
      case 'veterinarian':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'quarantined':
      case 'medium':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'admin':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'farmer':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'worker':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};
