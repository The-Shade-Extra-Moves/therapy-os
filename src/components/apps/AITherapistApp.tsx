import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
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
  Bug,
  Brain,
  Heart,
  Clock,
  Mic,
  Video,
  FileText,
  Target,
  TrendingUp,
  Repeat,
  Bell,
  Activity,
  User,
  Users,
  MessageCircle,
  Headphones,
  Camera
} from 'lucide-react';

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  diagnosis: string[];
  sessionHistory: SessionRecord[];
  aiInteractionLogs: AIInteraction[];
  progressMetrics: ProgressMetric[];
}

interface SessionRecord {
  id: string;
  date: Date;
  duration: number;
  type: 'manual' | 'ai_assisted' | 'ai_autonomous';
  exercises: Exercise[];
  assessments: Assessment[];
  notes: string;
  aiDecisions: AIDecision[];
  effectiveness: number;
}

interface AIInteraction {
  id: string;
  timestamp: Date;
  type: 'text' | 'audio' | 'video';
  input: string;
  output: string;
  context: any;
}

interface Exercise {
  id: string;
  type: 'breathing' | 'visualization' | 'cognitive' | 'behavioral' | 'mindfulness';
  name: string;
  duration: number;
  media?: string;
  instructions: string;
  completed: boolean;
  effectiveness?: number;
}

interface Assessment {
  id: string;
  type: 'mood' | 'anxiety' | 'depression' | 'stress' | 'custom';
  questions: string[];
  responses: any[];
  score: number;
  interpretation: string;
}

interface ProgressMetric {
  id: string;
  metric: string;
  value: number;
  trend: 'improving' | 'stable' | 'declining';
  date: Date;
}

interface AIDecision {
  id: string;
  timestamp: Date;
  trigger: string;
  decision: string;
  rationale: string;
  outcome?: string;
}

interface TherapyWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  aiConfiguration: AIConfiguration;
  template: boolean;
}

interface AIConfiguration {
  personality: 'empathetic' | 'supportive' | 'directive' | 'collaborative';
  responseStyle: 'formal' | 'casual' | 'therapeutic';
  adaptationLevel: number; // 1-10
  interventionTriggers: string[];
  multiModalEnabled: boolean;
}

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    position: { x: 250, y: 25 },
    data: { label: 'Session Start' },
  },
  {
    id: 'mood_check',
    position: { x: 250, y: 125 },
    data: { label: 'Mood Assessment', type: 'assessment' },
  },
  {
    id: 'decision',
    position: { x: 250, y: 225 },
    data: { label: 'AI Decision Point', type: 'decision' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'start', target: 'mood_check' },
  { id: 'e2-3', source: 'mood_check', target: 'decision' },
];

const therapyTemplates = [
  {
    id: 'cbt_basic',
    name: 'CBT Session Template',
    category: 'Cognitive Behavioral',
    description: 'Basic CBT session with thought recording and behavioral activation',
    duration: 45,
    nodes: [],
    edges: []
  },
  {
    id: 'mindfulness_intro',
    name: 'Mindfulness Introduction',
    category: 'Mindfulness',
    description: 'Introductory mindfulness session with breathing and body scan',
    duration: 30,
    nodes: [],
    edges: []
  },
  {
    id: 'anxiety_management',
    name: 'Anxiety Management',
    category: 'Anxiety',
    description: 'Comprehensive anxiety management session',
    duration: 60,
    nodes: [],
    edges: []
  },
  {
    id: 'trauma_informed',
    name: 'Trauma-Informed Session',
    category: 'Trauma',
    description: 'Trauma-informed care approach with grounding techniques',
    duration: 50,
    nodes: [],
    edges: []
  }
];

const AITherapistApp: React.FC = () => {
  const [currentPatient, setCurrentPatient] = useState<PatientProfile | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<TherapyWorkflow>({
    id: 'workflow-1',
    name: 'New Session',
    description: 'Untitled therapy session',
    nodes: initialNodes,
    edges: initialEdges,
    aiConfiguration: {
      personality: 'empathetic',
      responseStyle: 'therapeutic',
      adaptationLevel: 7,
      interventionTriggers: ['low_mood', 'high_anxiety', 'negative_thought_pattern'],
      multiModalEnabled: true
    },
    template: false
  });
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [mode, setMode] = useState<'workflow' | 'session' | 'analytics' | 'ai_config'>('workflow');
  const [sessionRunning, setSessionRunning] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<AIInteraction[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [patientList] = useState<PatientProfile[]>([
    {
      id: 'patient-1',
      name: 'Sarah Johnson',
      age: 28,
      diagnosis: ['Anxiety Disorder', 'Depression'],
      sessionHistory: [],
      aiInteractionLogs: [],
      progressMetrics: []
    },
    {
      id: 'patient-2',
      name: 'Michael Chen',
      age: 35,
      diagnosis: ['PTSD', 'Panic Disorder'],
      sessionHistory: [],
      aiInteractionLogs: [],
      progressMetrics: []
    }
  ]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handlePatientSelect = (patient: PatientProfile) => {
    setCurrentPatient(patient);
    toast.success(`Loaded patient: ${patient.name}`);
  };

  const handleStartSession = () => {
    if (!currentPatient) {
      toast.error('Please select a patient first');
      return;
    }
    
    setSessionRunning(true);
    toast.success('AI-assisted session started');
    
    // Simulate AI session flow
    setTimeout(() => {
      const aiMessage: AIInteraction = {
        id: `ai-${Date.now()}`,
        timestamp: new Date(),
        type: 'text',
        input: 'Session initiated',
        output: `Hello ${currentPatient.name}, I'm your AI therapy assistant. How are you feeling today?`,
        context: { node: 'start', workflow: currentWorkflow.id }
      };
      
      setSessionLogs(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleStopSession = () => {
    setSessionRunning(false);
    toast.success('Session stopped');
  };

  const generateSessionReport = () => {
    if (!currentPatient || sessionLogs.length === 0) {
      toast.error('No session data to generate report');
      return;
    }

    const report = {
      patient: currentPatient.name,
      date: new Date().toISOString(),
      duration: sessionLogs.length * 2, // Mock duration
      interactions: sessionLogs.length,
      aiDecisions: sessionLogs.filter(log => log.type === 'text').length,
      effectiveness: Math.floor(Math.random() * 40) + 60 // Mock effectiveness 60-100%
    };

    toast.success('Session report generated');
    console.log('Session Report:', report);
  };

  const addWorkflowNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: type.charAt(0).toUpperCase() + type.slice(1),
        type: type
      },
    };

    setNodes(nds => [...nds, newNode]);
    toast.success(`Added ${type} node`);
  };

  const loadTemplate = (template: any) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      name: template.name,
      description: template.description
    }));
    toast.success(`Loaded template: ${template.name}`);
  };

  const aiPersonalityOptions = [
    { value: 'empathetic', label: 'Empathetic', description: 'Warm, understanding, validating' },
    { value: 'supportive', label: 'Supportive', description: 'Encouraging, solution-focused' },
    { value: 'directive', label: 'Directive', description: 'Structured, goal-oriented' },
    { value: 'collaborative', label: 'Collaborative', description: 'Partnership-based approach' }
  ];

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
          Load
        </Button>
        <Button variant="outline" size="sm" onClick={generateSessionReport}>
          <Download className="w-4 h-4 mr-1" />
          Report
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant={sessionRunning ? "destructive" : "default"}
          size="sm"
          onClick={sessionRunning ? handleStopSession : handleStartSession}
        >
          {sessionRunning ? (
            <>
              <Square className="w-4 h-4 mr-1" />
              Stop Session
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Start AI Session
            </>
          )}
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-1">
          <Button
            variant={mode === 'workflow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('workflow')}
          >
            <Blocks className="w-4 h-4 mr-1" />
            Workflow
          </Button>
          <Button
            variant={mode === 'session' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('session')}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Session
          </Button>
          <Button
            variant={mode === 'analytics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('analytics')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </Button>
          <Button
            variant={mode === 'ai_config' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('ai_config')}
          >
            <Bot className="w-4 h-4 mr-1" />
            AI Config
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {currentPatient && (
            <Badge variant="secondary">
              <User className="w-3 h-3 mr-1" />
              {currentPatient.name}
            </Badge>
          )}
          <Badge variant={sessionRunning ? "default" : "secondary"}>
            {sessionRunning ? 'ACTIVE' : 'IDLE'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <Tabs defaultValue="patients" className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="patients">
                <Users className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="nodes">
                <Palette className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="templates">
                <FileCode className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Brain className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patients" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Patient List</h3>
                {patientList.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`mb-2 cursor-pointer transition-colors ${
                      currentPatient?.id === patient.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Age {patient.age} • {patient.diagnosis.join(', ')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="nodes" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Workflow Nodes</h3>
                <div className="space-y-2">
                  {[
                    { type: 'exercise', icon: Activity, label: 'Exercise' },
                    { type: 'assessment', icon: Target, label: 'Assessment' },
                    { type: 'decision', icon: Brain, label: 'AI Decision' },
                    { type: 'timer', icon: Clock, label: 'Timer' },
                    { type: 'notification', icon: Bell, label: 'Notification' },
                    { type: 'media', icon: Video, label: 'Media Player' },
                    { type: 'journal', icon: FileText, label: 'Journal Entry' }
                  ].map((nodeType) => (
                    <Button
                      key={nodeType.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addWorkflowNode(nodeType.type)}
                    >
                      <nodeType.icon className="w-4 h-4 mr-2" />
                      {nodeType.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="templates" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">Session Templates</h3>
                {therapyTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="mb-2 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => loadTemplate(template)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {template.category} • {template.duration}min
                      </div>
                      <div className="text-xs">{template.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="flex-1">
              <ScrollArea className="h-full p-4">
                <h3 className="font-semibold mb-4">AI Assistant</h3>
                <div className="space-y-4">
                  <Button className="w-full" onClick={handleStartSession}>
                    <Bot className="w-4 h-4 mr-2" />
                    Quick AI Session
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Exercise
                  </Button>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Optimize Workflow
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {mode === 'workflow' && (
            <div className="flex-1">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                className="bg-background"
              >
                <Controls />
                <MiniMap />
                <Background />
              </ReactFlow>
            </div>
          )}

          {mode === 'session' && (
            <div className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Live Session
                    {sessionRunning && (
                      <Badge variant="default" className="animate-pulse">
                        Recording
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 border rounded p-4 mb-4">
                    {sessionLogs.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        No session logs yet. Start a session to see AI interactions.
                      </div>
                    ) : (
                      sessionLogs.map((log) => (
                        <div key={log.id} className="mb-3 p-2 border-l-2 border-primary/20">
                          <div className="text-xs text-muted-foreground mb-1">
                            {log.timestamp.toLocaleTimeString()} • {log.type}
                          </div>
                          <div className="text-sm">{log.output}</div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input placeholder="Type patient response..." className="flex-1" />
                    <Button>
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button>
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === 'analytics' && (
            <div className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Effectiveness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">87%</div>
                    <div className="text-sm text-muted-foreground">Average improvement</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>AI Interventions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">23</div>
                    <div className="text-sm text-muted-foreground">This week</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">92%</div>
                    <div className="text-sm text-muted-foreground">Completion rate</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">156</div>
                    <div className="text-sm text-muted-foreground">+12% from last month</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {mode === 'ai_config' && (
            <div className="flex-1 p-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">AI Personality</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {aiPersonalityOptions.map((option) => (
                        <Card
                          key={option.value}
                          className={`cursor-pointer transition-colors ${
                            currentWorkflow.aiConfiguration.personality === option.value
                              ? 'bg-accent border-primary'
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => setCurrentWorkflow(prev => ({
                            ...prev,
                            aiConfiguration: {
                              ...prev.aiConfiguration,
                              personality: option.value as any
                            }
                          }))}
                        >
                          <CardContent className="p-3">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adaptation-level">Adaptation Level: {currentWorkflow.aiConfiguration.adaptationLevel}</Label>
                    <Slider
                      id="adaptation-level"
                      min={1}
                      max={10}
                      step={1}
                      value={[currentWorkflow.aiConfiguration.adaptationLevel]}
                      onValueChange={([value]) => setCurrentWorkflow(prev => ({
                        ...prev,
                        aiConfiguration: {
                          ...prev.aiConfiguration,
                          adaptationLevel: value
                        }
                      }))}
                      className="mt-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      How much the AI adapts its approach based on patient responses
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="multimodal">Multi-modal Interaction</Label>
                      <div className="text-xs text-muted-foreground">Enable text, audio, and video responses</div>
                    </div>
                    <Switch
                      id="multimodal"
                      checked={currentWorkflow.aiConfiguration.multiModalEnabled}
                      onCheckedChange={(checked) => setCurrentWorkflow(prev => ({
                        ...prev,
                        aiConfiguration: {
                          ...prev.aiConfiguration,
                          multiModalEnabled: checked
                        }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        {selectedNode && (
          <div className="w-80 border-l bg-card p-4">
            <h3 className="font-semibold mb-4">Node Properties</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-label">Label</Label>
                      <Input
                        id="node-label"
                        value={String(selectedNode.data?.label || '')}
                        onChange={(e) => {
                          // Update node logic would go here
                        }}
                      />
              </div>
              
              <div>
                <Label htmlFor="node-type">Type</Label>
                <div className="text-sm text-muted-foreground">
                  {String(selectedNode.data?.type || 'default')}
                </div>
              </div>
              
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Node
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITherapistApp;