import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-5 rounded-2xl bg-red-50 p-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-xs leading-relaxed">
        {message ?? 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
