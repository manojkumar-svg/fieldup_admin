import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  readonly variant?: 'success' | 'warning' | 'error' | 'info';
  readonly size?: 'sm' | 'md';
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Badge({ variant = 'info', size = 'sm', children, className }: BadgeProps): React.ReactElement {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    error: 'bg-red-50 text-red-700 ring-red-600/10',
    info: 'bg-blue-50 text-blue-700 ring-blue-600/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-semibold ring-1 ring-inset',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  readonly status: 'ACTIVE' | 'INACTIVE';
  readonly className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.ReactElement {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'error'} className={className}>
      <span className={cn(
        'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
        status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
      )} />
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </Badge>
  );
}
