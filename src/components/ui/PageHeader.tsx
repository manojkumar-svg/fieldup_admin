import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly backHref?: string;
  readonly action?: React.ReactNode;
  readonly className?: string;
}

export function PageHeader({ title, subtitle, backHref, action, className }: PageHeaderProps): React.ReactElement {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="rounded-xl p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
