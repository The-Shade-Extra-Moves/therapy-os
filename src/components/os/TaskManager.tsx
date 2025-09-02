import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  X, 
  Pause, 
  Play,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessInfo {
  id: string;
  name: string;
  type: 'app' | 'widget' | 'system';
  cpuUsage: number;
  memoryUsage: number;
  status: 'running' | 'paused' | 'idle';
  priority: 'high' | 'normal' | 'low';
}

export const TaskManager: React.FC = () => {
  const { windows, closeWindow } = useWindowStore();
  const [activeTab, setActiveTab] = useState('processes');

  // Mock system metrics
  const systemMetrics = {
    cpu: { usage: 23, cores: 8, temperature: 42 },
    memory: { used: 8.2, total: 16, available: 7.8 },
    disk: { used: 256, total: 512, available: 256 },
    network: { upload: 1.2, download: 5.8 }
  };

  // Generate process list from windows and system processes
  const processes: ProcessInfo[] = [
    ...windows.map(w => ({
      id: w.id,
      name: w.title,
      type: 'app' as const,
      cpuUsage: Math.random() * 15 + 5,
      memoryUsage: Math.random() * 200 + 50,
      status: w.isMinimized ? 'paused' as const : 'running' as const,
      priority: 'normal' as const
    })),
    {
      id: 'system-kernel',
      name: 'ReMotionOS Kernel',
      type: 'system',
      cpuUsage: 2.1,
      memoryUsage: 45.2,
      status: 'running',
      priority: 'high'
    },
    {
      id: 'system-ui',
      name: 'Desktop Environment',
      type: 'system',
      cpuUsage: 8.5,
      memoryUsage: 156.8,
      status: 'running',
      priority: 'high'
    },
    {
      id: 'ai-assistant-bg',
      name: 'AI Assistant Service',
      type: 'system',
      cpuUsage: 12.3,
      memoryUsage: 89.4,
      status: 'running',
      priority: 'normal'
    }
  ];

  const handleEndProcess = (processId: string) => {
    const window = windows.find(w => w.id === processId);
    if (window) {
      closeWindow(processId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-secondary';
      case 'paused': return 'bg-accent';
      case 'idle': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'normal': return 'text-foreground';
      case 'low': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Processes
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="flex-1 mt-0 border-0 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Running Processes</h3>
                <Badge variant="secondary">
                  {processes.length} processes
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {processes.map((process) => (
                  <motion.div
                    key={process.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{process.name}</span>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(process.status)}
                            >
                              {process.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type: {process.type} • Priority: 
                            <span className={getPriorityColor(process.priority)}>
                              {process.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div>CPU: {process.cpuUsage.toFixed(1)}%</div>
                          <div className="text-muted-foreground">
                            Memory: {process.memoryUsage.toFixed(0)} MB
                          </div>
                        </div>
                        
                        {process.type === 'app' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEndProcess(process.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="flex-1 mt-0 border-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* CPU Usage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">CPU Usage</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Usage</span>
                    <span>{systemMetrics.cpu.usage}%</span>
                  </div>
                  <Progress value={systemMetrics.cpu.usage} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Cores: {systemMetrics.cpu.cores}</div>
                    <div>Temperature: {systemMetrics.cpu.temperature}°C</div>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Memory Usage</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used Memory</span>
                    <span>{systemMetrics.memory.used} / {systemMetrics.memory.total} GB</span>
                  </div>
                  <Progress 
                    value={(systemMetrics.memory.used / systemMetrics.memory.total) * 100} 
                    className="h-2" 
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Available: {systemMetrics.memory.available} GB</div>
                    <div>Usage: {((systemMetrics.memory.used / systemMetrics.memory.total) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Disk Usage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold">Storage</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used Storage</span>
                    <span>{systemMetrics.disk.used} / {systemMetrics.disk.total} GB</span>
                  </div>
                  <Progress 
                    value={(systemMetrics.disk.used / systemMetrics.disk.total) * 100} 
                    className="h-2" 
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Available: {systemMetrics.disk.available} GB</div>
                    <div>Usage: {((systemMetrics.disk.used / systemMetrics.disk.total) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Network Activity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Network Activity</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Upload</div>
                    <div className="text-lg font-semibold text-secondary">
                      {systemMetrics.network.upload} MB/s
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Download</div>
                    <div className="text-lg font-semibold text-primary">
                      {systemMetrics.network.download} MB/s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="services" className="flex-1 mt-0 border-0 p-0">
          <div className="p-6">
            <div className="text-center text-muted-foreground">
              <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">System Services</h3>
              <p>Advanced service management features coming soon...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};