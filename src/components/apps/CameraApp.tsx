import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Square, 
  Circle, 
  Settings, 
  Zap,
  RotateCcw,
  Download,
  Grid3x3,
  Timer,
  Maximize2,
  Minimize2,
  Trash2,
  Share,
  ImageIcon,
  VideoIcon,
  SwitchCamera,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraAppProps {
  windowId?: string;
}

type CaptureMode = 'photo' | 'video';
type FlashMode = 'off' | 'on' | 'auto';
type TimerMode = 'off' | '3s' | '10s';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  timestamp: Date;
  duration?: number;
}

export const CameraApp: React.FC<CameraAppProps> = () => {
  // State management
  const [isStreaming, setIsStreaming] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [timerMode, setTimerMode] = useState<TimerMode>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = isMuted;
      }
      
      setIsStreaming(true);
      setPermissionStatus('granted');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setPermissionStatus('denied');
    }
  }, [facingMode, isMuted]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
    }
  }, [isRecording]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopCamera();
      setTimeout(() => {
        initializeCamera();
      }, 100);
    }
  }, [isStreaming, stopCamera, initializeCamera]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flash effect
    if (flashMode === 'on' || flashMode === 'auto') {
      // Create multiple flash layers for better effect
      const flashOverlay = document.createElement('div');
      flashOverlay.style.position = 'fixed';
      flashOverlay.style.top = '0';
      flashOverlay.style.left = '0';
      flashOverlay.style.width = '100vw';
      flashOverlay.style.height = '100vh';
      flashOverlay.style.backgroundColor = 'white';
      flashOverlay.style.zIndex = '999999';
      flashOverlay.style.opacity = '0';
      flashOverlay.style.pointerEvents = 'none';
      flashOverlay.style.transition = 'opacity 50ms ease-out';
      document.body.appendChild(flashOverlay);
      
      // Trigger flash animation
      requestAnimationFrame(() => {
        flashOverlay.style.opacity = '0.95';
      });
      
      // Remove flash after animation
      setTimeout(() => {
        flashOverlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(flashOverlay)) {
            document.body.removeChild(flashOverlay);
          }
        }, 50);
      }, 100);
      
      // Add camera shutter sound effect (optional)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIdCSqJz/DGdSgGMYLN9diFMxEbaLPs4JtUIxNOoePtrGAUATGH2/LcfCgFIHPH8t2YOgcdXrDz6KxiGAY3jdby2Yk2CScZ8O2mXxoQU6Hi9LdkGAWGDvz/w3ojDS2Gx/LRfzAXN4Xb8c98Hw');
      audio.volume = 0.1;
      audio.play().catch(() => {
        // Ignore errors if audio can't play
      });
    }

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const mediaItem: MediaItem = {
          id: `photo-${Date.now()}`,
          type: 'photo',
          url,
          thumbnail: url,
          timestamp: new Date(),
        };
        setMediaLibrary(prev => [mediaItem, ...prev]);
      }
    }, 'image/jpeg', 0.9);
  }, [flashMode]);

  // Start video recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Create thumbnail (first frame)
      const video = document.createElement('video');
      video.src = url;
      video.currentTime = 0.1;
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          
          const mediaItem: MediaItem = {
            id: `video-${Date.now()}`,
            type: 'video',
            url,
            thumbnail,
            timestamp: new Date(),
            duration: recordingTime,
          };
          setMediaLibrary(prev => [mediaItem, ...prev]);
        }
      };
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);

    // Start recording timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, [recordingTime]);

  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  // Handle capture with timer
  const handleCapture = useCallback(() => {
    if (captureMode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
      return;
    }

    // Photo capture with timer
    const timerSeconds = timerMode === '3s' ? 3 : timerMode === '10s' ? 10 : 0;
    
    if (timerSeconds > 0) {
      let countdown = timerSeconds;
      const countdownInterval = setInterval(() => {
        countdown--;
        // You could add a countdown UI here
        if (countdown === 0) {
          clearInterval(countdownInterval);
          capturePhoto();
        }
      }, 1000);
    } else {
      capturePhoto();
    }
  }, [captureMode, isRecording, timerMode, stopRecording, startRecording, capturePhoto]);

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Download media
  const downloadMedia = useCallback((media: MediaItem) => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `${media.type}-${media.timestamp.toISOString()}.${media.type === 'photo' ? 'jpg' : 'webm'}`;
    link.click();
  }, []);

  // Delete media
  const deleteMedia = useCallback((mediaId: string) => {
    setMediaLibrary(prev => {
      const media = prev.find(m => m.id === mediaId);
      if (media) {
        URL.revokeObjectURL(media.url);
        if (media.thumbnail !== media.url) {
          URL.revokeObjectURL(media.thumbnail);
        }
      }
      return prev.filter(m => m.id !== mediaId);
    });
    setSelectedMedia(null);
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Permission UI
  if (permissionStatus === 'pending') {
    return (
      <div className="h-full bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Camera Access Required</h3>
          <p className="text-gray-400 mb-4">Allow access to camera and microphone</p>
          <Button onClick={initializeCamera} className="bg-blue-600 hover:bg-blue-500">
            Enable Camera
          </Button>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="h-full bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium mb-2">Camera Access Denied</h3>
          <p className="text-gray-400 mb-4">Please enable camera permissions in your browser</p>
          <Button onClick={initializeCamera} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex flex-col relative overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFlashMode(prev => {
                const newMode = prev === 'off' ? 'auto' : prev === 'auto' ? 'on' : 'off';
                console.log(`Flash mode changed: ${prev} → ${newMode}`);
                
                // Add haptic feedback if supported
                if ('vibrate' in navigator) {
                  navigator.vibrate(50);
                }
                
                return newMode;
              });
            }}
            className={`text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 ${
              flashMode !== 'off' ? 'bg-white/20 ring-2 ring-white/40' : ''
            }`}
            title={`Flash: ${flashMode.toUpperCase()}`}
          >
            {flashMode === 'off' && <Settings className="w-5 h-5" />}
            {flashMode === 'on' && <Zap className="w-5 h-5 text-yellow-300" />}
            {flashMode === 'auto' && <Zap className="w-5 h-5 text-blue-300" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTimerMode(prev => 
              prev === 'off' ? '3s' : prev === '3s' ? '10s' : 'off'
            )}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Timer className="w-5 h-5" />
            {timerMode !== 'off' && (
              <span className="ml-1 text-xs">{timerMode}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`text-white hover:bg-white/20 backdrop-blur-sm ${
              showGrid ? 'bg-white/20' : ''
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-3">
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-mono text-white">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {/* Flash status indicator */}
        {flashMode !== 'off' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              flashMode === 'on' 
                ? 'bg-yellow-600/90' 
                : 'bg-blue-600/90'
            } backdrop-blur-sm`}
          >
            {flashMode === 'on' && <Zap className="w-4 h-4 text-white" />}
            {flashMode === 'auto' && <Zap className="w-4 h-4 text-white" />}
            <span className="text-white text-sm font-medium">
              {flashMode === 'on' ? 'Flash On' : 'Auto Flash'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />
        
        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-8">
          {/* Media Library Preview */}
          <div className="flex space-x-2">
            {mediaLibrary.slice(0, 3).map((media) => (
              <motion.button
                key={media.id}
                onClick={() => setSelectedMedia(media)}
                className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={media.thumbnail}
                  alt={`${media.type} thumbnail`}
                  className="w-full h-full object-cover"
                />
                {media.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoIcon className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Capture Button */}
          <div className="flex flex-col items-center space-y-4">
            {/* Mode Selector */}
            <div className="flex bg-black/50 backdrop-blur-sm rounded-full p-1">
              <button
                onClick={() => setCaptureMode('photo')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  captureMode === 'photo' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                PHOTO
              </button>
              <button
                onClick={() => setCaptureMode('video')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  captureMode === 'video' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                VIDEO
              </button>
            </div>

            {/* Capture Button */}
            <motion.button
              onClick={handleCapture}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-600 border-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {captureMode === 'photo' ? (
                <Camera className="w-8 h-8 text-white" />
              ) : isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Circle className="w-8 h-8 text-white" />
              )}
            </motion.button>
          </div>

          {/* Switch Camera */}
          <Button
            variant="ghost"
            size="sm"
            onClick={switchCamera}
            className="w-12 h-12 rounded-full text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <SwitchCamera className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex items-center justify-center"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.url}
                  alt="Captured photo"
                  className="max-w-full max-h-full rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                />
              )}

              {/* Media Controls */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadMedia(selectedMedia)}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMedia(selectedMedia.id)}
                  className="text-white hover:bg-red-500/20 backdrop-blur-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
