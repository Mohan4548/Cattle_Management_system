import React from 'react';
import type { QRStatus } from '../types/index';

interface IdentityStatusBadgeProps {
  status: QRStatus | undefined | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<QRStatus, {
  label: string;
  dotClass: string;
  badgeClass: string;
  pulseClass?: string;
}> = {
  pending: {
    label: 'Pending',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    pulseClass: 'animate-pulse',
  },
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  inactive: {
    label: 'Inactive',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
  },
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const DOT_SIZES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export const IdentityStatusBadge: React.FC<IdentityStatusBadgeProps> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status ?? 'pending'] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide transition-all ${SIZE_CLASSES[size]} ${config.badgeClass}`}
    >
      <span
        className={`rounded-full shrink-0 ${DOT_SIZES[size]} ${config.dotClass} ${config.pulseClass ?? ''}`}
      />
      {showLabel && config.label}
    </span>
  );
};
