import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'table-row';
}

export function Skeleton({ className, variant = 'text' }: Readonly<SkeletonProps>): React.ReactElement {
  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    'table-row': 'h-14 w-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]',
        variants[variant],
        className
      )}
    />
  );
}

export function TableSkeleton({ rows = 5 }: Readonly<{ rows?: number }>): React.ReactElement {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={`skeleton-row-${String(i)}`} variant="table-row" />
      ))}
    </div>
  );
}

export function CardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm shadow-gray-200/50">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
