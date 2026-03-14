'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  isLoading = false,
}: ConfirmDialogProps): React.ReactElement {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} isLoading={isLoading} className="w-full sm:w-auto">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
