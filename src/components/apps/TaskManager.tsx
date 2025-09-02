import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Cpu, HardDrive, Wifi, X, RefreshCw,
  ChevronDown, ChevronRight, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useWindowStore } from '@/stores/windowStore';

interface Process {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'suspended' | 'error';
  pid: number;
}

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export const TaskManager: React.FC = () => {
  const { windows, closeWindow } = useWindowStore();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['system']));

  useEffect(() => {
    // Generate mock processes based on open windows and system processes
    const generateProcesses = () => {
      const systemProcesses: Process[] = [
        {
          id: 'system',
          name: 'ReMotionOS System',
          cpu: 2.1 + Math.random() * 3,
          memory: 156 + Math.random() * 50,
          status: 'running',
          pid: 1001,
        },
        {
          id: 'desktop',
          name: 'Desktop Environment',
          cpu: 0.5 + Math.random() * 2,
          memory: 89 + Math.random() * 30,
          status: 'running',
          pid: 1002,
        },
        {
          id: 'taskbar',
          name: 'Taskbar Service',
          cpu: 0.1 + Math.random() * 0.5,
          memory: 32 + Math.random() * 15,
          status: 'running',
          pid: 1003,
        },
      ];

      const windowProcesses: Process[] = windows.map((window, index) => ({
        id: window.id,
        name: window.title,
        cpu: Math.random() * 15,
        memory: 45 + Math.random() * 100,
        status: window.isMinimized ? 'suspended' : 'running',
        pid: 2000 + index,
      }));

      return [...systemProcesses, ...windowProcesses];
    };

    const updateStats = () => {
      setProcesses(generateProcesses());
      setSystemStats({
        cpu: 15 + Math.random() * 25,
        memory: 45 + Math.random() * 30,
        disk: 65 + Math.random() * 10,
        network: Math.random() * 50,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [windows]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleEndProcess = (processId: string) => {
    const window = windows.find(w => w.id === processId);
    if (window) {
      closeWindow(processId);
    }
  };

  const getStatusColor = (status: Process['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'suspended': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const SystemOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {systemStats.cpu.toFixed(1)}%
          </div>
          <Progress value={systemStats.cpu} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <HardDrive className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {systemStats.memory.toFixed(1)}%
          </div>
          <Progress value={systemStats.memory} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Disk</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {systemStats.disk.toFixed(1)}%
          </div>
          <Progress value={systemStats.disk} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Wifi className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {systemStats.network.toFixed(1)}%
          </div>
          <Progress value={systemStats.network} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );

  const ProcessList = () => {
    const systemProcesses = processes.filter(p => ['system', 'desktop', 'taskbar'].includes(p.id));
    const userProcesses = processes.filter(p => !['system', 'desktop', 'taskbar'].includes(p.id));

    const ProcessSection = ({ title, processes, sectionId }: { 
      title: string; 
      processes: Process[]; 
      sectionId: string; 
    }) => (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionId)}
          className="flex items-center space-x-2 w-full text-left p-2 hover:bg-muted/50 rounded"
        >
          {expandedSections.has(sectionId) ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="font-medium">{title}</span>
          <Badge variant="secondary" className="ml-auto">
            {processes.length}
          </Badge>
        </button>

        {expandedSections.has(sectionId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mt-2"
          >
            {processes.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(process.status)}`} />
                  <div>
                    <div className="font-medium text-sm">{process.name}</div>
                    <div className="text-xs text-muted-foreground">PID: {process.pid}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-right">
                    <div>{process.cpu.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">CPU</div>
                  </div>
                  <div className="text-right">
                    <div>{process.memory.toFixed(0)} MB</div>
                    <div className="text-xs text-muted-foreground">Memory</div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={process.status === 'running' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {process.status}
                    </Badge>
                  </div>
                  {!['system', 'desktop', 'taskbar'].includes(process.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEndProcess(process.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );

    return (
      <div>
        <ProcessSection 
          title="System Processes" 
          processes={systemProcesses} 
          sectionId="system" 
        />
        <ProcessSection 
          title="User Applications" 
          processes={userProcesses} 
          sectionId="user" 
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Manager</h1>
            <p className="text-muted-foreground">Monitor system performance and processes</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="processes" className="h-full">
          <div className="px-6 py-4 border-b">
            <TabsList>
              <TabsTrigger value="processes">Processes</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="processes" className="p-6 mt-0">
            <SystemOverview />
            <ProcessList />
          </TabsContent>

          <TabsContent value="performance" className="p-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CPU Performance</CardTitle>
                  <CardDescription>Real-time CPU usage monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <div className="text-center">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">CPU chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                  <CardDescription>RAM consumption over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <div className="text-center">
                      <HardDrive className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Memory chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="p-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Detailed system specifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Hardware</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Processor: Intel Core i7-9700K</div>
                      <div>Memory: 16 GB DDR4</div>
                      <div>Storage: 512 GB NVMe SSD</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Software</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>OS: ReMotionOS v1.0</div>
                      <div>Runtime: Chrome 120.0</div>
                      <div>Node.js: v18.17.0</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};