import React, { useState, useRef, useCallback } from 'react';
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
  Palette,
  Bot,
  FileCode,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  Database,
  Image,
  Type,
  MousePointer,
  Calendar,
  BarChart3,
  Layout,
  Grid,
  List,
  CheckSquare,
  Radio,
  Layers,
  Move,
  RotateCcw,
  Bug
} from 'lucide-react';

interface Component {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  properties: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AppProject {
  id: string;
  name: string;
  description: string;
  components: Component[];
  code: string;
  version: number;
  lastModified: Date;
  thumbnail?: string;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  data: any;
}

const componentLibrary = [
  { type: 'button', name: 'Button', icon: <MousePointer className="w-4 h-4" />, category: 'Basic' },
  { type: 'text', name: 'Text', icon: <Type className="w-4 h-4" />, category: 'Basic' },
  { type: 'input', name: 'Input', icon: <Type className="w-4 h-4" />, category: 'Form' },
  { type: 'textarea', name: 'Text Area', icon: <Type className="w-4 h-4" />, category: 'Form' },
  { type: 'checkbox', name: 'Checkbox', icon: <CheckSquare className="w-4 h-4" />, category: 'Form' },
  { type: 'radio', name: 'Radio', icon: <Radio className="w-4 h-4" />, category: 'Form' },
  { type: 'form', name: 'Form', icon: <Layout className="w-4 h-4" />, category: 'Form' },
  { type: 'image', name: 'Image', icon: <Image className="w-4 h-4" />, category: 'Media' },
  { type: 'chart', name: 'Chart', icon: <BarChart3 className="w-4 h-4" />, category: 'Data' },
  { type: 'calendar', name: 'Calendar', icon: <Calendar className="w-4 h-4" />, category: 'Data' },
  { type: 'container', name: 'Container', icon: <Layout className="w-4 h-4" />, category: 'Layout' },
  { type: 'grid', name: 'Grid', icon: <Grid className="w-4 h-4" />, category: 'Layout' },
  { type: 'list', name: 'List', icon: <List className="w-4 h-4" />, category: 'Layout' },
];

const AppBuilderApp: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<AppProject>({
    id: 'default',
    name: 'New App',
    description: 'Untitled application',
    components: [],
    code: '// Your app code goes here\nfunction App() {\n  return <div>Hello World!</div>;\n}',
    version: 1,
    lastModified: new Date()
  });
  
  const [mode, setMode] = useState<'blocks' | 'code' | 'preview'>('blocks');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showGrid, setShowGrid] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  const addToHistory = useCallback((action: string, description: string, data?: any) => {
    const entry: HistoryEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date(),
      action,
      description,
      data
    };
    setHistory(prev => [...prev.slice(-19), entry]);
  }, []);

  const handleDragStart = (componentType: string) => {
    setDraggedComponent(componentType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedComponent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent: Component = {
      id: `component-${Date.now()}`,
      type: draggedComponent,
      name: `${draggedComponent} ${currentProject.components.length + 1}`,
      icon: componentLibrary.find(c => c.type === draggedComponent)?.icon || <div />,
      properties: {
        text: draggedComponent === 'text' ? 'Sample Text' : draggedComponent === 'button' ? 'Click Me' : '',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontSize: 16,
        padding: 8,
        borderRadius: 4,
        visible: true
      },
      x,
      y,
      width: draggedComponent === 'text' ? 100 : draggedComponent === 'button' ? 120 : 200,
      height: draggedComponent === 'text' ? 30 : draggedComponent === 'button' ? 40 : 100
    };

    setCurrentProject(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    addToHistory('add_component', `Added ${draggedComponent} component`, newComponent);
    setDraggedComponent(null);
    toast.success(`Added ${draggedComponent} component`);
  };

  const handleComponentClick = (component: Component) => {
    setSelectedComponent(component);
  };

  const updateComponentProperty = (property: string, value: any) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      properties: {
        ...selectedComponent.properties,
        [property]: value
      }
    };

    setCurrentProject(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === selectedComponent.id ? updatedComponent : c
      )
    }));

    setSelectedComponent(updatedComponent);
    addToHistory('update_property', `Updated ${property} for ${selectedComponent.name}`);
  };

  const deleteComponent = (componentId: string) => {
    setCurrentProject(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== componentId)
    }));
    
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
    
    addToHistory('delete_component', `Deleted component`);
    toast.success('Component deleted');
  };

  const duplicateComponent = (component: Component) => {
    const newComponent: Component = {
      ...component,
      id: `component-${Date.now()}`,
      name: `${component.name} Copy`,
      x: component.x + 20,
      y: component.y + 20
    };

    setCurrentProject(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    addToHistory('duplicate_component', `Duplicated ${component.name}`, newComponent);
    toast.success('Component duplicated');
  };

  const saveProject = () => {
    const updatedProject = {
      ...currentProject,
      lastModified: new Date(),
      version: currentProject.version + 1
    };
    setCurrentProject(updatedProject);
    addToHistory('save_project', `Saved project ${updatedProject.name}`);
    toast.success('Project saved successfully');
  };

  const exportProject = () => {
    const projectData = JSON.stringify(currentProject, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project exported');
  };

  const togglePlayMode = () => {
    setIsPlaying(!isPlaying);
    addToHistory(isPlaying ? 'stop_preview' : 'start_preview', `${isPlaying ? 'Stopped' : 'Started'} preview mode`);
    toast.success(isPlaying ? 'Preview stopped' : 'Preview started');
  };

  const generateCodeFromComponents = () => {
    const componentCode = currentProject.components.map(comp => {
      switch (comp.type) {
        case 'button':
          return `<button style={{
            position: 'absolute',
            left: '${comp.x}px',
            top: '${comp.y}px',
            width: '${comp.width}px',
            height: '${comp.height}px',
            backgroundColor: '${comp.properties.backgroundColor}',
            color: '${comp.properties.color}',
            borderRadius: '${comp.properties.borderRadius}px',
            padding: '${comp.properties.padding}px',
            border: 'none',
            cursor: 'pointer'
          }}>${comp.properties.text}</button>`;
        case 'text':
          return `<div style={{
            position: 'absolute',
            left: '${comp.x}px',
            top: '${comp.y}px',
            fontSize: '${comp.properties.fontSize}px',
            color: '${comp.properties.color}'
          }}>${comp.properties.text}</div>`;
        default:
          return `<div style={{
            position: 'absolute',
            left: '${comp.x}px',
            top: '${comp.y}px',
            width: '${comp.width}px',
            height: '${comp.height}px',
            backgroundColor: '${comp.properties.backgroundColor}',
            border: '1px solid #ccc'
          }}>${comp.type}</div>`;
      }
    }).join('\n');

    return `function ${currentProject.name.replace(/\s+/g, '')}() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      ${componentCode}
    </div>
  );
}`;
  };

  const handleAIGeneration = () => {
    if (!aiPrompt.trim()) return;

    // Simulate AI generation
    setTimeout(() => {
      const suggestions = [
        'Generated a patient feedback form with rating components',
        'Created a therapy session tracker with calendar integration',
        'Built a mood monitoring dashboard with charts',
        'Generated a patient profile card with customizable fields'
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      toast.success(`AI: ${randomSuggestion}`);
      addToHistory('ai_generation', `AI generated: ${randomSuggestion}`, { prompt: aiPrompt });
    }, 1000);

    setAiPrompt('');
  };

  const renderComponent = (component: Component) => {
    const isSelected = selectedComponent?.id === component.id;
    const style = {
      position: 'absolute' as const,
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      border: isSelected ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
      borderRadius: component.properties.borderRadius || 4,
      backgroundColor: component.properties.backgroundColor || 'hsl(var(--background))',
      color: component.properties.color || 'hsl(var(--foreground))',
      padding: component.properties.padding || 8,
      fontSize: component.properties.fontSize || 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      userSelect: 'none' as const
    };

    return (
      <div
        key={component.id}
        style={style}
        onClick={() => handleComponentClick(component)}
        onContextMenu={(e) => {
          e.preventDefault();
          // Could show context menu here
        }}
      >
        {component.type === 'button' && component.properties.text}
        {component.type === 'text' && component.properties.text}
        {!['button', 'text'].includes(component.type) && (
          <span className="text-xs text-muted-foreground">{component.type}</span>
        )}
      </div>
    );
  };

  const getPreviewDimensions = () => {
    switch (previewDevice) {
      case 'mobile': return { width: 375, height: 667 };
      case 'tablet': return { width: 768, height: 1024 };
      default: return { width: '100%', height: '100%' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        <Button variant="outline" size="sm" onClick={saveProject}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <FolderOpen className="w-4 h-4 mr-1" />
          Open
        </Button>
        <Button variant="outline" size="sm" onClick={exportProject}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          onClick={togglePlayMode}
        >
          {isPlaying ? <Square className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isPlaying ? 'Stop' : 'Play'}
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-1">
          <Button
            variant={mode === 'blocks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('blocks')}
          >
            <Blocks className="w-4 h-4 mr-1" />
            Blocks
          </Button>
          <Button
            variant={mode === 'code' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('code')}
          >
            <Code className="w-4 h-4 mr-1" />
            Code
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
            placeholder="App Name"
            value={currentProject.name}
            onChange={(e) => setCurrentProject(prev => ({ ...prev, name: e.target.value }))}
            className="w-32"
          />
          <Badge variant="secondary">v{currentProject.version}</Badge>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Component Library & Properties */}
        <div className="w-80 border-r bg-card flex flex-col">
          <Tabs defaultValue="components" className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="components">
                <Palette className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="properties">
                <Settings className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Bot className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Component Library</h3>
                {Object.entries(
                  componentLibrary.reduce((acc, comp) => {
                    if (!acc[comp.category]) acc[comp.category] = [];
                    acc[comp.category].push(comp);
                    return acc;
                  }, {} as Record<string, typeof componentLibrary>)
                ).map(([category, components]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {components.map((component) => (
                        <Card
                          key={component.type}
                          className="cursor-move hover:bg-accent transition-colors"
                          draggable
                          onDragStart={() => handleDragStart(component.type)}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="mb-1">{component.icon}</div>
                            <div className="text-xs">{component.name}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="properties" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Properties</h3>
                {selectedComponent ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={selectedComponent.name}
                        onChange={(e) => {
                          const updated = { ...selectedComponent, name: e.target.value };
                          setSelectedComponent(updated);
                          setCurrentProject(prev => ({
                            ...prev,
                            components: prev.components.map(c => 
                              c.id === selectedComponent.id ? updated : c
                            )
                          }));
                        }}
                      />
                    </div>
                    
                    {selectedComponent.type === 'text' || selectedComponent.type === 'button' ? (
                      <div>
                        <Label>Text</Label>
                        <Input
                          value={selectedComponent.properties.text || ''}
                          onChange={(e) => updateComponentProperty('text', e.target.value)}
                        />
                      </div>
                    ) : null}
                    
                    <div>
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={selectedComponent.properties.backgroundColor || '#ffffff'}
                        onChange={(e) => updateComponentProperty('backgroundColor', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={selectedComponent.properties.color || '#000000'}
                        onChange={(e) => updateComponentProperty('color', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Font Size: {selectedComponent.properties.fontSize || 16}px</Label>
                      <Slider
                        value={[selectedComponent.properties.fontSize || 16]}
                        onValueChange={([value]) => updateComponentProperty('fontSize', value)}
                        min={8}
                        max={48}
                        step={1}
                      />
                    </div>
                    
                    <div>
                      <Label>Padding: {selectedComponent.properties.padding || 8}px</Label>
                      <Slider
                        value={[selectedComponent.properties.padding || 8]}
                        onValueChange={([value]) => updateComponentProperty('padding', value)}
                        min={0}
                        max={32}
                        step={1}
                      />
                    </div>
                    
                    <div>
                      <Label>Border Radius: {selectedComponent.properties.borderRadius || 4}px</Label>
                      <Slider
                        value={[selectedComponent.properties.borderRadius || 4]}
                        onValueChange={([value]) => updateComponentProperty('borderRadius', value)}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateComponent(selectedComponent)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteComponent(selectedComponent.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Select a component to edit its properties</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="flex-1">
              <div className="p-4 space-y-4">
                <h3 className="font-semibold">AI Assistant</h3>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe what you want to build..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-20"
                  />
                  <Button onClick={handleAIGeneration} disabled={!aiPrompt.trim()}>
                    <Zap className="w-4 h-4 mr-1" />
                    Generate with AI
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quick Actions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm">
                      Generate Patient Form
                    </Button>
                    <Button variant="outline" size="sm">
                      Create Dashboard
                    </Button>
                    <Button variant="outline" size="sm">
                      Build Report Layout
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Therapy Tools
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">History</h3>
                <div className="space-y-2">
                  {history.slice().reverse().map((entry) => (
                    <Card key={entry.id} className="p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <History className="w-3 h-3" />
                        <span className="flex-1">{entry.description}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </Card>
                  ))}
                  {history.length === 0 && (
                    <p className="text-muted-foreground text-sm">No actions yet</p>
                  )}
                </div>
              </ScrollArea>
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
                  <Grid className="w-4 h-4" />
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
                {currentProject.components.map(renderComponent)}
                
                {currentProject.components.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Blocks className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Drag components from the sidebar to start building</p>
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
                  <FileCode className="w-4 h-4" />
                  <span className="font-medium">{currentProject.name}.jsx</span>
                  <div className="ml-auto">
                    <Button variant="outline" size="sm" onClick={() => {
                      const generatedCode = generateCodeFromComponents();
                      setCurrentProject(prev => ({ ...prev, code: generatedCode }));
                      toast.success('Code generated from components');
                    }}>
                      Generate from Blocks
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={currentProject.code}
                  onChange={(e) => setCurrentProject(prev => ({ ...prev, code: e.target.value }))}
                  className="h-full border-0 rounded-none font-mono text-sm resize-none"
                  placeholder="Write your app code here..."
                />
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Preview:</span>
                <div className="flex gap-1">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
                {isPlaying && <Badge variant="default">Live Preview</Badge>}
              </div>
              
              <div className="flex justify-center">
                <div
                  className="border rounded-lg bg-background overflow-auto"
                  style={getPreviewDimensions()}
                >
                  <div className="relative w-full h-full min-h-96">
                    {currentProject.components.map((component) => (
                      <div
                        key={component.id}
                        style={{
                          position: 'absolute',
                          left: component.x,
                          top: component.y,
                          width: component.width,
                          height: component.height,
                          borderRadius: component.properties.borderRadius || 4,
                          backgroundColor: component.properties.backgroundColor || 'hsl(var(--background))',
                          color: component.properties.color || 'hsl(var(--foreground))',
                          padding: component.properties.padding || 8,
                          fontSize: component.properties.fontSize || 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: component.type === 'button' ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                        onClick={() => {
                          if (component.type === 'button') {
                            toast.success(`Button "${component.properties.text}" clicked!`);
                          }
                        }}
                      >
                        {component.type === 'button' && component.properties.text}
                        {component.type === 'text' && component.properties.text}
                        {!['button', 'text'].includes(component.type) && (
                          <span className="text-xs text-muted-foreground">{component.type}</span>
                        )}
                      </div>
                    ))}
                    
                    {currentProject.components.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No components to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - App Structure */}
        <div className="w-64 border-l bg-card">
          <ScrollArea className="h-full p-4">
            <h3 className="font-semibold mb-4">App Structure</h3>
            <div className="space-y-1">
              {currentProject.components.map((component) => (
                <div
                  key={component.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
                    selectedComponent?.id === component.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedComponent(component)}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-sm flex-1">{component.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {component.type}
                  </Badge>
                </div>
              ))}
              {currentProject.components.length === 0 && (
                <p className="text-muted-foreground text-sm">No components yet</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AppBuilderApp;