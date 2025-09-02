import React from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore, WindowState } from '@/stores/windowStore';
import { WindowControls } from './WindowControls';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window, children }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow, setActiveWindow, updateWindowPosition, updateWindowSize } = useWindowStore();

  const handleDragStop = (e: any, d: any) => {
    updateWindowPosition(window.id, { x: d.x, y: d.y });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    updateWindowSize(window.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    });
    updateWindowPosition(window.id, position);
  };

  const handleMinimize = () => {
    minimizeWindow(window.id);
  };

  const handleMaximize = () => {
    if (window.isMaximized) {
      restoreWindow(window.id);
    } else {
      maximizeWindow(window.id);
    }
  };

  const handleClose = () => {
    closeWindow(window.id);
  };

  const handleRestore = () => {
    restoreWindow(window.id);
  };

  const handleFocus = () => {
    setActiveWindow(window.id);
  };

  // Calculate position and size for maximized windows
  const rndProps = window.isMaximized 
    ? {
        position: { x: 0, y: 0 },
        size: { width: '100vw', height: 'calc(100vh - 48px)' },
        disableDragging: true,
        enableResizing: false
      }
    : {
        position: window.position,
        size: window.size,
        disableDragging: false,
        enableResizing: true
      };

  return (
    <AnimatePresence>
      {!window.isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ zIndex: window.zIndex }}
          className="absolute"
        >
          <Rnd
            {...rndProps}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            minWidth={400}
            minHeight={300}
            bounds="window"
            dragHandleClassName="window-drag-handle"
            onMouseDown={handleFocus}
          >
            <motion.div
              className={`window-surface rounded-xl overflow-hidden h-full flex flex-col ${
                window.isActive ? 'shadow-window' : 'shadow-lg'
              }`}
              whileHover={{ 
                boxShadow: window.isActive ? undefined : 'var(--shadow-window)'
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Window Header */}
              <div className="window-drag-handle flex items-center justify-between px-4 py-3 bg-card/50 border-b border-border/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer" onClick={handleClose} />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer" onClick={handleMinimize} />
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer" onClick={handleMaximize} />
                  </div>
                  <h3 className="font-medium text-sm select-none">{window.title}</h3>
                </div>
                
                <WindowControls
                  windowId={window.id}
                  isMaximized={window.isMaximized}
                  isMinimized={window.isMinimized}
                  onMinimize={handleMinimize}
                  onMaximize={handleMaximize}
                  onClose={handleClose}
                  onRestore={handleRestore}
                />
              </div>
              
              {/* Window Content */}
              <div className="flex-1 overflow-hidden bg-window-bg">
                {children}
              </div>
            </motion.div>
          </Rnd>
        </motion.div>
      )}
    </AnimatePresence>
  );
};