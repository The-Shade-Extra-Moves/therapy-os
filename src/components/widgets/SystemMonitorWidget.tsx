import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const SystemMonitorWidget: React.FC = () => {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      // Simulate system stats
      setStats({
        cpu: Math.random() * 100,
        memory: 45 + Math.random() * 30,
        disk: 65 + Math.random() * 10,
      });
    };

    updateStats();
    const timer = setInterval(updateStats, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="glass-surface p-4 rounded-xl w-72 h-40"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">System Monitor</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-foreground">CPU</span>
          </div>
          <span className="text-xs font-mono text-foreground">{stats.cpu.toFixed(1)}%</span>
        </div>
        <Progress value={stats.cpu} className="h-2" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-foreground">Memory</span>
          </div>
          <span className="text-xs font-mono text-foreground">{stats.memory.toFixed(1)}%</span>
        </div>
        <Progress value={stats.memory} className="h-2" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-3 h-3 text-orange-500" />
            <span className="text-xs text-foreground">Disk</span>
          </div>
          <span className="text-xs font-mono text-foreground">{stats.disk.toFixed(1)}%</span>
        </div>
        <Progress value={stats.disk} className="h-2" />
      </div>
    </motion.div>
  );
};