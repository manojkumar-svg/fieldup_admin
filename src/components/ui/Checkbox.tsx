import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkboxId = id ?? label.toLowerCase().replaceAll(/\s+/g, '-');

    return (
      <div className="flex items-start gap-2">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600',
            'focus:ring-2 focus:ring-brand-500',
            error && 'border-red-300',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        <label htmlFor={checkboxId} className="text-sm text-gray-700 select-none">
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface CheckboxGroupProps {
  readonly label?: string;
  readonly error?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function CheckboxGroup({ label, error, children, className }: Readonly<CheckboxGroupProps>): React.ReactElement {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <span className="block text-sm font-medium text-gray-700">{label}</span>
      )}
      <div className="flex flex-wrap gap-3">
        {children}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
