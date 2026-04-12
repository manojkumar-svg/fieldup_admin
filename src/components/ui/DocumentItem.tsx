'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { openDocUrl } from '@/lib/utils';

interface DocumentItemProps {
  url: string;
  title?: string;
  index: number;
}

export function DocumentItem({ url, title, index }: DocumentItemProps): React.ReactElement {
  const isBase64 = url.startsWith('data:');
  const urlFileName = isBase64
    ? `Document ${index + 1}`
    : (url.split('/').pop() ?? `Document ${index + 1}`);
  const fileName = title || urlFileName;
  const ext = (title || isBase64) ? 'FILE' : (url.split('.').pop()?.toUpperCase() ?? 'FILE');
  const isImage = url.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  return (
    <button
      type="button"
      onClick={() => openDocUrl(url)}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all group text-left"
    >
      {isImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt={fileName}
          className="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-200"
        />
      ) : (
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold shrink-0">
          {ext}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-700">
          {fileName}
        </p>
        <p className="text-xs text-gray-500">Click to open</p>
      </div>
      <FileText className="h-4 w-4 text-gray-300 group-hover:text-brand-400 shrink-0 transition-colors" />
    </button>
  );
}
