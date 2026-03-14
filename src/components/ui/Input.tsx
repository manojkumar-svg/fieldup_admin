import React from 'react';
import { cn } from '@/lib/utils';

function getAriaDescribedBy(inputId: string | undefined, error?: string, hint?: string): string | undefined {
  if (error) return `${inputId}-error`;
  if (hint) return `${inputId}-hint`;
  return undefined;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replaceAll(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'placeholder:text-gray-400',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 bg-red-50/50'
              : 'border-gray-200 text-gray-900 focus:ring-brand-500 hover:border-gray-300',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={getAriaDescribedBy(inputId, error, hint)}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
