'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, onPageChange, total, pageSize }: Readonly<PaginationProps>): React.ReactElement {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
      <p className="text-sm text-gray-500 order-2 sm:order-1">
        Showing <span className="font-medium text-gray-700">{start}–{end}</span> of <span className="font-medium text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-xl"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
