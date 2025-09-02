import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, Clock, CheckSquare, Bot, FileText, Mic, MicOff,
  Play, Pause, Square, Settings, Download, Upload, Search, Filter,
  Zap, Brain, History, AlertCircle, CheckCircle, XCircle, MoreHorizontal,
  Trash2, Edit3, Copy, RefreshCw, Bell, Archive, Tag, ChevronDown,
  Calendar as CalendarIcon, PlusCircle, Target, TrendingUp, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'reminder' | 'automation' | 'workflow' | 'recurring' | 'ai_suggestion';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: Date;
  recurringPattern?: string;
  patientId?: string;
  patientName?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  progress?: number;
  estimatedDuration?: number;
  actualDuration?: number;
}

interface LogEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  action: 'created' | 'started' | 'completed' | 'failed' | 'paused' | 'resumed' | 'modified';
  timestamp: Date;
  details?: string;
  error?: string;
  userId?: string;
}

interface AIProfile {
  id: string;
  name: string;
  description: string;
  avatar: string;
  specialization: string[];
  active: boolean;
}

const AISecretaryApp: React.FC = () => {
  // State Management
  const [activeView, setActiveView] = useState<'tasks' | 'scheduler' | 'history' | 'ai'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Patient Session Reminder',
      description: 'Remind patient Sarah about upcoming therapy session',
      type: 'reminder',
      status: 'pending',
      priority: 'high',
      scheduledDate: new Date(Date.now() + 3600000),
      patientId: '123',
      patientName: 'Sarah Johnson',
      tags: ['reminder', 'patient', 'session'],
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDuration: 5
    },
    {
      id: '2',
      title: 'Generate Weekly Report',
      description: 'Automated weekly therapy progress report generation',
      type: 'automation',
      status: 'running',
      priority: 'medium',
      recurringPattern: '0 9 * * MON',
      tags: ['report', 'automation', 'weekly'],
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 65,
      estimatedDuration: 30
    },
    {
      id: '3',
      title: 'Follow-up Care Plan',
      description: 'AI suggested task for patient care optimization',
      type: 'ai_suggestion',
      status: 'pending',
      priority: 'medium',
      patientId: '456',
      patientName: 'Mike Chen',
      tags: ['ai', 'suggestion', 'care-plan'],
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDuration: 15
    }
  ]);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      taskId: '1',
      taskTitle: 'Patient Session Reminder',
      action: 'created',
      timestamp: new Date(Date.now() - 3600000),
      details: 'Reminder task created for Sarah Johnson'
    },
    {
      id: '2', 
      taskId: '2',
      taskTitle: 'Generate Weekly Report',
      action: 'started',
      timestamp: new Date(Date.now() - 1800000),
      details: 'Weekly report generation initiated'
    }
  ]);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState<Task['type']>('reminder');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskSchedule, setNewTaskSchedule] = useState<Date | undefined>();
  const [newTaskPatient, setNewTaskPatient] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [aiProfiles] = useState<AIProfile[]>([
    {
      id: '1',
      name: 'Task Optimizer',
      description: 'Analyzes workflow patterns and suggests optimizations',
      avatar: '🤖',
      specialization: ['task-optimization', 'workflow-analysis'],
      active: true
    },
    {
      id: '2',
      name: 'Patient Care AI',
      description: 'Focuses on patient care workflows and reminders',
      avatar: '👩‍⚕️',
      specialization: ['patient-care', 'therapy-planning'],
      active: true
    },
    {
      id: '3',
      name: 'Schedule Master',
      description: 'Optimizes scheduling and calendar management',
      avatar: '📅',
      specialization: ['scheduling', 'calendar-optimization'],
      active: false
    }
  ]);

  const [aiSuggestions] = useState([
    {
      id: '1',
      title: 'Optimize Session Reminders',
      description: 'Based on patient no-show patterns, I suggest sending reminders 24 hours and 2 hours before sessions.',
      type: 'workflow',
      confidence: 92,
      potentialSavings: '15 minutes/day'
    },
    {
      id: '2',
      title: 'Automate Progress Reports',
      description: 'Create automated weekly progress reports based on session notes and patient feedback.',
      type: 'automation',
      confidence: 88,
      potentialSavings: '2 hours/week'
    },
    {
      id: '3',
      title: 'Patient Mood Tracking',
      description: 'Set up automated mood check-ins via ReMotionOS messaging for better care monitoring.',
      type: 'reminder',
      confidence: 85,
      potentialSavings: '30 minutes/week'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters and Search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.patientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredLogs = logs.filter(log => 
    log.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Task Actions
  const createTask = useCallback(() => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      type: newTaskType,
      status: 'pending',
      priority: newTaskPriority,
      scheduledDate: newTaskSchedule,
      patientName: newTaskPatient || undefined,
      patientId: newTaskPatient ? Date.now().toString() : undefined,
      tags: newTaskTags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [...prev, newTask]);
    
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      taskId: newTask.id,
      taskTitle: newTask.title,
      action: 'created',
      timestamp: new Date(),
      details: `${newTask.type} task created${newTask.patientName ? ` for ${newTask.patientName}` : ''}`
    };
    
    setLogs(prev => [logEntry, ...prev]);

    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskType('reminder');
    setNewTaskPriority('medium');
    setNewTaskSchedule(undefined);
    setNewTaskPatient('');
    setNewTaskTags('');
    setIsCreateDialogOpen(false);

    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been added to your task list.`
    });
  }, [newTaskTitle, newTaskDescription, newTaskType, newTaskPriority, newTaskSchedule, newTaskPatient, newTaskTags]);

  const runTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'running', updatedAt: new Date() }
        : task
    ));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        taskId,
        taskTitle: task.title,
        action: 'started',
        timestamp: new Date(),
        details: `Task execution started`
      };
      setLogs(prev => [logEntry, ...prev]);

      toast({
        title: "Task Started",
        description: `"${task.title}" is now running.`
      });

      // Simulate task completion
      setTimeout(() => {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed', completedAt: new Date(), progress: 100 }
            : t
        ));

        const completionLogEntry: LogEntry = {
          id: (Date.now() + 1).toString(),
          taskId,
          taskTitle: task.title,
          action: 'completed',
          timestamp: new Date(),
          details: `Task completed successfully`
        };
        setLogs(prev => [completionLogEntry, ...prev]);

        toast({
          title: "Task Completed",
          description: `"${task.title}" has been completed successfully.`
        });
      }, 3000);
    }
  }, [tasks]);

  const pauseTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'paused', updatedAt: new Date() }
        : task
    ));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        taskId,
        taskTitle: task.title,
        action: 'paused',
        timestamp: new Date(),
        details: `Task execution paused`
      };
      setLogs(prev => [logEntry, ...prev]);

      toast({
        title: "Task Paused",
        description: `"${task.title}" has been paused.`
      });
    }
  }, [tasks]);

  const deleteTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    if (task) {
      toast({
        title: "Task Deleted",
        description: `"${task.title}" has been removed.`
      });
    }
  }, [tasks]);

  // Voice Recording
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => {
      const newState = !prev;
      if (newState) {
        toast({
          title: "Voice Recording Started",
          description: "Speak your task or command..."
        });
      } else {
        toast({
          title: "Voice Recording Stopped",
          description: "Processing your voice command..."
        });
        // Here you would process the voice input
      }
      return newState;
    });
  }, []);

  // File Upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      toast({
        title: "File Uploaded",
        description: `Processing "${file.name}" for task extraction...`
      });
      
      // Simulate AI processing
      setTimeout(() => {
        const extractedTask: Task = {
          id: Date.now().toString(),
          title: `Process ${file.name}`,
          description: `AI extracted task from uploaded file: ${file.name}`,
          type: 'automation',
          status: 'pending',
          priority: 'medium',
          tags: ['file-processing', 'ai-extracted'],
          createdAt: new Date(),
          updatedAt: new Date(),
          estimatedDuration: 10
        };
        
        setTasks(prev => [...prev, extractedTask]);
        toast({
          title: "Task Extracted",
          description: `AI found a task in "${file.name}" and added it to your list.`
        });
      }, 2000);
    }
  }, []);

  // Export Functions
  const exportTasks = useCallback(() => {
    const data = {
      tasks: filteredTasks,
      logs: logs.filter(log => filteredTasks.some(task => task.id === log.taskId)),
      exportDate: new Date(),
      totalTasks: filteredTasks.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-secretary-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your tasks and logs have been exported successfully."
    });
  }, [filteredTasks, logs]);

  // Status Badge Component
  const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
    const variants = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      running: { bg: 'bg-blue-100 text-blue-800', icon: Play },
      completed: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { bg: 'bg-red-100 text-red-800', icon: XCircle },
      paused: { bg: 'bg-gray-100 text-gray-800', icon: Pause }
    };
    
    const variant = variants[status];
    const Icon = variant.icon;
    
    return (
      <Badge className={cn("capitalize", variant.bg)}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // Priority Badge Component
  const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={cn("capitalize", variants[priority])}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">AI Secretary</h1>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Set up a new automated task or reminder
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-title" className="text-right">Title</Label>
                      <Input
                        id="task-title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="col-span-3"
                        placeholder="Task title..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-description" className="text-right">Description</Label>
                      <Textarea
                        id="task-description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="Task description..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-type" className="text-right">Type</Label>
                      <Select value={newTaskType} onValueChange={(value: Task['type']) => setNewTaskType(value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="automation">Automation</SelectItem>
                          <SelectItem value="workflow">Workflow</SelectItem>
                          <SelectItem value="recurring">Recurring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-priority" className="text-right">Priority</Label>
                      <Select value={newTaskPriority} onValueChange={(value: Task['priority']) => setNewTaskPriority(value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-schedule" className="text-right">Schedule</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !newTaskSchedule && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTaskSchedule ? format(newTaskSchedule, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={newTaskSchedule}
                            onSelect={setNewTaskSchedule}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-patient" className="text-right">Patient</Label>
                      <Input
                        id="task-patient"
                        value={newTaskPatient}
                        onChange={(e) => setNewTaskPatient(e.target.value)}
                        className="col-span-3"
                        placeholder="Patient name (optional)..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-tags" className="text-right">Tags</Label>
                      <Input
                        id="task-tags"
                        value={newTaskTags}
                        onChange={(e) => setNewTaskTags(e.target.value)}
                        className="col-span-3"
                        placeholder="Tags (comma separated)..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createTask}>
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={toggleRecording}>
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Command
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt,.csv"
              />
              
              <Button variant="outline" size="sm" onClick={exportTasks}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{tasks.filter(t => t.status === 'running').length} Running</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{tasks.filter(t => t.status === 'pending').length} Pending</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{tasks.filter(t => t.status === 'completed').length} Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-muted/20">
          <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks" className="text-xs">
                <CheckSquare className="h-4 w-4 mr-1" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="scheduler" className="text-xs">
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="h-4 w-4 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                <Brain className="h-4 w-4 mr-1" />
                AI
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks, logs, or AI suggestions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {activeView === 'tasks' && (
                    <div className="flex space-x-2">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <TabsContent value="tasks" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm leading-5">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {task.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => runTask(task.id)}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Run Task
                                  </DropdownMenuItem>
                                )}
                                {task.status === 'running' && (
                                  <DropdownMenuItem onClick={() => pauseTask(task.id)}>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause Task
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <StatusBadge status={task.status} />
                              <PriorityBadge priority={task.priority} />
                            </div>
                            {task.progress !== undefined && (
                              <div className="text-xs text-muted-foreground">
                                {task.progress}%
                              </div>
                            )}
                          </div>
                          
                          {task.progress !== undefined && (
                            <Progress value={task.progress} className="h-1" />
                          )}
                          
                          {task.patientName && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="h-3 w-3 mr-1" />
                              {task.patientName}
                            </div>
                          )}
                          
                          {task.scheduledDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(task.scheduledDate, 'MMM d, h:mm a')}
                            </div>
                          )}
                          
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{task.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredTasks.length === 0 && (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery ? 'No tasks match your search criteria.' : 'Create your first task to get started.'}
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="scheduler" className="flex-1 m-0">
              <div className="p-4 space-y-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border p-3 pointer-events-auto"
                />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Scheduled Tasks</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {tasks
                        .filter(task => task.scheduledDate && 
                          selectedDate && 
                          format(task.scheduledDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
                        .map((task) => (
                          <Card key={task.id} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-sm">{task.title}</h5>
                                <StatusBadge status={task.status} />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {task.scheduledDate && format(task.scheduledDate, 'h:mm a')}
                              </div>
                            </div>
                          </Card>
                        ))}
                      
                      {tasks.filter(task => task.scheduledDate && 
                        selectedDate && 
                        format(task.scheduledDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No tasks scheduled for this date</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {filteredLogs.map((log) => (
                    <Card key={log.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{log.taskTitle}</h5>
                          <Badge variant="outline" className="text-xs capitalize">
                            {log.action}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                        <div className="text-xs text-muted-foreground">
                          {format(log.timestamp, 'MMM d, h:mm a')}
                        </div>
                        {log.error && (
                          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                            {log.error}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No History</h3>
                      <p className="text-sm text-muted-foreground">
                        Task execution history will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">AI Profiles</h4>
                    <div className="space-y-2">
                      {aiProfiles.map((profile) => (
                        <Card key={profile.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-lg">{profile.avatar}</div>
                              <div>
                                <h5 className="font-medium text-sm">{profile.name}</h5>
                                <p className="text-xs text-muted-foreground">{profile.description}</p>
                              </div>
                            </div>
                            <Switch checked={profile.active} />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">AI Suggestions</h4>
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="p-3">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{suggestion.title}</h5>
                                <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.confidence}% confidence
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                <span>Saves {suggestion.potentialSavings}</span>
                              </div>
                              <Button size="sm" variant="outline">
                                <PlusCircle className="h-3 w-3 mr-1" />
                                Implement
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col">
          {/* Workspace Header */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize">{activeView} Overview</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Workspace Content */}
          <div className="flex-1 p-6">
            {activeView === 'tasks' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                          <p className="text-2xl font-bold">{tasks.length}</p>
                        </div>
                        <CheckSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Running</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {tasks.filter(t => t.status === 'running').length}
                          </p>
                        </div>
                        <Play className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Completed</p>
                          <p className="text-2xl font-bold text-green-600">
                            {tasks.filter(t => t.status === 'completed').length}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Failed</p>
                          <p className="text-2xl font-bold text-red-600">
                            {tasks.filter(t => t.status === 'failed').length}
                          </p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Task Activity</CardTitle>
                    <CardDescription>Latest task executions and status changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.taskTitle}</p>
                            <p className="text-xs text-muted-foreground">{log.details}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(log.timestamp, 'h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'ai' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Assistant Dashboard</CardTitle>
                    <CardDescription>Manage AI profiles and view suggestions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Active AI</p>
                              <p className="text-2xl font-bold">{aiProfiles.filter(p => p.active).length}</p>
                            </div>
                            <Bot className="h-8 w-8 text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
                              <p className="text-2xl font-bold">{aiSuggestions.length}</p>
                            </div>
                            <Brain className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                              <p className="text-2xl font-bold">5.2h</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">AI Suggestions</h3>
                      <div className="grid gap-4">
                        {aiSuggestions.map((suggestion) => (
                          <Card key={suggestion.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{suggestion.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                                  <div className="flex items-center space-x-4 mt-3">
                                    <Badge variant="outline">
                                      {suggestion.confidence}% confidence
                                    </Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <TrendingUp className="h-4 w-4 mr-1" />
                                      Saves {suggestion.potentialSavings}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Target className="h-4 w-4 mr-2" />
                                    Preview
                                  </Button>
                                  <Button size="sm">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Implement
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(activeView === 'scheduler' || activeView === 'history') && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {activeView === 'scheduler' ? '📅' : '📋'}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {activeView === 'scheduler' ? 'Scheduler View' : 'History View'}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeView === 'scheduler' 
                      ? 'Use the calendar sidebar to view and manage scheduled tasks.' 
                      : 'Check the history sidebar for detailed task execution logs.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISecretaryApp;