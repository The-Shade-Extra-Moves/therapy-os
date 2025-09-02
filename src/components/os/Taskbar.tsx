
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
  Volume2 
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { Button } from '@/components/ui/button';
import { StartMenu } from './StartMenu';

const appIcons = [
  { id: 'patient-manager', icon: Users, label: 'Patients', component: 'PatientManager' },
  { id: 'session-notes', icon: FileText, label: 'Notes', component: 'SessionNotes' },
  { id: 'ai-assistant', icon: Brain, label: 'AI Assistant', component: 'AIAssistant' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', component: 'Calendar' },
  { id: 'settings', icon: Settings, label: 'Settings', component: 'Settings' },
];

export const Taskbar: React.FC = () => {
  const { windows, openWindow, restoreWindow, setActiveWindow } = useWindowStore();
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

  return (
    <>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 h-16 glass-surface border-t border-glass-border/50 flex items-center justify-between px-4 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Start Menu Button */}
        <div className="flex items-center space-x-3">
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
        <div className="flex items-center space-x-2">
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
        <div className="flex items-center space-x-3">
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
