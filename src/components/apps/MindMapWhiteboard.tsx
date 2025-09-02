import React from 'react';
import { motion } from 'framer-motion';
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
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Lightbulb, 
  Plus, 
  Palette, 
  Type, 
  Link,
  Save,
  Download,
  Upload,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Custom Node Component
const IdeaNode = ({ data }: { data: any }) => {
  return (
    <Card className="px-3 py-2 border border-border/50 bg-card/90 backdrop-blur-sm min-w-32">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          {data.category || 'Idea'}
        </span>
      </div>
      <div className="text-sm font-medium text-foreground">
        {data.label}
      </div>
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1">
          {data.description}
        </div>
      )}
    </Card>
  );
};

// Custom Edge Component
const ThoughtEdge = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  data 
}: any) => {
  const edgePath = `M${sourceX},${sourceY} Q${(sourceX + targetX) / 2},${sourceY - 50} ${targetX},${targetY}`;
  
  return (
    <g>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#8b5cf6"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 25}
          textAnchor="middle"
          className="text-xs fill-muted-foreground"
        >
          {data.label}
        </text>
      )}
    </g>
  );
};

const nodeTypes: NodeTypes = {
  idea: IdeaNode,
};

const edgeTypes: EdgeTypes = {
  thought: ThoughtEdge,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'idea',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Patient Wellness Goals',
      category: 'Objective',
      description: 'Primary treatment objectives'
    },
  },
  {
    id: '2',
    type: 'idea',
    position: { x: 100, y: 150 },
    data: { 
      label: 'Anxiety Management',
      category: 'Treatment',
      description: 'Breathing & mindfulness techniques'
    },
  },
  {
    id: '3',
    type: 'idea',
    position: { x: 400, y: 150 },
    data: { 
      label: 'Social Skills',
      category: 'Development',
      description: 'Communication & interaction improvement'
    },
  },
  {
    id: '4',
    type: 'idea',
    position: { x: 250, y: 250 },
    data: { 
      label: 'Progress Tracking',
      category: 'Monitoring',
      description: 'Weekly assessments & milestones'
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'thought',
    data: { label: 'addresses' },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'thought',
    data: { label: 'includes' },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    type: 'thought',
    data: { label: 'measured by' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'thought',
    data: { label: 'tracked via' },
  },
];

export const MindMapWhiteboard: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [newNodeText, setNewNodeText] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Idea');

  const categories = [
    'Idea', 'Objective', 'Treatment', 'Development', 
    'Monitoring', 'Challenge', 'Solution', 'Resource'
  ];

  const onConnect = React.useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'thought',
      data: { label: 'connects to' }
    }, eds)),
    [setEdges],
  );

  const addNewNode = () => {
    if (!newNodeText.trim()) return;

    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      type: 'idea',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: newNodeText,
        category: selectedCategory,
        description: ''
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeText('');
  };

  const handleSave = () => {
    const mindMapData = { nodes, edges };
    const dataStr = JSON.stringify(mindMapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'therapy-mindmap.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="p-4 border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-semibold">Mind Map & Whiteboard</h1>
              <p className="text-xs text-muted-foreground">
                Collaborative visual thinking space
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </div>
        </div>

        {/* Quick Add */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Add new concept or idea..."
              value={newNodeText}
              onChange={(e) => setNewNodeText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNewNode()}
              className="flex-1"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm bg-background"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Button onClick={addNewNode} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
          minZoom={0.2}
          maxZoom={2}
        >
          {/* Custom SVG Definitions */}
          <svg>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#8b5cf6"
                />
              </marker>
            </defs>
          </svg>
          
          <Controls className="!bg-card/90 !backdrop-blur-sm !border-border/50" />
          <MiniMap 
            className="!bg-card/90 !backdrop-blur-sm !border-border/50" 
            nodeColor={() => '#8b5cf6'}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background 
            gap={20} 
            size={1} 
            color="hsl(var(--muted-foreground))"
          />
        </ReactFlow>

        {/* Floating Tools */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 space-y-2"
        >
          <div className="text-xs font-medium text-muted-foreground px-2">
            Quick Tools
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" className="justify-start">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </Button>
            <Button variant="ghost" size="sm" className="justify-start">
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button variant="ghost" size="sm" className="justify-start">
              <Link className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </motion.div>

        {/* Node Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-3"
        >
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Mind Map Stats
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <div className="font-medium">{nodes.length}</div>
              <div className="text-xs text-muted-foreground">Concepts</div>
            </div>
            <div>
              <div className="font-medium">{edges.length}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {categories.slice(0, 4).map(cat => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};