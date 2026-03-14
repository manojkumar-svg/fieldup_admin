import React from 'react';
import { InboxIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-5 rounded-2xl bg-gray-50 p-4 text-gray-400">
        {icon ?? <InboxIcon className="h-10 w-10" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-xs leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
