import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, PhoneCall, Video, VideoOff, Mic, MicOff, MessageCircle, 
  Send, Paperclip, Smile, Settings, Search, MoreVertical,
  Users, Lock, Camera, Minimize2, Maximize2, X, ArrowLeft, 
  Check, CheckCheck, Star, Shield, PhoneOff, Info,
  BellOff, Headphones, Speaker, Share2, PenTool,
  Languages, FileText, Heart, Brain, Timer,
  MonitorSpeaker, Activity, Waves, CheckCircle, Globe, Download
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  isBlocked?: boolean;
  isFavorite?: boolean;
  isTyping?: boolean;
  customStatus?: string;
}

interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'voice';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  isForwarded?: boolean;
  isEdited?: boolean;
  disappearAt?: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // for audio/video
  isEncrypted: boolean;
  reactions?: MessageReaction[];
  waveform?: number[]; // for voice messages
}

interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  avatar?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isEncrypted: boolean;
  groupAdmins?: string[]; // for groups
}

interface Call {
  id: string;
  type: 'voice' | 'video' | 'therapy';
  participants: string[];
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isIncoming: boolean;
  isEncrypted: boolean;
  quality?: 'HD' | '4K' | 'Auto';
  noiseSuppressionEnabled?: boolean;
  therapyMode?: {
    roomType: 'calming' | 'focus' | 'nature' | 'professional';
    biometricTracking?: boolean;
    moodAnalysis?: boolean;
  };
  collaboration?: {
    screenSharingActive?: boolean;
    whiteboardActive?: boolean;
    filesSharingActive?: boolean;
  };
  aiFeatures?: {
    transcriptionEnabled?: boolean;
    translationEnabled?: boolean;
    summaryEnabled?: boolean;
    emotionalAnalysisEnabled?: boolean;
  };
  focusSession?: {
    isActive: boolean;
    type: 'pomodoro' | 'custom';
    duration: number;
    breakReminders: boolean;
  };
}

interface AIInsight {
  id: string;
  type: 'emotional' | 'engagement' | 'summary' | 'action';
  content: string;
  confidence: number;
  timestamp: Date;
  isVisible: boolean;
}

interface TherapyEnvironment {
  id: string;
  name: string;
  type: 'calming' | 'focus' | 'nature' | 'professional';
  background: string;
  ambientSound?: string;
  lightingEffect?: 'warm' | 'cool' | 'dynamic';
}

interface BiometricData {
  heartRate?: number;
  stressLevel?: 'low' | 'medium' | 'high';
  engagementScore?: number;
  timestamp: Date;
}

interface WhiteboardStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: Date;
  userId: string;
}

interface WhiteboardState {
  strokes: WhiteboardStroke[];
  currentTool: 'pen' | 'eraser' | 'text' | 'shapes';
  currentColor: string;
  currentWidth: number;
  isDrawing: boolean;
  currentStroke?: WhiteboardStroke;
}

interface TranscriptionSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: Date;
  confidence: number;
  isTranslated?: boolean;
  originalLanguage?: string;
  translatedText?: string;
}

interface LiveTranscription {
  enabled: boolean;
  language: string;
  autoTranslate: boolean;
  targetLanguage: string;
  segments: TranscriptionSegment[];
  isRecording: boolean;
}

interface CollaborationTool {
  id: string;
  type: 'whiteboard' | 'screen' | 'file' | 'notes';
  isActive: boolean;
  permissions: 'view' | 'edit' | 'admin';
}

interface ReMotionTalkProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

const ReMotionTalk: React.FC<ReMotionTalkProps> = ({ onMinimize, onMaximize, onClose }) => {
  // State management
  const [currentView, setCurrentView] = useState<'chats' | 'calls' | 'contacts' | 'settings'>('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([]);
  
  // Advanced Features State
  const [isNoiseSuppressionOn, setIsNoiseSuppressionOn] = useState(true);
  const [callQuality, setCallQuality] = useState<'HD' | '4K' | 'Auto'>('Auto');
  const [isTherapyModeActive, setIsTherapyModeActive] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('professional');
  const [isBiometricTrackingEnabled, setIsBiometricTrackingEnabled] = useState(false);
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  
  // Whiteboard State
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({
    strokes: [],
    currentTool: 'pen',
    currentColor: '#3B82F6',
    currentWidth: 3,
    isDrawing: false
  });
  
  // Transcription State
  const [liveTranscription, setLiveTranscription] = useState<LiveTranscription>({
    enabled: false,
    language: 'en-US',
    autoTranslate: false,
    targetLanguage: 'es-ES',
    segments: [],
    isRecording: false
  });
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [isEmotionalAnalysisEnabled, setIsEmotionalAnalysisEnabled] = useState(false);
  const [focusSessionActive, setFocusSessionActive] = useState(false);
  const [focusTimer, setFocusTimer] = useState<number>(25 * 60); // 25 minutes
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [currentBiometrics, setCurrentBiometrics] = useState<BiometricData | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  // Mock data
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      phoneNumber: '+1234567890',
      avatar: '/api/placeholder/40/40',
      status: 'online',
      isFavorite: true,
      isTyping: false,
      customStatus: 'Available for therapy sessions'
    },
    {
      id: '2', 
      name: 'Bob Smith',
      phoneNumber: '+1234567891',
      avatar: '/api/placeholder/40/40',
      status: 'away',
      lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
      customStatus: 'In a meeting'
    },
    {
      id: '3',
      name: 'Carol Davis',
      phoneNumber: '+1234567892',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      customStatus: 'Do not disturb'
    }
  ]);

  const [therapyEnvironments] = useState<TherapyEnvironment[]>([
    {
      id: 'calming',
      name: 'Calming Ocean',
      type: 'calming',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      ambientSound: 'ocean-waves',
      lightingEffect: 'warm'
    },
    {
      id: 'focus',
      name: 'Focus Space',
      type: 'focus',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      ambientSound: 'white-noise',
      lightingEffect: 'cool'
    },
    {
      id: 'nature',
      name: 'Forest Retreat',
      type: 'nature',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      ambientSound: 'forest-sounds',
      lightingEffect: 'dynamic'
    },
    {
      id: 'professional',
      name: 'Professional',
      type: 'professional',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      lightingEffect: 'cool'
    }
  ]);

  const [chats] = useState<Chat[]>([
    {
      id: '1',
      type: 'direct',
      name: 'Alice Johnson',
      participants: ['1', 'current-user'],
      unreadCount: 3,
      isPinned: true,
      isMuted: false,
      isArchived: false,
      avatar: '/api/placeholder/50/50',
      createdAt: new Date(),
      updatedAt: new Date(),
      isEncrypted: true,
      lastMessage: {
        id: 'msg1',
        senderId: '1',
        receiverId: 'current-user',
        content: 'Hey! Are we still meeting today?',
        type: 'text',
        timestamp: new Date(Date.now() - 300000),
        status: 'delivered',
        isEncrypted: true
      }
    },
    {
      id: '2',
      type: 'group',
      name: 'Team Project',
      participants: ['1', '2', 'current-user'],
      unreadCount: 0,
      isPinned: false,
      isMuted: true,
      isArchived: false,
      avatar: '/api/placeholder/50/50',
      createdAt: new Date(),
      updatedAt: new Date(),
      isEncrypted: true,
      groupAdmins: ['current-user'],
      lastMessage: {
        id: 'msg2',
        senderId: '2',
        receiverId: 'group-2',
        content: 'Project update attached',
        type: 'file',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        fileName: 'project-update.pdf',
        fileSize: 2048576,
        isEncrypted: true
      }
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      senderId: '1',
      receiverId: 'current-user',
      content: 'Hey! Are we still meeting today?',
      type: 'text',
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered',
      isEncrypted: true
    },
    {
      id: 'msg2',
      senderId: 'current-user',
      receiverId: '1',
      content: 'Yes, absolutely! See you at 3 PM.',
      type: 'text',
      timestamp: new Date(Date.now() - 240000),
      status: 'read',
      isEncrypted: true
    }
  ]);

  const [recentCalls] = useState<Call[]>([
    {
      id: 'call1',
      type: 'video',
      participants: ['1', 'current-user'],
      status: 'ended',
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 6900000),
      duration: 300,
      isIncoming: true,
      isEncrypted: true
    },
    {
      id: 'call2',
      type: 'voice',
      participants: ['2', 'current-user'],
      status: 'missed',
      startTime: new Date(Date.now() - 14400000),
      isIncoming: true,
      isEncrypted: true
    }
  ]);

  // Helper functions
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Advanced AI Features
  const generateAIInsight = (type: AIInsight['type'], content: string) => {
    const insight: AIInsight = {
      id: `insight-${Date.now()}`,
      type,
      content,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      timestamp: new Date(),
      isVisible: true
    };
    setAiInsights(prev => [...prev, insight]);
  };

  const updateBiometrics = () => {
    // Simulate biometric data updates
    setCurrentBiometrics({
      heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
      stressLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      engagementScore: Math.floor(Math.random() * 40) + 60, // 60-100%
      timestamp: new Date()
    });
  };

  const startFocusSession = (duration: number = 25) => {
    setFocusSessionActive(true);
    setFocusTimer(duration * 60);
    
    const interval = setInterval(() => {
      setFocusTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setFocusSessionActive(false);
          // Show break notification
          generateAIInsight('action', 'Focus session completed! Time for a 5-minute break.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleTherapyEnvironment = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    setIsTherapyModeActive(true);
    generateAIInsight('summary', `Therapy environment changed to ${therapyEnvironments.find(e => e.id === environmentId)?.name}`);
  };

  const enableAINoiseSuppression = () => {
    setIsNoiseSuppressionOn(true);
    generateAIInsight('summary', 'AI noise suppression activated - background sounds filtered');
  };

  // Whiteboard functions
  const startWhiteboard = () => {
    setIsWhiteboardActive(true);
    generateAIInsight('summary', 'Interactive whiteboard activated for collaboration');
  };

  const stopWhiteboard = () => {
    setIsWhiteboardActive(false);
  };

  const handleWhiteboardMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!whiteboardCanvasRef.current) return;
    
    const canvas = whiteboardCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newStroke: WhiteboardStroke = {
      id: `stroke-${Date.now()}`,
      points: [{ x, y }],
      color: whiteboardState.currentColor,
      width: whiteboardState.currentWidth,
      timestamp: new Date(),
      userId: 'current-user'
    };
    
    setWhiteboardState(prev => ({
      ...prev,
      isDrawing: true,
      currentStroke: newStroke
    }));
  };

  const handleWhiteboardMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!whiteboardState.isDrawing || !whiteboardCanvasRef.current || !whiteboardState.currentStroke) return;
    
    const canvas = whiteboardCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setWhiteboardState(prev => ({
      ...prev,
      currentStroke: prev.currentStroke ? {
        ...prev.currentStroke,
        points: [...prev.currentStroke.points, { x, y }]
      } : undefined
    }));
    
    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (ctx && whiteboardState.currentStroke) {
      ctx.strokeStyle = whiteboardState.currentColor;
      ctx.lineWidth = whiteboardState.currentWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const points = whiteboardState.currentStroke.points;
      if (points.length > 1) {
        const lastPoint = points[points.length - 2];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const handleWhiteboardMouseUp = () => {
    if (whiteboardState.currentStroke) {
      setWhiteboardState(prev => ({
        ...prev,
        isDrawing: false,
        strokes: [...prev.strokes, prev.currentStroke!],
        currentStroke: undefined
      }));
    }
  };

  const clearWhiteboard = () => {
    setWhiteboardState(prev => ({
      ...prev,
      strokes: []
    }));
    
    if (whiteboardCanvasRef.current) {
      const ctx = whiteboardCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, whiteboardCanvasRef.current.width, whiteboardCanvasRef.current.height);
      }
    }
  };

  // Live Transcription functions
  const startLiveTranscription = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      generateAIInsight('summary', 'Speech recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = liveTranscription.language;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          const segment: TranscriptionSegment = {
            id: `segment-${Date.now()}`,
            speakerId: 'current-user',
            speakerName: 'You',
            text: finalTranscript,
            timestamp: new Date(),
            confidence: event.results[event.results.length - 1][0].confidence,
            originalLanguage: liveTranscription.language
          };
          
          setLiveTranscription(prev => ({
            ...prev,
            segments: [...prev.segments, segment]
          }));
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        generateAIInsight('summary', `Transcription error: ${event.error}`);
      };
      
      recognition.start();
      speechRecognitionRef.current = recognition;
      
      setLiveTranscription(prev => ({
        ...prev,
        enabled: true,
        isRecording: true
      }));
      
      generateAIInsight('summary', 'Live transcription started');
    } catch (error) {
      console.error('Failed to start transcription:', error);
      generateAIInsight('summary', 'Failed to start live transcription');
    }
  };

  const stopLiveTranscription = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    
    setLiveTranscription(prev => ({
      ...prev,
      enabled: false,
      isRecording: false
    }));
    
    generateAIInsight('summary', 'Live transcription stopped');
  };

  const toggleAutoTranslation = () => {
    setLiveTranscription(prev => ({
      ...prev,
      autoTranslate: !prev.autoTranslate
    }));
  };

  const exportTranscription = () => {
    const transcript = liveTranscription.segments
      .map(segment => `[${segment.timestamp.toLocaleTimeString()}] ${segment.speakerName}: ${segment.text}`)
      .join('\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    generateAIInsight('summary', 'Transcription exported successfully');
  };

  // Message handling
  const sendMessage = useCallback((content: string, type: Message['type'] = 'text', fileData?: any) => {
    if (!selectedChat || (!content.trim() && !fileData)) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      receiverId: selectedChat,
      content: content.trim() || '',
      type,
      timestamp: new Date(),
      status: 'sending',
      isEncrypted: true,
      replyTo: replyToMessage?.id,
      ...fileData
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyToMessage(null);
    setSelectedFiles([]);

    // Stop typing indicator
    setTypingUsers(prev => {
      const updated = new Set(prev);
      updated.delete('current-user');
      return updated;
    });

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);
  }, [selectedChat, replyToMessage]);

  // Typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!selectedChat) return;
    
    setTypingUsers(prev => {
      const updated = new Set(prev);
      if (isTyping) {
        updated.add('current-user');
      } else {
        updated.delete('current-user');
      }
      return updated;
    });
  }, [selectedChat]);

  // Message reactions
  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.userId === 'current-user' && r.emoji === emoji);
        
        if (existingReaction) {
          // Remove reaction if already exists
          return {
            ...msg,
            reactions: reactions.filter(r => !(r.userId === 'current-user' && r.emoji === emoji))
          };
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [...reactions, {
              emoji,
              userId: 'current-user',
              timestamp: new Date()
            }]
          };
        }
      }
      return msg;
    }));
  }, []);

  // File handling
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          fileName: file.name,
          fileSize: file.size,
          fileUrl: e.target?.result as string,
        };
        
        const type: Message['type'] = file.type.startsWith('image/') ? 'image' :
                                     file.type.startsWith('video/') ? 'video' :
                                     file.type.startsWith('audio/') ? 'audio' : 'file';
        
        sendMessage('', type, fileData);
      };
      reader.readAsDataURL(file);
    });
  }, [sendMessage]);

  // Voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      let startTime = Date.now();
      const updateDuration = () => {
        if (isRecordingVoice) {
          setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
          requestAnimationFrame(updateDuration);
        }
      };
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
        // Simulate waveform data
        const randomWave = Array.from({length: 50}, () => Math.random() * 100);
        setVoiceWaveform(randomWave);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        sendMessage('', 'voice', {
          fileUrl: audioUrl,
          duration: recordingDuration,
          waveform: voiceWaveform
        });
        
        stream.getTracks().forEach(track => track.stop());
        setRecordingDuration(0);
        setVoiceWaveform([]);
      };
      
      mediaRecorder.start();
      setIsRecordingVoice(true);
      updateDuration();
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  // Call handling
  const startCall = (contactId: string, type: 'voice' | 'video' | 'therapy') => {
    const newCall: Call = {
      id: `call-${Date.now()}`,
      type,
      participants: [contactId, 'current-user'],
      status: 'ringing',
      startTime: new Date(),
      isIncoming: false,
      isEncrypted: true,
      quality: callQuality,
      noiseSuppressionEnabled: isNoiseSuppressionOn,
      therapyMode: type === 'therapy' ? {
        roomType: therapyEnvironments.find(e => e.id === selectedEnvironment)?.type || 'professional',
        biometricTracking: isBiometricTrackingEnabled,
        moodAnalysis: isEmotionalAnalysisEnabled
      } : undefined,
      collaboration: {
        screenSharingActive: false,
        whiteboardActive: false,
        filesSharingActive: false
      },
      aiFeatures: {
        transcriptionEnabled: isTranscriptionEnabled,
        translationEnabled: isTranslationEnabled,
        summaryEnabled: true,
        emotionalAnalysisEnabled: isEmotionalAnalysisEnabled
      },
      focusSession: {
        isActive: false,
        type: 'pomodoro',
        duration: 25,
        breakReminders: true
      }
    };
    
    setActiveCall(newCall);
    
    // Start AI features if enabled
    if (isTranscriptionEnabled) {
      startLiveTranscription();
    }
    
    if (isBiometricTrackingEnabled) {
      const biometricInterval = setInterval(updateBiometrics, 5000);
      // Store interval for cleanup
    }
    
    // Initialize WebRTC connection here
    generateAIInsight('summary', `Starting ${type} call with enhanced AI features`);
  };

  const endCall = () => {
    if (activeCall) {
      // Generate call summary
      const duration = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000);
      generateAIInsight('summary', `Call ended. Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
      
      if (activeCall.aiFeatures?.summaryEnabled) {
        generateAIInsight('action', 'Call summary and action items will be available in your notes');
      }
      
      setActiveCall(null);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setIsSpeakerOn(false);
      setIsScreenSharingActive(false);
      setIsWhiteboardActive(false);
      setLiveTranscript('');
    }
  };

  const toggleScreenSharing = () => {
    setIsScreenSharingActive(!isScreenSharingActive);
    generateAIInsight('summary', isScreenSharingActive ? 'Screen sharing stopped' : 'Screen sharing started');
  };

  const toggleWhiteboard = () => {
    setIsWhiteboardActive(!isWhiteboardActive);
    generateAIInsight('summary', isWhiteboardActive ? 'Whiteboard closed' : 'Interactive whiteboard opened');
  };

  const acceptCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'active' });
    }
  };

  const declineCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'declined' });
      setTimeout(() => setActiveCall(null), 1000);
    }
  };

  // Effects
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Get current chat data
  const currentChat = chats.find(chat => chat.id === selectedChat);
  const currentChatMessages = messages.filter(msg => 
    (msg.senderId === selectedChat && msg.receiverId === 'current-user') ||
    (msg.senderId === 'current-user' && msg.receiverId === selectedChat)
  );

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold">ReMotion Talk</h1>
            <p className="text-xs text-gray-400">Simple. Secure. Seamless.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onMinimize}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onMaximize}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-red-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Navigation */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
              {[
                { id: 'chats', icon: MessageCircle, label: 'Chats' },
                { id: 'calls', icon: Phone, label: 'Calls' },
                { id: 'contacts', icon: Users, label: 'Contacts' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${currentView}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {currentView === 'chats' && (
              <div className="p-2">
                <AnimatePresence>
                  {chats.map(chat => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedChat === chat.id 
                          ? 'bg-blue-600/20 border border-blue-500' 
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {chat.avatar ? (
                              <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-lg font-semibold">
                                {chat.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {chat.isEncrypted && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Lock className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white truncate">{chat.name}</h3>
                            <div className="flex items-center space-x-1">
                              {chat.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                              {chat.isPinned && <Star className="w-3 h-3 text-yellow-500" />}
                              {chat.lastMessage && (
                                <span className="text-xs text-gray-400">
                                  {formatTime(chat.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {chat.lastMessage && (
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-400 truncate">
                                {chat.lastMessage.type === 'text' ? chat.lastMessage.content : 
                                 chat.lastMessage.type === 'image' ? '📷 Photo' :
                                 chat.lastMessage.type === 'video' ? '🎥 Video' :
                                 chat.lastMessage.type === 'audio' ? '🎵 Audio' :
                                 chat.lastMessage.type === 'file' ? `📎 ${chat.lastMessage.fileName}` : 
                                 '💭 Sticker'}
                              </p>
                              
                              <div className="flex items-center space-x-1">
                                {chat.lastMessage.senderId === 'current-user' && (
                                  <>
                                    {chat.lastMessage.status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
                                    {chat.lastMessage.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
                                    {chat.lastMessage.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                  </>
                                )}
                                
                                {chat.unreadCount > 0 && (
                                  <div className="bg-blue-500 text-white rounded-full min-w-[18px] h-4 flex items-center justify-center text-xs font-medium">
                                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {currentView === 'calls' && (
              <div className="p-2">
                <AnimatePresence>
                  {recentCalls.map(call => {
                    const contact = contacts.find(c => c.id === call.participants.find(p => p !== 'current-user'));
                    return (
                      <motion.div
                        key={call.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer mb-2"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">
                                {contact?.name.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              {call.type === 'video' ? (
                                <Video className="w-4 h-4 text-green-500" />
                              ) : call.type === 'therapy' ? (
                                <Heart className="w-4 h-4 text-pink-500" />
                              ) : (
                                <Phone className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white">{contact?.name || 'Unknown'}</h3>
                              <span className="text-xs text-gray-400">
                                {formatTime(call.startTime)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-sm ${
                                call.status === 'missed' ? 'text-red-400' : 
                                call.status === 'ended' ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                {call.isIncoming ? '↓' : '↑'} {call.status === 'missed' ? 'Missed' : 
                                 call.status === 'ended' && call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : 
                                 call.status}
                              </p>
                              
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => startCall(contact?.id || '', call.type)}
                                  className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                                >
                                  {call.type === 'video' ? (
                                    <Video className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Phone className="w-4 h-4 text-blue-500" />
                                  )}
                                </button>
                                <button className="p-1 hover:bg-gray-600 rounded-full transition-colors">
                                  <Info className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {currentView === 'contacts' && (
              <div className="p-2">
                <AnimatePresence>
                  {contacts.map(contact => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer mb-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(contact.status)} rounded-full border-2 border-gray-800`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white">{contact.name}</h3>
                            {contact.isFavorite && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-400">
                              {contact.status === 'online' ? 'Online' : 
                               contact.lastSeen ? `Last seen ${formatLastSeen(contact.lastSeen)}` : 
                               'Offline'}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => startCall(contact.id, 'voice')}
                                className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                                title="Voice call"
                              >
                                <Phone className="w-4 h-4 text-blue-500" />
                              </button>
                              <button 
                                onClick={() => startCall(contact.id, 'video')}
                                className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                                title="Video call"
                              >
                                <Video className="w-4 h-4 text-green-500" />
                              </button>
                              <button 
                                onClick={() => startCall(contact.id, 'therapy')}
                                className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                                title="Therapy session"
                              >
                                <Heart className="w-4 h-4 text-pink-500" />
                              </button>
                              <button 
                                onClick={() => setSelectedChat(contact.id)}
                                className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                                title="Send message"
                              >
                                <MessageCircle className="w-4 h-4 text-purple-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="p-4 space-y-6">
                {/* AI & Smart Features */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI & Smart Features
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">AI noise suppression</span>
                      <button
                        onClick={() => setIsNoiseSuppressionOn(!isNoiseSuppressionOn)}
                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isNoiseSuppressionOn ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Live transcription</span>
                      <button
                        onClick={() => setIsTranscriptionEnabled(!isTranscriptionEnabled)}
                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isTranscriptionEnabled ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Real-time translation</span>
                      <button
                        onClick={() => setIsTranslationEnabled(!isTranslationEnabled)}
                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isTranslationEnabled ? 'bg-purple-500 justify-end' : 'bg-gray-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Emotional analysis</span>
                      <button
                        onClick={() => setIsEmotionalAnalysisEnabled(!isEmotionalAnalysisEnabled)}
                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isEmotionalAnalysisEnabled ? 'bg-pink-500 justify-end' : 'bg-gray-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Call quality</span>
                      <select 
                        value={callQuality}
                        onChange={(e) => setCallQuality(e.target.value as any)}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="Auto">Auto</option>
                        <option value="HD">HD</option>
                        <option value="4K">4K</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Therapy Mode */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Therapy & Wellness
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Therapy mode</span>
                      <button
                        onClick={() => setIsTherapyModeActive(!isTherapyModeActive)}
                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isTherapyModeActive ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Biometric tracking</span>
                      <button
                        onClick={() => setIsBiometricTrackingEnabled(!isBiometricTrackingEnabled)}
                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isBiometricTrackingEnabled ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div>
                      <span className="text-sm text-gray-300 block mb-2">Therapy environment</span>
                      <div className="grid grid-cols-2 gap-2">
                        {therapyEnvironments.map(env => (
                          <button
                            key={env.id}
                            onClick={() => toggleTherapyEnvironment(env.id)}
                            className={`p-2 rounded-lg text-xs transition-colors ${
                              selectedEnvironment === env.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {env.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Focus & Productivity */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Timer className="w-5 h-5 mr-2" />
                    Focus & Productivity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Focus session timer</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {Math.floor(focusTimer / 60)}:{(focusTimer % 60).toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => startFocusSession()}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            focusSessionActive
                              ? 'bg-red-600 text-white'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {focusSessionActive ? 'Stop' : 'Start'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Break reminders</span>
                      <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy & Security */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy & Security
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">End-to-end encryption</span>
                      <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">On-device AI processing</span>
                      <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">HIPAA/GDPR compliance</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Disappearing messages</span>
                      <button className="text-blue-500 text-sm">Configure</button>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">ReMotion Talk v2.0.0</p>
                    <p className="text-xs text-gray-500">Simple. Secure. Seamless.</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>• Ultra-low latency calls</span>
                      <span>• AI-powered features</span>
                      <span>• Therapy optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setSelectedChat(null)}
                      className="sm:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {currentChat?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {currentChat?.isEncrypted && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="font-semibold text-white">{currentChat?.name}</h2>
                        <p className="text-sm text-gray-400">
                          {currentChat?.type === 'group' 
                            ? `${currentChat.participants.length} participants`
                            : 'Online'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => startCall(selectedChat, 'voice')}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Voice call"
                    >
                      <Phone className="w-5 h-5 text-blue-500" />
                    </button>
                    <button 
                      onClick={() => startCall(selectedChat, 'video')}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Video call"
                    >
                      <Video className="w-5 h-5 text-green-500" />
                    </button>
                    <button 
                      onClick={() => startCall(selectedChat, 'therapy')}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Therapy session"
                    >
                      <Heart className="w-5 h-5 text-pink-500" />
                    </button>
                    <button 
                      onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Collaboration tools"
                    >
                      <Share2 className="w-5 h-5 text-purple-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900"
              >
                <AnimatePresence>
                  {currentChatMessages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        {/* Reply indicator */}
                        {message.replyTo && (
                          <div className="text-xs text-gray-400 mb-1 px-2">
                            Replying to message
                          </div>
                        )}
                        
                        <div className={`px-4 py-2 rounded-2xl relative group ${
                          message.senderId === 'current-user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {/* Message content based on type */}
                          {message.type === 'text' && (
                            <p className="break-words">{message.content}</p>
                          )}
                          
                          {message.type === 'image' && (
                            <div>
                              <img 
                                src={message.fileUrl} 
                                alt="Shared image" 
                                className="max-w-full rounded-lg mb-2"
                              />
                              {message.content && <p className="text-sm">{message.content}</p>}
                            </div>
                          )}
                          
                          {message.type === 'file' && (
                            <div className="flex items-center space-x-3 p-2 bg-black/20 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                <Paperclip className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.fileName}</p>
                                <p className="text-xs opacity-70">{formatFileSize(message.fileSize || 0)}</p>
                              </div>
                            </div>
                          )}
                          
                          {message.type === 'voice' && (
                            <div className="flex items-center space-x-3">
                              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center space-x-1 h-6">
                                  {message.waveform?.map((height, i) => (
                                    <div 
                                      key={i} 
                                      className="w-1 bg-current opacity-60 rounded-full"
                                      style={{ height: `${Math.max(height / 4, 4)}px` }}
                                    />
                                  )) || Array.from({length: 20}, (_, i) => (
                                    <div key={i} className="w-1 h-4 bg-current opacity-60 rounded-full" />
                                  ))}
                                </div>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatDuration(message.duration || 0)}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Message actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 right-2 flex space-x-1">
                            <button
                              onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                              className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-xs"
                            >
                              😊
                            </button>
                            <button
                              onClick={() => setReplyToMessage(message)}
                              className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center"
                            >
                              ↩
                            </button>
                          </div>
                          
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(
                                message.reactions.reduce((acc, reaction) => {
                                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(message.id, emoji)}
                                  className="flex items-center space-x-1 px-2 py-1 bg-black/20 rounded-full text-xs hover:bg-black/30"
                                >
                                  <span>{emoji}</span>
                                  <span>{count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Quick reactions popup */}
                          {showReactions === message.id && (
                            <div className="absolute bottom-full left-0 mb-2 flex space-x-1 p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-600">
                              {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    addReaction(message.id, emoji);
                                    setShowReactions(null);
                                  }}
                                  className="text-lg hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Message info */}
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            message.senderId === 'current-user' ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            <span>{formatTime(message.timestamp)}</span>
                            {message.senderId === 'current-user' && (
                              <div className="flex items-center space-x-1">
                                {message.isEncrypted && <Lock className="w-3 h-3" />}
                                {message.status === 'sent' && <Check className="w-3 h-3" />}
                                {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                                {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-200" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {typingUsers.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="bg-gray-700 px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse animate-delay-200" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse animate-delay-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reply preview */}
              {replyToMessage && (
                <div className="bg-gray-700 px-4 py-2 border-t border-gray-600 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-blue-500 rounded" />
                    <div>
                      <p className="text-xs text-gray-400">Replying to</p>
                      <p className="text-sm text-white truncate max-w-48">
                        {replyToMessage.content || `${replyToMessage.type} message`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-gray-800 px-4 py-4 border-t border-gray-700">
                {/* Voice recording preview */}
                {isRecordingVoice && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm text-red-400">Recording...</span>
                        <span className="text-sm text-gray-400">{formatDuration(recordingDuration)}</span>
                      </div>
                      <button
                        onClick={stopVoiceRecording}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full transition-colors"
                      >
                        Stop
                      </button>
                    </div>
                    {voiceWaveform.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2 h-8">
                        {voiceWaveform.map((height, i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-red-400 rounded-full"
                            style={{ height: `${Math.max(height / 4, 4)}px` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                    <label htmlFor="file-input">
                      <div className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                        <Paperclip className="w-5 h-5 text-gray-400" />
                      </div>
                    </label>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Camera className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping(e.target.value.length > 0);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage(messageInput);
                          handleTyping(false);
                        }
                      }}
                      className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {messageInput.trim() ? (
                      <button 
                        onClick={() => {
                          sendMessage(messageInput);
                          handleTyping(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onMouseDown={startVoiceRecording}
                        onMouseUp={stopVoiceRecording}
                        className={`p-3 rounded-full transition-colors ${
                          isRecordingVoice ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to ReMotion Talk</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                  Simple. Secure. Seamless. Select a chat to start messaging or make a call to get started.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>End-to-end encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Privacy focused</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Call Overlay */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: isTherapyModeActive 
                ? therapyEnvironments.find(e => e.id === selectedEnvironment)?.background || 'bg-gray-900/95'
                : 'rgba(17, 24, 39, 0.95)'
            }}
          >
            <div className="w-full h-full flex flex-col">
              {/* Call Header */}
              <div className="p-6 flex items-center justify-between backdrop-blur-sm bg-black/20">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {contacts.find(c => c.id === activeCall.participants.find(p => p !== 'current-user'))?.name.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {contacts.find(c => c.id === activeCall.participants.find(p => p !== 'current-user'))?.name || 'Unknown'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>
                        {activeCall.status === 'ringing' ? (activeCall.isIncoming ? 'Incoming call...' : 'Calling...') :
                         activeCall.status === 'active' ? 'Connected' : 'Call ended'}
                      </span>
                      {activeCall.noiseSuppressionEnabled && (
                        <div className="flex items-center space-x-1">
                          <Waves className="w-3 h-3" />
                          <span>AI Noise Reduction</span>
                        </div>
                      )}
                      {activeCall.therapyMode && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>Therapy Mode</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call Quality & Status */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>{activeCall.quality} Quality</span>
                  </div>
                  {activeCall.isEncrypted && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">End-to-End Encrypted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Call Area */}
              <div className="flex-1 flex">
                {/* Video/Main Content Area */}
                <div className="flex-1 relative">
                  {activeCall.type === 'video' && (
                    <>
                      <video 
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover rounded-lg"
                        autoPlay
                        playsInline
                      />
                      <video 
                        ref={localVideoRef}
                        className="absolute bottom-4 right-4 w-48 h-32 object-cover rounded-lg border-2 border-white/20"
                        autoPlay
                        playsInline
                        muted
                      />
                    </>
                  )}
                  
                  {/* Collaboration Overlay */}
                  {isScreenSharingActive && (
                    <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <MonitorSpeaker className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Screen Sharing Active</h3>
                        <p className="text-gray-300">Sharing your screen with participants</p>
                      </div>
                    </div>
                  )}

                  {isWhiteboardActive && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                      <div className="text-center text-gray-800">
                        <PenTool className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Interactive Whiteboard</h3>
                        <p className="text-gray-600">Collaborative drawing and annotation space</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side Panel */}
                <div className="w-80 bg-black/30 backdrop-blur-sm p-4 space-y-4 overflow-y-auto">
                  {/* Biometric Data */}
                  {isBiometricTrackingEnabled && currentBiometrics && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Wellness Metrics
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Heart Rate</span>
                          <span className="text-white">{currentBiometrics.heartRate} BPM</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Stress Level</span>
                          <span className={`text-sm ${
                            currentBiometrics.stressLevel === 'low' ? 'text-green-400' :
                            currentBiometrics.stressLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {currentBiometrics.stressLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Engagement</span>
                          <span className="text-white">{currentBiometrics.engagementScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  {aiInsights.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Insights
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {aiInsights.slice(-3).map(insight => (
                          <div key={insight.id} className="text-xs bg-white/10 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`uppercase font-semibold ${
                                insight.type === 'emotional' ? 'text-pink-400' :
                                insight.type === 'engagement' ? 'text-blue-400' :
                                insight.type === 'summary' ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {insight.type}
                              </span>
                              <span className="text-gray-400">
                                {Math.round(insight.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-gray-300">{insight.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Transcript */}
                  {isTranscriptionEnabled && liveTranscript && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Live Transcript
                        {isTranslationEnabled && (
                          <Languages className="w-3 h-3 ml-2 text-purple-400" />
                        )}
                      </h4>
                      <div className="text-xs text-gray-300 max-h-32 overflow-y-auto">
                        {liveTranscript}
                      </div>
                    </div>
                  )}

                  {/* Focus Session */}
                  {focusSessionActive && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <Timer className="w-4 h-4 mr-2" />
                        Focus Session
                      </h4>
                      <div className="text-center">
                        <div className="text-2xl font-mono text-white mb-2">
                          {Math.floor(focusTimer / 60)}:{(focusTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${((25 * 60 - focusTimer) / (25 * 60)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className="p-6 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-6">
                  {/* Basic Controls */}
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                      isAudioEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}
                    title={isAudioEnabled ? 'Mute' : 'Unmute'}
                  >
                    {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
                  
                  {activeCall.type !== 'voice' && (
                    <button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                        isVideoEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                      }`}
                      title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                    >
                      {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>
                  )}
                  
                  {/* Advanced Controls */}
                  <button
                    onClick={toggleScreenSharing}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                      isScreenSharingActive ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'
                    }`}
                    title="Share screen"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>

                  <button
                    onClick={toggleWhiteboard}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                      isWhiteboardActive ? 'bg-purple-500 text-white' : 'bg-white/20 text-white'
                    }`}
                    title="Open whiteboard"
                  >
                    <PenTool className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => {
                      if (liveTranscription.enabled) {
                        stopLiveTranscription();
                      } else {
                        startLiveTranscription();
                      }
                    }}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                      liveTranscription.enabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                    }`}
                    title={liveTranscription.enabled ? 'Stop transcription' : 'Start live transcription'}
                  >
                    <Languages className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                      isSpeakerOn ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'
                    }`}
                    title={isSpeakerOn ? 'Switch to headphones' : 'Switch to speaker'}
                  >
                    {isSpeakerOn ? <Speaker className="w-6 h-6" /> : <Headphones className="w-6 h-6" />}
                  </button>

                  {/* Focus Session Control */}
                  <button
                    onClick={() => focusSessionActive ? setFocusSessionActive(false) : startFocusSession()}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                      focusSessionActive ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white'
                    }`}
                    title={focusSessionActive ? 'Stop focus session' : 'Start focus session'}
                  >
                    <Timer className="w-6 h-6" />
                  </button>
                </div>

                {/* Call Actions */}
                <div className="flex items-center justify-center mt-6 space-x-4">
                  {activeCall.status === 'ringing' && activeCall.isIncoming ? (
                    <>
                      <button
                        onClick={declineCall}
                        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-all transform hover:scale-110"
                        title="Decline call"
                      >
                        <PhoneOff className="w-8 h-8" />
                      </button>
                      <button
                        onClick={acceptCall}
                        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-all transform hover:scale-110"
                        title="Accept call"
                      >
                        <PhoneCall className="w-8 h-8" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={endCall}
                      className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-all transform hover:scale-110"
                      title="End call"
                    >
                      <PhoneOff className="w-8 h-8" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Whiteboard Modal */}
      <AnimatePresence>
        {isWhiteboardActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Whiteboard Header */}
              <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">Interactive Whiteboard</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">Participants: 2</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearWhiteboard}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsWhiteboardActive(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Whiteboard Tools */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b">
                <div className="flex items-center space-x-3">
                  {/* Tool Selection */}
                  <div className="flex items-center space-x-2">
                    {[
                      { tool: 'pen', icon: PenTool, label: 'Pen' },
                      { tool: 'eraser', icon: X, label: 'Eraser' }
                    ].map(({ tool, icon: Icon, label }) => (
                      <button
                        key={tool}
                        onClick={() => setWhiteboardState(prev => ({ ...prev, currentTool: tool as any }))}
                        className={`p-2 rounded-lg transition-colors ${
                          whiteboardState.currentTool === tool
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title={label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  
                  {/* Color Picker */}
                  <div className="flex items-center space-x-1">
                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#000000'].map(color => (
                      <button
                        key={color}
                        onClick={() => setWhiteboardState(prev => ({ ...prev, currentColor: color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          whiteboardState.currentColor === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Brush Size */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Size:</span>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={whiteboardState.currentWidth}
                      onChange={(e) => setWhiteboardState(prev => ({ ...prev, currentWidth: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 w-6">{whiteboardState.currentWidth}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {whiteboardState.strokes.length} strokes • Auto-saved
                </div>
              </div>

              {/* Whiteboard Canvas */}
              <div className="flex-1 relative bg-white">
                <canvas
                  ref={whiteboardCanvasRef}
                  width={800}
                  height={600}
                  className="w-full h-full cursor-crosshair"
                  onMouseDown={handleWhiteboardMouseDown}
                  onMouseMove={handleWhiteboardMouseMove}
                  onMouseUp={handleWhiteboardMouseUp}
                />
                
                {whiteboardState.strokes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-400">
                      <PenTool className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Start drawing or writing to collaborate</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcription Panel */}
      <AnimatePresence>
        {liveTranscription.enabled && activeCall && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 top-20 w-80 bg-gray-800 rounded-2xl shadow-2xl z-40 overflow-hidden"
          >
            {/* Transcription Header */}
            <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Languages className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">Live Transcription</span>
                {liveTranscription.isRecording && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleAutoTranslation}
                  className={`p-1 rounded transition-colors ${
                    liveTranscription.autoTranslate ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Toggle auto-translation"
                >
                  <Globe className="w-4 h-4" />
                </button>
                
                <button
                  onClick={exportTranscription}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Export transcription"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={stopLiveTranscription}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Stop transcription"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transcription Content */}
            <div className="max-h-96 overflow-y-auto bg-gray-800">
              {liveTranscription.segments.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Listening for speech...</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {liveTranscription.segments.slice(-10).map((segment) => (
                    <div key={segment.id} className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-blue-400">{segment.speakerName}</span>
                        <span className="text-xs text-gray-500">
                          {segment.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-200 leading-relaxed">{segment.text}</p>
                      {segment.isTranslated && segment.translatedText && (
                        <p className="text-green-300 text-xs mt-1 italic">
                          Translation: {segment.translatedText}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          segment.confidence > 0.8 ? 'bg-green-900 text-green-300' :
                          segment.confidence > 0.6 ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {Math.round(segment.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transcription Controls */}
            <div className="bg-gray-700 px-4 py-3 border-t border-gray-600">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <select
                    value={liveTranscription.language}
                    onChange={(e) => setLiveTranscription(prev => ({ ...prev, language: e.target.value }))}
                    className="bg-gray-600 text-white text-xs rounded px-2 py-1"
                    title="Source language"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="zh-CN">Chinese</option>
                  </select>
                  
                  {liveTranscription.autoTranslate && (
                    <select
                      value={liveTranscription.targetLanguage}
                      onChange={(e) => setLiveTranscription(prev => ({ ...prev, targetLanguage: e.target.value }))}
                      className="bg-gray-600 text-white text-xs rounded px-2 py-1"
                      title="Target language"
                    >
                      <option value="es-ES">Spanish</option>
                      <option value="en-US">English (US)</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="zh-CN">Chinese</option>
                    </select>
                  )}
                </div>
                
                <div className="text-xs text-gray-400">
                  {liveTranscription.segments.length} segments
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReMotionTalk;
