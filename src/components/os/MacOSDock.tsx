import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion';
import { 
  Users, 
  Brain, 
  FileText, 
  Calendar, 
  Settings,
  Folder,
  Activity,
  Heart,
  Plus
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DockItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: string;
  isRunning: boolean;
  isActive: boolean;
  position: number;
}

interface MacOSDocxProps {
  position?: 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}

export const MacOSDock: React.FC<MacOSDocxProps> = ({ 
  position = 'bottom', 
  size = 'medium' 
}) => {
  const { windows, openWindow, setActiveWindow, restoreWindow } = useWindowStore();
  const [dockItems, setDockItems] = useState<DockItem[]>([
    { id: 'patient-manager', name: 'Patients', icon: Users, component: 'PatientManager', isRunning: false, isActive: false, position: 0 },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Brain, component: 'AIAssistant', isRunning: false, isActive: false, position: 1 },
    { id: 'session-notes', name: 'Notes', icon: FileText, component: 'SessionNotes', isRunning: false, isActive: false, position: 2 },
    { id: 'calendar', name: 'Calendar', icon: Calendar, component: 'Calendar', isRunning: false, isActive: false, position: 3 },
    { id: 'file-manager', name: 'Files', icon: Folder, component: 'FileManager', isRunning: false, isActive: false, position: 4 },
    { id: 'task-manager', name: 'Activity', icon: Activity, component: 'SystemTaskManager', isRunning: false, isActive: false, position: 5 },
    { id: 'accessibility', name: 'Accessibility', icon: Heart, component: 'AccessibilityPanel', isRunning: false, isActive: false, position: 6 },
    { id: 'settings', name: 'Settings', icon: Settings, component: 'Settings', isRunning: false, isActive: false, position: 7 }
  ]);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Update dock items based on running windows
  React.useEffect(() => {
    setDockItems(prev => prev.map(item => {
      const window = windows.find(w => w.component === item.component);
      return {
        ...item,
        isRunning: !!window,
        isActive: window?.isActive || false
      };
    }));
  }, [windows]);

  const handleItemClick = (item: DockItem) => {
    const existingWindow = windows.find(w => w.component === item.component);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        restoreWindow(existingWindow.id);
      } else if (existingWindow.isActive) {
        // If already active, minimize
        return;
      } else {
        setActiveWindow(existingWindow.id);
      }
    } else {
      openWindow({
        title: item.name,
        component: item.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        size: { width: 800, height: 600 },
      });
    }
  };

  const getItemScale = (itemId: string, index: number) => {
    if (hoveredItem === itemId) return 1.6;
    
    const hoveredIndex = dockItems.findIndex(item => item.id === hoveredItem);
    if (hoveredIndex === -1) return 1;
    
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 1) return 1.3;
    if (distance === 2) return 1.1;
    return 1;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-8 h-8';
      case 'large': return 'w-16 h-16';
      default: return 'w-12 h-12';
    }
  };

  const getDockClasses = () => {
    const baseClasses = "fixed glass-surface border border-glass-border/50 z-40";
    const paddingClasses = "p-2";
    
    switch (position) {
      case 'left':
        return `${baseClasses} ${paddingClasses} left-4 top-1/2 transform -translate-y-1/2 flex-col rounded-2xl`;
      case 'right':
        return `${baseClasses} ${paddingClasses} right-4 top-1/2 transform -translate-y-1/2 flex-col rounded-2xl`;
      default: // bottom
        return `${baseClasses} ${paddingClasses} bottom-4 left-1/2 transform -translate-x-1/2 rounded-2xl`;
    }
  };

  const getFlexDirection = () => {
    return position === 'bottom' ? 'flex-row' : 'flex-col';
  };

  return (
    <motion.div 
      className={`${getDockClasses()} backdrop-blur-xl`}
      initial={{ 
        opacity: 0, 
        scale: 0.8,
        y: position === 'bottom' ? 100 : 0,
        x: position === 'left' ? -100 : position === 'right' ? 100 : 0
      }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Reorder.Group 
        axis={position === 'bottom' ? 'x' : 'y'}
        values={dockItems}
        onReorder={setDockItems}
        className={`flex ${getFlexDirection()} gap-1 items-center`}
      >
        {dockItems.map((item, index) => (
          <Reorder.Item key={item.id} value={item} dragListener={false}>
            <motion.div
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => handleItemClick(item)}
              animate={{ 
                scale: getItemScale(item.id, index),
                y: hoveredItem === item.id && position === 'bottom' ? -8 : 0,
                x: hoveredItem === item.id && position !== 'bottom' ? (position === 'left' ? 8 : -8) : 0
              }}
              transition={{ 
                type: 'spring', 
                damping: 15, 
                stiffness: 300,
                duration: 0.2
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* App Icon */}
              <div className={`
                ${getSizeClasses()} 
                rounded-xl 
                bg-gradient-to-br from-glass-surface to-glass-surface/80 
                border border-glass-border/30
                flex items-center justify-center 
                shadow-lg
                backdrop-blur-sm
                transition-all duration-200
                ${item.isActive ? 'ring-2 ring-primary/50 shadow-primary/20' : ''}
                ${item.isRunning ? 'shadow-accent/20' : ''}
              `}>
                <item.icon className={`
                  text-foreground transition-all duration-200
                  ${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'}
                  ${item.isActive ? 'text-primary' : ''}
                `} />
              </div>

              {/* Running Indicator */}
              {item.isRunning && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}

              {/* Active Indicator */}
              {item.isActive && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-secondary rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredItem === item.id && (
                  <motion.div
                    className={`
                      absolute z-50 px-2 py-1 bg-background border rounded-md shadow-lg text-xs whitespace-nowrap
                      ${position === 'bottom' ? '-top-10 left-1/2 transform -translate-x-1/2' : 
                        position === 'left' ? 'left-full ml-3 top-1/2 transform -translate-y-1/2' :
                        'right-full mr-3 top-1/2 transform -translate-y-1/2'
                      }
                    `}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                    {item.isRunning && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Running
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag Handle (visible only when dragging) */}
              <motion.div
                className="absolute inset-0 cursor-move"
                onMouseDown={() => setDraggedItem(item.id)}
                onMouseUp={() => setDraggedItem(null)}
                style={{ 
                  opacity: draggedItem === item.id ? 0.5 : 0 
                }}
              />
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Add Button */}
      <motion.div
        className="ml-2 group cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={`
            ${getSizeClasses()} 
            p-0 
            rounded-xl 
            bg-muted/50 
            hover:bg-muted 
            border-2 
            border-dashed 
            border-muted-foreground/30
            hover:border-muted-foreground/50
          `}
        >
          <Plus className={`
            text-muted-foreground 
            ${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-6 h-6' : 'w-4 h-4'}
          `} />
        </Button>
      </motion.div>
    </motion.div>
  );
};