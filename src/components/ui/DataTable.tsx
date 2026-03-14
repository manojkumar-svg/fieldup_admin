'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  mobileCard?: (item: T) => React.ReactNode;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  mobileCard,
  actions,
}: DataTableProps<T>): React.ReactElement {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500',
                    col.hideOnMobile && 'hidden lg:table-cell',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'transition-colors hover:bg-brand-50/30',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5 text-sm',
                      col.hideOnMobile && 'hidden lg:table-cell',
                      col.className
                    )}
                  >
                    {col.render(item)}
                  </td>
                ))}
                {actions && (
                  <td
                    className="px-4 py-3.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className={cn(
              'rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all active:scale-[0.98]',
              onRowClick && 'cursor-pointer'
            )}
            onClick={() => onRowClick?.(item)}
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onRowClick && e.key === 'Enter') onRowClick(item);
            }}
          >
            {mobileCard ? (
              mobileCard(item)
            ) : (
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase">{col.label}</span>
                    <span className="text-sm text-gray-900">{col.render(item)}</span>
                  </div>
                ))}
              </div>
            )}
            {actions && (
              <div
                className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {actions(item)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
