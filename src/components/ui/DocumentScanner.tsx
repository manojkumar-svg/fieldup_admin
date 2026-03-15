'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SunMedium,
  Contrast,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DocumentScannerProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

type FilterMode = 'original' | 'grayscale' | 'bw' | 'enhanced';

const FILTER_LABELS: Record<FilterMode, string> = {
  original: 'Color',
  grayscale: 'Gray',
  bw: 'B&W',
  enhanced: 'Enhanced',
};

const MAX_DOC_WIDTH = 1200;
const JPEG_QUALITY = 0.8;

export function DocumentScanner({
  onCapture,
  onClose,
}: DocumentScannerProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<'camera' | 'preview'>('camera');
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('enhanced');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(120);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Camera access denied. Please allow camera permissions in your browser settings.'
      );
    }
  }, [facingMode]);

  useEffect(() => {
    if (phase === 'camera') {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [phase, startCamera]);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setRawImage(dataUrl);
    setPhase('preview');

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, []);

  // Apply document filter to image and return processed data URL
  const applyFilter = useCallback(
    (imgSrc: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');

          // Scale down if too large
          const scale = img.width > MAX_DOC_WIDTH ? MAX_DOC_WIDTH / img.width : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imgSrc);
            return;
          }

          // Apply brightness/contrast via CSS filter
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

          if (filter === 'grayscale') {
            ctx.filter += ' grayscale(100%)';
          } else if (filter === 'bw') {
            ctx.filter += ' grayscale(100%) contrast(200%)';
          } else if (filter === 'enhanced') {
            ctx.filter += ' grayscale(100%) contrast(150%) brightness(110%)';
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // For B&W mode, apply threshold
          if (filter === 'bw') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const threshold = 128;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const val = avg > threshold ? 255 : 0;
              data[i] = val;
              data[i + 1] = val;
              data[i + 2] = val;
            }
            ctx.putImageData(imageData, 0, 0);
          }

          resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        };
        img.src = imgSrc;
      });
    },
    [filter, brightness, contrast]
  );

  // Confirm and send processed image
  const confirmCapture = useCallback(async () => {
    if (!rawImage) return;
    const processed = await applyFilter(rawImage);
    onCapture(processed);
    onClose();
  }, [rawImage, applyFilter, onCapture, onClose]);

  // Retake
  const retake = useCallback(() => {
    setRawImage(null);
    setBrightness(100);
    setContrast(120);
    setFilter('enhanced');
    setPhase('camera');
  }, []);

  // Flip camera
  const flipCamera = useCallback(() => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));
  }, []);

  // Preview CSS filter (matches canvas filter for live preview)
  const previewFilter = (() => {
    let f = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (filter === 'grayscale') f += ' grayscale(100%)';
    if (filter === 'bw') f += ' grayscale(100%) contrast(200%)';
    if (filter === 'enhanced') f += ' grayscale(100%) contrast(150%) brightness(110%)';
    return f;
  })();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 text-white">
        <button onClick={onClose} className="p-2" aria-label="Close scanner">
          <X className="h-6 w-6" />
        </button>
        <span className="text-sm font-medium">
          {phase === 'camera' ? 'Scan Document' : 'Adjust & Confirm'}
        </span>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Camera / Preview area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        {phase === 'camera' && (
          <>
            {cameraError ? (
              <div className="text-center text-white px-6">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">{cameraError}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={startCamera}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-h-full max-w-full object-contain"
                />
                {/* Document guide overlay */}
                <div className="absolute inset-8 border-2 border-white/40 rounded-lg pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-lg" />
                </div>
                <p className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-xs">
                  Align document within the frame
                </p>
              </>
            )}
          </>
        )}

        {phase === 'preview' && rawImage && (
          <img
            src={rawImage}
            alt="Captured document"
            className="max-h-full max-w-full object-contain"
            style={{ filter: previewFilter }}
          />
        )}
      </div>

      {/* Controls */}
      {phase === 'camera' && !cameraError && (
        <div className="bg-black/80 px-4 py-6">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={flipCamera}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Flip camera"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={captureFrame}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              aria-label="Capture document"
            >
              <div className="w-12 h-12 rounded-full bg-white" />
            </button>
            <div className="w-11" /> {/* spacer to balance layout */}
          </div>
        </div>
      )}

      {phase === 'preview' && (
        <div className="bg-black/80 px-4 py-4 space-y-4">
          {/* Filter modes */}
          <div className="flex items-center justify-center gap-2">
            {(Object.keys(FILTER_LABELS) as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  filter === mode
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {FILTER_LABELS[mode]}
              </button>
            ))}
          </div>

          {/* Brightness & contrast sliders */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2 flex-1">
              <SunMedium className="h-4 w-4 text-white/60 shrink-0" />
              <input
                type="range"
                min={50}
                max={150}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="flex-1 accent-white h-1"
                aria-label="Brightness"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Contrast className="h-4 w-4 text-white/60 shrink-0" />
              <input
                type="range"
                min={50}
                max={200}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="flex-1 accent-white h-1"
                aria-label="Contrast"
              />
            </div>
          </div>

          {/* Retake / Confirm */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retake}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <div className="p-3 rounded-full bg-white/10">
                <RotateCcw className="h-5 w-5" />
              </div>
              <span className="text-xs">Retake</span>
            </button>
            <button
              onClick={confirmCapture}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <div className="p-3 rounded-full bg-brand-600">
                <Check className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs">Use Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
