import React from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { Minus, Square, X, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowStore, WindowState } from '@/stores/windowStore';
import { Button } from '@/components/ui/button';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window, children }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize 
  } = useWindowStore();

  const handleDragStop = (e: any, d: any) => {
    updateWindowPosition(window.id, { x: d.x, y: d.y });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    updateWindowSize(window.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    updateWindowPosition(window.id, position);
  };

  const windowStyle = window.isMaximized 
    ? { x: 0, y: 0, width: '100vw', height: 'calc(100vh - 60px)' }
    : { 
        x: window.position.x, 
        y: window.position.y, 
        width: window.size.width, 
        height: window.size.height 
      };

  if (window.isMinimized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ zIndex: window.isActive ? 9999 : window.zIndex }}
    >
      <Rnd
        position={window.isMaximized ? { x: 0, y: 0 } : window.position}
        size={window.isMaximized ? { width: '100vw', height: 'calc(100vh - 60px)' } : window.size}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        disableDragging={window.isMaximized}
        enableResizing={!window.isMaximized}
        minWidth={320}
        minHeight={240}
        className={`
          glass-window rounded-xl overflow-hidden
          ${window.isActive ? 'ring-2 ring-primary/50' : ''}
        `}
        dragHandleClassName="window-header"
        onClick={() => setActiveWindow(window.id)}
      >
        {/* Window Header */}
        <div className="window-header flex items-center justify-between p-4 bg-gradient-glass border-b border-glass-border/50 cursor-move">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
            </div>
            <h3 className="text-sm font-medium text-foreground select-none">
              {window.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(window.id);
              }}
              className="h-6 w-6 p-0 hover:bg-glass-surface/50"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(window.id);
              }}
              className="h-6 w-6 p-0 hover:bg-glass-surface/50"
            >
              {window.isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(window.id);
              }}
              className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 h-full overflow-hidden">
          {children}
        </div>
      </Rnd>
    </motion.div>
  );
};