'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const AUTO_DISMISS_MS = 5000;
const MAX_TOASTS = 3;

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, message, variant }]);
      setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    },
    [removeToast]
  );

  const contextValue = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:top-4 sm:bottom-auto sm:right-4 z-50 space-y-2 flex flex-col items-stretch sm:items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

function ToastItem({ toast, onClose }: Readonly<{ toast: Toast; onClose: () => void }>): React.ReactElement {
  const Icon = variantIcons[toast.variant];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-4 shadow-lg w-full sm:min-w-[320px] sm:max-w-[420px] animate-slide-up sm:animate-fade-in',
        variantStyles[toast.variant]
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
