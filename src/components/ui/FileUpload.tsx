'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Camera,
  ScanLine,
  Eye,
  Pencil,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DocumentScanner } from '@/components/ui/DocumentScanner';

interface FileUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  type?: 'image' | 'document';
  maxFiles?: number;
  hint?: string;
  enableCamera?: boolean;
  /** Parallel array of titles for each file */
  titles?: string[];
  /** Called when titles change */
  onTitlesChange?: (titles: string[]) => void;
}

const MAX_IMAGE_WIDTH = 1200;
const IMAGE_QUALITY = 0.75;
const WATERMARK_OPACITY = 0.15;
const WATERMARK_SIZE_RATIO = 0.15; // 15% of image width

// Cache the watermark image in module scope
let watermarkCache: HTMLImageElement | null = null;

function loadWatermark(): Promise<HTMLImageElement> {
  if (watermarkCache) return Promise.resolve(watermarkCache);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      watermarkCache = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load watermark'));
    img.src = '/shortlogo.svg';
  });
}

function applyWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  watermarkImg: HTMLImageElement
): void {
  const wmWidth = canvasWidth * WATERMARK_SIZE_RATIO;
  const wmHeight = (wmWidth / watermarkImg.width) * watermarkImg.height;
  const padding = canvasWidth * 0.03;
  const x = canvasWidth - wmWidth - padding;
  const y = canvasHeight - wmHeight - padding;

  ctx.globalAlpha = WATERMARK_OPACITY;
  ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
  ctx.globalAlpha = 1.0;
}

/**
 * Compress an image File to WebP/JPEG base64 data URI with watermark.
 * Non-image files are returned as raw base64.
 */
function compressToBase64WithWatermark(
  file: File,
  maxWidth: number,
  quality: number,
  addWatermark: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (!file.type.startsWith('image/')) {
        resolve(reader.result as string);
        return;
      }

      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply watermark
        if (addWatermark) {
          try {
            const wm = await loadWatermark();
            applyWatermark(ctx, canvas.width, canvas.height, wm);
          } catch {
            // Skip watermark if loading fails
          }
        }

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Apply watermark to an existing data URL (used for camera captures and scans).
 */
function addWatermarkToDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);

      try {
        const wm = await loadWatermark();
        applyWatermark(ctx, canvas.width, canvas.height, wm);
      } catch {
        resolve(dataUrl);
        return;
      }

      let result = canvas.toDataURL('image/webp', IMAGE_QUALITY);
      if (!result.startsWith('data:image/webp')) {
        result = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      }
      resolve(result);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ── Title Input Dialog ────────────────────────────────────────
interface TitleDialogProps {
  imageUrl: string | null;
  onConfirm: (title: string) => void;
  onCancel: () => void;
  type: 'image' | 'document';
}

function TitleDialog({ imageUrl, onConfirm, onCancel, type }: TitleDialogProps): React.ReactElement {
  const [title, setTitle] = useState('');
  const isPreviewable = imageUrl?.startsWith('data:image/') || imageUrl?.startsWith('blob:');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        {/* Preview */}
        {isPreviewable && imageUrl && (
          <div className="bg-gray-100 flex items-center justify-center max-h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Preview" className="max-h-64 w-full object-contain" />
          </div>
        )}
        {!isPreviewable && imageUrl && (
          <div className="bg-gray-100 flex items-center justify-center h-32">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <div className="p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            {type === 'image' ? 'Name this image' : 'Name this document'}
          </h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'image' ? 'e.g. Front view, Court 1...' : 'e.g. ID Proof, License...'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(title);
            }}
          />
          <div className="flex gap-2 mt-4 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Skip
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={() => onConfirm(title)}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────
interface PreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
  onEditTitle: () => void;
  type: 'image' | 'document';
}

function PreviewModal({ url, title, onClose, onEditTitle, type }: PreviewModalProps): React.ReactElement {
  const isPreviewable = url.startsWith('data:image/') || url.startsWith('blob:') || /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image/doc preview */}
        {isPreviewable ? (
          <div className="bg-gray-900 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={title || 'Preview'} className="max-h-[60vh] w-full object-contain" />
          </div>
        ) : (
          <div className="bg-gray-100 flex flex-col items-center justify-center h-48">
            <FileText className="h-16 w-16 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Document preview not available</p>
          </div>
        )}

        {/* Title & actions */}
        <div className="p-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-900 truncate">
              {title || `Untitled ${type === 'image' ? 'Image' : 'Document'}`}
            </span>
            <button
              type="button"
              onClick={onEditTitle}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Edit title"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Title Inline Dialog ──────────────────────────────────
interface EditTitleDialogProps {
  currentTitle: string;
  onSave: (title: string) => void;
  onCancel: () => void;
}

function EditTitleDialog({ currentTitle, onSave, onCancel }: EditTitleDialogProps): React.ReactElement {
  const [title, setTitle] = useState(currentTitle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 animate-fade-in">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit Title</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(title);
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="flex gap-2 mt-3 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button type="button" variant="primary" size="sm" onClick={() => onSave(title)}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ── Main FileUpload Component ─────────────────────────────────
export function FileUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  type = 'image',
  maxFiles = 10,
  hint,
  enableCamera = true,
  titles = [],
  onTitlesChange,
}: FileUploadProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Pending files waiting for title input
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [titleDialogIndex, setTitleDialogIndex] = useState(0);

  // Preview state
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [editTitleIndex, setEditTitleIndex] = useState<number | null>(null);

  // Drag to reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    setDragIndex(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newUrls = [...value];
    const [moved] = newUrls.splice(dragIndex, 1);
    newUrls.splice(idx, 0, moved);
    onChange(newUrls);

    if (titles.length > 0 && onTitlesChange) {
      const newTitles = [...titles];
      const [movedTitle] = newTitles.splice(dragIndex, 1);
      newTitles.splice(idx, 0, movedTitle);
      onTitlesChange(newTitles);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, value, onChange, titles, onTitlesChange]);

  const canAddMore = value.length + pendingFiles.length < maxFiles;
  const remaining = maxFiles - value.length - pendingFiles.length;

  // Helper to update a single title
  const updateTitle = useCallback(
    (index: number, newTitle: string) => {
      if (!onTitlesChange) return;
      const updated = [...titles];
      while (updated.length <= index) updated.push('');
      updated[index] = newTitle;
      onTitlesChange(updated);
    },
    [titles, onTitlesChange]
  );

  // Process files with watermark and queue for title input
  const processAndQueue = useCallback(
    async (files: FileList, fromCamera: boolean) => {
      const newDataUrls: string[] = [];

      for (let i = 0; i < files.length && newDataUrls.length < remaining; i++) {
        try {
          const dataUrl = await compressToBase64WithWatermark(
            files[i],
            MAX_IMAGE_WIDTH,
            IMAGE_QUALITY,
            fromCamera // watermark only on camera captures
          );
          newDataUrls.push(dataUrl);
        } catch {
          // Skip
        }
      }

      if (newDataUrls.length > 0) {
        setPendingFiles(newDataUrls);
        setTitleDialogIndex(0);
      }
    },
    [remaining]
  );

  // Handle title confirmation for queued files
  const handleTitleConfirm = useCallback(
    (title: string) => {
      const fileUrl = pendingFiles[titleDialogIndex];
      const newValues = [...value, fileUrl];
      const newTitles = [...titles];
      while (newTitles.length < newValues.length - 1) newTitles.push('');
      newTitles.push(title);

      onChange(newValues);
      onTitlesChange?.(newTitles);

      if (titleDialogIndex < pendingFiles.length - 1) {
        setTitleDialogIndex(titleDialogIndex + 1);
      } else {
        setPendingFiles([]);
        setTitleDialogIndex(0);
      }
    },
    [pendingFiles, titleDialogIndex, value, titles, onChange, onTitlesChange]
  );

  const handleTitleCancel = useCallback(() => {
    // "Skip" — add without title
    handleTitleConfirm('');
  }, [handleTitleConfirm]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await processAndQueue(files, false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleCameraInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await processAndQueue(files, true);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Handle document scanner capture — add watermark, then queue for title
  const handleScanCapture = useCallback(
    async (dataUrl: string) => {
      const watermarked = await addWatermarkToDataUrl(dataUrl);
      setPendingFiles([watermarked]);
      setTitleDialogIndex(0);
    },
    []
  );

  const removeFile = (index: number) => {
    const updated = [...value];
    if (updated[index].startsWith('blob:')) {
      URL.revokeObjectURL(updated[index]);
    }
    updated.splice(index, 1);
    onChange(updated);

    if (onTitlesChange) {
      const updatedTitles = [...titles];
      updatedTitles.splice(index, 1);
      onTitlesChange(updatedTitles);
    }
  };

  const getFileLabel = (url: string, idx: number): string => {
    if (titles[idx]) return titles[idx];
    if (url.startsWith('data:image/')) return `${type === 'image' ? 'Image' : 'Document'} ${idx + 1}`;
    if (url.startsWith('data:')) return `Document ${idx + 1}`;
    if (url.startsWith('blob:')) return `File ${idx + 1}`;
    return url.split('/').pop() ?? `File ${idx + 1}`;
  };

  const isImagePreviewable = (url: string): boolean => {
    return url.startsWith('data:image/') || url.startsWith('blob:') || /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}

      {/* File grid */}
      {value.length > 0 && (
        <div
          className={`grid gap-3 mb-3 ${
            type === 'image' ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1'
          }`}
        >
          {value.map((url, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              className={`relative group rounded-lg border overflow-hidden cursor-pointer transition-all ${
                type === 'image' ? 'aspect-square' : 'flex items-center gap-3 p-3'
              } ${dragOverIndex === idx ? 'border-brand-400 ring-2 ring-brand-200' : 'border-gray-200'} ${
                dragIndex === idx ? 'opacity-40' : ''
              }`}
              onClick={() => setPreviewIndex(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setPreviewIndex(idx); }}
            >
              {/* Drag handle */}
              {type === 'image' && value.length > 1 && (
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span className="rounded bg-black/60 p-0.5 text-white block cursor-grab">
                    <GripVertical className="h-3 w-3" />
                  </span>
                </div>
              )}
              {(type === 'image' || isImagePreviewable(url)) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={getFileLabel(url, idx)}
                  className={`object-cover ${type === 'image' ? 'w-full h-full' : 'w-12 h-12 rounded shrink-0'}`}
                />
              ) : null}
              {type === 'document' && (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {!isImagePreviewable(url) && (
                    <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {getFileLabel(url, idx)}
                  </span>
                </div>
              )}

              {/* Title overlay for images */}
              {type === 'image' && titles[idx] && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[11px] text-white truncate">{titles[idx]}</p>
                </div>
              )}

              {/* Preview & remove buttons */}
              <div className={`absolute ${
                type === 'image'
                  ? 'top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1'
                  : 'top-1/2 -translate-y-1/2 right-2 flex gap-1'
              } transition-opacity`}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex(idx); }}
                  className="rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label={`Preview file ${idx + 1}`}
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  aria-label={`Remove file ${idx + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {canAddMore && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          {enableCamera && (
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraInput}
              className="hidden"
            />
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {type === 'image' ? 'Gallery' : 'Browse Files'}
            </Button>

            {enableCamera && type === 'image' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            )}

            {enableCamera && type === 'document' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowScanner(true)}
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Scan Document
              </Button>
            )}

            {enableCamera && type === 'document' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {value.length}/{maxFiles} files uploaded
          </p>
        </div>
      )}

      {/* Document Scanner Modal */}
      {showScanner && (
        <DocumentScanner
          onCapture={handleScanCapture}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Title Input Dialog — shown for each pending file */}
      {pendingFiles.length > 0 && (
        <TitleDialog
          imageUrl={pendingFiles[titleDialogIndex]}
          onConfirm={handleTitleConfirm}
          onCancel={handleTitleCancel}
          type={type}
        />
      )}

      {/* Preview Modal */}
      {previewIndex !== null && value[previewIndex] && (
        <PreviewModal
          url={value[previewIndex]}
          title={getFileLabel(value[previewIndex], previewIndex)}
          onClose={() => setPreviewIndex(null)}
          onEditTitle={() => {
            setEditTitleIndex(previewIndex);
            setPreviewIndex(null);
          }}
          type={type}
        />
      )}

      {/* Edit Title Dialog */}
      {editTitleIndex !== null && (
        <EditTitleDialog
          currentTitle={titles[editTitleIndex] ?? ''}
          onSave={(newTitle) => {
            updateTitle(editTitleIndex, newTitle);
            setEditTitleIndex(null);
          }}
          onCancel={() => setEditTitleIndex(null)}
        />
      )}
    </div>
  );
}
