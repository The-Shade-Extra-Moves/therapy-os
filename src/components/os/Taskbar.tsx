
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
  Folder,
  Shield,
  Bot
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import { StartMenu } from './StartMenu';

const appIcons = [
  { id: 'patient-manager', icon: Users, label: 'Patients', component: 'PatientManager' },
  { id: 'session-notes', icon: FileText, label: 'Notes', component: 'SessionNotes' },
  { id: 'search-browser', icon: Shield, label: 'Private Search', component: 'SearchBrowser' },
  { id: 'ai-search', icon: Bot, label: 'AI Search', component: 'AISearchApp' },
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
  const { windows, openWindow, restoreWindow, setActiveWindow } = useWindowStore();
  const { appearance } = useOSStore();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleAppClick = (app: typeof appIcons[0]) => {
    const existingWindow = windows.find(w => w.component === app.component);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        restoreWindow(existingWindow.id);
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
    const baseClasses = "fixed glass-surface border-glass-border/50 z-50";
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
            className={`h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary ${
              isStartMenuOpen ? 'bg-primary/20 text-primary' : ''
            }`}
            onClick={toggleStartMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* App Icons */}
        <div className={`flex items-center ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col space-y-2' 
            : 'space-x-2'
        }`}>
          {appIcons.map((app) => {
            const isOpen = windows.some(w => w.component === app.component && !w.isMinimized);
            const isActive = windows.some(w => w.component === app.component && w.isActive);
            
            return (
              <motion.div key={app.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAppClick(app)}
                  className={`
                    h-12 w-12 p-0 relative
                    ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-glass-surface/50'}
                    ${isOpen ? 'ring-2 ring-primary/30' : ''}
                  `}
                >
                  <app.icon className="h-5 w-5" />
                  {isOpen && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* System Tray */}
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
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          )}

          {/* Notifications Toggle */}
          {onOpenNotifications && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenNotifications}
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20 relative"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Wifi className="h-4 w-4" />
            <Volume2 className="h-4 w-4" />
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">{currentTime}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-glass-surface/50"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Start Menu */}
      <StartMenu isOpen={isStartMenuOpen} onClose={closeStartMenu} />
    </>
  );
};
