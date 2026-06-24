import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Square, RefreshCw, Upload, Film, Trash2, AlertCircle, Play, Eye } from 'lucide-react';

interface CameraMediaCaptureProps {
  onMediaCaptured: (mediaUrl: string, mediaType: 'image' | 'video') => void;
  onClear: () => void;
  capturedUrl: string | null;
  capturedType: 'image' | 'video' | null;
}

export default function CameraMediaCapture({ 
  onMediaCaptured, 
  onClear, 
  capturedUrl, 
  capturedType 
}: CameraMediaCaptureProps) {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recorderSupported, setRecorderSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (typeof window !== 'undefined' && !window.MediaRecorder) {
      setRecorderSupported(false);
    }
  }, []);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera(); // Clean up existing
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: mode === 'video' // Only request audio if recording video
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
      // Try video-only in case audio permission was denied or microphone missing
      if (mode === 'video') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play();
          }
          setStreamActive(true);
          return;
        } catch (retryErr) {
          console.error('Video only retry failed:', retryErr);
        }
      }
      setCameraError('Unable to access camera. Please allow permissions or upload a file directly.');
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
      onMediaCaptured(dataUrl, 'image');
      stopCamera();
    }
  };

  // Start Video Recording
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      let recorder;
      try {
        recorder = new MediaRecorder(streamRef.current, options);
      } catch (e) {
        // Fallback mimeType
        recorder = new MediaRecorder(streamRef.current);
      }

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        // Convert to data url for mock/localStorage storage
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onMediaCaptured(reader.result, 'video');
          }
        };
        reader.readAsDataURL(blob);
        stopCamera();
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      setCameraError('Video recording is not fully supported in this browser environment. Please upload video files.');
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      setCameraError('Supported formats: Images (JPEG, PNG, WebP) or Videos (MP4, WebM).');
      return;
    }

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onMediaCaptured(reader.result, isVideo ? 'video' : 'image');
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
          Incident Media Evidence
        </label>
        
        {!capturedUrl && (
          <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5 text-[10px] font-semibold font-mono">
            <button
              type="button"
              onClick={() => { setMode('photo'); stopCamera(); }}
              className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                mode === 'photo' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" /> Photo
            </button>
            <button
              type="button"
              onClick={() => { setMode('video'); stopCamera(); }}
              className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                mode === 'video' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3 h-3" /> Video
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="relative">
        {/* State A: Media is already Captured */}
        {capturedUrl ? (
          <div className="relative border border-amber-500/30 rounded-xl overflow-hidden bg-black/40 p-1.5 flex flex-col items-center justify-center">
            {capturedType === 'video' ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video 
                  src={capturedUrl} 
                  controls 
                  playsInline
                  className="max-h-[220px] w-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur border border-white/10 rounded text-[9px] font-mono font-bold text-amber-500 flex items-center gap-1">
                  <Film className="w-3 h-3" /> RECORDED EVIDENCE
                </div>
              </div>
            ) : (
              <div className="relative w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src={capturedUrl} 
                  alt="Captured Evidence" 
                  referrerPolicy="no-referrer"
                  className="max-h-[220px] w-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur border border-white/10 rounded text-[9px] font-mono font-bold text-amber-500 flex items-center gap-1">
                  <Camera className="w-3 h-3" /> SNAPSHOT CAPTURED
                </div>
              </div>
            )}
            
            <div className="w-full flex justify-between items-center mt-2 px-1 text-xs">
              <span className="text-[10px] text-slate-500 font-mono">Size: ~{(capturedUrl.length / 1024).toFixed(1)} KB</span>
              <button
                type="button"
                onClick={onClear}
                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Retake Evidence
              </button>
            </div>
          </div>
        ) : streamActive ? (
          /* State B: Live Camera Stream Viewfinder */
          <div className="relative border-2 border-dashed border-amber-500/40 rounded-2xl overflow-hidden bg-black aspect-video flex flex-col justify-between">
            {/* Camera Viewfinder Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-0.5 border border-white/5 rounded text-[9px] font-mono font-bold text-amber-500">
                  <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isRecording ? 'animate-ping' : ''}`} />
                  {isRecording ? 'REC' : 'LIVE'}
                </div>
                <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 border border-white/5 rounded text-[9px] font-mono font-medium text-slate-400">
                  {mode === 'photo' ? 'TELEMETRY GRID ON' : formatTime(recordSeconds)}
                </div>
              </div>

              {/* Grid guides */}
              <div className="absolute inset-x-0 top-1/3 border-b border-white/10" />
              <div className="absolute inset-x-0 top-2/3 border-b border-white/10" />
              <div className="absolute inset-y-0 left-1/3 border-r border-white/10" />
              <div className="absolute inset-y-0 left-2/3 border-r border-white/10" />

              <div className="flex justify-between items-end">
                <span className="text-[8px] font-mono text-slate-500">640x480 ENVIRONMENT</span>
                <span className="text-[8px] font-mono text-slate-500">ISO-AUTO</span>
              </div>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Capture controls */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-3">
              {mode === 'photo' ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center border-4 border-black/80 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  title="Snap Photo"
                >
                  <Camera className="w-5 h-5 text-black" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-black/80 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {isRecording ? <Square className="w-4 h-4 text-white fill-white" /> : <Video className="w-5 h-5 text-black" />}
                </button>
              )}

              <button
                type="button"
                onClick={stopCamera}
                className="w-8 h-8 bg-black/80 hover:bg-black/100 text-slate-400 hover:text-white rounded-full flex items-center justify-center border border-white/10 shadow-lg cursor-pointer my-auto"
                title="Cancel Camera"
              >
                ✕
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          /* State C: Drag and Drop & Trigger camera button */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
              isDragging 
                ? 'border-amber-500 bg-amber-500/5' 
                : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
            }`}
          >
            <input
              type="file"
              id="file-evidence"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-2 max-w-sm">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" /> Start Device Camera
                </button>
                <label
                  htmlFor="file-evidence"
                  className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" /> Choose File
                </label>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-normal mt-1.5">
                Drag & drop incident photos/videos or click to open. Captured files are cataloged directly into the decentralized ledger.
              </p>
            </div>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
}
