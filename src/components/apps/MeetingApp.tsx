import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Share, Share2, Users, MessageSquare,
  FileText, PenTool, BarChart3, Settings, Phone, PhoneOff, Camera,
  Monitor, Calendar, Clock, Heart, Brain, Smile, Frown, Meh,
  Upload, Download, Eye, EyeOff, Volume2, VolumeX, MoreVertical,
  Maximize, Minimize, RotateCcw, Save, Edit, Send, Paperclip,
  Grid3X3, Layout, PaintBucket, Type, Circle, Square, Triangle,
  ArrowRight, Play, Pause, SkipForward, SkipBack, Zap, Star,
  UserCheck, Shield, Lock, Unlock, Headphones, Speaker, Wifi,
  WifiOff, RefreshCw, ChevronDown, ChevronUp, Plus, Minus,
  CheckCircle, AlertCircle, Info, X, Maximize2, Copy, Download as DownloadIcon,
  Layers, Presentation, Focus, SplitSquareHorizontal,
  HelpCircle, Lightbulb, Activity, Target, Timer, Archive
} from 'lucide-react';
import { renderFocusView, renderSplitView, renderPresentationView } from './MeetingAppViews';
import { renderEnhancedSidebar } from './MeetingAppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data for meeting participants
const mockParticipants = [
  {
    id: 1,
    name: "Dr. Sarah Thompson",
    role: "therapist",
    isHost: true,
    isMuted: false,
    isVideoOn: true,
    avatar: "",
    status: "speaking"
  },
  {
    id: 2,
    name: "Emma Rodriguez",
    role: "client",
    isHost: false,
    isMuted: false,
    isVideoOn: true,
    avatar: "",
    status: "listening"
  },
  {
    id: 3,
    name: "Dr. Michael Chen",
    role: "supervisor",
    isHost: false,
    isMuted: true,
    isVideoOn: false,
    avatar: "",
    status: "observing"
  }
];

// Mock session data
const sessionData = {
  title: "Weekly Therapy Session - Emma Rodriguez",
  startTime: "2024-01-22 14:00",
  duration: "45 minutes",
  type: "Individual Therapy",
  recordingEnabled: true,
  transcriptionEnabled: true,
  aiAssistantEnabled: true
};

// Mock chat messages
const mockMessages = [
  { id: 1, sender: "Dr. Sarah Thompson", message: "Welcome to our session, Emma!", timestamp: "14:02", type: "text" },
  { id: 2, sender: "Emma Rodriguez", message: "Thank you, I'm feeling better today", timestamp: "14:03", type: "text" },
  { id: 3, sender: "AI Assistant", message: "Mood tracker: Client appears calm and engaged", timestamp: "14:05", type: "ai" },
];

// Therapy templates
const therapyTemplates = [
  { id: 'cbt', name: 'CBT Session', icon: Brain, description: 'Cognitive Behavioral Therapy session structure' },
  { id: 'emdr', name: 'EMDR Session', icon: Eye, description: 'Eye Movement Desensitization framework' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Heart, description: 'Mindfulness and meditation session' },
  { id: 'group', name: 'Group Therapy', icon: Users, description: 'Group therapy facilitation tools' },
];

// Mood tracking options
const moodOptions = [
  { emoji: '😊', label: 'Great', value: 5, color: 'text-green-500' },
  { emoji: '🙂', label: 'Good', value: 4, color: 'text-blue-500' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'text-yellow-500' },
  { emoji: '😟', label: 'Low', value: 2, color: 'text-orange-500' },
  { emoji: '😢', label: 'Difficult', value: 1, color: 'text-red-500' },
];

export const MeetingApp: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardTool, setWhiteboardTool] = useState('pen');
  const [currentTemplate, setCurrentTemplate] = useState('cbt');
  const [messages, setMessages] = useState(mockMessages);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [biometricData, setBiometricData] = useState({ heartRate: 72, stress: 'low' });
  
  // New enhanced state management
  const [viewMode, setViewMode] = useState<'gallery' | 'focus' | 'split' | 'presentation'>('gallery');
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [aiInsights, setAiInsights] = useState<string[]>([
    'Client appears more relaxed than last session',
    'Speaking rate has increased - positive engagement',
    'Recommend following up on anxiety management techniques'
  ]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [isLiveTranscribing, setIsLiveTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [sessionTabs, setSessionTabs] = useState([
    { id: 1, title: 'Emma Rodriguez - Individual', active: true, type: 'individual' },
  ]);
  const [activeSessionTab, setActiveSessionTab] = useState(1);

  // Session timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = useCallback(() => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: "Dr. Sarah Thompson",
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text" as const
    };
    
    setMessages([...messages, newMessage]);
    setChatMessage('');
  }, [chatMessage, messages]);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic
      const newRecording = {
        id: recordings.length + 1,
        name: `Session Recording ${recordings.length + 1}`,
        timestamp: new Date().toISOString(),
        duration: 0,
        size: '0 MB'
      };
      setRecordings([...recordings, newRecording]);
    }
  }, [isRecording, recordings]);

  const shareFile = useCallback((file: File) => {
    const newFile = {
      id: sharedFiles.length + 1,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      timestamp: new Date().toISOString(),
      sharedBy: 'Dr. Sarah Thompson'
    };
    setSharedFiles([...sharedFiles, newFile]);
  }, [sharedFiles]);

  const generateAISummary = useCallback(() => {
    const summary = {
      keyPoints: [
        'Client showed improved emotional regulation',
        'Homework completion rate: 80%',
        'Anxiety levels decreased since last session'
      ],
      recommendations: [
        'Continue current CBT approach',
        'Introduce mindfulness exercises',
        'Schedule follow-up in 1 week'
      ],
      nextSteps: [
        'Review anxiety management techniques',
        'Assign breathing exercises homework',
        'Check in on sleep patterns'
      ]
    };
    return summary;
  }, []);

  const handleViewModeChange = useCallback((mode: typeof viewMode) => {
    setViewMode(mode);
  }, []);

  const renderVideoGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      {mockParticipants.map((participant) => (
        <motion.div
          key={participant.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden ${
            participant.isHost ? 'ring-2 ring-primary' : ''
          }`}
        >
          {/* Video Stream Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            {participant.isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 flex items-center justify-center">
                <span className="text-white/70">Video Stream</span>
              </div>
            ) : (
              <Avatar className="h-20 w-20 border-2 border-white/20">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10">
                  {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Participant Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium text-sm">{participant.name}</span>
                {participant.isHost && (
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary-foreground">
                    Host
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {!participant.isMuted ? (
                  <Mic className="h-4 w-4 text-green-400" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-400" />
                )}
                {participant.isVideoOn ? (
                  <Video className="h-4 w-4 text-blue-400" />
                ) : (
                  <VideoOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-3 right-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              participant.status === 'speaking' ? 'bg-green-500/20 text-green-300' :
              participant.status === 'listening' ? 'bg-blue-500/20 text-blue-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {participant.status}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Enhanced render functions
  const renderTopToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-primary/10">
      {/* Session Tabs */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
          {sessionTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeSessionTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSessionTab(tab.id)}
              className="text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              {tab.title}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-xs">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Live
        </Badge>
        {isRecording && (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
            Recording
          </Badge>
        )}
      </div>

      {/* View Mode Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === 'gallery' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange('gallery')}
            className="text-xs"
          >
            <Grid3X3 className="h-3 w-3" />
          </Button>
          <Button
            variant={viewMode === 'focus' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange('focus')}
            className="text-xs"
          >
            <Focus className="h-3 w-3" />
          </Button>
          <Button
            variant={viewMode === 'split' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange('split')}
            className="text-xs"
          >
            <SplitSquareHorizontal className="h-3 w-3" />
          </Button>
          <Button
            variant={viewMode === 'presentation' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange('presentation')}
            className="text-xs"
          >
            <Presentation className="h-3 w-3" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTime(sessionTimer)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{mockParticipants.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionQuality === 'excellent' ? 'bg-green-500' :
            connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-muted-foreground capitalize">{connectionQuality}</span>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Top Toolbar */}
      {renderTopToolbar()}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid based on view mode */}
          <div className="flex-1 p-4">
            {viewMode === 'gallery' && renderVideoGrid()}
            {viewMode === 'focus' && renderFocusView()}
            {viewMode === 'split' && renderSplitView()}
            {viewMode === 'presentation' && renderPresentationView()}
          </div>

          {/* Live Transcription Bar */}
          {isTranscriptionEnabled && (
            <div className="bg-background/95 backdrop-blur-sm border-t border-primary/10 p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-600">Live Transcription</span>
                <Button variant="ghost" size="sm" onClick={() => setIsTranscriptionEnabled(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <ScrollArea className="h-16">
                <p className="text-sm text-muted-foreground">
                  {currentTranscript || "I'm feeling much better today. The breathing exercises you taught me last week have been really helpful..."}
                </p>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        {renderEnhancedSidebar({
          activeTab,
          setActiveTab,
          messages,
          chatMessage,
          setChatMessage,
          sendMessage,
          sessionTimer,
          selectedMood,
          setSelectedMood,
          sessionNotes,
          setSessionNotes,
          formatTime,
          aiInsights,
          isAIEnabled,
          setIsAIEnabled,
          showParticipantsPanel,
          setShowParticipantsPanel,
          recordings,
          sharedFiles,
          biometricData,
          currentTemplate,
          setCurrentTemplate
        })}
      </div>

      {/* Enhanced Control Bar */}
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-t border-primary/10">
        {/* Main Controls */}
        <div className="flex items-center space-x-3">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOn ? "outline" : "destructive"}
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="rounded-full"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="icon"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className="rounded-full"
          >
            <Share className="h-5 w-5" />
          </Button>

          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={toggleRecording}
            className="rounded-full"
          >
            <div className="relative">
              <div className="w-3 h-3 bg-current rounded-full" />
              {isRecording && (
                <div className="absolute inset-0 w-3 h-3 bg-current rounded-full animate-ping" />
              )}
            </div>
          </Button>
        </div>

        {/* Therapy Tools */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowMoodTracker(true)}>
            <Smile className="h-4 w-4 mr-2" />
            Mood
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowWhiteboard(!showWhiteboard)}>
            <PenTool className="h-4 w-4 mr-2" />
            Board
          </Button>

          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            AI Summary
          </Button>
        </div>

        {/* Session End */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
          
          <Button variant="destructive" className="rounded-full">
            <PhoneOff className="h-5 w-5 mr-2" />
            End Session
          </Button>
        </div>
      </div>

      {/* Mood Tracker Modal */}
      <AnimatePresence>
        {showMoodTracker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowMoodTracker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={selectedMood === mood.value ? "default" : "outline"}
                      className="aspect-square p-0 text-2xl"
                      onClick={() => {
                        setSelectedMood(mood.value);
                        const newMessage = {
                          id: messages.length + 1,
                          sender: "Mood Tracker",
                          message: `Client mood: ${mood.label} ${mood.emoji}`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          type: "ai" as const
                        };
                        setMessages([...messages, newMessage]);
                        setShowMoodTracker(false);
                      }}
                    >
                      {mood.emoji}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setShowMoodTracker(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};