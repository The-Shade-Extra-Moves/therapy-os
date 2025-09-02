import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Mic, MicOff, Upload, Image, FileText, Video,
  Brain, Settings, History, User, Zap, Sparkles, Download, Share2,
  Plus, X, Minimize2, Maximize2, RotateCcw, Save, Copy, Forward,
  Play, Pause, Volume2, VolumeX, FileAudio, Camera, Paperclip,
  Bot, UserIcon, Clock, TrendingUp, Lightbulb, Target, Heart,
  BarChart3, Eye, EyeOff, Lock, Unlock, Moon, Sun, Palette,
  ChevronDown, ChevronRight, Folder, Search, Filter, Tag,
  RefreshCw, AlertCircle, CheckCircle, Info, Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Types and interfaces
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'audio' | 'image' | 'file';
  metadata?: {
    model?: string;
    audioUrl?: string;
    imageUrl?: string;
    fileName?: string;
    fileSize?: string;
    mood?: string;
    confidence?: number;
  };
}

interface ChatTab {
  id: string;
  name: string;
  model: string;
  active: boolean;
  messages: ChatMessage[];
  context?: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'multimodal' | 'audio' | 'image';
  capabilities: string[];
  temperature: number;
}

// Available AI models
const aiModels: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4 Omni',
    provider: 'OpenAI',
    type: 'multimodal',
    capabilities: ['text', 'vision', 'audio'],
    temperature: 0.7
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'text',
    capabilities: ['text', 'analysis'],
    temperature: 0.6
  },
  {
    id: 'llama-3',
    name: 'LLaMA 3',
    provider: 'Meta',
    type: 'text',
    capabilities: ['text'],
    temperature: 0.8
  },
  {
    id: 'whisper',
    name: 'Whisper',
    provider: 'OpenAI',
    type: 'audio',
    capabilities: ['speech-to-text'],
    temperature: 0.2
  }
];

// Therapy-specific prompts and templates
const therapyPrompts = [
  {
    id: 'session-summary',
    name: 'Session Summary',
    prompt: 'Please provide a comprehensive summary of this therapy session, highlighting key insights, emotional patterns, and progress made.',
    category: 'analysis'
  },
  {
    id: 'mood-analysis',
    name: 'Mood Analysis',
    prompt: 'Analyze the emotional tone and mood patterns in this conversation. Identify any concerning trends or positive developments.',
    category: 'assessment'
  },
  {
    id: 'intervention-suggestions',
    name: 'Intervention Suggestions',
    prompt: 'Based on the conversation, suggest appropriate therapeutic interventions, exercises, or homework assignments.',
    category: 'recommendations'
  },
  {
    id: 'crisis-assessment',
    name: 'Crisis Assessment',
    prompt: 'Evaluate for any signs of crisis, self-harm ideation, or urgent mental health concerns that require immediate attention.',
    category: 'safety'
  }
];

export const AIAssistantApp: React.FC = () => {
  // Core state
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([
    {
      id: '1',
      name: 'New Chat',
      model: 'gpt-4o',
      active: true,
      messages: [],
      context: 'Therapy session with Emma Rodriguez'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  
  // UI state
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [showContext, setShowContext] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [aiTemperature, setAiTemperature] = useState(0.7);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  
  // File handling
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get active chat tab
  const activeTab = chatTabs.find(tab => tab.id === activeTabId) || chatTabs[0];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.messages]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() && uploadedFiles.length === 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      type: uploadedFiles.length > 0 ? 'file' : 'text',
      metadata: uploadedFiles.length > 0 ? {
        fileName: uploadedFiles[0]?.name,
        fileSize: (uploadedFiles[0]?.size / 1024).toFixed(1) + ' KB'
      } : undefined
    };

    // Update active tab with new message
    setChatTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, messages: [...tab.messages, newMessage] }
        : tab
    ));

    setCurrentMessage('');
    setUploadedFiles([]);
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(currentMessage, uploadedFiles),
        timestamp: new Date(),
        type: 'text',
        metadata: {
          model: selectedModel,
          confidence: 0.92
        }
      };

      setChatTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, aiResponse] }
          : tab
      ));

      setIsProcessing(false);
    }, 1500);
  }, [currentMessage, uploadedFiles, activeTabId, selectedModel]);

  const generateAIResponse = (message: string, files: File[]) => {
    if (files.length > 0) {
      return `I've analyzed the uploaded file "${files[0].name}". Based on the content, I can see this relates to your therapy session. Here are my key observations:\n\n• The document contains important emotional markers\n• There are patterns indicating progress in emotional regulation\n• I recommend discussing the highlighted sections in your next session\n\nWould you like me to create a detailed summary or suggest specific interventions?`;
    }

    const responses = [
      "That's a very insightful observation. Let's explore this feeling further. What specific moments or triggers have you noticed that bring up these emotions?",
      "I understand you're working through some complex emotions. From a therapeutic perspective, this shows significant self-awareness and growth.",
      "This sounds like an important breakthrough. How does recognizing this pattern make you feel about your progress?",
      "Based on what you've shared, I'd suggest practicing the grounding techniques we discussed. Would you like me to walk you through them again?",
      "Your reflection demonstrates remarkable emotional intelligence. This kind of insight is a strong indicator of therapeutic progress."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle audio recording
  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        // Add audio message
        const audioMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: 'Audio message',
          timestamp: new Date(),
          type: 'audio',
          metadata: { audioUrl }
        };

        setChatTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, messages: [...tab.messages, audioMessage] }
            : tab
        ));

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to start recording");
    }
  }, [activeTabId]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  }, []);

  // Handle file drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(files);
    toast.success(`${files.length} file(s) uploaded`);
  }, []);

  // Create new chat tab
  const handleNewChat = useCallback(() => {
    const newTab: ChatTab = {
      id: Date.now().toString(),
      name: `Chat ${chatTabs.length + 1}`,
      model: selectedModel,
      active: false,
      messages: [],
      context: 'New therapy session'
    };

    setChatTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [chatTabs.length, selectedModel]);

  // Apply therapy prompt
  const applyTherapyPrompt = useCallback((prompt: string) => {
    setCurrentMessage(prompt);
    toast.success("Therapy prompt applied");
  }, []);

  // Export chat
  const handleExportChat = useCallback(() => {
    const chatData = {
      id: activeTab.id,
      name: activeTab.name,
      model: activeTab.model,
      messages: activeTab.messages,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab.name}-${Date.now()}.json`;
    link.click();
    
    toast.success("Chat exported successfully");
  }, [activeTab]);

  // Render message component
  const renderMessage = (message: ChatMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${
        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className={`${
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {message.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={`rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}>
          {message.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.type === 'audio' && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Play className="h-4 w-4" />
              </Button>
              <span className="text-sm">Audio message</span>
              <FileAudio className="h-4 w-4" />
            </div>
          )}

          {message.type === 'file' && (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">{message.metadata?.fileName}</p>
                <p className="text-xs opacity-70">{message.metadata?.fileSize}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
            <span>{message.timestamp.toLocaleTimeString()}</span>
            {message.metadata?.model && (
              <Badge variant="outline" className="text-xs">
                {message.metadata.model}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render top toolbar
  const renderTopToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-primary/10">
      {/* Chat Tabs */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
          {chatTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTabId === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTabId(tab.id)}
              className="text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {tab.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setChatTabs(prev => prev.filter(t => t.id !== tab.id));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleNewChat}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Active
        </Badge>
      </div>

      {/* Model Selection & Actions */}
      <div className="flex items-center space-x-2">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {aiModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>{model.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" onClick={handleExportChat}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render sidebar
  const renderSidebar = () => (
    <Card className="w-80 h-full bg-background/95 backdrop-blur-md border-primary/10">
      <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 m-4">
          <TabsTrigger value="chat" className="text-xs">
            <MessageSquare className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="context" className="text-xs">
            <User className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">
            <Brain className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs">
            <Folder className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Chat History</h3>
              
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {chatTabs.map((tab) => (
                    <Card 
                      key={tab.id} 
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${
                        tab.id === activeTabId ? 'border-primary' : ''
                      }`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{tab.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {tab.messages.length} messages • {tab.model}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tab.messages.length > 0 ? 'Active' : 'New'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">AI Settings</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Temperature: {aiTemperature}</Label>
                    <Slider
                      value={[aiTemperature]}
                      onValueChange={([value]) => setAiTemperature(value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Dark Mode</Label>
                    <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Split View</Label>
                    <Switch checked={splitView} onCheckedChange={setSplitView} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Patient Context</h3>
              
              <Card className="p-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Emma Rodriguez</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Age: 28 • Session: #12</p>
                    <p>Primary Focus: Anxiety Management</p>
                    <p>Last Session: Jan 15, 2025</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Previous Sessions</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {[
                      { date: 'Jan 15', topic: 'Workplace anxiety', mood: 'Improving' },
                      { date: 'Jan 8', topic: 'Breathing exercises', mood: 'Stable' },
                      { date: 'Jan 1', topic: 'Goal setting', mood: 'Positive' }
                    ].map((session, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{session.date}</span>
                          <Badge variant="outline" className="text-xs">{session.mood}</Badge>
                        </div>
                        <p className="text-muted-foreground">{session.topic}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Current Goals</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Practice daily breathing exercises</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    <span>Reduce workplace anxiety triggers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-blue-500" />
                    <span>Improve sleep hygiene</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Therapy Tools</h3>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quick Prompts</h4>
                <div className="space-y-2">
                  {therapyPrompts.map((prompt) => (
                    <Button
                      key={prompt.id}
                      variant="outline"
                      className="w-full justify-start text-xs h-auto p-2"
                      onClick={() => applyTherapyPrompt(prompt.prompt)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{prompt.name}</div>
                        <div className="text-muted-foreground text-xs">{prompt.category}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">AI Analysis</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Mood
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Progress
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Wellness
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Insights
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Voice Controls</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Volume: {audioVolume}%</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Slider
                    value={[audioVolume]}
                    onValueChange={([value]) => setAudioVolume(value)}
                    max={100}
                    min={0}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">File Manager</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop files here or click to upload
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedFiles(files);
                  }}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Uploaded Files</h4>
                  <ScrollArea className="h-32">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Supported Formats</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Text: PDF, DOCX, TXT</p>
                  <p>• Audio: MP3, WAV, M4A</p>
                  <p>• Images: JPG, PNG, GIF</p>
                  <p>• Video: MP4, WebM</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top Toolbar */}
      {renderTopToolbar()}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              {activeTab?.messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a conversation with advanced AI models designed for therapeutic support
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                    <Button variant="outline" size="sm">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Insights
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Mood
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab.messages.map(renderMessage)}
                  {isProcessing && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background/95 backdrop-blur-sm border-t border-primary/10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Ask me anything about therapy, upload files, or record audio..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() && uploadedFiles.length === 0}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-muted/50 rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{uploadedFiles.length} file(s) attached</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {renderSidebar()}
      </div>
    </div>
  );
};

export default AIAssistantApp;