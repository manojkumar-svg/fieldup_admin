import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variant?: 'default' | 'bordered';
}

export function Card({ children, className, variant = 'default' }: CardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-5 sm:p-6 transition-shadow duration-200',
        variant === 'bordered' ? 'border border-gray-200/80' : 'shadow-sm shadow-gray-200/50',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps): React.ReactElement {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function CardTitle({ children, className }: CardTitleProps): React.ReactElement {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
}
