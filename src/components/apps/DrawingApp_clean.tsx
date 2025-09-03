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

// Types
type DrawingTool = 'pen' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'text';

interface Point {
  x: number;
  y: number;
}

interface AISuggestion {
  id: string;
  text: string;
  timestamp: Date;
  type: 'creative' | 'technical' | 'therapeutic';
}

export default function DrawingApp() {
  // Canvas setup
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  
  // Canvas properties
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [layers, setLayers] = useState(['Background']);
  const [activeLayer, setActiveLayer] = useState(0);
  
  // History management
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // AI features
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const aiAnalysisTasksRef = useRef<NodeJS.Timeout[]>([]);
  
  // Color palettes
  const defaultColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];
  const therapyColors = ['#FFB6C1', '#87CEEB', '#98FB98', '#F0E68C', '#DDA0DD', '#F4A460', '#20B2AA', '#FFE4E1'];
  
  // Therapy stickers
  const therapyStickers = ['😊', '😢', '😠', '😱', '😍', '🤗', '🧘‍♀️', '🌸', '🌈', '⭐', '💚', '🕊️'];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setCtx(context);
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set default background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  // Save to history
  const saveToHistory = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [ctx, history, historyIndex]);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (!ctx || !canvasRef.current || historyIndex <= 0) return;
    
    const prevState = history[historyIndex - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistoryIndex(prev => prev - 1);
  }, [ctx, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!ctx || !canvasRef.current || historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    ctx.putImageData(nextState, 0, 0);
    setHistoryIndex(prev => prev + 1);
  }, [ctx, history, historyIndex]);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;

    const point = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPath([point]);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity / 100;
    
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
    }

    if (activeTool === 'pen' || activeTool === 'brush' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  }, [ctx, activeTool, activeColor, brushSize, opacity, getCanvasCoordinates]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !startPoint) return;

    const currentPoint = getCanvasCoordinates(e);
    
    if (activeTool === 'pen' || activeTool === 'brush' || activeTool === 'eraser') {
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      setCurrentPath(prev => [...prev, currentPoint]);
    }
  }, [isDrawing, ctx, activeTool, startPoint, getCanvasCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !ctx || !startPoint) return;
    
    setIsDrawing(false);
    
    // Draw shapes when mouse is released
    if (activeTool !== 'pen' && activeTool !== 'brush' && activeTool !== 'eraser') {
      const currentPoint = getCanvasCoordinates(event as any);
      const width = currentPoint.x - startPoint.x;
      const height = currentPoint.y - startPoint.y;
      
      ctx.beginPath();
      
      switch (activeTool) {
        case 'rectangle':
          ctx.rect(startPoint.x, startPoint.y, width, height);
          ctx.stroke();
          break;
        case 'circle':
          const radius = Math.sqrt(width * width + height * height) / 2;
          const centerX = startPoint.x + width / 2;
          const centerY = startPoint.y + height / 2;
          ctx.arc(centerX, centerY, Math.abs(radius), 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'triangle':
          ctx.moveTo(startPoint.x + width / 2, startPoint.y);
          ctx.lineTo(startPoint.x, startPoint.y + height);
          ctx.lineTo(startPoint.x + width, startPoint.y + height);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'line':
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(currentPoint.x, currentPoint.y);
          ctx.stroke();
          break;
      }
    }
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    
    // Save to history
    saveToHistory();
    setCurrentPath([]);
    setStartPoint(null);
  }, [isDrawing, ctx, activeTool, startPoint, saveToHistory]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveToHistory();
    toast.success("Canvas cleared!");
  }, [ctx, saveToHistory]);

  // Export canvas
  const handleExportCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast.success("Drawing exported!");
  }, []);

  // Generate AI suggestion
  const generateAISuggestion = useCallback(() => {
    if (!aiEnabled) {
      toast.error("AI assistant is disabled");
      return;
    }
    
    const suggestions = [
      "Try using warm colors to express comfort and safety",
      "Consider adding flowing lines to represent your thoughts",
      "Use the mandala template for mindfulness practice",
      "Express your current emotions through color choices",
      "Add patterns or textures to create depth",
      "Try the thought bubbles to organize your ideas",
      "Use different brush sizes for varied expression",
      "Consider symmetrical patterns for a calming effect"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAiSuggestions(prev => [...prev, {
      id: Date.now().toString(),
      text: randomSuggestion,
      timestamp: new Date(),
      type: 'therapeutic'
    }]);
    
    toast.success("New AI suggestion added!");
  }, [aiEnabled]);

  // Apply therapy templates
  const applyTemplate = useCallback((templateId: string) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear canvas first
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2;
    
    switch (templateId) {
      case 'mandala':
        // Draw mandala pattern
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Outer petals
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const x = centerX + Math.cos(angle) * 100;
          const y = centerY + Math.sin(angle) * 100;
          
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
        
      case 'emotion-wheel':
        // Draw emotion wheel sectors
        const emotions = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Calm'];
        const colors = ['#FFD700', '#4169E1', '#FF0000', '#800080', '#FFA500', '#008000'];
        
        emotions.forEach((emotion, index) => {
          const angle = (index * Math.PI * 2) / emotions.length;
          const x = centerX + Math.cos(angle) * 80;
          const y = centerY + Math.sin(angle) * 80;
          
          ctx.fillStyle = colors[index];
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          
          // Add emotion text
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(emotion, x, y + 50);
        });
        break;
        
      case 'thought-bubbles':
        // Draw thought bubbles
        for (let i = 0; i < 3; i++) {
          const x = 200 + i * 200;
          const y = centerY + Math.sin(i) * 50;
          
          ctx.beginPath();
          ctx.arc(x, y, 60, 0, 2 * Math.PI);
          ctx.stroke();
          
          // Add smaller bubbles
          for (let j = 1; j <= 3; j++) {
            ctx.beginPath();
            ctx.arc(x - 30 - j * 15, y + 30 + j * 10, 8 - j * 2, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
        break;
        
      case 'safe-space':
        // Draw house outline
        ctx.strokeRect(centerX - 100, centerY - 50, 200, 150);
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 50);
        ctx.lineTo(centerX, centerY - 120);
        ctx.lineTo(centerX + 120, centerY - 50);
        ctx.stroke();
        
        // Door
        ctx.strokeRect(centerX - 20, centerY + 50, 40, 50);
        
        // Windows
        ctx.strokeRect(centerX - 80, centerY - 20, 30, 30);
        ctx.strokeRect(centerX + 50, centerY - 20, 30, 30);
        break;
    }
    
    saveToHistory();
    toast.success(`${templateId.charAt(0).toUpperCase() + templateId.slice(1)} template applied!`);
  }, [ctx, activeColor, saveToHistory]);

  // Add sticker
  const addSticker = useCallback((emoji: string) => {
    if (!ctx) return;
    
    const x = Math.random() * 600 + 100;
    const y = Math.random() * 400 + 100;
    
    ctx.font = '48px Arial';
    ctx.fillText(emoji, x, y);
    
    saveToHistory();
    toast.success("Sticker added!");
  }, [ctx, saveToHistory]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 500));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  // Touch event handler
  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    if (e.type === 'touchstart') {
      startDrawing(mouseEvent as any);
    } else if (e.type === 'touchmove') {
      draw(mouseEvent as any);
    }
  }, [startDrawing, draw]);

  // Template data
  const therapyTemplates = [
    { id: 'mandala', name: 'Mandala', icon: '🌸', description: 'Circular pattern for meditation' },
    { id: 'emotion-wheel', name: 'Emotion Wheel', icon: '😊', description: 'Explore your feelings' },
    { id: 'thought-bubbles', name: 'Thought Bubbles', icon: '💭', description: 'Organize your thoughts' },
    { id: 'safe-space', name: 'Safe Space', icon: '🏠', description: 'Draw your comfort zone' }
  ];

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
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Tool Buttons */}
          {[
            { tool: 'pen' as DrawingTool, icon: Pen, label: 'Pen' },
            { tool: 'brush' as DrawingTool, icon: Paintbrush, label: 'Brush' },
            { tool: 'eraser' as DrawingTool, icon: Eraser, label: 'Eraser' },
            { tool: 'rectangle' as DrawingTool, icon: Square, label: 'Rectangle' },
            { tool: 'circle' as DrawingTool, icon: CircleIcon, label: 'Circle' },
            { tool: 'triangle' as DrawingTool, icon: TriangleIcon, label: 'Triangle' },
            { tool: 'text' as DrawingTool, icon: Type, label: 'Text' }
          ].map(({ tool, icon: Icon, label }) => (
            <Button
              key={tool}
              variant={activeTool === tool ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool(tool)}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* File Operations */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <Redo2 className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" size="sm" onClick={handleClearCanvas}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportCanvas}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
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
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
                onTouchEnd={stopDrawing}
              />
              {showGrid && (
                <div className="canvas-grid-overlay grid-pattern" />
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="drawing-status-bar p-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Zoom:</Label>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-sm min-w-[3rem] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Ready • Tool: {activeTool} • Size: {brushSize}px
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 drawing-sidebar border-l">
          <Tabs defaultValue="colors" className="h-full">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="brush">Brush</TabsTrigger>
                <TabsTrigger value="stickers">Stickers</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Colors Tab */}
              <TabsContent value="colors" className="h-full m-0 p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Current Color</Label>
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => setActiveColor(e.target.value)}
                      className="color-picker-input"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Default Colors</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {defaultColors.map((color) => (
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
                    <Label className="text-sm font-medium mb-2 block">Therapy Colors</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {therapyColors.map((color) => (
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
              </TabsContent>

              {/* Brush Tab */}
              <TabsContent value="brush" className="h-full m-0 p-4">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Brush Size: {brushSize}px</Label>
                    <Slider
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Opacity: {opacity}%</Label>
                    <Slider
                      value={[opacity]}
                      onValueChange={(value) => setOpacity(value[0])}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Show Grid</Label>
                      <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Show Rulers</Label>
                      <Switch checked={showRulers} onCheckedChange={setShowRulers} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Stickers Tab */}
              <TabsContent value="stickers" className="h-full m-0 p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Therapy Stickers</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {therapyStickers.map((sticker) => (
                        <Button
                          key={sticker}
                          variant="outline"
                          size="sm"
                          onClick={() => addSticker(sticker)}
                          className="h-12 text-2xl p-0"
                          title={`Add ${sticker} sticker`}
                        >
                          {sticker}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Templates</Label>
                    <div className="space-y-2">
                      {therapyTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          onClick={() => applyTemplate(template.id)}
                          className="w-full justify-start"
                        >
                          <span className="mr-2">{template.icon}</span>
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ai" className="h-full m-0 p-4">
                <div className="space-y-4 h-full">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">AI Assistant</Label>
                    <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                  </div>

                  <Button 
                    onClick={generateAISuggestion}
                    disabled={!aiEnabled}
                    className="w-full"
                    size="sm"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Get Suggestion
                  </Button>

                  <ScrollArea className="h-[calc(100%-8rem)]">
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{suggestion.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                      {aiSuggestions.length === 0 && (
                        <div className="text-center py-8">
                          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No suggestions yet. Click above to get started!
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
