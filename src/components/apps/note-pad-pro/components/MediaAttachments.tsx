import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Mic, 
  X, 
  Play, 
  Pause, 
  Download,
  Eye,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Attachment } from '../types';

interface MediaAttachmentsProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Omit<Attachment, 'id'>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  className?: string;
}

interface RecordingState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  recordedChunks: Blob[];
  recordingTime: number;
  stream: MediaStream | null;
}

export const MediaAttachments: React.FC<MediaAttachmentsProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordingTime: 0,
    stream: null
  });

  const handleFileSelect = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const fileId = `upload-${Date.now()}-${Math.random()}`;
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
        }
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }, 200);

      // Create file URL (in real app, upload to server)
      const url = URL.createObjectURL(file);
      
      // Determine file type
      let type: Attachment['type'] = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      // Create thumbnail for images
      let thumbnail: string | undefined;
      if (type === 'image') {
        thumbnail = url; // Use the image itself as thumbnail
      }

      setTimeout(() => {
        onAddAttachment({
          name: file.name,
          type,
          url,
          size: file.size,
          uploadedAt: new Date(),
          thumbnail,
          mimeType: file.type
        });
      }, 2000); // Simulate upload delay
    });
  }, [onAddAttachment]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        onAddAttachment({
          name: `Recording ${new Date().toLocaleTimeString()}.webm`,
          type: 'audio',
          url,
          size: blob.size,
          uploadedAt: new Date(),
          duration: recording.recordingTime,
          mimeType: 'audio/webm'
        });

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        setRecording({
          isRecording: false,
          mediaRecorder: null,
          recordedChunks: [],
          recordingTime: 0,
          stream: null
        });
      };

      mediaRecorder.start();
      setRecording({
        isRecording: true,
        mediaRecorder,
        recordedChunks: chunks,
        recordingTime: 0,
        stream
      });

      // Start timer
      const timer = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          recordingTime: prev.recordingTime + 1
        }));
      }, 1000);

      // Store timer ID for cleanup
      (mediaRecorder as any).timerId = timer;
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [onAddAttachment, recording.recordingTime]);

  const stopRecording = useCallback(() => {
    if (recording.mediaRecorder && recording.isRecording) {
      clearInterval((recording.mediaRecorder as any).timerId);
      recording.mediaRecorder.stop();
    }
  }, [recording]);

  const playAudio = useCallback((attachment: Attachment) => {
    if (playingAudio === attachment.id) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = attachment.url;
        audioRef.current.play();
        setPlayingAudio(attachment.id);
        
        audioRef.current.onended = () => setPlayingAudio(null);
      }
    }
  }, [playingAudio]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Paperclip className="w-5 h-5" />
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Drag and drop files here, or click to select
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <File className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={recording.isRecording ? stopRecording : startRecording}
                className={recording.isRecording ? "text-red-600" : ""}
              >
                <Mic className="w-4 h-4 mr-2" />
                {recording.isRecording ? `Recording... ${formatDuration(recording.recordingTime)}` : 'Record Audio'}
              </Button>
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            title="Select files to upload"
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelect(e.target.files);
              }
            }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md"
          />

          {/* Upload Progress */}
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <File className="w-5 h-5" />
              Attached Files ({attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div 
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    {/* File Icon/Thumbnail */}
                    <div className="flex-shrink-0">
                      {attachment.type === 'image' && attachment.thumbnail ? (
                        <img 
                          src={attachment.thumbnail} 
                          alt={attachment.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          {getFileIcon(attachment.type)}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {attachment.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {attachment.type}
                        </Badge>
                        <span>{formatFileSize(attachment.size)}</span>
                        {attachment.duration && (
                          <span>{formatDuration(attachment.duration)}</span>
                        )}
                        <span>{attachment.uploadedAt.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {attachment.type === 'audio' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => playAudio(attachment)}
                        >
                          {playingAudio === attachment.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      {attachment.type === 'image' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = attachment.url;
                          a.download = attachment.name;
                          a.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveAttachment(attachment.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};
