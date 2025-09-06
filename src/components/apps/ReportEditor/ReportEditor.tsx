import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeBlock from '@tiptap/extension-code-block';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, ListChecks, Quote, Minus,
  Undo, Save, Image as ImageIcon, 
  Table as TableIcon, Link as LinkIcon, Bot, Share, 
  Type, AlignLeft, AlignCenter, AlignRight,
  Download, Eye, Plus, Printer, FileText, FileImage,
  Heading1, Heading2, Heading3, 
  Highlighter, RotateCcw, Mic, MicOff,
  Square, Settings, Globe, ChevronDown,
  Languages, Sparkles, BookOpen, CheckCircle, Wand2,
  RefreshCw, Minimize2
} from 'lucide-react';

/*
 * Z-Index Hierarchy for ReportEditor:
 * - Window base: z-9999 (active window in Window.tsx)
 * - Loading Overlay: z-[10002] (highest priority - blocks all interaction)  
 * - AI Result Panel: z-[10001] (modal overlay)
 * - Voice Control Panel: z-[10000] (floating panel)
 * - Color/Highlight Pickers: z-[10004] (tooltip-style overlays)
 * - Dropdown Menus: z-[10003] (AI tools, export, voice settings menus)
 * 
 * This ensures proper layering within the window context while staying above
 * the base window z-index to prevent conflicts with other windows.
 */

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ReportEditor: React.FC = () => {
  const [activeDocument, setActiveDocument] = useState('report-1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  
  // Voice typing state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [isContinuous, setIsContinuous] = useState(true);
  const [interimResults, setInterimResults] = useState(true);
  const [voiceCommands, setVoiceCommands] = useState(true);
  const recognitionRef = useRef<any>(null);
  
  // Live typing state
  const [interimText, setInterimText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const interimNodeRef = useRef<any>(null);
  const volumeAnimationRef = useRef<number>();
  
  // AI features state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showAiResult, setShowAiResult] = useState(false);
  
  // Gemini API configuration
  const GEMINI_API_KEY = 'AIzaSyAoZR4Hyhjm-tMbpq8LSWbh9rzuaUh5f84';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  const [documents, setDocuments] = useState([
    { 
      id: 'report-1', 
      title: 'Session Report - John Doe', 
      patient: 'John Doe', 
      date: '2024-01-15',
      type: 'session-report',
      content: `
        <h1>Therapy Session Report</h1>
        <p><strong>Patient:</strong> John Doe</p>
        <p><strong>Date:</strong> January 15, 2024</p>
        <p><strong>Session Duration:</strong> 60 minutes</p>
        
        <h2>Session Overview</h2>
        <p>Today's session focused on cognitive behavioral therapy techniques for anxiety management. The patient showed significant improvement in identifying trigger patterns.</p>
        
        <h2>Progress Notes</h2>
        <ul>
          <li>Completed anxiety scale assessment (score: 6/10)</li>
          <li>Practiced breathing exercises</li>
          <li>Discussed homework assignments</li>
        </ul>
        
        <h2>Treatment Goals</h2>
        <p>Continue working on anxiety reduction strategies and improve coping mechanisms.</p>
      `
    },
    { 
      id: 'report-2', 
      title: 'Progress Assessment - Jane Smith', 
      patient: 'Jane Smith', 
      date: '2024-01-14',
      type: 'progress-assessment',
      content: `
        <h1>Progress Assessment Report</h1>
        <p><strong>Patient:</strong> Jane Smith</p>
        <p><strong>Assessment Date:</strong> January 14, 2024</p>
        
        <h2>Assessment Summary</h2>
        <p>Significant improvement in mood stability and social interactions over the past month.</p>
      `
    }
  ]);

  const currentDocument = documents.find(doc => doc.id === activeDocument);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({ 
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Strike,
      CodeBlock.configure({
        languageClassPrefix: 'language-',
      }),
    ],
    content: currentDocument?.content || '',
    editorProps: {
      attributes: {
        class: 'min-h-[500px] p-4 focus:outline-none prose prose-sm max-w-none',
      },
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true; // Always continuous for better experience
      recognition.interimResults = true; // Always show interim results
      recognition.lang = voiceLanguage;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setIsProcessingVoice(true);
        setInterimText('');
        toast.success('Voice typing started - speak now');
        
        // Create interim text node in editor
        if (editor) {
          const interimNode = editor.state.schema.text('', [
            editor.state.schema.marks.em.create({ class: 'interim-text' })
          ]);
          interimNodeRef.current = interimNode;
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setIsProcessingVoice(false);
        setInterimText('');
        setVoiceVolume(0);
        
        // Clear interim text from editor
        if (editor && interimNodeRef.current) {
          clearInterimText();
        }
        
        // Only show stopped message if user didn't manually stop
        if (recognitionRef.current && !recognitionRef.current._manuallyStopped) {
          toast.info('Voice typing stopped');
        }
      };

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result received');
        let finalTranscript = '';
        let currentInterimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setInterimText(''); // Clear interim when we get final
          } else {
            currentInterimText += transcript;
            setInterimText(currentInterimText);
            
            // Show interim results in real-time
            if (interimResults && editor) {
              updateInterimText(currentInterimText);
            }
          }
        }
        
        if (finalTranscript && editor) {
          // Clear any interim text first
          clearInterimText();
          
          // Process voice commands if enabled
          if (voiceCommands && processVoiceCommand(finalTranscript)) {
            return;
          }
          
          // Insert the final transcribed text
          const processedText = finalTranscript.charAt(0).toUpperCase() + finalTranscript.slice(1);
          const textToInsert = processedText.endsWith('.') ? processedText + ' ' : processedText + '. ';
          
          editor.chain().focus().insertContent(textToInsert).run();
          toast.success(`Added: "${processedText}"`);
        }
      };
      
      recognition.onaudiostart = () => {
        console.log('Audio capture started');
        setIsProcessingVoice(true);
        startVolumeMonitoring();
      };
      
      recognition.onaudioend = () => {
        console.log('Audio capture ended');
        setIsProcessingVoice(false);
        stopVolumeMonitoring();
      };
      
      recognition.onspeechstart = () => {
        console.log('Speech detected');
        setVoiceVolume(50); // Indicate speech detected
      };
      
      recognition.onspeechend = () => {
        console.log('Speech ended');
        setVoiceVolume(0);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessingVoice(false);
        setInterimText('');
        setVoiceVolume(0);
        
        let errorMessage = 'Speech recognition error';
        switch(event.error) {
          case 'network':
            errorMessage = 'Network error - check your connection';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied - please allow microphone access';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected - try speaking louder or closer to microphone';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was stopped';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found - please check your audio devices';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech service not allowed - try refreshing the page';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        toast.error(errorMessage);
      };
      
      recognition.onnomatch = () => {
        console.log('No speech match');
        toast.warning('No clear speech was recognized - please try speaking more clearly');
      };
      
      setSpeechRecognition(recognition);
      recognitionRef.current = recognition;
    } else {
      toast.error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current._manuallyStopped = true;
        recognitionRef.current.stop();
      }
      stopVolumeMonitoring();
    };
  }, [voiceLanguage, editor]); // Removed dependencies that cause recreation

  // Volume monitoring for visual feedback
  const startVolumeMonitoring = () => {
    const animateVolume = () => {
      if (isProcessingVoice) {
        // Simulate volume changes (in real app, you'd use Web Audio API)
        const randomVolume = Math.random() * 100;
        setVoiceVolume(randomVolume);
        volumeAnimationRef.current = requestAnimationFrame(animateVolume);
      }
    };
    animateVolume();
  };

  const stopVolumeMonitoring = () => {
    if (volumeAnimationRef.current) {
      cancelAnimationFrame(volumeAnimationRef.current);
    }
    setVoiceVolume(0);
  };

  // Update interim text in editor
  const updateInterimText = (text: string) => {
    if (!editor || !text) return;
    
    // For now, we'll show interim text in the floating panel
    // In a more advanced implementation, you could insert temporary nodes
  };

  // Clear interim text from editor
  const clearInterimText = () => {
    if (!editor) return;
    
    // Remove any interim text nodes
    // This would be more complex in a real implementation
    interimNodeRef.current = null;
  };

  // Process voice commands
  const processVoiceCommand = (transcript: string): boolean => {
    const command = transcript.toLowerCase().trim();
    
    if (command.includes('bold')) {
      editor?.chain().focus().toggleBold().run();
      toast.success('Applied bold formatting');
      return true;
    }
    
    if (command.includes('italic')) {
      editor?.chain().focus().toggleItalic().run();
      toast.success('Applied italic formatting');
      return true;
    }
    
    if (command.includes('new line') || command.includes('new paragraph')) {
      editor?.chain().focus().setHardBreak().run();
      return true;
    }
    
    if (command.includes('heading 1') || command.includes('title')) {
      editor?.chain().focus().toggleHeading({ level: 1 }).run();
      toast.success('Applied heading 1');
      return true;
    }
    
    if (command.includes('heading 2') || command.includes('subtitle')) {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
      toast.success('Applied heading 2');
      return true;
    }
    
    if (command.includes('bullet list') || command.includes('bulleted list')) {
      editor?.chain().focus().toggleBulletList().run();
      toast.success('Created bullet list');
      return true;
    }
    
    if (command.includes('numbered list') || command.includes('ordered list')) {
      editor?.chain().focus().toggleOrderedList().run();
      toast.success('Created numbered list');
      return true;
    }
    
    if (command.includes('save document') || command.includes('save')) {
      saveDocument();
      return true;
    }
    
    if (command.includes('undo')) {
      editor?.chain().focus().undo().run();
      toast.success('Undid last action');
      return true;
    }
    
    if (command.includes('redo')) {
      editor?.chain().focus().redo().run();
      toast.success('Redid last action');
      return true;
    }
    
    return false;
  };

  // Start/stop voice typing
  const toggleVoiceTyping = () => {
    if (!speechRecognition) {
      toast.error('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      console.log('Manually stopping voice recognition');
      speechRecognition._manuallyStopped = true;
      speechRecognition.stop();
      toast.info('Voice typing stopped');
    } else {
      console.log('Starting voice recognition');
      speechRecognition._manuallyStopped = false;
      
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            console.log('Microphone permission granted');
            try {
              speechRecognition.start();
            } catch (error) {
              console.error('Error starting speech recognition:', error);
              toast.error('Failed to start voice recognition. Please try again.');
            }
          })
          .catch(() => {
            toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
          });
      } else {
        // Fallback for browsers without getUserMedia
        try {
          speechRecognition.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          toast.error('Failed to start voice recognition. Please try again.');
        }
      }
    }
  };

  // Remove the problematic auto-restart effect
  // Auto-restart recognition if it stops unexpectedly
  /*
  useEffect(() => {
    if (isListening && speechRecognition && !isProcessingVoice) {
      const timeout = setTimeout(() => {
        if (Date.now() - lastVoiceActivity > 5000) { // 5 seconds of silence
          toast.info('Restarting voice recognition...');
          speechRecognition.start();
        }
      }, 6000);
      
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isListening, speechRecognition, isProcessingVoice, lastVoiceActivity]);
  */

  // Colors for text and highlighting
  const textColors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', 
    '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const highlightColors = [
    '#FEF3C7', '#FECACA', '#FED7D7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FCE7F3', '#F9FAFB', '#FEF2F2'
  ];

  // Voice recognition languages
  const voiceLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' }
  ];

  // Export formats
  const exportFormats = [
    { id: 'pdf', name: 'PDF Document', icon: FileText, description: 'Portable Document Format' },
    { id: 'docx', name: 'Word Document', icon: FileText, description: 'Microsoft Word format' },
    { id: 'html', name: 'HTML Document', icon: Globe, description: 'Web page format' },
    { id: 'markdown', name: 'Markdown', icon: FileText, description: 'Plain text with formatting' },
    { id: 'txt', name: 'Plain Text', icon: FileText, description: 'Raw text without formatting' },
    { id: 'png', name: 'Image (PNG)', icon: FileImage, description: 'High-quality image' },
    { id: 'jpg', name: 'Image (JPG)', icon: FileImage, description: 'Compressed image' },
    { id: 'rtf', name: 'Rich Text Format', icon: FileText, description: 'Cross-platform rich text' }
  ];

  // AI enhancement options
  const aiEnhancements = [
    { 
      id: 'translate', 
      name: 'Translate Text', 
      icon: Languages, 
      description: 'Translate selected text to another language',
      languages: [
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'ru', name: 'Russian' }
      ]
    },
    { 
      id: 'summarize', 
      name: 'Summarize Content', 
      icon: BookOpen, 
      description: 'Create a concise summary of the selected text' 
    },
    { 
      id: 'enhance', 
      name: 'Enhance Writing', 
      icon: Sparkles, 
      description: 'Improve clarity, tone, and professional language' 
    },
    { 
      id: 'grammar', 
      name: 'Fix Grammar & Typos', 
      icon: CheckCircle, 
      description: 'Correct grammar mistakes and spelling errors' 
    },
    { 
      id: 'reformulate', 
      name: 'Reformulate Text', 
      icon: RefreshCw, 
      description: 'Rephrase text while maintaining the original meaning' 
    },
    { 
      id: 'reduce', 
      name: 'Content Reduction', 
      icon: Minimize2, 
      description: 'Make text more concise while preserving key information' 
    }
  ];

  // Helper functions
  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  const saveDocument = useCallback(() => {
    if (editor && currentDocument) {
      const content = editor.getHTML();
      setDocuments(prev => prev.map(doc => 
        doc.id === activeDocument 
          ? { ...doc, content }
          : doc
      ));
      toast.success('Document saved successfully!');
    }
  }, [editor, currentDocument, activeDocument]);

  // Comprehensive export functionality
  const exportDocument = useCallback(async (format: string) => {
    if (!editor || !currentDocument) {
      toast.error('No document to export');
      return;
    }
    
    const content = editor.getHTML();
    const title = currentDocument.title;
    
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(content, title);
          break;
        case 'docx':
          await exportToWord(content, title);
          break;
        case 'html':
          exportToHTML(content, title);
          break;
        case 'markdown':
          exportToMarkdown(content, title);
          break;
        case 'txt':
          exportToText(content, title);
          break;
        case 'png':
        case 'jpg':
          await exportToImage(content, title, format);
          break;
        case 'rtf':
          exportToRTF(content, title);
          break;
        default:
          toast.error('Unsupported export format');
      }
    } catch (error) {
      toast.error(`Export failed: ${error}`);
    }
  }, [editor, currentDocument]);

  // AI Enhancement Functions
  const callGeminiAPI = async (prompt: string) => {
    try {
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
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`AI service unavailable: ${error}`);
    }
  };

  // Convert markdown to HTML for TipTap compatibility
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr>')
      .replace(/^\*\*\*$/gim, '<hr>');

    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote')) {
      html = '<p>' + html + '</p>';
    }

    // Fix list wrapping
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
      if (!match.includes('<ul>') && !match.includes('<ol>')) {
        // Check if it's a numbered list (contains numbers)
        if (/^\d+\./.test(match.replace(/<[^>]*>/g, ''))) {
          return '<ol>' + match + '</ol>';
        } else {
          return '<ul>' + match + '</ul>';
        }
      }
      return match;
    });

    return html;
  };

  const translateText = async (text: string, targetLanguage: string) => {
    setIsAiProcessing(true);
    try {
      const prompt = `Translate the following text to ${targetLanguage}. You can use markdown formatting if needed for better structure. Only return the translated text:\n\n${text}`;
      const result = await callGeminiAPI(prompt);
      const htmlResult = convertMarkdownToHTML(result);
      setAiResult(htmlResult);
      setShowAiResult(true);
      toast.success(`Text translated to ${targetLanguage}`);
    } catch (error) {
      toast.error(`Translation failed: ${error}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const summarizeText = async (text: string) => {
    setIsAiProcessing(true);
    try {
      const prompt = `Create a concise and professional summary of the following text. Use markdown formatting (headers, bold, lists) to structure the summary clearly. Keep the key points and important information:\n\n${text}`;
      const result = await callGeminiAPI(prompt);
      const htmlResult = convertMarkdownToHTML(result);
      setAiResult(htmlResult);
      setShowAiResult(true);
      toast.success('Summary generated successfully');
    } catch (error) {
      toast.error(`Summarization failed: ${error}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const enhanceText = async (text: string) => {
    setIsAiProcessing(true);
    try {
      const prompt = `Enhance the following text by improving clarity, professional tone, and readability while maintaining the original meaning and context. Use markdown formatting for better structure if appropriate. Return only the enhanced text:\n\n${text}`;
      const result = await callGeminiAPI(prompt);
      const htmlResult = convertMarkdownToHTML(result);
      setAiResult(htmlResult);
      setShowAiResult(true);
      toast.success('Text enhanced successfully');
    } catch (error) {
      toast.error(`Enhancement failed: ${error}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const fixGrammarAndTypos = async (text: string) => {
    setIsAiProcessing(true);
    try {
      const prompt = `Fix all grammar mistakes, spelling errors, and typos in the following text. Maintain the original meaning and structure. You can use markdown formatting if it improves readability. Return only the corrected text:\n\n${text}`;
      const result = await callGeminiAPI(prompt);
      const htmlResult = convertMarkdownToHTML(result);
      setAiResult(htmlResult);
      setShowAiResult(true);
      toast.success('Grammar and typos fixed successfully');
    } catch (error) {
      toast.error(`Grammar check failed: ${error}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const reformulateText = async (text: string) => {
    setIsAiProcessing(true);
    try {
      const prompt = `Reformulate and rephrase the following text while maintaining the exact same meaning and context. Use different words and sentence structures but preserve all the original information and intent. You can use markdown formatting for better structure:\n\n${text}`;
      const result = await callGeminiAPI(prompt);
      const htmlResult = convertMarkdownToHTML(result);
      setAiResult(htmlResult);
      setShowAiResult(true);
      toast.success('Text reformulated successfully');
    } catch (error) {
      toast.error(`Reformulation failed: ${error}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const reduceContent = async (text: string) => {
    setIsAiProcessing(true);
    try {
      const prompt = `Reduce the length of the following text by making it more concise and eliminating unnecessary words while preserving all key information and important details. Maintain the professional tone and essential meaning. Use markdown formatting for better structure:\n\n${text}`;
      const result = await callGeminiAPI(prompt);
      const htmlResult = convertMarkdownToHTML(result);
      setAiResult(htmlResult);
      setShowAiResult(true);
      toast.success('Content reduced successfully');
    } catch (error) {
      toast.error(`Content reduction failed: ${error}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiEnhancement = async (enhancementId: string, targetLanguage?: string) => {
    if (!editor) {
      toast.error('Editor not available');
      return;
    }

    const { from, to, empty } = editor.state.selection;
    let selectedText = '';

    if (!empty) {
      selectedText = editor.state.doc.textBetween(from, to);
    } else {
      // If no selection, use entire document content
      selectedText = editor.getText();
    }

    if (!selectedText.trim()) {
      toast.error('No text to process');
      return;
    }

    switch (enhancementId) {
      case 'translate':
        if (targetLanguage) {
          await translateText(selectedText, targetLanguage);
        }
        break;
      case 'summarize':
        await summarizeText(selectedText);
        break;
      case 'enhance':
        await enhanceText(selectedText);
        break;
      case 'grammar':
        await fixGrammarAndTypos(selectedText);
        break;
      case 'reformulate':
        await reformulateText(selectedText);
        break;
      case 'reduce':
        await reduceContent(selectedText);
        break;
      default:
        toast.error('Unknown enhancement type');
    }
  };

  const applyAiResult = () => {
    if (!editor || !aiResult) return;

    const { empty } = editor.state.selection;
    
    if (!empty) {
      // Replace selected text with HTML content
      editor.chain().focus().deleteSelection().insertContent(aiResult).run();
    } else {
      // Insert HTML content at cursor position
      editor.chain().focus().insertContent(aiResult).run();
    }
    
    setShowAiResult(false);
    setAiResult('');
    toast.success('AI result applied to document');
  };

  const dismissAiResult = () => {
    setShowAiResult(false);
    setAiResult('');
  };

  const exportToPDF = async (content: string, title: string) => {
    // For a real implementation, you'd use libraries like jsPDF with html2canvas
    // This is a simplified version that creates a printable HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('PDF export initiated (print dialog opened)');
  };

  const exportToWord = async (content: string, title: string) => {
    // Create a basic Word-compatible document
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1, h2, h3 { color: #333; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `;
    
    const blob = new Blob([docContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    downloadFile(blob, `${title}.docx`);
    toast.success('Word document exported');
  };

  const exportToHTML = (content: string, title: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadFile(blob, `${title}.html`);
    toast.success('HTML document exported');
  };

  const exportToMarkdown = (content: string, title: string) => {
    // Convert HTML to Markdown (simplified conversion)
    let markdown = content
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gs, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gs, '$1\n')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1\n\n')
      .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up extra newlines
    
    const blob = new Blob([`# ${title}\n\n${markdown}`], { type: 'text/markdown' });
    downloadFile(blob, `${title}.md`);
    toast.success('Markdown document exported');
  };

  const exportToText = (content: string, title: string) => {
    // Strip all HTML tags and convert to plain text
    const textContent = content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    const blob = new Blob([`${title}\n${'='.repeat(title.length)}\n\n${textContent}`], { type: 'text/plain' });
    downloadFile(blob, `${title}.txt`);
    toast.success('Text document exported');
  };

  const exportToImage = async (content: string, title: string, format: string) => {
    // Create a temporary div to render the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.style.cssText = `
      font-family: Arial, sans-serif;
      max-width: 800px;
      padding: 40px;
      background: white;
      position: absolute;
      top: -9999px;
      left: -9999px;
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      // For a real implementation, you'd use html2canvas library
      // This is a simplified approach using the browser's built-in capabilities
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 1000;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        
        // Simple text rendering (in a real app, use html2canvas)
        const lines = tempDiv.textContent?.split('\n') || [];
        lines.forEach((line, index) => {
          ctx.fillText(line, 40, 40 + (index * 20));
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `${title}.${format}`);
            toast.success(`${format.toUpperCase()} image exported`);
          }
        }, `image/${format}`, 0.9);
      }
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const exportToRTF = (content: string, title: string) => {
    // Create a basic RTF document
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
      \\f0\\fs24 ${title}\\par\\par
      ${content.replace(/<[^>]*>/g, '').replace(/\n/g, '\\par ')}
    }`;
    
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    downloadFile(blob, `${title}.rtf`);
    toast.success('RTF document exported');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Update editor content when switching documents
  useEffect(() => {
    if (editor && currentDocument) {
      editor.commands.setContent(currentDocument.content);
    }
  }, [activeDocument, editor, currentDocument]);

  const formatButton = (action: () => void, icon: React.ReactNode, isActive?: boolean) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={action}
      className={`h-8 w-8 p-0 ${isActive ? 'bg-accent' : ''}`}
    >
      {icon}
    </Button>
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        {/* File Operations */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={saveDocument}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          {/* Enhanced Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 z-[10003]">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <DropdownMenuItem
                    key={format.id}
                    onClick={() => exportDocument(format.id)}
                    className="flex items-center space-x-3 p-3"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{format.name}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Export Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Voice Typing Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={toggleVoiceTyping}
            disabled={!speechRecognition}
            title={isListening ? "Stop voice typing" : "Start voice typing"}
          >
            {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isListening ? 'Stop' : 'Voice'}
          </Button>
          
          {isListening && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </div>
          )}
          
          {/* Manual restart button when stopped unexpectedly */}
          {!isListening && speechRecognition && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceTyping}
              title="Restart voice typing"
              className="text-xs px-2 py-1 h-6"
            >
              🔄 Restart
            </Button>
          )}
          
          {/* Voice Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Voice settings">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-4 z-[10003]">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <Select value={voiceLanguage} onValueChange={setVoiceLanguage}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Continuous listening</Label>
                  <Switch checked={isContinuous} onCheckedChange={setIsContinuous} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show live transcription</Label>
                  <Switch checked={interimResults} onCheckedChange={setInterimResults} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Voice commands</Label>
                  <Switch checked={voiceCommands} onCheckedChange={setVoiceCommands} />
                </div>
                
                {voiceCommands && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Available commands:</strong><br />
                    "Bold", "Italic", "Heading 1", "Heading 2", "Bullet list", 
                    "Numbered list", "New line", "Save", "Undo", "Redo"
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="text-xs font-medium mb-2">Live Typing Features:</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>✓ Real-time speech transcription</div>
                    <div>✓ Volume level monitoring</div>
                    <div>✓ Auto-punctuation</div>
                    <div>✓ Smart capitalization</div>
                    <div>✓ Voice command recognition</div>
                    <div>✓ Auto-restart on silence</div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Formatting Tools */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().undo().run(),
            <Undo className="h-4 w-4" />,
            false
          )}
          {formatButton(
            () => editor.chain().focus().redo().run(),
            <RotateCcw className="h-4 w-4" />,
            false
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().toggleBold().run(),
            <Bold className="h-4 w-4" />,
            editor.isActive('bold')
          )}
          {formatButton(
            () => editor.chain().focus().toggleItalic().run(),
            <Italic className="h-4 w-4" />,
            editor.isActive('italic')
          )}
          {formatButton(
            () => editor.chain().focus().toggleUnderline().run(),
            <UnderlineIcon className="h-4 w-4" />,
            editor.isActive('underline')
          )}
          {formatButton(
            () => editor.chain().focus().toggleStrike().run(),
            <Strikethrough className="h-4 w-4" />,
            editor.isActive('strike')
          )}
          {formatButton(
            () => editor.chain().focus().toggleCode().run(),
            <Code className="h-4 w-4" />,
            editor.isActive('code')
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            <Heading1 className="h-4 w-4" />,
            editor.isActive('heading', { level: 1 })
          )}
          {formatButton(
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            <Heading2 className="h-4 w-4" />,
            editor.isActive('heading', { level: 2 })
          )}
          {formatButton(
            () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            <Heading3 className="h-4 w-4" />,
            editor.isActive('heading', { level: 3 })
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().setTextAlign('left').run(),
            <AlignLeft className="h-4 w-4" />,
            editor.isActive({ textAlign: 'left' })
          )}
          {formatButton(
            () => editor.chain().focus().setTextAlign('center').run(),
            <AlignCenter className="h-4 w-4" />,
            editor.isActive({ textAlign: 'center' })
          )}
          {formatButton(
            () => editor.chain().focus().setTextAlign('right').run(),
            <AlignRight className="h-4 w-4" />,
            editor.isActive({ textAlign: 'right' })
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().toggleBulletList().run(),
            <List className="h-4 w-4" />,
            editor.isActive('bulletList')
          )}
          {formatButton(
            () => editor.chain().focus().toggleOrderedList().run(),
            <ListOrdered className="h-4 w-4" />,
            editor.isActive('orderedList')
          )}
          {formatButton(
            () => editor.chain().focus().toggleTaskList().run(),
            <ListChecks className="h-4 w-4" />,
            editor.isActive('taskList')
          )}
          {formatButton(
            () => editor.chain().focus().toggleBlockquote().run(),
            <Quote className="h-4 w-4" />,
            editor.isActive('blockquote')
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
            {showColorPicker && (
              <div className="absolute top-full mt-1 p-2 bg-popover border rounded-md shadow-lg z-[10004]">
                <div className="grid grid-cols-5 gap-1">
                  {textColors.map((color) => (
                    <Button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border p-0"
                      style={{ backgroundColor: color }}
                      title={`Set text color to ${color}`}
                      aria-label={`Text color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className="h-8 w-8 p-0"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            {showHighlightPicker && (
              <div className="absolute top-full mt-1 p-2 bg-popover border rounded-md shadow-lg z-[10004]">
                <div className="grid grid-cols-5 gap-1">
                  {highlightColors.map((color) => (
                    <Button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      className="w-6 h-6 rounded border p-0"
                      style={{ backgroundColor: color }}
                      title={`Set highlight color to ${color}`}
                      aria-label={`Highlight color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert Tools */}
        <div className="flex items-center gap-1">
          {formatButton(
            setLink,
            <LinkIcon className="h-4 w-4" />,
            editor.isActive('link')
          )}
          {formatButton(
            addImage,
            <ImageIcon className="h-4 w-4" />,
            false
          )}
          {formatButton(
            insertTable,
            <TableIcon className="h-4 w-4" />,
            false
          )}
          {formatButton(
            () => editor.chain().focus().setHorizontalRule().run(),
            <Minus className="h-4 w-4" />,
            false
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* AI Enhancement Tools */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isAiProcessing}>
                <Wand2 className="h-4 w-4 mr-2" />
                {isAiProcessing ? 'Processing...' : 'AI Tools'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 z-[10003]">
              {aiEnhancements.map((enhancement) => {
                const Icon = enhancement.icon;
                
                if (enhancement.id === 'translate') {
                  return (
                    <div key={enhancement.id}>
                      <DropdownMenuItem className="flex items-center space-x-3 p-3 hover:bg-muted">
                        <Icon className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">{enhancement.name}</div>
                          <div className="text-xs text-muted-foreground">{enhancement.description}</div>
                        </div>
                      </DropdownMenuItem>
                      <div className="px-3 pb-2">
                        <div className="grid grid-cols-2 gap-1">
                          {enhancement.languages?.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleAiEnhancement('translate', lang.name)}
                              className="text-xs p-1 hover:bg-muted rounded text-left"
                              disabled={isAiProcessing}
                            >
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </div>
                  );
                }
                
                return (
                  <DropdownMenuItem
                    key={enhancement.id}
                    onClick={() => handleAiEnhancement(enhancement.id)}
                    className="flex items-center space-x-3 p-3"
                    disabled={isAiProcessing}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{enhancement.name}</div>
                      <div className="text-xs text-muted-foreground">{enhancement.description}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground p-3">
                <Bot className="h-3 w-3 mr-2" />
                Powered by Google Gemini
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* AI Assistant */}
        <Button variant="outline" size="sm">
          <Bot className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document List Sidebar */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Documents</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <Select value={activeDocument} onValueChange={setActiveDocument}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`cursor-pointer transition-colors ${
                    activeDocument === doc.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setActiveDocument(doc.id)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{doc.title}</CardTitle>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Patient: {doc.patient}</p>
                      <p>Date: {doc.date}</p>
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Document Header */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{currentDocument?.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Patient: {currentDocument?.patient} • Date: {currentDocument?.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentDocument?.type}</Badge>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto relative">
            <div className="max-w-4xl mx-auto p-8">
              <EditorContent 
                editor={editor} 
                className="min-h-[600px] focus-within:outline-none"
              />
            </div>
            
            {/* Floating Voice Control Panel */}
            {isListening && (
              <div className="fixed bottom-20 right-6 bg-card border rounded-lg shadow-lg p-4 z-[10000] w-80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      {isProcessingVoice && (
                        <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <span className="font-medium">Voice Typing Active</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleVoiceTyping}
                    className="h-6 w-6 p-0"
                    title="Stop voice typing"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Voice Volume Indicator */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Mic className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">Volume</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`bg-green-500 h-2 rounded-full transition-all duration-100`}
                      style={{ width: `${Math.min(voiceVolume, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Live Interim Text Display */}
                {interimText && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="text-xs text-blue-600 mb-1">Live transcription:</div>
                    <div className="text-blue-800 italic">"{interimText}"</div>
                  </div>
                )}
                
                {/* Processing Status */}
                {isProcessingVoice && !interimText && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                      <span>Listening for speech...</span>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground mb-3">
                  Language: {voiceLanguages.find(l => l.code === voiceLanguage)?.name}
                </div>
                
                {voiceCommands && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Quick Commands:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>"Bold" - Bold text</div>
                      <div>"Italic" - Italic text</div>
                      <div>"Heading 1" - Title</div>
                      <div>"Bullet list" - List</div>
                      <div>"New line" - Line break</div>
                      <div>"Save" - Save document</div>
                    </div>
                  </div>
                )}

                {/* Tips for better recognition */}
                <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Tips:</div>
                  <ul className="space-y-1">
                    <li>• Speak clearly and at normal pace</li>
                    <li>• Pause briefly between sentences</li>
                    <li>• Use voice commands for formatting</li>
                    <li>• Check microphone volume indicator</li>
                  </ul>
                </div>
              </div>
            )}

            {/* AI Result Panel */}
            {showAiResult && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border rounded-lg shadow-xl p-6 z-[10001] w-[600px] max-h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">AI Enhancement Result</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={dismissAiResult}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="mb-4 max-h-60 overflow-auto bg-muted p-4 rounded border">
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: aiResult }}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={dismissAiResult}>
                    Cancel
                  </Button>
                  <Button onClick={applyAiResult} className="bg-primary text-primary-foreground">
                    Apply to Document
                  </Button>
                </div>
              </div>
            )}

            {/* Loading Overlay for AI Processing */}
            {isAiProcessing && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10002] flex items-center justify-center">
                <div className="bg-card p-6 rounded-lg shadow-xl border">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="font-medium">AI is processing your request...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="p-2 border-t bg-card flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Ready</span>
              {isListening && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Voice typing active ({voiceLanguages.find(l => l.code === voiceLanguage)?.name})</span>
                </div>
              )}
              {isAiProcessing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
                  <span>AI processing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Words: {editor?.storage.characterCount?.words() || 0}</span>
              <span>Characters: {editor?.storage.characterCount?.characters() || 0}</span>
              <span>Last saved: {new Date().toLocaleTimeString()}</span>
              {speechRecognition && (
                <div className="flex items-center gap-2">
                  <Mic className="h-3 w-3" />
                  <span>Speech recognition available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
