'use client';

import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { VenueImage } from '@/types/database';

interface VenueImageGalleryProps {
  venueId: string;
}

export function VenueImageGallery({ venueId }: VenueImageGalleryProps): React.ReactElement {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<{ images: VenueImage[] }>({
    queryKey: ['venue-images', venueId],
    queryFn: async () => {
      const res = await fetch(`/api/venues/${venueId}/images`);
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    },
  });

  const images = data?.images ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch(`/api/venues/${venueId}/images`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message ?? 'Upload failed');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast('Images uploaded successfully', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const res = await fetch(`/api/venues/${venueId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete image');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast('Image deleted', 'success');
    },
    onError: () => {
      toast('Failed to delete image', 'error');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Venue Images</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && images.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
          role="button"
          tabIndex={0}
        >
          <ImageIcon className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Click to upload venue images</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF (max 5MB each)</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg border border-gray-200 overflow-hidden aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.caption ?? 'Venue image'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => deleteMutation.mutate(img.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Delete image"
              >
                <X className="h-4 w-4" />
              </button>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-xs text-white truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}

          {/* Add more button */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg aspect-square cursor-pointer hover:border-brand-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
            role="button"
            tabIndex={0}
          >
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">Add more</span>
          </div>
        </div>
      )}
    </div>
  );
}
