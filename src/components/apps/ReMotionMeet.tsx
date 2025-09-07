import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Users, Settings,
  MessageSquare, Hand, MoreVertical, Grid3X3,
  Layout, User, UserPlus, Shield, Lock, Clock,
  Play, Square, Download, Share, FileText,
  X, Minimize2, Maximize2, Smile, Paperclip, Send,
  Zap, Brain, BarChart3, CheckSquare, Search,
  Reply, Image, File, Crown, UserX, Volume1,
  CheckCircle, Globe, Archive
} from 'lucide-react';

// Types and Interfaces
interface Participant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isHost: boolean;
  isCoHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  joinedAt: Date;
  device: 'desktop' | 'mobile' | 'web';
  status: 'connected' | 'connecting' | 'disconnected';
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'poll' | 'reaction';
  attachments?: FileAttachment[];
  replyTo?: string;
  reactions: Record<string, string[]>; // emoji -> userIds
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  allowMultiple: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: string[]; // participant IDs
}

interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  isActive: boolean;
  createdAt: Date;
  timer?: number; // minutes
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  participants: Participant[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isRecording: boolean;
  isLocked: boolean;
  maxParticipants: number;
  waitingRoom: boolean;
  settings: MeetingSettings;
}

interface MeetingSettings {
  allowParticipantMic: boolean;
  allowParticipantCamera: boolean;
  allowParticipantScreenShare: boolean;
  allowParticipantChat: boolean;
  enableWaitingRoom: boolean;
  enableBreakoutRooms: boolean;
  enablePolls: boolean;
  enableRecording: boolean;
  enableTranscription: boolean;
  enableAI: boolean;
}

interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

interface AIInsight {
  id: string;
  type: 'summary' | 'action' | 'question' | 'sentiment' | 'topic';
  content: string;
  confidence: number;
  timestamp: Date;
  relatedSegments: string[];
}

interface ReMotionMeetProps {
  meetingId?: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

// Main Component
const ReMotionMeet: React.FC<ReMotionMeetProps> = ({ 
  meetingId, 
  onMinimize, 
  onMaximize, 
  onClose 
}) => {
  // Core State
  const [currentView, setCurrentView] = useState<'lobby' | 'meeting' | 'summary'>('lobby');
  const [meetingState, setMeetingState] = useState<'waiting' | 'connecting' | 'connected' | 'ended'>('waiting');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'speaker' | 'gallery' | 'presentation'>('grid');
  
  // User State
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{audio?: string, video?: string}>({});
  
  // UI State
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  
  // Meeting Data
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  
  // Recording & Streaming
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [streamQuality, setStreamQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Record<string, HTMLVideoElement>>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  
  // Mock Data
  const [mockParticipants] = useState<Participant[]>([
    {
      id: 'current-user',
      name: 'You',
      email: 'you@remotion.com',
      isHost: true,
      isCoHost: false,
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
      isScreenSharing: false,
      connectionQuality: 'excellent',
      joinedAt: new Date(),
      device: 'desktop',
      status: 'connected'
    },
    {
      id: 'participant-1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      avatar: '/api/placeholder/40/40',
      isHost: false,
      isCoHost: true,
      isMuted: false,
      isVideoOn: true,
      isHandRaised: true,
      isScreenSharing: false,
      connectionQuality: 'good',
      joinedAt: new Date(Date.now() - 300000),
      device: 'desktop',
      status: 'connected'
    },
    {
      id: 'participant-2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      isHost: false,
      isCoHost: false,
      isMuted: true,
      isVideoOn: false,
      isHandRaised: false,
      isScreenSharing: false,
      connectionQuality: 'poor',
      joinedAt: new Date(Date.now() - 600000),
      device: 'mobile',
      status: 'connected'
    }
  ]);

  const [mockChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'participant-1',
      senderName: 'Alice Johnson',
      content: 'Hello everyone! Ready to get started?',
      timestamp: new Date(Date.now() - 120000),
      type: 'text',
      replyTo: undefined,
      reactions: { '👍': ['participant-2'], '❤️': ['current-user'] }
    },
    {
      id: 'msg-2',
      senderId: 'current-user',
      senderName: 'You',
      content: 'Yes, let\'s begin with the quarterly review.',
      timestamp: new Date(Date.now() - 90000),
      type: 'text',
      replyTo: 'msg-1',
      reactions: {}
    }
  ]);

  // Helper Functions
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = (quality: Participant['connectionQuality']) => {
    switch (quality) {
      case 'excellent': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'good': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'poor': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    }
  };

  const getDeviceIcon = (device: Participant['device']) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-3 h-3" />;
      case 'mobile': return <User className="w-3 h-3" />;
      case 'web': return <Globe className="w-3 h-3" />;
    }
  };

  // Meeting Functions
  const joinMeeting = useCallback(() => {
    setMeetingState('connecting');
    setParticipants(mockParticipants);
    setChatMessages(mockChatMessages);
    
    // Simulate connection
    setTimeout(() => {
      setMeetingState('connected');
      setCurrentView('meeting');
    }, 2000);
  }, [mockParticipants, mockChatMessages]);

  const leaveMeeting = useCallback(() => {
    setMeetingState('ended');
    setCurrentView('summary');
  }, []);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(!isAudioEnabled);
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(!isVideoEnabled);
  }, [isVideoEnabled]);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
  }, [isScreenSharing]);

  const toggleHandRaise = useCallback(() => {
    setIsHandRaised(!isHandRaised);
  }, [isHandRaised]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start recording timer
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const sendChatMessage = useCallback(() => {
    if (!chatMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'You',
      content: chatMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      replyTo: replyTo?.id,
      reactions: {}
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    setReplyTo(null);
  }, [chatMessage, replyTo]);

  const createPoll = useCallback((question: string, options: string[]) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question,
      options: options.map((text, index) => ({
        id: `option-${index}`,
        text,
        votes: []
      })),
      createdBy: 'current-user',
      createdAt: new Date(),
      isActive: true,
      allowMultiple: false
    };
    
    setActivePolls(prev => [...prev, newPoll]);
  }, []);

  const createBreakoutRoom = useCallback((name: string, participantIds: string[]) => {
    const newRoom: BreakoutRoom = {
      id: `room-${Date.now()}`,
      name,
      participants: participantIds,
      isActive: true,
      createdAt: new Date(),
      timer: 15 // 15 minutes default
    };
    
    setBreakoutRooms(prev => [...prev, newRoom]);
  }, []);

  // Effects
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Render Functions
  const renderLobby = () => (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-2xl mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join ReMotion Meet</h1>
          <p className="text-gray-300">Test your camera and microphone before joining</p>
        </div>

        {/* Video Preview */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6 aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full transition-colors ${
                isVideoEnabled ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full transition-colors ${
                isAudioEnabled ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Device Settings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Camera</label>
            <select className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:border-blue-500 focus:outline-none">
              <option>Default Camera</option>
              <option>External Camera</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Microphone</label>
            <select className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:border-blue-500 focus:outline-none">
              <option>Default Microphone</option>
              <option>External Microphone</option>
            </select>
          </div>
        </div>

        {/* Join Options */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={joinMeeting}
            disabled={meetingState === 'connecting'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {meetingState === 'connecting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              'Join Meeting'
            )}
          </button>
          
          <div className="flex space-x-3">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
              Join as Guest
            </button>
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
              Sign In
            </button>
          </div>
        </div>

        {/* Settings Link */}
        <div className="text-center mt-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center mx-auto"
          >
            <Settings className="w-4 h-4 mr-1" />
            Audio & Video Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderMeeting = () => (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">Quarterly Review Meeting</h1>
          {isRecording && (
            <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm">{formatDuration(recordingDuration)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">{participants.length} participants</span>
          <div className="flex items-center space-x-1">
            <button 
              onClick={onMinimize}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onMaximize}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-red-600 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Meeting Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-2 md:p-4 min-h-0">
          <div className={`h-full ${
            layoutMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4' :
            layoutMode === 'speaker' ? 'flex flex-col' :
            layoutMode === 'gallery' ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1 md:gap-2' :
            'flex flex-col'
          }`}>
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-gray-800 rounded-lg overflow-hidden ${
                  layoutMode === 'speaker' && participant.id === 'current-user' ? 'flex-1 min-h-0' : 
                  layoutMode === 'speaker' ? 'h-16 sm:h-20 md:h-24 flex-shrink-0' : 
                  layoutMode === 'gallery' ? 'aspect-video' :
                  'aspect-video'
                }`}
              >
                {/* Video Stream */}
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {participant.isVideoOn ? (
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay
                      muted={participant.id === 'current-user'}
                      playsInline
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm sm:text-lg md:text-2xl font-semibold text-white">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Participant Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 sm:p-2 md:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                      <span className="text-white text-xs sm:text-sm font-medium truncate">
                        {participant.name}
                      </span>
                      {participant.isHost && (
                        <span className="bg-blue-500 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">Host</span>
                      )}
                      {participant.isCoHost && (
                        <span className="bg-purple-500 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">Co-Host</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {getConnectionIcon(participant.connectionQuality)}
                      <div className="hidden sm:block">
                        {getDeviceIcon(participant.device)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex space-x-1">
                  {!participant.isMuted ? (
                    <div className="bg-green-500 p-0.5 sm:p-1 rounded-full">
                      <Mic className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  ) : (
                    <div className="bg-red-500 p-0.5 sm:p-1 rounded-full">
                      <MicOff className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
                  
                  {participant.isScreenSharing && (
                    <div className="bg-blue-500 p-0.5 sm:p-1 rounded-full">
                      <Monitor className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
                  
                  {participant.isHandRaised && (
                    <div className="bg-yellow-500 p-0.5 sm:p-1 rounded-full animate-bounce">
                      <Hand className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Participant Menu */}
                <button 
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Participant options"
                >
                  <MoreVertical className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {(showChat || showParticipants || showAI || showBreakoutRooms) && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-full md:w-80 bg-gray-800 md:border-l border-gray-700 flex flex-col absolute md:relative inset-0 md:inset-auto z-20"
            >
              {/* Panel Header */}
              <div className="p-3 md:p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 overflow-x-auto">
                    <button
                      onClick={() => {
                        setShowChat(true);
                        setShowParticipants(false);
                        setShowAI(false);
                        setShowBreakoutRooms(false);
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                        showChat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => {
                        setShowParticipants(true);
                        setShowChat(false);
                        setShowAI(false);
                        setShowBreakoutRooms(false);
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                        showParticipants ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      People
                    </button>
                    <button
                      onClick={() => {
                        setShowAI(true);
                        setShowChat(false);
                        setShowParticipants(false);
                        setShowBreakoutRooms(false);
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                        showAI ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      AI
                    </button>
                    <button
                      onClick={() => {
                        setShowBreakoutRooms(true);
                        setShowChat(false);
                        setShowParticipants(false);
                        setShowAI(false);
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                        showBreakoutRooms ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Rooms
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowChat(false);
                      setShowParticipants(false);
                      setShowAI(false);
                      setShowBreakoutRooms(false);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {showChat && renderChatPanel()}
                {showParticipants && renderParticipantsPanel()}
                {showAI && renderAIPanel()}
                {showBreakoutRooms && renderBreakoutRoomsPanel()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-xs sm:text-sm hidden sm:block">
              {formatDuration(Math.floor((Date.now() - Date.now()) / 1000))}
            </span>
            {isRecording && (
              <div className="flex items-center space-x-2 bg-red-500/20 px-2 sm:px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs sm:text-sm">{formatDuration(recordingDuration)}</span>
              </div>
            )}
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <button
              onClick={toggleAudio}
              className={`p-2 sm:p-3 rounded-full transition-colors ${
                isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-2 sm:p-3 rounded-full transition-colors ${
                isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-2 sm:p-3 rounded-full transition-colors hidden sm:flex ${
                isScreenSharing ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Share screen"
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 sm:p-3 rounded-full transition-colors ${
                showChat ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Chat"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleHandRaise}
              className={`p-2 sm:p-3 rounded-full transition-colors hidden sm:flex ${
                isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Raise hand"
            >
              <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-2 sm:p-3 rounded-full transition-colors ${
                showParticipants ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Participants"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Recording Controls */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 sm:p-3 rounded-full transition-colors ${
                  isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <Square className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setLayoutMode(layoutMode === 'grid' ? 'speaker' : 'grid')}
                className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Change layout"
              >
                {layoutMode === 'grid' ? <Layout className="w-3 h-3 sm:w-4 sm:h-4" /> : <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Mobile More Options */}
            <button
              className="md:hidden p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <button
              onClick={leaveMeeting}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <span className="hidden sm:inline">Leave</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatPanel = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header with File Sharing */}
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-medium text-sm sm:text-base">Chat</h4>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              title="Upload file"
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button 
              title="Start poll"
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button 
              title="More options"
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        
        {/* Quick Reactions */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <span className="text-xs text-gray-400 flex-shrink-0">Quick reactions:</span>
          {['👍', '👎', '❤️', '👏', '🔥', '😂'].map((emoji) => (
            <button
              key={emoji}
              className="text-base sm:text-lg hover:scale-110 transition-transform flex-shrink-0"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto" ref={chatContainerRef}>
        <div className="space-y-3 sm:space-y-4">
          {/* Active Poll */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-blue-400 font-medium flex items-center text-sm sm:text-base">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Quick Poll
              </h5>
              <span className="text-xs text-gray-400">2 votes</span>
            </div>
            <p className="text-white text-xs sm:text-sm mb-3">Should we extend this meeting by 15 minutes?</p>
            <div className="space-y-2">
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-left p-2 rounded text-xs sm:text-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span>Yes, let's continue</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 bg-gray-600 rounded-full h-1 overflow-hidden">
                      <div className="w-3/4 bg-green-500 h-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">75%</span>
                  </div>
                </div>
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-left p-2 rounded text-xs sm:text-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span>No, let's wrap up</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 bg-gray-600 rounded-full h-1 overflow-hidden">
                      <div className="w-1/4 bg-red-500 h-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">25%</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {chatMessages.map((message) => (
            <div key={message.id} className="group">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">
                    {message.senderName.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">{message.senderName}</span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {message.replyTo && (
                    <div className="bg-gray-700/50 border-l-2 border-blue-500 pl-3 py-1 mb-2 text-sm text-gray-300 rounded">
                      <div className="flex items-center space-x-1 mb-1">
                        <Reply className="w-3 h-3" />
                        <span className="text-xs text-blue-400">Reply to Alice</span>
                      </div>
                      <p className="text-xs truncate">Original message content...</p>
                    </div>
                  )}
                  
                  <p className="text-gray-200 text-sm">{message.content}</p>
                  
                  {/* File Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((file) => (
                        <div key={file.id} className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                              <Image className="w-5 h-5 text-white" />
                            ) : (
                              <File className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{file.name}</p>
                            <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          <button 
                            title="Download file"
                            className="p-1.5 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {Object.keys(message.reactions).length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      {Object.entries(message.reactions).map(([emoji, users]) => (
                        <button
                          key={emoji}
                          title={`Reacted by ${users.length} participant(s)`}
                          className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full text-xs transition-colors"
                        >
                          <span>{emoji}</span>
                          <span className="text-gray-300">{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    title="Reply to message"
                    onClick={() => setReplyTo(message)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button 
                    title="Add reaction"
                    className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button 
                    title="More options"
                    className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicators */}
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>Alice is typing...</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 border-t border-gray-700">
        {replyTo && (
          <div className="bg-gray-700/50 p-2 rounded-lg mb-2 text-xs sm:text-sm text-gray-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="w-3 h-3" />
              <span>Replying to {replyTo.senderName}</span>
            </div>
            <button 
              onClick={() => setReplyTo(null)}
              title="Cancel reply"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-3 sm:pl-4 pr-16 sm:pr-20 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex space-x-0.5 sm:space-x-1">
              <button 
                title="Add emoji"
                className="p-1 hover:bg-gray-600 rounded transition-colors"
              >
                <Smile className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </button>
              <button 
                title="Attach file"
                className="p-1 hover:bg-gray-600 rounded transition-colors"
              >
                <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </button>
              <button 
                title="Mention someone"
                className="p-1 hover:bg-gray-600 rounded transition-colors hidden sm:inline-flex"
              >
                <User className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <button
            onClick={sendChatMessage}
            disabled={!chatMessage.trim()}
            title="Send message"
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 p-1.5 sm:p-2 rounded-lg transition-colors"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
        </div>
        
        {/* Chat Tools */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          <span className="sm:hidden">Tap to send</span>
          <div className="flex items-center space-x-2">
            <button 
              title="Save chat"
              className="hover:text-white transition-colors"
            >
              <Archive className="w-3 h-3" />
            </button>
            <button 
              title="Search chat"
              className="hover:text-white transition-colors"
            >
              <Search className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParticipantsPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
          <div className="flex items-center space-x-2">
            <button 
              title="Invite participants"
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button 
              title="Meeting settings"
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meeting Controls (Host Only) */}
        <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white flex items-center">
              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
              Host Controls
            </h4>
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-400">Meeting Secured</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Lock Meeting</span>
              </div>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Waiting Room</span>
              </div>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
              <div className="flex items-center space-x-1">
                <MicOff className="w-3 h-3" />
                <span>Mute All</span>
              </div>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
              <div className="flex items-center space-x-1">
                <VideoOff className="w-3 h-3" />
                <span>Stop Videos</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    participant.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium truncate">{participant.name}</span>
                    {participant.isHost && (
                      <div className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </div>
                    )}
                    {participant.isCoHost && (
                      <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded">Co-Host</span>
                    )}
                    {participant.isHandRaised && (
                      <Hand className="w-4 h-4 text-yellow-400 animate-bounce" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {getConnectionIcon(participant.connectionQuality)}
                    {getDeviceIcon(participant.device)}
                    <span className="text-xs text-gray-400 capitalize">{participant.connectionQuality}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className={`p-1 rounded-full ${participant.isMuted ? 'bg-red-500/20' : 'bg-gray-700'}`}>
                  {participant.isMuted ? (
                    <MicOff className="w-3 h-3 text-red-400" />
                  ) : (
                    <Mic className="w-3 h-3 text-green-400" />
                  )}
                </div>
                
                <div className={`p-1 rounded-full ${!participant.isVideoOn ? 'bg-red-500/20' : 'bg-gray-700'}`}>
                  {participant.isVideoOn ? (
                    <Video className="w-3 h-3 text-green-400" />
                  ) : (
                    <VideoOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
                
                {participant.isScreenSharing && (
                  <div className="p-1 rounded-full bg-blue-500/20">
                    <Monitor className="w-3 h-3 text-blue-400" />
                  </div>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ml-2">
                  {!participant.isHost && (
                    <>
                      <button 
                        title="Make co-host"
                        className="p-1 hover:bg-gray-600 rounded transition-colors text-gray-400 hover:text-white"
                      >
                        <Crown className="w-3 h-3" />
                      </button>
                      <button 
                        title="Remove participant"
                        className="p-1 hover:bg-red-600 rounded transition-colors text-gray-400 hover:text-white"
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <button 
                    title="More options"
                    className="p-1 hover:bg-gray-600 rounded transition-colors text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Waiting Room */}
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-orange-400 font-medium text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Waiting Room (2)
            </h4>
            <button 
              title="Admit all"
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded transition-colors"
            >
              Admit All
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Carol Wilson</span>
              <div className="flex space-x-1">
                <button 
                  title="Admit"
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded transition-colors"
                >
                  Admit
                </button>
                <button 
                  title="Deny"
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded transition-colors"
                >
                  Deny
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">David Brown</span>
              <div className="flex space-x-1">
                <button 
                  title="Admit"
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded transition-colors"
                >
                  Admit
                </button>
                <button 
                  title="Deny"
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded transition-colors"
                >
                  Deny
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Host Tools */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button 
            onClick={() => setShowBreakoutRooms(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
          >
            <Users className="w-4 h-4 mr-1" />
            Breakout Rooms
          </button>
          <button 
            onClick={() => setShowPolls(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Create Poll
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-1 text-xs">
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
            <div className="flex flex-col items-center space-y-1">
              <Volume1 className="w-3 h-3" />
              <span>Audio</span>
            </div>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
            <div className="flex flex-col items-center space-y-1">
              <Monitor className="w-3 h-3" />
              <span>Screen</span>
            </div>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-2 rounded transition-colors">
            <div className="flex flex-col items-center space-y-1">
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAIPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Assistant
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
        
        {/* AI Features Toggles */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Live Transcription</span>
            <button 
              className="bg-blue-500 w-10 h-6 rounded-full flex items-center justify-end px-1"
              title="Toggle live transcription"
              aria-label="Toggle live transcription - currently enabled"
            >
              <div className="w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Real-time Translation</span>
            <button 
              className="bg-gray-600 w-10 h-6 rounded-full flex items-center justify-start px-1"
              title="Toggle real-time translation"
              aria-label="Toggle real-time translation - currently disabled"
            >
              <div className="w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Meeting Summary</span>
            <button 
              className="bg-blue-500 w-10 h-6 rounded-full flex items-center justify-end px-1"
              title="Toggle meeting summary"
              aria-label="Toggle meeting summary - currently enabled"
            >
              <div className="w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* Live Transcript */}
        <div className="bg-gray-700 rounded-lg p-3 mb-4 h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Live Transcript</h4>
          <div className="space-y-2 text-sm">
            <div className="text-blue-400">
              <span className="font-medium">Alice Johnson:</span>
              <span className="text-gray-300 ml-1">Let's start with the quarterly numbers. We've seen a 15% increase in user engagement.</span>
            </div>
            <div className="text-green-400">
              <span className="font-medium">You:</span>
              <span className="text-gray-300 ml-1">That's great news. Can you break down the numbers by region?</span>
            </div>
            <div className="text-purple-400">
              <span className="font-medium">Bob Smith:</span>
              <span className="text-gray-300 ml-1">North America shows the highest growth at 23%...</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            AI Insights
          </h4>
          <div className="space-y-2">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-400">Key Topic</span>
                <span className="text-xs text-gray-400">95% confidence</span>
              </div>
              <p className="text-xs text-gray-300">Main discussion: Quarterly performance metrics and regional growth analysis</p>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-green-400">Action Item</span>
                <span className="text-xs text-gray-400">87% confidence</span>
              </div>
              <p className="text-xs text-gray-300">Alice to provide detailed regional breakdown by Friday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBreakoutRoomsPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Breakout Rooms</h3>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">
            + Create Room
          </button>
        </div>
        
        {breakoutRooms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">No breakout rooms yet</p>
            <button
              onClick={() => createBreakoutRoom('Team A', ['participant-1'])}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {breakoutRooms.map((room) => (
              <div key={room.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{room.name}</h4>
                  <span className="text-xs text-gray-400">{room.participants.length} participants</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {room.timer && (
                      <div className="flex items-center space-x-1 text-xs text-yellow-400">
                        <Clock className="w-3 h-3" />
                        <span>{room.timer}m</span>
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      room.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
                    }`}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-xs">
                    Join Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="flex-1 bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Meeting Ended</h1>
          <p className="text-gray-300">Thanks for joining the Quarterly Review Meeting</p>
        </div>

        {/* Meeting Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">45:32</div>
            <div className="text-sm text-gray-400">Duration</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-sm text-gray-400">Participants</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-sm text-gray-400">Chat Messages</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">4</div>
            <div className="text-sm text-gray-400">Action Items</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Download Recording</div>
            <div className="text-sm opacity-80">45:32 video</div>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center transition-colors">
            <FileText className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">View Transcript</div>
            <div className="text-sm opacity-80">Full text available</div>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center transition-colors">
            <Share className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Share Summary</div>
            <div className="text-sm opacity-80">Send to participants</div>
          </button>
        </div>

        {/* AI Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Meeting Summary
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">Key Topics Discussed</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Quarterly performance metrics showing 15% growth in user engagement</li>
                <li>• Regional analysis with North America leading at 23% growth</li>
                <li>• Resource allocation for Q2 initiatives</li>
                <li>• Team expansion plans for the European market</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Action Items</h4>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-400" />
                  Alice to provide detailed regional breakdown by Friday
                </li>
                <li className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-400" />
                  Bob to research European market entry requirements
                </li>
                <li className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-400" />
                  Schedule follow-up meeting for next Tuesday
                </li>
                <li className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-400" />
                  Prepare Q2 budget proposal for review
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Schedule Follow-up
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Start New Meeting
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header - only show in meeting view */}
      {currentView === 'meeting' && (
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold">ReMotion Meet</h1>
              <p className="text-xs text-gray-400">Secure • Encrypted • AI-Powered</p>
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
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'lobby' && renderLobby()}
        {currentView === 'meeting' && renderMeeting()}
        {currentView === 'summary' && renderSummary()}
      </div>
    </div>
  );
};

export default ReMotionMeet;
