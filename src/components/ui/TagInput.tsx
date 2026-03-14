'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  placeholder?: string;
}

export function TagInput({ label, value, onChange, error, placeholder }: Readonly<TagInputProps>): React.ReactElement {
  const [input, setInput] = useState('');

  const addTag = (tag: string): void => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number): void => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={cn(
          'flex flex-wrap gap-1.5 rounded-lg border px-3 py-2 text-sm shadow-sm',
          'focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500',
          error ? 'border-red-300' : 'border-gray-300'
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-0.5 text-sm text-brand-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(value.indexOf(tag))}
              className="rounded hover:bg-brand-200 p-0.5"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
