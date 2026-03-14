'use client';

import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FileUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  type?: 'image' | 'document';
  maxFiles?: number;
  hint?: string;
}

export function FileUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  type = 'image',
  maxFiles = 10,
  hint,
}: FileUploadProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls: string[] = [];

    for (let i = 0; i < files.length && value.length + newUrls.length < maxFiles; i++) {
      // Create local object URLs for preview
      // In production, these would be uploaded to Supabase Storage
      const url = URL.createObjectURL(files[i]);
      newUrls.push(url);
    }

    onChange([...value, ...newUrls]);

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updated = [...value];
    // Revoke object URL if it's a blob URL
    if (updated[index].startsWith('blob:')) {
      URL.revokeObjectURL(updated[index]);
    }
    updated.splice(index, 1);
    onChange(updated);
  };

  const Icon = type === 'image' ? ImageIcon : FileText;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}

      {/* File grid */}
      {value.length > 0 && (
        <div className={`grid gap-3 mb-3 ${type === 'image' ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1'}`}>
          {value.map((url, idx) => (
            <div
              key={idx}
              className={`relative group rounded-lg border border-gray-200 overflow-hidden ${
                type === 'image' ? 'aspect-square' : 'flex items-center gap-3 p-3'
              }`}
            >
              {type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {url.startsWith('blob:') ? `Document ${idx + 1}` : url.split('/').pop()}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className={`absolute ${
                  type === 'image'
                    ? 'top-1 right-1 opacity-0 group-hover:opacity-100'
                    : 'top-1/2 -translate-y-1/2 right-2'
                } rounded-full bg-red-500 p-1 text-white transition-opacity hover:bg-red-600`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxFiles && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFiles}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            <Icon className="h-4 w-4 mr-2" />
            Upload {type === 'image' ? 'Images' : 'Documents'}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            {value.length}/{maxFiles} files uploaded
          </p>
        </div>
      )}
    </div>
  );
}
