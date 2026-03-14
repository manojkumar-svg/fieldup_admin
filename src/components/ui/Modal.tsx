'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps): React.ReactElement | null {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <dialog
        className={cn(
          'relative z-10 w-full bg-white shadow-2xl animate-slide-up',
          'rounded-t-2xl sm:rounded-2xl',
          'p-5 sm:p-6',
          'max-h-[85dvh] overflow-y-auto',
          sizes[size]
        )}
        open
        aria-labelledby="modal-title"
      >
        <div className="sm:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  );
}
