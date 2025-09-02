import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle, AlertCircle, Info, X, Maximize2, Copy, Download as DownloadIcon
} from 'lucide-react';
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

  const sendMessage = () => {
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
  };

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

  const renderSidebar = () => (
    <Card className="w-80 h-full bg-background/80 backdrop-blur-sm border-primary/10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 m-4">
          <TabsTrigger value="chat" className="text-xs">
            <MessageSquare className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            <FileText className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">
            <PenTool className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            <Brain className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 p-4 pt-0">
            <div className="flex flex-col h-full">
              <div className="mb-3">
                <h3 className="font-semibold mb-2">Session Chat</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {mockParticipants.length} participants
                  </Badge>
                  <Badge variant="outline" className="text-xs text-green-600">
                    Encrypted
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded-lg text-sm ${
                        msg.type === 'ai' 
                          ? 'bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-xs ${
                          msg.type === 'ai' ? 'text-blue-600 dark:text-blue-400' : ''
                        }`}>
                          {msg.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="h-full m-0 p-4 pt-0">
            <div className="flex flex-col h-full">
              <h3 className="font-semibold mb-3">Session Notes</h3>
              
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <p className="font-medium">{formatTime(sessionTimer)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="font-medium">{sessionData.type}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-muted-foreground">Mood Check</Label>
                  <div className="flex space-x-1 mt-1">
                    {moodOptions.map((mood) => (
                      <Button
                        key={mood.value}
                        variant={selectedMood === mood.value ? "default" : "outline"}
                        size="sm"
                        className="p-1 h-8 w-8"
                        onClick={() => setSelectedMood(mood.value)}
                      >
                        <span className="text-sm">{mood.emoji}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea
                  placeholder="Add session observations, progress notes, next steps..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="mt-2 h-40 resize-none"
                />
              </div>

              <Button className="mt-3" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save to Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Therapy Tools</h3>

              <div className="space-y-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Whiteboard</span>
                    <Switch
                      checked={showWhiteboard}
                      onCheckedChange={setShowWhiteboard}
                    />
                  </div>
                  {showWhiteboard && (
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="outline" size="sm" className="p-2">
                        <PenTool className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="p-2">
                        <Type className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="p-2">
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="p-2">
                        <Circle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Mood Tracker</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMoodTracker(!showMoodTracker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Breathing Exercise</span>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress Chart</span>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>

                <Card className="p-3">
                  <span className="text-sm font-medium">Session Template</span>
                  <Select value={currentTemplate} onValueChange={setCurrentTemplate}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {therapyTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <Switch
                  checked={isAIEnabled}
                  onCheckedChange={setIsAIEnabled}
                />
              </div>

              {isAIEnabled && (
                <div className="space-y-3">
                  <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Real-time Insights
                      </span>
                    </div>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Client appears calm and engaged</li>
                      <li>• Speaking rate is normal</li>
                      <li>• Positive emotional indicators detected</li>
                    </ul>
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Biometrics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Heart Rate</span>
                        <p className="font-medium">{biometricData.heartRate} BPM</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stress Level</span>
                        <p className="font-medium capitalize">{biometricData.stress}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Suggestions</span>
                    </div>
                    <ul className="text-xs space-y-1">
                      <li>• Consider grounding exercises</li>
                      <li>• Good time for goal setting</li>
                      <li>• Client is responsive to CBT techniques</li>
                    </ul>
                  </Card>

                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Summary
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );

  return (
    <div className="flex h-full bg-gradient-to-br from-background/80 to-background/60">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Meeting Bar */}
        <div className="bg-background/60 backdrop-blur-sm border-b border-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="font-semibold">{sessionData.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(sessionTimer)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{mockParticipants.length} participants</span>
                  </div>
                  {isRecording && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>Recording</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {sessionData.type}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Encrypted
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4">
          {renderVideoGrid()}
        </div>

        {/* Bottom Control Bar */}
        <div className="bg-background/80 backdrop-blur-sm border-t border-primary/10 p-4">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full"
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant={!isVideoOn ? "destructive" : "outline"}
              size="lg"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className="rounded-full"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className="rounded-full"
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={() => setIsRecording(!isRecording)}
              className="rounded-full"
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Video className="h-5 w-5" />}
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button variant="outline" size="lg" className="rounded-full">
              <Headphones className="h-5 w-5" />
            </Button>

            <Button variant="outline" size="lg" className="rounded-full">
              <Camera className="h-5 w-5" />
            </Button>

            <Button variant="outline" size="lg" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button variant="destructive" size="lg" className="rounded-full">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {renderSidebar()}

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