import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Play,
  Square,
  Save,
  FolderOpen,
  Download,
  Upload,
  Code,
  Blocks,
  Eye,
  Settings,
  History,
  Trash2,
  Copy,
  Undo,
  Redo,
  Plus,
  Bot,
  Timer,
  Brain,
  Heart,
  Activity,
  FileText,
  Mic,
  Video,
  Image,
  Volume2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Zap,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  MessageCircle,
  Award,
  Lightbulb,
  Sparkles
} from 'lucide-react';

interface TherapyBlock {
  id: string;
  type: 'exercise' | 'assessment' | 'decision' | 'timer' | 'journal' | 'media' | 'notification' | 'ai-assistant' | 'loop' | 'analytics';
  name: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
  data: Record<string, any>;
  connections: string[];
  isCompleted?: boolean;
}

interface TherapyTemplate {
  id: string;
  name: string;
  category: 'CBT' | 'Mindfulness' | 'PTSD' | 'Anxiety' | 'Depression' | 'Custom';
  description: string;
  blocks: TherapyBlock[];
  estimatedDuration: number;
}

interface SimulationState {
  isRunning: boolean;
  currentBlock: string | null;
  completedBlocks: string[];
  sessionData: Record<string, any>;
  startTime?: Date;
}

const therapyBlockTypes = [
  { 
    type: 'exercise', 
    name: 'Exercise', 
    icon: <Activity className="w-4 h-4" />, 
    category: 'Core',
    color: 'bg-blue-500',
    description: 'Mindfulness, breathing, or physical exercises'
  },
  { 
    type: 'assessment', 
    name: 'Assessment', 
    icon: <CheckCircle className="w-4 h-4" />, 
    category: 'Core',
    color: 'bg-green-500',
    description: 'Mood scales, questionnaires, evaluations'
  },
  { 
    type: 'decision', 
    name: 'Decision', 
    icon: <AlertCircle className="w-4 h-4" />, 
    category: 'Logic',
    color: 'bg-yellow-500',
    description: 'Conditional branching based on responses'
  },
  { 
    type: 'timer', 
    name: 'Timer', 
    icon: <Timer className="w-4 h-4" />, 
    category: 'Control',
    color: 'bg-purple-500',
    description: 'Delays, breaks, scheduled activities'
  },
  { 
    type: 'journal', 
    name: 'Journal', 
    icon: <FileText className="w-4 h-4" />, 
    category: 'Input',
    color: 'bg-orange-500',
    description: 'Patient reflections and notes'
  },
  { 
    type: 'media', 
    name: 'Media', 
    icon: <Video className="w-4 h-4" />, 
    category: 'Content',
    color: 'bg-pink-500',
    description: 'Audio, video, or visual content'
  },
  { 
    type: 'ai-assistant', 
    name: 'AI Assistant', 
    icon: <Brain className="w-4 h-4" />, 
    category: 'AI',
    color: 'bg-cyan-500',
    description: 'AI-powered suggestions and insights'
  },
  { 
    type: 'analytics', 
    name: 'Analytics', 
    icon: <TrendingUp className="w-4 h-4" />, 
    category: 'Tracking',
    color: 'bg-indigo-500',
    description: 'Progress tracking and metrics'
  }
];

const therapyTemplates: TherapyTemplate[] = [
  {
    id: 'cbt-anxiety',
    name: 'CBT Anxiety Management',
    category: 'CBT',
    description: 'Cognitive Behavioral Therapy session for anxiety management',
    estimatedDuration: 45,
    blocks: []
  },
  {
    id: 'mindfulness-basic',
    name: 'Basic Mindfulness Session',
    category: 'Mindfulness',
    description: 'Introduction to mindfulness and breathing exercises',
    estimatedDuration: 20,
    blocks: []
  },
  {
    id: 'ptsd-grounding',
    name: 'PTSD Grounding Techniques',
    category: 'PTSD',
    description: 'Grounding and stabilization exercises for PTSD',
    estimatedDuration: 30,
    blocks: []
  }
];

const TherapyAppBuilder: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<{
    id: string;
    name: string;
    description: string;
    category: 'CBT' | 'Mindfulness' | 'PTSD' | 'Anxiety' | 'Depression' | 'Custom';
    blocks: TherapyBlock[];
    version: number;
    lastModified: Date;
  }>({
    id: 'new-app',
    name: 'New Therapy Session',
    description: 'Untitled therapy application',
    category: 'Custom',
    blocks: [],
    version: 1,
    lastModified: new Date()
  });

  const [mode, setMode] = useState<'blocks' | 'code' | 'preview' | 'simulation'>('blocks');
  const [selectedBlock, setSelectedBlock] = useState<TherapyBlock | null>(null);
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentBlock: null,
    completedBlocks: [],
    sessionData: {}
  });
  
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (blockType: string) => {
    setDraggedBlockType(blockType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlockType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const blockType = therapyBlockTypes.find(b => b.type === draggedBlockType);
    if (!blockType) return;

    const newBlock: TherapyBlock = {
      id: `block-${Date.now()}`,
      type: draggedBlockType as any,
      name: `${blockType.name} ${currentApp.blocks.length + 1}`,
      icon: blockType.icon,
      position: { x, y },
      data: getDefaultBlockData(draggedBlockType),
      connections: []
    };

    setCurrentApp(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));

    setDraggedBlockType(null);
    toast.success(`Added ${blockType.name} block`);
  };

  const getDefaultBlockData = (blockType: string): Record<string, any> => {
    switch (blockType) {
      case 'exercise':
        return {
          title: 'New Exercise',
          instructions: 'Follow these instructions...',
          duration: 5,
          type: 'breathing',
          media: null
        };
      case 'assessment':
        return {
          title: 'Mood Assessment',
          question: 'How are you feeling right now?',
          type: 'scale',
          min: 1,
          max: 10,
          required: true
        };
      case 'decision':
        return {
          condition: 'assessment.score < 5',
          trueConnection: null,
          falseConnection: null
        };
      case 'timer':
        return {
          duration: 60,
          message: 'Take a moment to breathe...',
          autoAdvance: true
        };
      case 'journal':
        return {
          prompt: 'How did this exercise make you feel?',
          minLength: 50,
          private: true
        };
      case 'media':
        return {
          type: 'audio',
          src: null,
          autoplay: false,
          controls: true
        };
      case 'ai-assistant':
        return {
          mode: 'suggest',
          context: 'session',
          prompt: 'Analyze current session and suggest next steps'
        };
      case 'analytics':
        return {
          metrics: ['completion_time', 'engagement', 'mood_change'],
          realtime: true
        };
      default:
        return {};
    }
  };

  const handleBlockClick = (block: TherapyBlock) => {
    setSelectedBlock(block);
  };

  const updateBlockData = (property: string, value: any) => {
    if (!selectedBlock) return;

    const updatedBlock = {
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        [property]: value
      }
    };

    setCurrentApp(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === selectedBlock.id ? updatedBlock : b
      )
    }));

    setSelectedBlock(updatedBlock);
  };

  const deleteBlock = (blockId: string) => {
    setCurrentApp(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
    
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
    
    toast.success('Block deleted');
  };

  const startSimulation = () => {
    if (currentApp.blocks.length === 0) {
      toast.error('Add blocks to simulate the session');
      return;
    }

    const firstBlock = currentApp.blocks[0];
    setSimulation({
      isRunning: true,
      currentBlock: firstBlock.id,
      completedBlocks: [],
      sessionData: {},
      startTime: new Date()
    });
    
    setMode('simulation');
    toast.success('Simulation started');
  };

  const stopSimulation = () => {
    setSimulation({
      isRunning: false,
      currentBlock: null,
      completedBlocks: [],
      sessionData: {}
    });
    toast.success('Simulation stopped');
  };

  const completeCurrentBlock = () => {
    if (!simulation.currentBlock) return;

    const currentBlock = currentApp.blocks.find(b => b.id === simulation.currentBlock);
    if (!currentBlock) return;

    // Mark block as completed
    setSimulation(prev => ({
      ...prev,
      completedBlocks: [...prev.completedBlocks, currentBlock.id],
      currentBlock: currentBlock.connections[0] || null // Move to next connected block
    }));

    // If no more blocks, end simulation
    if (!currentBlock.connections[0]) {
      stopSimulation();
      toast.success('Session completed!');
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = therapyTemplates.find(t => t.id === templateId);
    if (!template) return;

    setCurrentApp(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      category: template.category,
      blocks: template.blocks
    }));

    toast.success(`Loaded template: ${template.name}`);
  };

  const generateWithAI = () => {
    if (!aiPrompt.trim()) return;

    // Simulate AI generation
    setTimeout(() => {
      const suggestions = [
        'Generated CBT anxiety session with breathing exercises',
        'Created mindfulness flow with body scan and reflection',
        'Built PTSD grounding sequence with safety techniques',
        'Generated mood tracking with personalized insights'
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      toast.success(`AI: ${randomSuggestion}`);
    }, 1000);

    setAiPrompt('');
  };

  const renderBlock = (block: TherapyBlock) => {
    const blockType = therapyBlockTypes.find(t => t.type === block.type);
    const isSelected = selectedBlock?.id === block.id;
    const isCurrentInSim = simulation.currentBlock === block.id;
    const isCompleted = simulation.completedBlocks.includes(block.id);

    return (
      <div
        key={block.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        } ${isCurrentInSim ? 'ring-2 ring-yellow-400 ring-offset-2' : ''} ${
          isCompleted ? 'opacity-75' : ''
        }`}
        style={{
          left: block.position.x,
          top: block.position.y,
          transform: isCurrentInSim ? 'scale(1.05)' : 'scale(1)'
        }}
        onClick={() => handleBlockClick(block)}
      >
        <Card className={`w-48 h-32 ${blockType?.color} text-white hover:shadow-lg transition-shadow`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {block.icon}
              <CardTitle className="text-sm font-medium truncate">
                {block.name}
              </CardTitle>
              {isCompleted && <CheckCircle className="w-4 h-4 text-green-300" />}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs opacity-90">
              {block.type === 'exercise' && `${block.data.duration || 5} min`}
              {block.type === 'assessment' && block.data.question}
              {block.type === 'timer' && `${block.data.duration || 60}s delay`}
              {block.type === 'journal' && 'Reflection prompt'}
              {block.type === 'media' && block.data.type}
              {block.type === 'decision' && 'Conditional branch'}
              {block.type === 'ai-assistant' && 'AI suggestions'}
              {block.type === 'analytics' && 'Progress tracking'}
            </div>
            
            {/* Connection indicators */}
            {block.connections.length > 0 && (
              <div className="flex gap-1 mt-2">
                {block.connections.map((_, index) => (
                  <div key={index} className="w-2 h-2 bg-white/50 rounded-full" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPropertyPanel = () => {
    if (!selectedBlock) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          Select a block to edit its properties
        </div>
      );
    }

    return (
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          <div>
            <Label>Block Name</Label>
            <Input
              value={selectedBlock.name}
              onChange={(e) => {
                const updated = { ...selectedBlock, name: e.target.value };
                setSelectedBlock(updated);
                setCurrentApp(prev => ({
                  ...prev,
                  blocks: prev.blocks.map(b => 
                    b.id === selectedBlock.id ? updated : b
                  )
                }));
              }}
            />
          </div>

          {selectedBlock.type === 'exercise' && (
            <>
              <div>
                <Label>Exercise Title</Label>
                <Input
                  value={selectedBlock.data.title || ''}
                  onChange={(e) => updateBlockData('title', e.target.value)}
                />
              </div>
              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={selectedBlock.data.instructions || ''}
                  onChange={(e) => updateBlockData('instructions', e.target.value)}
                  className="min-h-20"
                />
              </div>
              <div>
                <Label>Duration (minutes): {selectedBlock.data.duration || 5}</Label>
                <Slider
                  value={[selectedBlock.data.duration || 5]}
                  onValueChange={([value]) => updateBlockData('duration', value)}
                  min={1}
                  max={60}
                  step={1}
                />
              </div>
              <div>
                <Label>Exercise Type</Label>
                <Select
                  value={selectedBlock.data.type || 'breathing'}
                  onValueChange={(value) => updateBlockData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breathing">Breathing</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                    <SelectItem value="movement">Movement</SelectItem>
                    <SelectItem value="visualization">Visualization</SelectItem>
                    <SelectItem value="grounding">Grounding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedBlock.type === 'assessment' && (
            <>
              <div>
                <Label>Assessment Question</Label>
                <Textarea
                  value={selectedBlock.data.question || ''}
                  onChange={(e) => updateBlockData('question', e.target.value)}
                />
              </div>
              <div>
                <Label>Assessment Type</Label>
                <Select
                  value={selectedBlock.data.type || 'scale'}
                  onValueChange={(value) => updateBlockData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scale">Scale (1-10)</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="yes-no">Yes/No</SelectItem>
                    <SelectItem value="text">Text Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedBlock.data.type === 'scale' && (
                <>
                  <div>
                    <Label>Min Value: {selectedBlock.data.min || 1}</Label>
                    <Slider
                      value={[selectedBlock.data.min || 1]}
                      onValueChange={([value]) => updateBlockData('min', value)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label>Max Value: {selectedBlock.data.max || 10}</Label>
                    <Slider
                      value={[selectedBlock.data.max || 10]}
                      onValueChange={([value]) => updateBlockData('max', value)}
                      min={5}
                      max={20}
                      step={1}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {selectedBlock.type === 'timer' && (
            <>
              <div>
                <Label>Duration (seconds): {selectedBlock.data.duration || 60}</Label>
                <Slider
                  value={[selectedBlock.data.duration || 60]}
                  onValueChange={([value]) => updateBlockData('duration', value)}
                  min={10}
                  max={600}
                  step={10}
                />
              </div>
              <div>
                <Label>Timer Message</Label>
                <Input
                  value={selectedBlock.data.message || ''}
                  onChange={(e) => updateBlockData('message', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedBlock.data.autoAdvance || false}
                  onCheckedChange={(checked) => updateBlockData('autoAdvance', checked)}
                />
                <Label>Auto advance when timer ends</Label>
              </div>
            </>
          )}

          {selectedBlock.type === 'journal' && (
            <>
              <div>
                <Label>Journal Prompt</Label>
                <Textarea
                  value={selectedBlock.data.prompt || ''}
                  onChange={(e) => updateBlockData('prompt', e.target.value)}
                />
              </div>
              <div>
                <Label>Minimum Length: {selectedBlock.data.minLength || 50} characters</Label>
                <Slider
                  value={[selectedBlock.data.minLength || 50]}
                  onValueChange={([value]) => updateBlockData('minLength', value)}
                  min={10}
                  max={500}
                  step={10}
                />
              </div>
            </>
          )}

          {selectedBlock.type === 'media' && (
            <>
              <div>
                <Label>Media Type</Label>
                <Select
                  value={selectedBlock.data.type || 'audio'}
                  onValueChange={(value) => updateBlockData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedBlock.data.autoplay || false}
                  onCheckedChange={(checked) => updateBlockData('autoplay', checked)}
                />
                <Label>Autoplay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedBlock.data.controls !== false}
                  onCheckedChange={(checked) => updateBlockData('controls', checked)}
                />
                <Label>Show controls</Label>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const duplicated = {
                    ...selectedBlock,
                    id: `block-${Date.now()}`,
                    name: `${selectedBlock.name} Copy`,
                    position: {
                      x: selectedBlock.position.x + 20,
                      y: selectedBlock.position.y + 20
                    }
                  };
                  setCurrentApp(prev => ({
                    ...prev,
                    blocks: [...prev.blocks, duplicated]
                  }));
                  toast.success('Block duplicated');
                }}
              >
                <Copy className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteBlock(selectedBlock.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  };

  const renderSimulationView = () => {
    const currentBlock = simulation.currentBlock 
      ? currentApp.blocks.find(b => b.id === simulation.currentBlock)
      : null;

    if (!simulation.isRunning) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Play className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Ready to Simulate</h3>
            <p className="text-muted-foreground">Start simulation to test your therapy session</p>
            <Button onClick={startSimulation}>
              <Play className="w-4 h-4 mr-2" />
              Start Simulation
            </Button>
          </div>
        </div>
      );
    }

    if (!currentBlock) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-lg font-semibold">Session Complete</h3>
            <p className="text-muted-foreground">
              Completed {simulation.completedBlocks.length} blocks
            </p>
            <Button onClick={stopSimulation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Simulation
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Session Header */}
          <div className="text-center space-y-2">
            <Badge variant="outline">
              Block {simulation.completedBlocks.length + 1} of {currentApp.blocks.length}
            </Badge>
            <h2 className="text-2xl font-bold">{currentBlock.name}</h2>
          </div>

          {/* Block Content */}
          <Card className="p-6">
            {currentBlock.type === 'exercise' && (
              <div className="space-y-4 text-center">
                <Activity className="w-12 h-12 mx-auto text-blue-500" />
                <h3 className="text-xl font-semibold">{currentBlock.data.title}</h3>
                <p className="text-muted-foreground">{currentBlock.data.instructions}</p>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {currentBlock.data.duration} minutes
                </Badge>
              </div>
            )}

            {currentBlock.type === 'assessment' && (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <h3 className="text-xl font-semibold text-center">Assessment</h3>
                <p className="text-center">{currentBlock.data.question}</p>
                
                {currentBlock.data.type === 'scale' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{currentBlock.data.min || 1}</span>
                      <span>{currentBlock.data.max || 10}</span>
                    </div>
                    <Slider
                      defaultValue={[5]}
                      min={currentBlock.data.min || 1}
                      max={currentBlock.data.max || 10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {currentBlock.type === 'timer' && (
              <div className="space-y-4 text-center">
                <Timer className="w-12 h-12 mx-auto text-purple-500" />
                <h3 className="text-xl font-semibold">Take a Moment</h3>
                <p className="text-muted-foreground">{currentBlock.data.message}</p>
                <div className="text-3xl font-mono text-primary">
                  {Math.floor((currentBlock.data.duration || 60) / 60)}:
                  {String((currentBlock.data.duration || 60) % 60).padStart(2, '0')}
                </div>
              </div>
            )}

            {currentBlock.type === 'journal' && (
              <div className="space-y-4">
                <FileText className="w-12 h-12 mx-auto text-orange-500" />
                <h3 className="text-xl font-semibold text-center">Reflection</h3>
                <p className="text-center text-muted-foreground">{currentBlock.data.prompt}</p>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="min-h-32"
                />
              </div>
            )}
          </Card>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={stopSimulation}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button onClick={completeCurrentBlock}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{simulation.completedBlocks.length} / {currentApp.blocks.length}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(simulation.completedBlocks.length / currentApp.blocks.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        <Button variant="outline" size="sm">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <FolderOpen className="w-4 h-4 mr-1" />
          Open
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant={simulation.isRunning ? "default" : "outline"}
          size="sm"
          onClick={simulation.isRunning ? stopSimulation : startSimulation}
        >
          {simulation.isRunning ? (
            <Square className="w-4 h-4 mr-1" />
          ) : (
            <Play className="w-4 h-4 mr-1" />
          )}
          {simulation.isRunning ? 'Stop' : 'Simulate'}
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-1">
          <Button
            variant={mode === 'blocks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('blocks')}
          >
            <Blocks className="w-4 h-4 mr-1" />
            Flow
          </Button>
          <Button
            variant={mode === 'code' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('code')}
          >
            <Code className="w-4 h-4 mr-1" />
            DSL
          </Button>
          <Button
            variant={mode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('preview')}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Session Name"
            value={currentApp.name}
            onChange={(e) => setCurrentApp(prev => ({ ...prev, name: e.target.value }))}
            className="w-48"
          />
          <Badge variant="secondary">{currentApp.category}</Badge>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <Tabs defaultValue="blocks" className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="blocks">
                <Blocks className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="properties">
                <Settings className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="templates">
                <BookOpen className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Bot className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blocks" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Therapy Blocks</h3>
                {Object.entries(
                  therapyBlockTypes.reduce((acc, block) => {
                    if (!acc[block.category]) acc[block.category] = [];
                    acc[block.category].push(block);
                    return acc;
                  }, {} as Record<string, typeof therapyBlockTypes>)
                ).map(([category, blocks]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                    <div className="space-y-2">
                      {blocks.map((block) => (
                        <Card
                          key={block.type}
                          className="cursor-move hover:bg-accent transition-colors"
                          draggable
                          onDragStart={() => handleDragStart(block.type)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${block.color} flex items-center justify-center text-white`}>
                                {block.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{block.name}</div>
                                <div className="text-xs text-muted-foreground">{block.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="properties" className="flex-1">
              {renderPropertyPanel()}
            </TabsContent>

            <TabsContent value="templates" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Session Templates</h3>
                <div className="space-y-3">
                  {therapyTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:bg-accent transition-colors">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{template.estimatedDuration} min</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadTemplate(template.id)}
                            >
                              Load
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="flex-1">
              <div className="p-4 space-y-4">
                <h3 className="font-semibold">AI Assistant</h3>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe the therapy session you want to create..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-20"
                  />
                  <Button onClick={generateWithAI} disabled={!aiPrompt.trim()}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate Session
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quick Templates</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm">
                      CBT Anxiety Session
                    </Button>
                    <Button variant="outline" size="sm">
                      Mindfulness Practice
                    </Button>
                    <Button variant="outline" size="sm">
                      PTSD Grounding
                    </Button>
                    <Button variant="outline" size="sm">
                      Mood Tracking
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col">
          {mode === 'blocks' && (
            <div className="flex-1 relative">
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Blocks className="w-4 h-4" />
                </Button>
              </div>
              
              <div
                ref={canvasRef}
                className="w-full h-full relative overflow-auto"
                style={{
                  backgroundImage: showGrid ? 
                    'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)' : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'none'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {currentApp.blocks.map(renderBlock)}
                
                {currentApp.blocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Drag therapy blocks to create your session flow</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'code' && (
            <div className="flex-1 p-4">
              <div className="h-full border rounded-lg">
                <div className="flex items-center gap-2 p-2 border-b">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">Therapy DSL</span>
                </div>
                <Textarea
                  value={`START_SESSION
  Exercise "Mindfulness Breathing" duration=5min
  Assessment "Mood Check" type=scale min=1 max=10
  IF Assessment.result < 5
      Exercise "Positive Visualization" duration=3min
  END_IF
  Journal "Reflection Notes"
END_SESSION`}
                  className="h-full border-0 rounded-none font-mono text-sm resize-none"
                  placeholder="Write your therapy session in DSL..."
                />
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="flex-1 p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Session Preview</h3>
                <p className="text-muted-foreground">
                  {currentApp.blocks.length} blocks • Estimated duration: {
                    currentApp.blocks.reduce((total, block) => {
                      if (block.type === 'exercise') return total + (block.data.duration || 5);
                      if (block.type === 'timer') return total + Math.ceil((block.data.duration || 60) / 60);
                      return total + 2; // Default 2 min for other blocks
                    }, 0)
                  } minutes
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-4">
                {currentApp.blocks.map((block, index) => (
                  <Card key={block.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{block.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {block.type === 'exercise' && `${block.data.duration || 5} minute ${block.data.type} exercise`}
                          {block.type === 'assessment' && `${block.data.type} assessment`}
                          {block.type === 'timer' && `${Math.ceil((block.data.duration || 60) / 60)} minute break`}
                          {block.type === 'journal' && 'Reflection journal'}
                        </p>
                      </div>
                      <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
                
                {currentApp.blocks.length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No blocks to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'simulation' && renderSimulationView()}
        </div>

        {/* Right Sidebar - Session Structure */}
        <div className="w-64 border-l bg-card">
          <ScrollArea className="h-full p-4">
            <h3 className="font-semibold mb-4">Session Flow</h3>
            <div className="space-y-2">
              {currentApp.blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
                    selectedBlock?.id === block.id ? 'bg-accent' : ''
                  } ${simulation.currentBlock === block.id ? 'ring-2 ring-yellow-400' : ''} ${
                    simulation.completedBlocks.includes(block.id) ? 'opacity-60' : ''
                  }`}
                  onClick={() => setSelectedBlock(block)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{block.name}</div>
                    <div className="text-xs text-muted-foreground">{block.type}</div>
                  </div>
                  {simulation.completedBlocks.includes(block.id) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {simulation.currentBlock === block.id && (
                    <Activity className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
              {currentApp.blocks.length === 0 && (
                <p className="text-muted-foreground text-sm">No blocks in session</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default TherapyAppBuilder;