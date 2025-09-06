import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { Minus, X, Maximize2, Minimize2, Expand, ExternalLink } from 'lucide-react';
import { useWindowStore, WindowState } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';
import { useViewport } from '@/hooks/useViewport';
import { Button } from '@/components/ui/button';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window: windowState, children }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow,
    toggleFullScreen,
    popOutWindow,
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize 
  } = useWindowStore();
  const { appearance } = useOSStore();
  const viewport = useViewport();

  // Handle F11 key for full screen toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11' && windowState.isActive) {
        e.preventDefault();
        toggleFullScreen(windowState.id);
      }
    };

    if (windowState.isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    
    return undefined;
  }, [windowState.isActive, windowState.id, toggleFullScreen]);

  // Handle window resize for maximized windows
  useEffect(() => {
    const handleResize = () => {
      if (windowState.isMaximized) {
        updateWindowSize(windowState.id, {
          width: window.innerWidth,
          height: window.innerHeight - 60,
        });
      } else if (windowState.isFullScreen) {
        updateWindowSize(windowState.id, {
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowState.isMaximized, windowState.isFullScreen, windowState.id, updateWindowSize]);

  const handleDragStop = (_e: any, d: any) => {
    const { x, y } = d;
    const snapThreshold = 20;
    
    // Snap to left half
    if (x < snapThreshold && !windowState.isMaximized && !windowState.isFullScreen) {
      updateWindowPosition(windowState.id, { x: 0, y: 0 });
      updateWindowSize(windowState.id, {
        width: viewport.width / 2,
        height: viewport.height - 60,
      });
    }
    // Snap to right half  
    else if (x > viewport.width - snapThreshold && !windowState.isMaximized && !windowState.isFullScreen) {
      updateWindowPosition(windowState.id, { x: viewport.width / 2, y: 0 });
      updateWindowSize(windowState.id, {
        width: viewport.width / 2,
        height: viewport.height - 60,
      });
    }
    // Snap to maximize (top edge)
    else if (y < snapThreshold && !windowState.isMaximized && !windowState.isFullScreen) {
      maximizeWindow(windowState.id);
    }
    else {
      updateWindowPosition(windowState.id, { x, y });
    }
  };

  const handleResizeStop = (_e: any, _direction: any, ref: any, _delta: any, position: any) => {
    updateWindowSize(windowState.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    updateWindowPosition(windowState.id, position);
  };

  const getWindowStyle = () => {
    if (windowState.isFullScreen) {
      return {
        position: { x: 0, y: 0 },
        size: { width: viewport.width, height: viewport.height }
      };
    }
    if (windowState.isMaximized) {
      return {
        position: { x: 0, y: 0 },
        size: { width: viewport.width, height: viewport.height - 60 }
      };
    }
    return {
      position: windowState.position,
      size: windowState.size
    };
  };

  const windowStyle = getWindowStyle();

  return (
    <motion.div
      initial={appearance.animations ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
      animate={{ 
        opacity: windowState.isMinimized ? 0 : 1, 
        scale: windowState.isMinimized ? 0.1 : 1,
        y: windowState.isMinimized ? viewport.height : 0
      }}
      exit={appearance.animations ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
      transition={{ 
        duration: appearance.animations ? (windowState.isMinimized ? 0.3 : 0.2) : 0,
        ease: "easeInOut"
      }}
      style={{ 
        zIndex: windowState.isActive ? 9999 : windowState.zIndex,
        display: windowState.isMinimized ? 'none' : 'block',
        pointerEvents: windowState.isMinimized ? 'none' : 'auto'
      }}
    >
      <Rnd
        position={windowStyle.position}
        size={windowStyle.size}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        disableDragging={windowState.isFullScreen || windowState.isMaximized}
        enableResizing={!windowState.isFullScreen && !windowState.isMaximized}
        minWidth={320}
        minHeight={240}
        className={`
          glass-window ${windowState.isFullScreen ? '' : 'rounded-xl'} overflow-hidden
          ${windowState.isActive ? 'ring-2 ring-primary/50' : ''}
        `}
        style={{
          background: `hsl(var(--window-bg) / ${appearance.transparency})`,
          backdropFilter: `blur(${appearance.transparency * 25}px)`,
          zIndex: windowState.isFullScreen ? 99999 : undefined
        }}
        dragHandleClassName="window-header"
        onClick={() => setActiveWindow(windowState.id)}
      >
        <div 
          className="h-full w-full focus:outline-none flex flex-col"
          tabIndex={-1}
          onFocus={() => setActiveWindow(windowState.id)}
        >
        {/* Window Header */}
        {!windowState.isFullScreen && (
          <div className="window-header flex items-center justify-between p-4 bg-gradient-glass border-b border-glass-border/50 cursor-move">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
              </div>
              <h3 className="text-sm font-medium text-foreground select-none">
                {windowState.title}
              </h3>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  minimizeWindow(windowState.id);
                }}
                className="h-6 w-6 p-0 hover:bg-glass-surface/50"
                title="Minimize"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  maximizeWindow(windowState.id);
                }}
                className="h-6 w-6 p-0 hover:bg-green-500/20 hover:text-green-400"
                title={windowState.isMaximized ? "Restore" : "Maximize"}
              >
                {windowState.isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullScreen(windowState.id);
                }}
                className="h-6 w-6 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                title="Full Screen (F11)"
              >
                <Expand className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  popOutWindow(windowState.id);
                }}
                className="h-6 w-6 p-0 hover:bg-purple-500/20 hover:text-purple-400"
                title="Pop Out to New Window"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(windowState.id);
                }}
                className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Full Screen Header (appears on hover in full screen mode) */}
        {windowState.isFullScreen && (
          <div className="absolute top-0 left-0 right-0 z-50 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-md">
              <h3 className="text-sm font-medium text-white select-none">
                {windowState.title}
              </h3>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullScreen(windowState.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                  title="Exit Full Screen (F11)"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(windowState.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-500/20 text-white hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Window Content */}
        <div className={`flex-1 overflow-hidden ${windowState.isFullScreen ? 'h-full' : 'h-full'}`}>
          {children}
        </div>
        </div>
      </Rnd>
    </motion.div>
  );
};