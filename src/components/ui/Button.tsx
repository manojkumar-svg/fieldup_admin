import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Readonly<React.ButtonHTMLAttributes<HTMLButtonElement>> {
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly isLoading?: boolean;
  readonly children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: Readonly<ButtonProps>): React.ReactElement {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]';

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border border-gray-200 shadow-sm hover:shadow',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 hover:text-gray-900',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md shadow-red-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
