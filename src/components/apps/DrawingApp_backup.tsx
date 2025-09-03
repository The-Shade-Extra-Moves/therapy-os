import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Paintbrush, Pen, Eraser, Square, Circle as CircleIcon, Triangle as TriangleIcon,
  Type, Palette, Layers, Undo2, Redo2, Save, Download, 
  Eye, EyeOff, Lock, Unlock, Trash2, Plus, Minus,
  Heart, Star, Sun,
  Brain, Lightbulb, Wand2, Sparkles, FileText,
  ZoomIn, ZoomOut, RotateCcw, MousePointer, Share2,
  FolderOpen, PaintBucket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import './DrawingApp.css';

// Drawing tool types
type DrawingTool = 'pen' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'text' | 'bucket';

// Point interface for drawing paths
interface Point {
  x: number;
  y: number;
}

// Drawing state interface
interface DrawingState {
  imageData: ImageData | null;
}

// Color palettes
const therapyColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

const moodColors = [
  '#FF4757', '#FF6348', '#FF7675', '#FDCB6E', '#6C5CE7',
  '#A29BFE', '#74B9FF', '#0984E3', '#00B894', '#00CEC9'
];

// Therapy templates
const therapyTemplates = [
  { 
    id: 'mandala', 
    name: 'Mindfulness Mandala', 
    icon: Star,
    description: 'Circular template for mindful drawing' 
  },
  { 
    id: 'emotion-wheel', 
    name: 'Emotion Wheel', 
    icon: Heart,
    description: 'Template for exploring emotions' 
  },
  { 
    id: 'thought-bubble', 
    name: 'Thought Bubbles', 
    icon: Brain,
    description: 'Express thoughts and feelings' 
  },
  { 
    id: 'safe-space', 
    name: 'Safe Space', 
    icon: Sun,
    description: 'Design your ideal safe space' 
  }
];

// Stickers and emojis
const therapyStickers = [
  { emoji: '😊', category: 'emotions' },
  { emoji: '😢', category: 'emotions' },
  { emoji: '😡', category: 'emotions' },
  { emoji: '😰', category: 'emotions' },
  { emoji: '🥰', category: 'emotions' },
  { emoji: '💖', category: 'symbols' },
  { emoji: '⭐', category: 'symbols' },
  { emoji: '🌈', category: 'symbols' },
  { emoji: '🦋', category: 'nature' },
  { emoji: '🌸', category: 'nature' },
  { emoji: '🏠', category: 'objects' },
  { emoji: '👨‍👩‍👧‍👦', category: 'people' }
];

export const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [history, setHistory] = useState<DrawingState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('tools');
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

  // Canvas initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set initial canvas background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    setCtx(context);
    
    // Save initial state
    const initialState = { imageData: context.getImageData(0, 0, canvas.width, canvas.height) };
    setHistory([initialState]);
    setHistoryIndex(0);
    
    // Create preview canvas for shape tools
    const preview = document.createElement('canvas');
    preview.width = canvas.width;
    preview.height = canvas.height;
    setPreviewCanvas(preview);

    toast.success("Canvas ready! Start creating!");
  }, []);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  // Save current canvas state to history
  const saveToHistory = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newState = { imageData };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [ctx, historyIndex]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (!ctx || !canvasRef.current || historyIndex <= 0) return;
    
    const prevState = history[historyIndex - 1];
    if (prevState.imageData) {
      ctx.putImageData(prevState.imageData, 0, 0);
      setHistoryIndex(prev => prev - 1);
    }
  }, [ctx, history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (!ctx || !canvasRef.current || historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    if (nextState.imageData) {
      ctx.putImageData(nextState.imageData, 0, 0);
      setHistoryIndex(prev => prev + 1);
    }
  }, [ctx, history, historyIndex]);

  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    
    const point = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(point);
    
    if (activeTool === 'pen' || activeTool === 'brush') {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      setCurrentPath([point]);
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [ctx, activeTool, brushSize, getCanvasCoordinates]);

  // Continue drawing
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'pen' || activeTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = opacity / 100;
      
      if (activeTool === 'brush') {
        ctx.shadowBlur = 2;
        ctx.shadowColor = activeColor;
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      
      setCurrentPath(prev => [...prev, point]);
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (startPoint && (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line')) {
      // Show preview for shape tools
      drawShapePreview(startPoint, point);
    }
  }, [isDrawing, ctx, activeTool, activeColor, brushSize, opacity, startPoint, getCanvasCoordinates]);

  // Draw shape preview
  const drawShapePreview = useCallback((start: Point, current: Point) => {
    if (!ctx || !canvasRef.current || !previewCanvas) return;
    
    // Clear canvas and redraw from history
    if (history[historyIndex]?.imageData) {
      ctx.putImageData(history[historyIndex].imageData, 0, 0);
    }
    
    // Draw preview shape
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = activeColor;
    ctx.fillStyle = activeColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity / 100;
    
    if (activeTool === 'rectangle') {
      const width = current.x - start.x;
      const height = current.y - start.y;
      ctx.strokeRect(start.x, start.y, width, height);
    } else if (activeTool === 'circle') {
      const radius = Math.sqrt(Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (activeTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }
  }, [ctx, activeColor, brushSize, opacity, activeTool, history, historyIndex, previewCanvas]);

  // Stop drawing
  const stopDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    const point = getCanvasCoordinates(e);
    setIsDrawing(false);
    
    if (startPoint && (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line' || activeTool === 'triangle')) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = opacity / 100;
      
      if (activeTool === 'rectangle') {
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if (activeTool === 'triangle') {
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        ctx.beginPath();
        ctx.moveTo(startPoint.x + width / 2, startPoint.y);
        ctx.lineTo(startPoint.x, startPoint.y + height);
        ctx.lineTo(startPoint.x + width, startPoint.y + height);
        ctx.closePath();
        ctx.stroke();
      }
    }
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    
    // Save to history
    saveToHistory();
    setCurrentPath([]);
    setStartPoint(null);
  }, [isDrawing, ctx, activeTool, activeColor, brushSize, opacity, startPoint, getCanvasCoordinates, saveToHistory]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveToHistory();
    toast.success("Canvas cleared!");
  }, [ctx, saveToHistory]);

  // Export canvas as image
  const handleExportCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast.success("Drawing exported!");
  }, []);

  // Save canvas as JSON
  const handleSaveCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const dataURL = canvasRef.current.toDataURL();
    const saveData = {
      image: dataURL,
      timestamp: Date.now(),
      tools: { activeTool, activeColor, brushSize, opacity }
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `drawing-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success("Drawing saved!");
  }, [activeTool, activeColor, brushSize, opacity]);

  // Load canvas from file
  const handleLoadCanvas = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !ctx || !canvasRef.current) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0);
            saveToHistory();
            toast.success("Image loaded!");
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [ctx, saveToHistory]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 500));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  // Add text to canvas
  const addText = useCallback((text: string, x: number, y: number) => {
    if (!ctx) return;
    
    ctx.font = `${brushSize * 4}px Arial`;
    ctx.fillStyle = activeColor;
    ctx.globalAlpha = opacity / 100;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
    saveToHistory();
  }, [ctx, activeColor, brushSize, opacity, saveToHistory]);

  // Add sticker/emoji
  const addSticker = useCallback((emoji: string) => {
    if (!ctx || !canvasRef.current) return;
    
    const x = canvasRef.current.width / 2;
    const y = canvasRef.current.height / 2;
    
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, x, y);
    ctx.textAlign = 'start';
    saveToHistory();
    toast.success('Sticker added!');
  }, [ctx, saveToHistory]);

  // Apply therapy templates
  const applyTemplate = useCallback((templateId: string) => {
    if (!ctx || !canvasRef.current) return;

    // Clear canvas first
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;

    switch (templateId) {
      case 'mandala':
        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Outer circles
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const radius = 120;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, Math.PI * 2);
          ctx.stroke();

          // Petals
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -35, 15, 35, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        break;

      case 'emotion-wheel':
        const emotions = ['Happy', 'Sad', 'Angry', 'Calm', 'Excited', 'Worried', 'Love', 'Fear'];
        const wheelRadius = 150;

        // Center circle
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('My Emotions', centerX, centerY);

        // Emotion sectors
        emotions.forEach((emotion, index) => {
          const angle = (index * Math.PI * 2) / emotions.length;
          const x = centerX + (wheelRadius - 50) * Math.cos(angle);
          const y = centerY + (wheelRadius - 50) * Math.sin(angle);

          ctx.strokeStyle = therapyColors[index % therapyColors.length];
          ctx.fillStyle = therapyColors[index % therapyColors.length];
          ctx.globalAlpha = 0.3;
          
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.globalAlpha = 1;
          ctx.fillStyle = therapyColors[index % therapyColors.length];
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(emotion, x, y + 5);
        });
        break;

      case 'thought-bubble':
        const bubbles = [
          { x: centerX - 200, y: centerY - 100, size: 80, text: 'What I think...' },
          { x: centerX, y: centerY - 150, size: 100, text: 'What I feel...' },
          { x: centerX + 200, y: centerY - 50, size: 90, text: 'What I want...' }
        ];

        bubbles.forEach((bubble, index) => {
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(bubble.text, bubble.x, bubble.y);

          // Connecting bubbles
          if (index < bubbles.length - 1) {
            for (let i = 1; i <= 3; i++) {
              ctx.fillStyle = '#ddd';
              ctx.globalAlpha = 0.6;
              ctx.beginPath();
              ctx.arc(bubble.x + i * 30, bubble.y + i * 10, 8 - i * 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
        break;

      case 'safe-space':
        // House outline
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        
        // Main house
        ctx.strokeRect(centerX - 100, centerY - 75, 200, 150);
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 75);
        ctx.lineTo(centerX, centerY - 155);
        ctx.lineTo(centerX + 120, centerY - 75);
        ctx.stroke();
        
        // Door
        ctx.strokeRect(centerX - 30, centerY + 5, 60, 70);
        
        // Windows
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 80, centerY - 45, 40, 40);
        ctx.strokeRect(centerX + 40, centerY - 45, 40, 40);
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('My Safe Space', centerX, centerY + 110);
        break;
    }
    
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
    saveToHistory();
    toast.success(`${templateId.charAt(0).toUpperCase() + templateId.slice(1)} template applied!`);
  }, [ctx, saveToHistory]);

  // AI suggestion generator
  const generateAISuggestion = useCallback(() => {
    const suggestions = [
      "Try using warmer colors to express comfort and safety",
      "Consider adding more circular shapes for a calming effect", 
      "The composition looks balanced - you might add a focal point",
      "Cool colors could help express the emotions you're exploring",
      "This drawing shows great progress in emotional expression",
      "Consider adding texture with different brush sizes",
      "Symmetrical patterns can create a sense of calm",
      "Express movement with flowing lines"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    toast.info(randomSuggestion);
  }, []);

  // Update tool behavior
  const updateCanvasTab = useCallback(() => {
    setCanvasTabs(prev => prev.map(tab => 
      tab.id === activeTab 
        ? { ...tab, lastModified: new Date() }
        : tab
    ));
  }, [activeTab]);

  const handleToolClick = useCallback((tool: DrawingTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    // Reset drawing mode first
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false;

    switch (tool) {
      case 'pen':
      case 'brush':
        fabricCanvas.isDrawingMode = true;
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = activeColor;
          fabricCanvas.freeDrawingBrush.width = brushSize;
        }
        break;
      case 'eraser':
        fabricCanvas.isDrawingMode = true;
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = '#ffffff';
          fabricCanvas.freeDrawingBrush.width = brushSize;
        }
        break;
      case 'select':
        fabricCanvas.selection = true;
        fabricCanvas.defaultCursor = 'default';
        break;
      case 'rectangle':
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 100,
          opacity: opacity / 100
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        break;
      case 'circle':
        const circle = new fabric.Circle({
          left: 100,
          top: 100,
          fill: activeColor,
          radius: 50,
          opacity: opacity / 100
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        break;
      case 'triangle':
        const triangle = new fabric.Triangle({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 100,
          opacity: opacity / 100
        });
        fabricCanvas.add(triangle);
        fabricCanvas.setActiveObject(triangle);
        break;
      case 'text':
        const text = new fabric.IText('Click to edit', {
          left: 100,
          top: 100,
          fill: activeColor,
          fontSize: 20,
          opacity: opacity / 100
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        break;
      case 'line':
        const line = new fabric.Line([50, 100, 200, 100], {
          left: 100,
          top: 100,
          stroke: activeColor,
          strokeWidth: brushSize,
          opacity: opacity / 100
        });
        fabricCanvas.add(line);
        fabricCanvas.setActiveObject(line);
        break;
    }
    fabricCanvas.renderAll();
  }, [fabricCanvas, activeColor, opacity, brushSize]);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    const prevState = history[historyIndex - 1];
    fabricCanvas.loadFromJSON(prevState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(prev => prev - 1);
    });
  }, [fabricCanvas, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    fabricCanvas.loadFromJSON(nextState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(prev => prev + 1);
    });
  }, [fabricCanvas, history, historyIndex]);

  const handleClearCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast.success("Canvas cleared!");
  }, [fabricCanvas]);

  const handleExportCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast.success("Drawing exported!");
  }, [fabricCanvas]);

  const applyTemplate = useCallback((templateId: string) => {
    if (!fabricCanvas) return;

    // Clear canvas first
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';

    switch (templateId) {
      case 'mandala':
        // Create mandala circles with better positioning
        const centerX = 400;
        const centerY = 300;
        
        // Center circle
        const centerCircle = new fabric.Circle({
          left: centerX - 30,
          top: centerY - 30,
          radius: 30,
          fill: 'transparent',
          stroke: '#ddd',
          strokeWidth: 2,
          opacity: 0.7
        });
        fabricCanvas.add(centerCircle);

        // Outer circles
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const radius = 120;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          const circle = new fabric.Circle({
            left: x - 25,
            top: y - 25,
            radius: 25,
            fill: 'transparent',
            stroke: '#ddd',
            strokeWidth: 2,
            opacity: 0.7
          });
          fabricCanvas.add(circle);

          // Add petals
          const petal = new fabric.Ellipse({
            left: x - 15,
            top: y - 35,
            rx: 15,
            ry: 35,
            fill: 'transparent',
            stroke: '#ddd',
            strokeWidth: 1,
            opacity: 0.5,
            angle: (i * 45)
          });
          fabricCanvas.add(petal);
        }
        break;

      case 'emotion-wheel':
        // Create emotion wheel with sectors
        const emotions = ['Happy', 'Sad', 'Angry', 'Calm', 'Excited', 'Worried', 'Love', 'Fear'];
        const wheelRadius = 150;
        const sectorAngle = 360 / emotions.length;

        emotions.forEach((emotion, index) => {
          const angle = index * sectorAngle;
          const x = 400 + (wheelRadius - 50) * Math.cos((angle * Math.PI) / 180);
          const y = 300 + (wheelRadius - 50) * Math.sin((angle * Math.PI) / 180);

          // Add emotion text
          const text = new fabric.Text(emotion, {
            left: x - 25,
            top: y - 10,
            fontSize: 14,
            fill: therapyColors[index % therapyColors.length],
            textAlign: 'center'
          });
          fabricCanvas.add(text);

          // Add sector circle
          const sector = new fabric.Circle({
            left: x - 30,
            top: y - 30,
            radius: 30,
            fill: therapyColors[index % therapyColors.length],
            opacity: 0.3,
            stroke: therapyColors[index % therapyColors.length],
            strokeWidth: 2
          });
          fabricCanvas.add(sector);
        });

        // Add center circle
        const emotionCenter = new fabric.Circle({
          left: 370,
          top: 270,
          radius: 60,
          fill: 'transparent',
          stroke: '#333',
          strokeWidth: 3
        });
        fabricCanvas.add(emotionCenter);

        const centerText = new fabric.Text('My Emotions', {
          left: 365,
          top: 290,
          fontSize: 12,
          fill: '#333',
          textAlign: 'center'
        });
        fabricCanvas.add(centerText);
        break;

      case 'thought-bubble':
        // Create thought bubbles with connecting lines
        const bubbles = [
          { x: 200, y: 200, size: 80, text: 'What I think...' },
          { x: 400, y: 150, size: 100, text: 'What I feel...' },
          { x: 600, y: 250, size: 90, text: 'What I want...' }
        ];

        bubbles.forEach((bubble, index) => {
          const circle = new fabric.Circle({
            left: bubble.x - bubble.size/2,
            top: bubble.y - bubble.size/2,
            radius: bubble.size/2,
            fill: 'transparent',
            stroke: '#ddd',
            strokeWidth: 2
          });
          fabricCanvas.add(circle);

          const text = new fabric.Text(bubble.text, {
            left: bubble.x - 40,
            top: bubble.y - 10,
            fontSize: 12,
            fill: '#666',
            textAlign: 'center'
          });
          fabricCanvas.add(text);

          // Add smaller connecting bubbles
          if (index < bubbles.length - 1) {
            for (let i = 1; i <= 3; i++) {
              const smallBubble = new fabric.Circle({
                left: bubble.x + (i * 30),
                top: bubble.y + (i * 10),
                radius: 8 - i * 2,
                fill: '#ddd',
                opacity: 0.6
              });
              fabricCanvas.add(smallBubble);
            }
          }
        });
        break;

      case 'safe-space':
        // Create a house template for safe space
        const house = new fabric.Rect({
          left: 300,
          top: 250,
          width: 200,
          height: 150,
          fill: 'transparent',
          stroke: '#8B4513',
          strokeWidth: 3
        });
        fabricCanvas.add(house);

        // Roof
        const roof = new fabric.Triangle({
          left: 280,
          top: 200,
          width: 240,
          height: 80,
          fill: 'transparent',
          stroke: '#8B4513',
          strokeWidth: 3
        });
        fabricCanvas.add(roof);

        // Door
        const door = new fabric.Rect({
          left: 370,
          top: 320,
          width: 60,
          height: 80,
          fill: 'transparent',
          stroke: '#8B4513',
          strokeWidth: 2
        });
        fabricCanvas.add(door);

        // Windows
        const window1 = new fabric.Rect({
          left: 320,
          top: 280,
          width: 40,
          height: 40,
          fill: 'transparent',
          stroke: '#4169E1',
          strokeWidth: 2
        });
        fabricCanvas.add(window1);

        const window2 = new fabric.Rect({
          left: 440,
          top: 280,
          width: 40,
          height: 40,
          fill: 'transparent',
          stroke: '#4169E1',
          strokeWidth: 2
        });
        fabricCanvas.add(window2);

        // Add text
        const safeText = new fabric.Text('My Safe Space', {
          left: 350,
          top: 430,
          fontSize: 16,
          fill: '#333',
          textAlign: 'center'
        });
        fabricCanvas.add(safeText);
        break;
    }
    
    fabricCanvas.renderAll();
    saveCanvasState();
    toast.success(`${templateId.charAt(0).toUpperCase() + templateId.slice(1)} template applied!`);
  }, [fabricCanvas, saveCanvasState]);

  const addSticker = useCallback((emoji: string) => {
    if (!fabricCanvas) return;

    const text = new fabric.Text(emoji, {
      left: 400,
      top: 300,
      fontSize: 48,
      selectable: true,
      hasControls: true,
      hasBorders: true
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    saveCanvasState();
    toast.success('Sticker added!');
  }, [fabricCanvas, saveCanvasState]);

  const handleZoomIn = useCallback(() => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom + 25, 500);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom / 100);
    fabricCanvas.renderAll();
  }, [fabricCanvas, zoom]);

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom - 25, 25);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom / 100);
    fabricCanvas.renderAll();
  }, [fabricCanvas, zoom]);

  const handleSaveCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    const jsonData = fabricCanvas.toJSON();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `drawing-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Drawing saved!");
  }, [fabricCanvas]);

  const handleLoadCanvas = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        fabricCanvas.loadFromJSON(jsonData, () => {
          fabricCanvas.renderAll();
          saveCanvasState();
          toast.success("Drawing loaded!");
        });
      } catch (error) {
        toast.error("Error loading file");
      }
    };
    reader.readAsText(file);
  }, [fabricCanvas, saveCanvasState]);

  const generateAISuggestion = useCallback(() => {
    const suggestions = [
      "Try using warmer colors to express comfort and safety",
      "Consider adding more circular shapes for a calming effect", 
      "The composition looks balanced - you might add a focal point",
      "Cool colors could help express the emotions you're exploring",
      "This drawing shows great progress in emotional expression",
      "Consider adding texture with different brush sizes",
      "Symmetrical patterns can create a sense of calm",
      "Express movement with flowing lines"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    toast.info(randomSuggestion);
  }, []);

  const addNewCanvas = useCallback(() => {
    const newId = Date.now().toString();
    const newTab = {
      id: newId,
      name: `Drawing ${canvasTabs.length + 1}`,
      active: false,
      lastModified: new Date()
    };
    
    setCanvasTabs(prev => [...prev, newTab]);
    setActiveTab(newId);
    
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.renderAll();
      saveCanvasState();
    }
    
    toast.success("New canvas created!");
  }, [canvasTabs.length, fabricCanvas, saveCanvasState]);

  const renderTopToolbar = () => (
    <div className="flex items-center justify-between p-4 drawing-toolbar">
      {/* Canvas Tabs */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
          {canvasTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="text-xs"
            >
              <Paintbrush className="h-3 w-3 mr-1" />
              {tab.name}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={addNewCanvas}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Ready
        </Badge>
      </div>

      {/* Main Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <input
          type="file"
          accept=".json"
          onChange={handleLoadCanvas}
          className="hidden-file-input"
          id="load-canvas-input"
          title="Load drawing file"
          aria-label="Load drawing file"
        />
        <Button variant="outline" size="sm" onClick={() => document.getElementById('load-canvas-input')?.click()}>
          <FolderOpen className="h-4 w-4 mr-1" />
          Open
        </Button>
        <Button variant="outline" size="sm" onClick={handleSaveCanvas}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportCanvas}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2">
          <Label className="text-xs">Zoom:</Label>
          <span className="text-xs text-muted-foreground">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderToolsSidebar = () => (
    <Card className="drawing-sidebar w-80 h-full">
      <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5 m-4">
          <TabsTrigger value="tools" className="text-xs">
            <Paintbrush className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs">
            <Palette className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="layers" className="text-xs">
            <Layers className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <FileText className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            <Brain className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="tools" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Drawing Tools</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={activeTool === 'select' ? "default" : "outline"}
                  className="aspect-square p-0"
                  onClick={() => setActiveTool('select')}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'pen' ? "default" : "outline"}
                  className="aspect-square p-0"
                  onClick={() => handleToolClick('pen')}
                >
                  <Pen className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'brush' ? "default" : "outline"}
                  className="aspect-square p-0"
                  onClick={() => handleToolClick('brush')}
                >
                  <Paintbrush className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'eraser' ? "default" : "outline"}
                  className="aspect-square p-0"
                  onClick={() => handleToolClick('eraser')}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'text' ? "default" : "outline"}
                  className="aspect-square p-0"
                  onClick={() => handleToolClick('text')}
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'fill' ? "default" : "outline"}
                  className="aspect-square p-0"
                  onClick={() => handleToolClick('fill')}
                >
                  <PaintBucket className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Shapes</h4>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    className="aspect-square p-0"
                    onClick={() => handleToolClick('rectangle')}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="aspect-square p-0"
                    onClick={() => handleToolClick('circle')}
                  >
                    <CircleIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="aspect-square p-0"
                    onClick={() => handleToolClick('triangle')}
                  >
                    <TriangleIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="aspect-square p-0"
                    onClick={() => handleToolClick('line')}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Brush Size: {brushSize}px</Label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([value]) => setBrushSize(value)}
                    max={50}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Opacity: {opacity}%</Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={([value]) => setOpacity(value)}
                    max={100}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Colors & Palettes</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm mb-2 block">Current Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => setActiveColor(e.target.value)}
                      className="color-picker-input"
                      title="Choose color"
                      aria-label="Color picker"
                    />
                    <Input
                      value={activeColor}
                      onChange={(e) => setActiveColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Therapy Colors</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {therapyColors.map((color) => (
                      <button
                        key={color}
                        className={`color-palette-button ${
                          activeColor === color ? 'selected' : 'unselected'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColor(color)}
                        title={`Select color ${color}`}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Mood Colors</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {moodColors.map((color) => (
                      <button
                        key={color}
                        className={`color-palette-button ${
                          activeColor === color ? 'selected' : 'unselected'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColor(color)}
                        title={`Select mood color ${color}`}
                        aria-label={`Mood color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Layers</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`flex items-center justify-between p-2 rounded border ${
                        activeLayer === layer.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                          onClick={() => {
                            setLayers(prev => prev.map(l => 
                              l.id === layer.id ? { ...l, visible: !l.visible } : l
                            ));
                          }}
                        >
                          {layer.visible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                        </Button>
                        <span className="text-sm font-medium">{layer.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                        >
                          {layer.locked ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <h3 className="font-semibold">Therapy Templates</h3>
              
              <div className="space-y-3">
                {therapyTemplates.map((template) => (
                  <Card key={template.id} className="p-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <template.icon className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyTemplate(template.id)}
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Stickers & Emojis</h4>
                <div className="grid grid-cols-6 gap-2">
                  {therapyStickers.map((sticker, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="aspect-square p-0 text-lg"
                      onClick={() => addSticker(sticker.emoji)}
                    >
                      {sticker.emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 p-4 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <Switch checked={isAIEnabled} onCheckedChange={setIsAIEnabled} />
              </div>

              {isAIEnabled && (
                <div className="space-y-3">
                  <Card className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">AI Analysis Active</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your drawing shows balanced composition with warm, comforting colors. Consider adding focal elements.
                    </p>
                  </Card>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={generateAISuggestion}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get AI Suggestion
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Auto-Enhance
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Palette className="h-4 w-4 mr-2" />
                      Suggest Colors
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      Therapy Insights
                    </Button>
                  </div>

                  <Card className="p-3">
                    <h5 className="font-medium text-sm mb-2">Recent Insights</h5>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>• Increased use of warm colors shows improved mood</p>
                      <p>• More structured drawings indicate better organization</p>
                      <p>• Regular drawing practice is building confidence</p>
                    </div>
                  </Card>
                </div>
              )}

              {!isAIEnabled && (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">AI Assistant is disabled</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );

  return (
    <div className="drawing-app-container flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="drawing-toolbar flex items-center justify-between p-4">
        {/* Canvas Tools */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Canvas Ready
          </Badge>
        </div>

        {/* Main Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <Redo2 className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <input
            type="file"
            accept="image/*,.json"
            onChange={handleLoadCanvas}
            className="hidden-file-input"
            id="load-canvas-input-main"
            title="Load image or drawing file"
            aria-label="Load file"
          />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('load-canvas-input-main')?.click()}>
            <FolderOpen className="h-4 w-4 mr-1" />
            Open
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCanvas}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCanvas}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Label className="text-xs">Zoom:</Label>
            <span className="text-xs text-muted-foreground">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 flex items-center justify-center canvas-area">
            <div className={`canvas-zoom-container zoom-${zoom}`}>
              <canvas 
                ref={canvasRef} 
                className="drawing-canvas cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={() => setIsDrawing(false)}
              />
              {showGrid && (
                <div className="canvas-grid-overlay">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern
                        id="grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="drawing-status-bar p-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>Tool: {activeTool}</span>
                <span>Size: {brushSize}px</span>
                <span>Color: {activeColor}</span>
                <span>Zoom: {zoom}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Ready to draw</span>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <Card className="drawing-sidebar w-80 h-full">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 m-4">
              <TabsTrigger value="tools" className="text-xs">
                <Paintbrush className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                <Brain className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="tools" className="h-full m-0 p-4 pt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold">Drawing Tools</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activeTool === 'pen' ? "default" : "outline"}
                      className="aspect-square p-0"
                      onClick={() => setActiveTool('pen')}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={activeTool === 'brush' ? "default" : "outline"}
                      className="aspect-square p-0"
                      onClick={() => setActiveTool('brush')}
                    >
                      <Paintbrush className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={activeTool === 'eraser' ? "default" : "outline"}
                      className="aspect-square p-0"
                      onClick={() => setActiveTool('eraser')}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Shapes</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant={activeTool === 'rectangle' ? "default" : "outline"}
                        className="aspect-square p-0"
                        onClick={() => setActiveTool('rectangle')}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeTool === 'circle' ? "default" : "outline"}
                        className="aspect-square p-0"
                        onClick={() => setActiveTool('circle')}
                      >
                        <CircleIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeTool === 'triangle' ? "default" : "outline"}
                        className="aspect-square p-0"
                        onClick={() => setActiveTool('triangle')}
                      >
                        <TriangleIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeTool === 'line' ? "default" : "outline"}
                        className="aspect-square p-0"
                        onClick={() => setActiveTool('line')}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Brush Size: {brushSize}px</Label>
                      <Slider
                        value={[brushSize]}
                        onValueChange={([value]) => setBrushSize(value)}
                        max={50}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Opacity: {opacity}%</Label>
                      <Slider
                        value={[opacity]}
                        onValueChange={([value]) => setOpacity(value)}
                        max={100}
                        min={10}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show Grid</Label>
                    <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="h-full m-0 p-4 pt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold">Colors & Palettes</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm mb-2 block">Current Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={activeColor}
                          onChange={(e) => setActiveColor(e.target.value)}
                          className="color-picker-input"
                          title="Choose color"
                          aria-label="Color picker"
                        />
                        <Input
                          value={activeColor}
                          onChange={(e) => setActiveColor(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">Therapy Colors</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {therapyColors.map((color) => (
                          <button
                            key={color}
                            className={`color-palette-button ${
                              activeColor === color ? 'selected' : 'unselected'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setActiveColor(color)}
                            title={`Select color ${color}`}
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">Mood Colors</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {moodColors.map((color) => (
                          <button
                            key={color}
                            className={`color-palette-button ${
                              activeColor === color ? 'selected' : 'unselected'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setActiveColor(color)}
                            title={`Select mood color ${color}`}
                            aria-label={`Mood color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="h-full m-0 p-4 pt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold">Therapy Templates</h3>
                  
                  <div className="space-y-3">
                    {therapyTemplates.map((template) => (
                      <Card key={template.id} className="p-3 cursor-pointer hover:bg-muted/50 template-card">
                        <div className="flex items-center space-x-3">
                          <template.icon className="h-8 w-8 text-primary" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => applyTemplate(template.id)}
                          >
                            Apply
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Stickers & Emojis</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {therapyStickers.map((sticker, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="aspect-square p-0 text-lg"
                          onClick={() => addSticker(sticker.emoji)}
                        >
                          {sticker.emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="h-full m-0 p-4 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI Assistant</h3>
                    <Switch checked={isAIEnabled} onCheckedChange={setIsAIEnabled} />
                  </div>

                  {isAIEnabled && (
                    <div className="space-y-3">
                      <Card className="p-3 ai-analysis-active">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium">Canvas Analysis Active</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ready to provide insights and suggestions for your creative journey.
                        </p>
                      </Card>

                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={generateAISuggestion}
                        >
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Get AI Suggestion
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Palette className="h-4 w-4 mr-2" />
                          Suggest Colors
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Brain className="h-4 w-4 mr-2" />
                          Therapy Insights
                        </Button>
                      </div>

                      <Card className="p-3">
                        <h5 className="font-medium text-sm mb-2">Canvas Tips</h5>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p>• Use the pen tool for precise lines</p>
                          <p>• Try the brush tool for softer strokes</p>
                          <p>• Adjust brush size and opacity for variety</p>
                          <p>• Apply templates for guided activities</p>
                        </div>
                      </Card>
                    </div>
                  )}

                  {!isAIEnabled && (
                    <div className="text-center py-8 ai-disabled">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">AI Assistant is disabled</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="default"
          size="icon"
          className="floating-action-button rounded-full"
          onClick={handleClearCanvas}
          title="Clear canvas"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="floating-action-button rounded-full"
          onClick={handleExportCanvas}
          title="Export drawing"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DrawingApp;