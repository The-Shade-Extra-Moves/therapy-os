import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Line, IText, FabricImage } from 'fabric';
import { 
  Paintbrush, Pen, Eraser, Square, Circle as CircleIcon, Triangle as TriangleIcon,
  Type, Palette, Layers, Undo2, Redo2, Save, Upload, Download, 
  Grid3X3, Eye, EyeOff, Lock, Unlock, Copy, Trash2, Plus, Minus,
  Settings, Sticker, Smile, Heart, Star, Sun, Moon, Cloud,
  Brain, Lightbulb, Wand2, Sparkles, Image as ImageIcon, FileText,
  ZoomIn, ZoomOut, RotateCcw, Move, Hand, MousePointer, Share2,
  FolderOpen, FileImage, Printer, PaintBucket, Pipette, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

// Drawing tool types
type DrawingTool = 'select' | 'pen' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'text' | 'fill';

// Layer interface
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  objects: any[];
}

// Canvas tabs interface
interface CanvasTab {
  id: string;
  name: string;
  active: boolean;
  lastModified: Date;
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
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Background', visible: true, locked: false, opacity: 100, objects: [] }
  ]);
  const [activeLayer, setActiveLayer] = useState('1');
  const [canvasTabs, setCanvasTabs] = useState<CanvasTab[]>([
    { id: '1', name: 'New Drawing', active: true, lastModified: new Date() }
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sidebarTab, setSidebarTab] = useState('tools');

  // Canvas initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    // Initialize drawing brushes
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);
    toast.success("Canvas ready! Start creating!");

    // Set up event listeners
    canvas.on('path:created', () => {
      updateCanvasTab();
    });

    canvas.on('object:added', () => {
      updateCanvasTab();
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update tool behavior
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'pen' || activeTool === 'brush' || activeTool === 'eraser';
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }

    // Update selection mode
    fabricCanvas.selection = activeTool === 'select';
    fabricCanvas.defaultCursor = activeTool === 'select' ? 'default' : 'crosshair';

  }, [activeTool, activeColor, brushSize, fabricCanvas]);

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

    switch (tool) {
      case 'rectangle':
        const rect = new Rect({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 100,
          opacity: opacity / 100
        });
        fabricCanvas.add(rect);
        break;
      case 'circle':
        const circle = new Circle({
          left: 100,
          top: 100,
          fill: activeColor,
          radius: 50,
          opacity: opacity / 100
        });
        fabricCanvas.add(circle);
        break;
      case 'triangle':
        const triangle = new Triangle({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 100,
          opacity: opacity / 100
        });
        fabricCanvas.add(triangle);
        break;
      case 'text':
        const text = new IText('Click to edit', {
          left: 100,
          top: 100,
          fill: activeColor,
          fontSize: 20,
          opacity: opacity / 100
        });
        fabricCanvas.add(text);
        break;
    }
  }, [fabricCanvas, activeColor, opacity]);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

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

    switch (templateId) {
      case 'mandala':
        // Create mandala circles
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const radius = 150;
          const x = 400 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);
          
          const circle = new Circle({
            left: x - 25,
            top: y - 25,
            radius: 25,
            fill: 'transparent',
            stroke: '#ddd',
            strokeWidth: 2,
            opacity: 0.7
          });
          fabricCanvas.add(circle);
        }
        break;
      case 'emotion-wheel':
        // Create emotion wheel segments
        const emotions = ['Happy', 'Sad', 'Angry', 'Calm', 'Excited', 'Worried'];
        emotions.forEach((emotion, index) => {
          const text = new IText(emotion, {
            left: 300 + index * 60,
            top: 280,
            fontSize: 16,
            fill: therapyColors[index % therapyColors.length]
          });
          fabricCanvas.add(text);
        });
        break;
      case 'thought-bubble':
        // Create thought bubbles
        for (let i = 0; i < 3; i++) {
          const bubble = new Circle({
            left: 200 + i * 200,
            top: 200,
            radius: 80,
            fill: 'transparent',
            stroke: '#ddd',
            strokeWidth: 2
          });
          fabricCanvas.add(bubble);
        }
        break;
    }
    
    fabricCanvas.renderAll();
    toast.success(`${templateId} template applied!`);
  }, [fabricCanvas]);

  const addSticker = useCallback((emoji: string) => {
    if (!fabricCanvas) return;

    const text = new IText(emoji, {
      left: 400,
      top: 300,
      fontSize: 48,
      selectable: true
    });
    
    fabricCanvas.add(text);
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  const generateAISuggestion = useCallback(() => {
    const suggestions = [
      "Try using warmer colors to express comfort and safety",
      "Consider adding more circular shapes for a calming effect",
      "The composition looks balanced - you might add a focal point",
      "Cool colors could help express the emotions you're exploring",
      "This drawing shows great progress in emotional expression"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    toast.info(randomSuggestion);
  }, []);

  const renderTopToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-primary/10">
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
          <Button variant="ghost" size="sm" className="text-xs">
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
        <Button variant="outline" size="sm" onClick={handleUndo}>
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button variant="outline" size="sm">
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-1" />
          Open
        </Button>
        <Button variant="outline" size="sm">
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
          <Button variant="outline" size="sm">
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm">
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderToolsSidebar = () => (
    <Card className="w-80 h-full bg-background/95 backdrop-blur-md border-primary/10">
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
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
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
                        className={`w-8 h-8 rounded border-2 ${
                          activeColor === color ? 'border-primary' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColor(color)}
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
                        className={`w-8 h-8 rounded border-2 ${
                          activeColor === color ? 'border-primary' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColor(color)}
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
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top Toolbar */}
      {renderTopToolbar()}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="relative">
              <canvas 
                ref={canvasRef} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg bg-white"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
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
          <div className="bg-background/95 backdrop-blur-sm border-t border-primary/10 p-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>Tool: {activeTool}</span>
                <span>Size: {brushSize}px</span>
                <span>Zoom: {zoom}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Auto-save: On</span>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {renderToolsSidebar()}
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={handleClearCanvas}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={handleExportCanvas}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DrawingApp;