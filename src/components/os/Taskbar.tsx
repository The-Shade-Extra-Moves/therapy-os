
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  Menu,
  Clock,
  Wifi,
  Volume2,
  Grid3X3,
  Bell,
  Activity,
  Folder
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import { EnhancedStartMenu } from './EnhancedStartMenu';
import { EnhancedSystemTray } from './EnhancedSystemTray';

const appIcons = [
  { id: 'patient-manager', icon: Users, label: 'Patients', component: 'PatientManager' },
  { id: 'session-notes', icon: FileText, label: 'Notes', component: 'SessionNotes' },
  { id: 'ai-assistant', icon: Brain, label: 'AI Assistant', component: 'AIAssistant' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', component: 'Calendar' },
  { id: 'file-manager', icon: Folder, label: 'Files', component: 'FileManager' },
  { id: 'task-manager', icon: Activity, label: 'Task Manager', component: 'SystemTaskManager' },
  { id: 'settings', icon: Settings, label: 'Settings', component: 'Settings' },
];

interface TaskbarProps {
  onOpenWidgets?: () => void;
  onOpenNotifications?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ onOpenWidgets, onOpenNotifications }) => {
  const { windows, openWindow, restoreWindow, setActiveWindow, minimizeWindow } = useWindowStore();
  const { appearance } = useOSStore();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleAppClick = (app: typeof appIcons[0]) => {
    const existingWindow = windows.find(w => w.component === app.component);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        restoreWindow(existingWindow.id);
      } else if (existingWindow.isActive) {
        minimizeWindow(existingWindow.id);
      } else {
        setActiveWindow(existingWindow.id);
      }
    } else {
      openWindow({
        title: app.label,
        component: app.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        size: { width: 800, height: 600 },
      });
    }
  };

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const closeStartMenu = () => {
    setIsStartMenuOpen(false);
  };

  // Dynamic taskbar styling based on appearance settings
  const getTaskbarClasses = () => {
    const baseClasses = "fixed glass-surface border-glass-border/50 z-50 backdrop-blur-xl";
    const sizeClasses = {
      small: "h-12",
      medium: "h-16", 
      large: "h-20"
    };
    const positionClasses = {
      bottom: "bottom-0 left-0 right-0 border-t flex items-center justify-between",
      top: "top-0 left-0 right-0 border-b flex items-center justify-between",
      left: "left-0 top-0 bottom-0 w-16 border-r flex flex-col items-center justify-start py-4",
      right: "right-0 top-0 bottom-0 w-16 border-l flex flex-col items-center justify-start py-4"
    };
    
    return `${baseClasses} ${sizeClasses[appearance.taskbarSize]} ${positionClasses[appearance.taskbarPosition]}`;
  };

  return (
    <>
      <motion.div 
        className={`${getTaskbarClasses()} px-4`}
        initial={{ 
          y: appearance.taskbarPosition === 'bottom' ? 100 : appearance.taskbarPosition === 'top' ? -100 : 0, 
          x: appearance.taskbarPosition === 'left' ? -100 : appearance.taskbarPosition === 'right' ? 100 : 0 
        }}
        animate={{ y: 0, x: 0 }}
        transition={{ duration: appearance.animations ? 0.3 : 0 }}
        style={{ 
          background: `hsl(var(--taskbar-bg) / ${appearance.transparency})`,
          backdropFilter: `blur(${appearance.transparency * 20}px)`
        }}
      >
        {/* Start Menu Button */}
        <div className={`flex items-center ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col space-y-2' 
            : 'space-x-3'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 ${
              isStartMenuOpen ? 'bg-primary/20 text-primary scale-105' : ''
            }`}
            onClick={toggleStartMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* App Icons with Enhanced Animations */}
        <div className={`flex items-center ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col space-y-2' 
            : 'space-x-2'
        }`}>
          {appIcons.map((app) => {
            const isOpen = windows.some(w => w.component === app.component && !w.isMinimized);
            const isActive = windows.some(w => w.component === app.component && w.isActive);
            const isMinimized = windows.some(w => w.component === app.component && w.isMinimized);
            
            return (
              <motion.div 
                key={app.id} 
                whileHover={{ scale: 1.1, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAppClick(app)}
                  className={`
                    h-12 w-12 p-0 relative transition-all duration-200 rounded-xl
                    ${isActive ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20' : 'hover:bg-glass-surface/50'}
                    ${isOpen ? 'ring-2 ring-primary/30' : ''}
                    ${isMinimized ? 'opacity-60' : ''}
                  `}
                  title={app.label}
                >
                  <app.icon className="h-5 w-5" />
                  
                  {/* Running Indicator */}
                  {isOpen && (
                    <motion.div 
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    />
                  )}
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-primary rounded-full"
                      layoutId={`active-${app.id}`}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced System Tray */}
        <div className={`flex items-center ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col space-y-2' 
            : 'space-x-3'
        }`}>
          {/* Widgets Toggle */}
          {onOpenWidgets && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenWidgets}
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20 transition-all duration-200"
              title="Open Widgets"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          )}

          <EnhancedSystemTray onOpenNotifications={onOpenNotifications} />
        </div>
      </motion.div>

      {/* Enhanced Start Menu */}
      <EnhancedStartMenu isOpen={isStartMenuOpen} onClose={closeStartMenu} />
    </>
  );
};
