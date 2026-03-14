import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replaceAll(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'placeholder:text-gray-400 resize-y',
            error
              ? 'border-red-300 text-red-900 focus:ring-red-500 bg-red-50/50'
              : 'border-gray-200 text-gray-900 focus:ring-brand-500 hover:border-gray-300',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          rows={3}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
