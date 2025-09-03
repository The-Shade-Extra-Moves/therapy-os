import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as mammoth from 'mammoth';
import MarkdownIt from 'markdown-it';
import { 
  MessageSquare, Send, Mic, MicOff, Upload, Image, FileText, Video,
  Brain, Settings, History, User, Zap, Sparkles, Download, Share2,
  Plus, X, Minimize2, Maximize2, RotateCcw, Save, Copy, Forward,
  Play, Pause, Volume2, VolumeX, FileAudio, Camera, Paperclip,
  Bot, UserIcon, Clock, TrendingUp, Lightbulb, Target, Heart,
  BarChart3, Eye, EyeOff, Lock, Unlock, Moon, Sun, Palette,
  ChevronDown, ChevronRight, Folder, Search, Filter, Tag,
  RefreshCw, AlertCircle, CheckCircle, Info, Loader, Book
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

// Custom Markdown Components for better styling
const MarkdownComponents = {
  // Headings
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold text-slate-700 mb-3 mt-6">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base font-medium text-slate-600 mb-2 mt-3">
      {children}
    </h4>
  ),
  
  // Text formatting
  p: ({ children }: any) => (
    <p className="text-slate-700 mb-3 leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-800">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-slate-600">
      {children}
    </em>
  ),
  
  // Lists
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-3 ml-4 space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-3 ml-4 space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-slate-700 leading-relaxed">
      {children}
    </li>
  ),
  
  // Code
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    return !inline && language ? (
      <div className="relative mb-3">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(String(children));
              toast.success('Code copied to clipboard!');
            }}
            className="text-slate-400 hover:text-slate-200 h-8 w-8 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            padding: '1rem',
            paddingTop: '2.5rem',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => (
    <div className="mb-3">
      {children}
    </div>
  ),
  
  // Blockquote
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-3 italic text-slate-700">
      {children}
    </blockquote>
  ),
  
  // Links
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline font-medium"
    >
      {children}
    </a>
  ),
  
  // Tables
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full border border-slate-200 rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-slate-50">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-slate-200">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-slate-50">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-slate-700">
      {children}
    </td>
  ),
  
  // Horizontal rule
  hr: () => (
    <hr className="my-6 border-slate-200" />
  ),
  
  // Images
  img: ({ src, alt }: any) => (
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full h-auto rounded-lg shadow-sm mb-3"
    />
  ),
};

// Types and interfaces
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'audio' | 'image' | 'file' | 'data' | 'tts';
  metadata?: {
    model?: string;
    audioUrl?: string;
    imageUrl?: string;
    fileName?: string;
    fileSize?: string;
    mood?: string;
    confidence?: number;
    language?: string;
    mode?: 'general' | 'data-mining' | 'file-analysis';
    dataQuery?: string;
    fileCount?: number;
  };
}

interface ChatTab {
  id: string;
  name: string;
  model: string;
  active: boolean;
  messages: ChatMessage[];
  context?: string;
  mode: 'general' | 'data-mining' | 'file-analysis';
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
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    type: 'multimodal',
    capabilities: ['text', 'vision', 'conversation', 'friendly-chat'],
    temperature: 0.8
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4 Omni',
    provider: 'OpenAI',
    type: 'multimodal',
    capabilities: ['text', 'vision', 'audio', 'data-analysis'],
    temperature: 0.7
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'text',
    capabilities: ['text', 'analysis', 'data-mining'],
    temperature: 0.6
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    type: 'multimodal',
    capabilities: ['text', 'vision', 'file-analysis'],
    temperature: 0.5
  },
  {
    id: 'llama-3',
    name: 'LLaMA 3',
    provider: 'Meta',
    type: 'text',
    capabilities: ['text', 'general'],
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

// Available languages for TTS
const ttsLanguages = [
  { code: 'en-US', name: 'English (US)', voice: 'en-US-Wavenet-D' },
  { code: 'en-GB', name: 'English (UK)', voice: 'en-GB-Wavenet-A' },
  { code: 'es-ES', name: 'Spanish', voice: 'es-ES-Wavenet-B' },
  { code: 'fr-FR', name: 'French', voice: 'fr-FR-Wavenet-A' },
  { code: 'de-DE', name: 'German', voice: 'de-DE-Wavenet-A' },
  { code: 'it-IT', name: 'Italian', voice: 'it-IT-Wavenet-A' },
  { code: 'ja-JP', name: 'Japanese', voice: 'ja-JP-Wavenet-A' },
  { code: 'ko-KR', name: 'Korean', voice: 'ko-KR-Wavenet-A' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', voice: 'zh-CN-Wavenet-A' }
];

// AI Assistant modes
const aiModes = [
  {
    id: 'general',
    name: 'General AI',
    description: 'Ask general questions with text-to-speech support',
    icon: Brain,
    color: 'blue'
  },
  {
    id: 'data-mining',
    name: 'Data Mining',
    description: 'Query patient data and therapy records',
    icon: BarChart3,
    color: 'green'
  },
  {
    id: 'file-analysis',
    name: 'File Analysis',
    description: 'Upload and analyze files with AI insights',
    icon: FileText,
    color: 'purple'
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
  // Gemini API configuration
  const GEMINI_API_KEY = 'AIzaSyAoZR4Hyhjm-tMbpq8LSWbh9rzuaUh5f84';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  // Core state
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([
    {
      id: '1',
      name: 'General AI',
      model: 'gemini-2.0-flash',
      active: true,
      messages: [],
      context: 'Friendly AI assistant for general conversation and support',
      mode: 'general'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [currentMode, setCurrentMode] = useState<'general' | 'data-mining' | 'file-analysis'>('general');
  
  // TTS state
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [enableTTS, setEnableTTS] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  
  // Data mining state
  const [dataQuery, setDataQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [dateRange, setDateRange] = useState('last-30-days');
  
  // File analysis state
  const [analysisType, setAnalysisType] = useState('content');
  const [analysisDepth, setAnalysisDepth] = useState('standard');
  const [extractedContent, setExtractedContent] = useState<{[key: string]: string}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: any}>({});
  const [previewMode, setPreviewMode] = useState<'extracted' | 'original'>('extracted');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [supportedFormats] = useState(['pdf', 'doc', 'docx', 'txt', 'md', 'markdown']);
  const [extractionProgress, setExtractionProgress] = useState<{[key: string]: number}>({});
  
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get active chat tab
  const activeTab = chatTabs.find(tab => tab.id === activeTabId) ?? chatTabs[0] ?? null;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = selectedLanguage;
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('Speech recognition started');
      };
      
      recognitionInstance.onresult = (event: any) => {
        let interimTranscriptText = '';
        let finalTranscriptText = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptText += transcript + ' ';
          } else {
            interimTranscriptText += transcript;
          }
        }
        
        setInterimTranscript(interimTranscriptText);
        
        if (finalTranscriptText) {
          setFinalTranscript(prev => prev + finalTranscriptText);
          setCurrentMessage(prev => prev + finalTranscriptText);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        console.log('Speech recognition ended');
        
        // Auto-send if enabled and we have content
        if (autoSend && finalTranscript.trim()) {
          setTimeout(() => {
            handleSendMessage();
            setFinalTranscript('');
          }, 500);
        }
      };
      
      setRecognition(recognitionInstance);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [selectedLanguage]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = selectedLanguage;
    }
  }, [selectedLanguage, recognition]);

  // Gemini API integration
  const callGeminiAPI = async (message: string, conversationHistory: ChatMessage[] = []) => {
    try {
      // Create conversation context
      let contextPrompt = `You are a friendly, supportive, and knowledgeable AI assistant. You should:
- Be warm, conversational, and empathetic
- Provide helpful, accurate, and comprehensive responses
- Ask follow-up questions when appropriate
- Show genuine interest in helping the user
- Use a natural, friendly tone
- Be encouraging and positive
- Provide practical advice and insights

IMPORTANT FORMATTING INSTRUCTIONS:
- Format your responses using Markdown for better readability
- Use **bold** for emphasis and important points
- Use *italics* for subtle emphasis
- Use headings (## Heading) to organize longer responses
- Use bullet points (-) or numbered lists (1.) when listing items
- Use code blocks (\`\`\`) for any code or technical examples
- Use > blockquotes for important notes or tips
- Use tables when presenting structured data
- Keep paragraphs well-spaced for readability
- Make your responses visually appealing and easy to scan

Previous conversation context:`;

      // Add recent conversation history for context
      const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context
      recentMessages.forEach(msg => {
        if (msg.role === 'user') {
          contextPrompt += `\nUser: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          contextPrompt += `\nAssistant: ${msg.content}`;
        }
      });

      contextPrompt += `\n\nCurrent user message: ${message}\n\nPlease respond in a friendly, helpful, and engaging way using proper Markdown formatting for the best user experience:`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: contextPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
            topP: 0.9,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue generating a response. Could you please try asking your question again?';
      
      return aiResponse;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`I'm having trouble connecting to my AI services right now. Please check your internet connection and try again. If the problem persists, I'll use my backup response system.`);
    }
  };

  // Handle sending messages with mode-specific processing
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() && uploadedFiles.length === 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      type: uploadedFiles.length > 0 ? 'file' : 'text',
      metadata: {
        mode: currentMode,
        ...(uploadedFiles.length > 0 && {
          fileName: uploadedFiles[0]?.name,
          fileSize: (uploadedFiles[0]?.size / 1024).toFixed(1) + ' KB',
          fileCount: uploadedFiles.length
        }),
        ...(currentMode === 'data-mining' && { dataQuery }),
        ...(enableTTS && { language: selectedLanguage })
      }
    };

    // Update active tab with new message
    setChatTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, messages: [...tab.messages, newMessage] }
        : tab
    ));

    const userMessage = currentMessage;
    setCurrentMessage('');
    setUploadedFiles([]);
    setIsProcessing(true);

    try {
      let aiResponseText = '';
      
      if (currentMode === 'general' && selectedModel === 'gemini-2.0-flash') {
        // Use Gemini API for General AI mode
        const conversationHistory = activeTab?.messages || [];
        aiResponseText = await callGeminiAPI(userMessage, conversationHistory);
        toast.success('Response generated by Gemini AI');
      } else {
        // Use mode-specific mock responses for other modes
        aiResponseText = generateModeSpecificResponse(userMessage, uploadedFiles, currentMode);
      }

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
        type: enableTTS ? 'tts' : 'text',
        metadata: {
          model: selectedModel,
          confidence: currentMode === 'general' ? 0.95 : 0.92,
          mode: currentMode,
          ...(enableTTS && { language: selectedLanguage })
        }
      };

      setChatTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, aiResponse] }
          : tab
      ));

      // Handle TTS if enabled
      if (enableTTS) {
        handleTextToSpeech(aiResponse.content);
      }

    } catch (error) {
      // Fallback response in case of API error
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing some technical difficulties right now. ${error}. Let me try to help you with a general response: ${generateGeneralAIFallback(userMessage)}`,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          model: 'fallback',
          confidence: 0.8,
          mode: currentMode
        }
      };

      setChatTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, fallbackResponse] }
          : tab
      ));

      toast.error('Using fallback response due to API issue');
    }

    setIsProcessing(false);
  }, [currentMessage, uploadedFiles, activeTabId, selectedModel, currentMode, enableTTS, selectedLanguage, dataQuery, activeTab?.messages]);

  const generateModeSpecificResponse = (message: string, files: File[], mode: string) => {
    switch (mode) {
      case 'general':
        if (files.length > 0) {
          return `I've received your file "${files[0].name}". As a general AI assistant, I can help you with various questions. What would you like to know about this file or any other topic?`;
        }
        return generateGeneralAIResponse(message);

      case 'data-mining':
        return generateDataMiningResponse(message);

      case 'file-analysis':
        if (files.length > 0) {
          return generateFileAnalysisResponse(files);
        }
        return "Please upload one or more files to analyze. I can examine content, structure, sentiment, and provide detailed insights about documents, images, audio files, and more.";

      default:
        return generateGeneralAIResponse(message);
    }
  };

  const generateGeneralAIResponse = (message: string) => {
    const responses = [
      "I'm here to help with any questions you have. My knowledge spans across many topics, and I can assist with analysis, explanations, creative tasks, and problem-solving.",
      "That's an interesting question. Based on current knowledge and best practices, I'd suggest considering multiple perspectives on this topic.",
      "I understand you're looking for information about this. Let me provide you with a comprehensive overview and some actionable insights.",
      "Thank you for your question. I can help you explore this topic in depth and provide practical recommendations.",
      "This is a fascinating area to discuss. I can offer various approaches and methodologies to help you better understand this subject."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateGeneralAIFallback = (message: string) => {
    // Smart fallback responses based on message content with markdown formatting
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "## Hello there! 👋\n\nIt's **great** to meet you! I'm here to help with any questions or topics you'd like to discuss.\n\n*What's on your mind today?*";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return "## I'd be happy to help! 🤝\n\nI can assist with a **wide range of topics** including:\n\n- ❓ Answering questions\n- 📖 Providing explanations  \n- 🔍 Helping with analysis\n- ✨ Creative tasks\n- 🧩 Problem-solving\n- 💡 And much more!\n\n*What specifically would you like help with?*";
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
      return "## Thank you for asking! 😊\n\nI'm doing **well** and I'm excited to help you today. I'm here to provide:\n\n- 🤝 Support\n- 📚 Information  \n- 🛠️ Assistance with whatever you need\n\n*How are you doing today?*";
    }
    
    if (lowerMessage.includes('thank')) {
      return "## You're very welcome! 🙏\n\nI'm **glad** I could help. \n\n> Is there anything else you'd like to know or discuss? I'm here whenever you need assistance.\n\n*Feel free to ask me anything!*";
    }
    
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities')) {
      return "## I can help you with many things! 🚀\n\n### My Capabilities:\n\n- 💬 **Conversations**: Answer questions and engage in thoughtful discussions\n- 📝 **Writing**: Help with creative writing, editing, and content creation\n- 🔍 **Analysis**: Research, problem-solving, and critical thinking\n- 📚 **Learning**: Explain concepts and provide educational support\n- 💡 **Creativity**: Brainstorming, ideation, and creative projects\n- 🛠️ **Technical**: Code help, explanations, and troubleshooting\n\n*What interests you most? I'd love to help!*";
    }
    
    // General intelligent response
    return `## That's an interesting question! 🤔\n\nI find your question about **"${message}"** quite intriguing! While I'm experiencing some technical issues with my advanced AI capabilities right now, I can still help you explore this topic.\n\n### Let's dive deeper:\n\n- Could you tell me more about what specific aspect you're most curious about?\n- What's your current understanding of this topic?\n- Are you looking for practical advice or theoretical insights?\n\n*I'd love to explore this with you!* ✨`;
  };

  const generateDataMiningResponse = (message: string) => {
    const mockData = [
      "Based on your query, I've analyzed patient data from the last 30 days:\n\n• 15 patients showed improved mood scores (avg +2.3 points)\n• 8 patients completed all assigned exercises\n• 3 patients require follow-up for missed sessions\n• Common themes: anxiety management (67%), sleep improvement (45%)\n\nWould you like me to drill down into specific metrics or patient groups?",
      "Data mining results for your therapy practice:\n\n• Total sessions this month: 127\n• Average session duration: 52 minutes\n• Most effective interventions: CBT techniques (85% success rate)\n• Trending concerns: work-related stress, relationship issues\n• Patient satisfaction score: 4.7/5\n\nI can provide more detailed analytics on any of these areas.",
      "Here's what the data reveals about treatment outcomes:\n\n• Significant improvement in 78% of active cases\n• Early intervention success rate: 91%\n• Most common presenting issues: anxiety (45%), depression (32%)\n• Therapy modality effectiveness: DBT (92%), CBT (87%), ACT (83%)\n\nShall I generate a detailed report or focus on specific patient cohorts?"
    ];
    return mockData[Math.floor(Math.random() * mockData.length)];
  };

  const generateFileAnalysisResponse = (files: File[]) => {
    const fileTypes = files.map(f => f.type.split('/')[0]).join(', ');
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    
    return `I've analyzed ${files.length} file(s) with the following insights:\n\n**File Overview:**\n• Types: ${fileTypes}\n• Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n• Processing time: ${Math.floor(Math.random() * 5) + 2} seconds\n\n**Content Analysis:**\n• Key themes identified: Mental health assessment, therapeutic progress\n• Sentiment analysis: Overall positive tone (78% confidence)\n• Important sections flagged for review\n• Potential action items extracted\n\n**Recommendations:**\n• 3 follow-up questions identified\n• 2 therapeutic interventions suggested\n• 1 area requiring immediate attention\n\nWould you like me to elaborate on any of these findings or perform a deeper analysis?`;
  };

  // Handle text-to-speech
  const handleTextToSpeech = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error("Text-to-speech not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedLang = ttsLanguages.find(lang => lang.code === selectedLanguage);
    
    utterance.lang = selectedLanguage;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = audioVolume / 100;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Speech synthesis failed");
    };

    window.speechSynthesis.speak(utterance);
    toast.success(`Speaking in ${selectedLang?.name || selectedLanguage}`);
  }, [selectedLanguage, speechRate, speechPitch, audioVolume]);

  // Stop text-to-speech
  const handleStopTTS = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Speech recognition handlers
  const startListening = useCallback(() => {
    if (!speechSupported) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    
    if (!recognition) {
      toast.error('Speech recognition not initialized');
      return;
    }
    
    try {
      // Reset transcripts
      setFinalTranscript('');
      setInterimTranscript('');
      
      recognition.start();
      toast.success('🎤 Listening... Speak now');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  }, [recognition, speechSupported]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      toast.info('🛑 Stopped listening');
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setCurrentMessage('');
  }, []);

  // Auto-send message when speech recognition ends (if enabled)
  const handleSpeechToText = useCallback(() => {
    if (finalTranscript.trim()) {
      setCurrentMessage(finalTranscript.trim());
      if (autoSend) {
        setTimeout(() => {
          handleSendMessage();
          setFinalTranscript('');
        }, 500);
      }
    }
  }, [finalTranscript, autoSend]);

  // Update current message with live transcript
  useEffect(() => {
    const fullTranscript = finalTranscript + interimTranscript;
    if (fullTranscript.trim()) {
      setCurrentMessage(fullTranscript.trim());
    }
  }, [finalTranscript, interimTranscript]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: 'general' | 'data-mining' | 'file-analysis') => {
    setCurrentMode(newMode);
    
    // Update active tab mode
    setChatTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, mode: newMode, name: aiModes.find(m => m.id === newMode)?.name || tab.name }
        : tab
    ));

    toast.success(`Switched to ${aiModes.find(m => m.id === newMode)?.name} mode`);
  }, [activeTabId]);

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
      name: aiModes.find(m => m.id === currentMode)?.name || `Chat ${chatTabs.length + 1}`,
      model: selectedModel,
      active: false,
      messages: [],
      context: `New ${currentMode} session`,
      mode: currentMode
    };

    setChatTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [chatTabs.length, selectedModel, currentMode]);

  // Apply therapy prompt
  const applyTherapyPrompt = useCallback((prompt: string) => {
    setCurrentMessage(prompt);
    toast.success("Therapy prompt applied");
  }, []);

  // Export chat
  const handleExportChat = useCallback(() => {
    if (!activeTab) {
      toast.error("No active chat to export");
      return;
    }
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
        <Avatar className={`h-8 w-8 ${currentMode === 'general' && message.role === 'assistant' ? 'ring-2 ring-blue-200' : ''}`}>
          <AvatarFallback className={`${
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground' 
              : message.metadata?.mode === 'data-mining'
              ? 'bg-green-100 text-green-600'
              : message.metadata?.mode === 'file-analysis'
              ? 'bg-purple-100 text-purple-600'
              : currentMode === 'general' && message.role === 'assistant'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-blue-100 text-blue-600'
          }`}>
            {message.role === 'user' ? <UserIcon className="h-4 w-4" /> : 
             message.metadata?.mode === 'data-mining' ? <BarChart3 className="h-4 w-4" /> :
             message.metadata?.mode === 'file-analysis' ? <FileText className="h-4 w-4" /> :
             currentMode === 'general' && message.role === 'assistant' ? <Sparkles className="h-4 w-4" /> :
             <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={`rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : currentMode === 'general'
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100'
            : 'bg-muted'
        }`}>
          {(message.type === 'text' || message.type === 'tts') && (
            <div>
              {message.role === 'assistant' ? (
                <div className="text-sm prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800 prose-code:text-slate-800 prose-code:bg-slate-100 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-a:text-blue-600 prose-table:text-slate-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              {message.type === 'tts' && (
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextToSpeech(message.content)}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    TTS: {message.metadata?.language}
                  </Badge>
                </div>
              )}
              
              {/* Friendly interaction buttons for General AI mode */}
              {currentMode === 'general' && message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-blue-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextToSpeech(message.content)}
                    disabled={isSpeaking}
                    className="text-xs text-blue-600 hover:bg-blue-100"
                  >
                    {isSpeaking ? <Pause className="h-3 w-3 mr-1" /> : <Volume2 className="h-3 w-3 mr-1" />}
                    {isSpeaking ? 'Stop' : 'Listen'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      toast.success('Markdown copied to clipboard!');
                    }}
                    className="text-xs text-blue-600 hover:bg-blue-100"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy MD
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMessage(`Can you explain this in more detail: "${message.content.slice(0, 50)}..."`)}
                    className="text-xs text-blue-600 hover:bg-blue-100"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Follow up
                  </Button>
                </div>
              )}
            </div>
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
                <p className="text-xs opacity-70">
                  {message.metadata?.fileSize}
                  {message.metadata?.fileCount && message.metadata.fileCount > 1 && 
                    ` (+${message.metadata.fileCount - 1} more)`
                  }
                </p>
              </div>
            </div>
          )}

          {message.type === 'data' && (
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Data Analysis Result</p>
                <p className="text-xs opacity-70">{message.metadata?.dataQuery}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
            <span>{message.timestamp.toLocaleTimeString()}</span>
            <div className="flex items-center space-x-1">
              {message.metadata?.mode && (
                <Badge variant="outline" className="text-xs">
                  {message.metadata.mode}
                </Badge>
              )}
              {message.metadata?.model && (
                <Badge variant="outline" className="text-xs">
                  {message.metadata.model}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render top toolbar
  const renderTopToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-primary/10">
      {/* Mode Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Mode:</Label>
          <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
            {aiModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={currentMode === mode.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeChange(mode.id as any)}
                  className="text-xs"
                  title={mode.description}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {mode.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Chat Tabs */}
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
                    setChatTabs(prev => {
                      const idx = prev.findIndex(t => t.id === tab.id);
                      const newTabs = prev.filter(t => t.id !== tab.id);
                      if (newTabs.length === 0) {
                        const newTab: ChatTab = {
                          id: Date.now().toString(),
                          name: 'General AI',
                          model: selectedModel,
                          active: true,
                          messages: [],
                          context: 'New session',
                          mode: 'general'
                        };
                        setActiveTabId(newTab.id);
                        return [newTab];
                      } else {
                        const next = newTabs[Math.max(0, idx - 1)];
                        setActiveTabId(next.id);
                        return newTabs;
                      }
                    });
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

        {/* TTS Controls */}
        <div className="flex items-center space-x-2">
          <Switch 
            checked={enableTTS} 
            onCheckedChange={setEnableTTS}
            title="Enable Text-to-Speech"
          />
          <Label className="text-xs">TTS</Label>
          {isSpeaking && (
            <Button variant="outline" size="sm" onClick={handleStopTTS}>
              <VolumeX className="h-4 w-4" />
            </Button>
          )}
        </div>

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
                          {tab.mode}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              {/* Mode-specific settings */}
              {currentMode === 'general' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">TTS Settings</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Language</Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ttsLanguages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Speech Rate: {speechRate}</Label>
                      <Slider
                        value={[speechRate]}
                        onValueChange={([value]) => setSpeechRate(value)}
                        max={2}
                        min={0.5}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Speech Pitch: {speechPitch}</Label>
                      <Slider
                        value={[speechPitch]}
                        onValueChange={([value]) => setSpeechPitch(value)}
                        max={2}
                        min={0.5}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Label className="text-sm font-medium">Speech Recognition</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${speechSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs">
                            {speechSupported ? 'Speech Recognition Supported' : 'Speech Recognition Not Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {speechSupported && (
                      <>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Auto-send after speech</Label>
                          <Switch
                            checked={autoSend}
                            onCheckedChange={setAutoSend}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={isListening ? "destructive" : "default"}
                              size="sm"
                              onClick={toggleListening}
                              className="w-full"
                            >
                              {isListening ? (
                                <>
                                  <MicOff className="h-4 w-4 mr-2" />
                                  Stop Listening
                                </>
                              ) : (
                                <>
                                  <Mic className="h-4 w-4 mr-2" />
                                  Start Voice Input
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {(finalTranscript || interimTranscript) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearTranscript}
                              className="w-full"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Clear Transcript
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          🎤 Live transcription will appear in your message box
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {currentMode === 'data-mining' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Data Mining Settings</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Patient Filter</Label>
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Patients</SelectItem>
                          <SelectItem value="emma">Emma Rodriguez</SelectItem>
                          <SelectItem value="john">John Smith</SelectItem>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                          <SelectItem value="last-year">Last Year</SelectItem>
                          <SelectItem value="all-time">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentMode === 'file-analysis' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Analysis Settings</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Analysis Type</Label>
                      <Select value={analysisType} onValueChange={setAnalysisType}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content">Content Analysis</SelectItem>
                          <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                          <SelectItem value="structure">Structure Analysis</SelectItem>
                          <SelectItem value="metadata">Metadata Extraction</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Analysis Depth</Label>
                      <Select value={analysisDepth} onValueChange={setAnalysisDepth}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick">Quick Scan</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="deep">Deep Analysis</SelectItem>
                          <SelectItem value="expert">Expert Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

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
                  title="Upload files for analysis"
                  aria-label="File upload"
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
              {(activeTab?.messages?.length ?? 0) === 0 ? (
                <div className="text-center py-12">
                  {currentMode === 'general' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Friendly AI Avatar */}
                      <div className="text-center space-y-3">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Sparkles className="h-10 w-10 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Hi there! I'm your AI friend! 👋
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                          I'm powered by <span className="font-semibold text-blue-600">Google Gemini 2.0</span> and I'm here to chat, help, learn, and explore ideas together!
                        </p>
                      </div>
                      
                      {/* Conversation Starters */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-center">💫 Let's start with something fun:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                          <Button 
                            variant="outline" 
                            className="h-auto p-4 text-left justify-start group hover:shadow-md transition-all"
                            onClick={() => setCurrentMessage("Can you explain how artificial intelligence works in simple terms? Please use examples, code snippets if relevant, and organize your response with headings and bullet points for better readability.")}
                          >
                            <Brain className="h-6 w-6 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium">🤖 Tech & AI</div>
                              <div className="text-sm text-muted-foreground">Learn about AI, technology trends</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="h-auto p-4 text-left justify-start group hover:shadow-md transition-all"
                            onClick={() => setCurrentMessage("What are some effective daily habits for reducing stress and improving mental wellbeing?")}
                          >
                            <Heart className="h-6 w-6 mr-3 text-green-500 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium">🌱 Health & Wellness</div>
                              <div className="text-sm text-muted-foreground">Tips for mental & physical wellbeing</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="h-auto p-4 text-left justify-start group hover:shadow-md transition-all"
                            onClick={() => setCurrentMessage("I need help brainstorming creative ideas for a personal project. Can you help me think outside the box?")}
                          >
                            <Lightbulb className="h-6 w-6 mr-3 text-yellow-500 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium">💡 Creative Ideas</div>
                              <div className="text-sm text-muted-foreground">Brainstorming & inspiration</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="h-auto p-4 text-left justify-start group hover:shadow-md transition-all"
                            onClick={() => setCurrentMessage("What are some proven strategies for learning new skills more effectively and staying motivated?")}
                          >
                            <Target className="h-6 w-6 mr-3 text-purple-500 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium">🎯 Learning & Growth</div>
                              <div className="text-sm text-muted-foreground">Study tips & personal development</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="h-auto p-4 text-left justify-start group hover:shadow-md transition-all"
                            onClick={() => setCurrentMessage("Can you help me understand the basics of mindfulness and meditation for beginners?")}
                          >
                            <Sparkles className="h-6 w-6 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium">🧘 Mindfulness</div>
                              <div className="text-sm text-muted-foreground">Meditation & awareness practices</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="h-auto p-4 text-left justify-start group hover:shadow-md transition-all"
                            onClick={() => setCurrentMessage("Tell me an interesting story or share a fun fact that might surprise me!")}
                          >
                            <Book className="h-6 w-6 mr-3 text-orange-500 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="font-medium">📚 Stories & Facts</div>
                              <div className="text-sm text-muted-foreground">Interesting stories & surprises</div>
                            </div>
                          </Button>
                        </div>
                        
                        <div className="text-center space-y-4 pt-6">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 max-w-2xl mx-auto">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              💬 <strong>I'm here for you!</strong> Ask me anything - whether you want deep conversations, creative help, explanations, problem-solving, 
                              casual chat, or just someone to bounce ideas off. I'm designed to be helpful, thoughtful, and friendly.
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              ✨ <strong>Rich Formatting:</strong> I respond with beautiful markdown formatting including headings, lists, code blocks, tables, and more!
                            </p>
                          </div>
                          
                          {enableTTS && (
                            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3 max-w-md mx-auto">
                              <Volume2 className="h-5 w-5" />
                              <span>🎵 Text-to-speech is enabled - I'll speak my responses!</span>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Or just type anything below to start our conversation! 😊
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // Mode showcase for non-general modes
                    <div>
                      <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
                      <p className="text-muted-foreground mb-6">
                        Choose your mode and start interacting with advanced AI models
                      </p>
                      
                      {/* Mode showcase */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                        {aiModes.map((mode) => {
                          const Icon = mode.icon;
                          return (
                            <Card 
                              key={mode.id}
                              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                                currentMode === mode.id ? 'border-primary bg-primary/5' : ''
                              }`}
                              onClick={() => handleModeChange(mode.id as any)}
                            >
                              <Icon className={`h-8 w-8 mx-auto mb-2 ${
                                mode.color === 'blue' ? 'text-blue-500' :
                                mode.color === 'green' ? 'text-green-500' :
                                'text-purple-500'
                              }`} />
                              <h4 className="font-semibold text-sm mb-1">{mode.name}</h4>
                              <p className="text-xs text-muted-foreground">{mode.description}</p>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Quick actions based on current mode */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Quick Start</h4>
                        {currentMode === 'data-mining' && (
                          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                            <Button variant="outline" size="sm" onClick={() => setDataQuery("Show anxiety trends last month")}>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Anxiety Trends
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDataQuery("Patient progress summary")}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Progress Report
                            </Button>
                          </div>
                        )}
                        {currentMode === 'file-analysis' && (
                          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                              <FileText className="h-4 w-4 mr-2" />
                              Analyze Content
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {(activeTab?.messages ?? []).map(renderMessage)}
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
                            <span className="text-sm">
                              {currentMode === 'general' ? '✨ Gemini is thinking...' : 'AI is thinking...'}
                            </span>
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
              {/* Mode-specific inputs */}
              {currentMode === 'data-mining' && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium">Data Query</Label>
                  <Input
                    placeholder="e.g., Show me anxiety trends for the last month..."
                    value={dataQuery}
                    onChange={(e) => setDataQuery(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Patient: {selectedPatient}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>Range: {dateRange}</span>
                  </div>
                </div>
              )}

              {currentMode === 'file-analysis' && uploadedFiles.length === 0 && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload files to analyze content, sentiment, and extract insights
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  {/* Live transcription display */}
                  {(isListening || interimTranscript || finalTranscript) && (
                    <div className="mb-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                          >
                            <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : 'text-blue-500'}`} />
                          </motion.div>
                          <span className="text-sm font-medium text-blue-700">
                            {isListening ? 'Listening...' : 'Voice Input'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearTranscript}
                            className="h-6 text-xs text-blue-600 hover:bg-blue-100"
                          >
                            Clear
                          </Button>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => setAutoSend(!autoSend)}
                            className={`h-6 text-xs hover:bg-blue-100 ${autoSend ? 'text-green-600' : 'text-blue-600'}`}
                          >
                            Auto-send: {autoSend ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        {finalTranscript && (
                          <span className="text-slate-700">{finalTranscript}</span>
                        )}
                        {interimTranscript && (
                          <span className="text-slate-500 italic">{interimTranscript}</span>
                        )}
                        {!finalTranscript && !interimTranscript && isListening && (
                          <span className="text-slate-400 italic">Speak now...</span>
                        )}
                      </div>
                      
                      {speechSupported && (
                        <div className="mt-2 text-xs text-blue-600">
                          💡 Tip: Speech will be automatically added to your message
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Textarea
                    placeholder={
                      currentMode === 'general' 
                        ? "Ask me anything... (TTS available in multiple languages)"
                        : currentMode === 'data-mining'
                        ? "Ask about patient data, therapy outcomes, trends..."
                        : "Upload files and ask about their content..."
                    }
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
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleListening}
                    title={isListening ? "Stop live transcription" : "Start live voice-to-text"}
                    disabled={!speechSupported}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  {currentMode !== 'data-mining' && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  )}

                  {currentMode === 'general' && enableTTS && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => currentMessage && handleTextToSpeech(currentMessage)}
                      disabled={!currentMessage.trim() || isSpeaking}
                      title="Preview TTS"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !currentMessage.trim() && 
                      uploadedFiles.length === 0 && 
                      (currentMode !== 'data-mining' || !dataQuery.trim())
                    }
                    size="icon"
                    title="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-muted/50 rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {uploadedFiles.length} file(s) attached 
                    {currentMode === 'file-analysis' && (
                      <span className="text-muted-foreground">
                        • {analysisType} • {analysisDepth}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Mode indicator */}
              <div className="flex items-center justify-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {aiModes.find(m => m.id === currentMode)?.name} Mode
                  {enableTTS && currentMode === 'general' && (
                    <span className="ml-1">• TTS: {ttsLanguages.find(l => l.code === selectedLanguage)?.name}</span>
                  )}
                </Badge>
              </div>
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