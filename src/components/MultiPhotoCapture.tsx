import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

interface MultiPhotoCaptureProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function MultiPhotoCapture({ photos, onChange }: MultiPhotoCaptureProps) {
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera(); // Clean up existing
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow permissions or upload files directly.');
      setStreamActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Capture Snapshot (Photo)
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onChange([...photos, dataUrl]);
      // Keep camera active so they can snap more photos!
    }
  };

  // Handle Drag & Drop / File select fallback
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    const newPhotos: string[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setCameraError('Only image files are supported for verification photos.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newPhotos.push(reader.result);
        }
        processedCount++;
        if (processedCount === files.length) {
          onChange([...photos, ...newPhotos]);
          setCameraError(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (indexToRemove: number) => {
    onChange(photos.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
          Verification Photos ({photos.length})
        </label>
      </div>

      {/* Camera Live Stream or Upload Selector */}
      <div className="relative">
        {streamActive ? (
          <div className="relative border-2 border-dashed border-amber-500/40 rounded-2xl overflow-hidden bg-black aspect-video flex flex-col justify-between">
            {/* Viewfinder Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-0.5 border border-white/5 rounded text-[9px] font-mono font-bold text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  AUDIT SCANNER
                </div>
                <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 border border-white/5 rounded text-[9px] font-mono font-medium text-slate-400">
                  GRID CALIBRATED
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[8px] font-mono text-slate-500">MULTIPLE CAPTURE ACTIVE</span>
              </div>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Controls */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="w-11 h-11 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center border-4 border-black/80 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="Snap Verification Photo"
              >
                <Camera className="w-4 h-4 text-black" />
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="w-7 h-7 bg-black/80 hover:bg-black text-slate-400 hover:text-white rounded-full flex items-center justify-center border border-white/10 shadow-lg cursor-pointer my-auto text-xs"
                title="Stop Camera"
              >
                ✕
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center min-h-[120px] cursor-pointer ${
              isDragging 
                ? 'border-amber-500 bg-amber-500/5' 
                : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
            }`}
          >
            <input
              type="file"
              id="file-verification-photos"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-2 max-w-sm">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Camera className="w-3.5 h-3.5" /> Start Camera
                </button>
                <label
                  htmlFor="file-verification-photos"
                  className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photos
                </label>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mt-1">
                Take multiple auditing pictures using device camera, or drop/upload multiple images at once.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Captured photos horizontal thumbnail reel */}
      {photos.length > 0 && (
        <div className="bg-black/30 border border-white/5 p-2 rounded-xl flex gap-2 overflow-x-auto max-w-full">
          {photos.map((url, idx) => (
            <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 group">
              <img 
                src={url} 
                alt={`Verification ${idx + 1}`} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white p-0.5 rounded-full transition-colors z-10"
                title="Remove photo"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {cameraError && (
        <div className="text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 p-2 rounded-lg flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
}
