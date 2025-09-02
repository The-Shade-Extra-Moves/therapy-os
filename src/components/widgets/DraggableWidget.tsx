import React from 'react';
import Draggable from 'react-draggable';
import { motion } from 'framer-motion';
import { GripVertical, X, Maximize, Minimize } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { Widget } from '@/stores/osStore';

interface DraggableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ widget, children }) => {
  const { updateWidget, removeWidget } = useOSStore();
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrag = (e: any, data: any) => {
    updateWidget(widget.id, {
      position: { x: data.x, y: data.y }
    });
  };

  const handleResize = (direction: 'increase' | 'decrease') => {
    const currentWidth = widget.size.width;
    const currentHeight = widget.size.height;
    
    const factor = direction === 'increase' ? 1.2 : 0.8;
    const newWidth = Math.max(200, Math.min(600, currentWidth * factor));
    const newHeight = Math.max(150, Math.min(400, currentHeight * factor));
    
    updateWidget(widget.id, {
      size: { width: newWidth, height: newHeight }
    });
  };

  return (
    <Draggable
      position={widget.position}
      onDrag={handleDrag}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      handle=".widget-handle"
      bounds="parent"
    >
      <motion.div
        className={`absolute cursor-default ${isDragging ? 'z-50' : 'z-10'}`}
        style={{ 
          width: widget.size.width, 
          height: isMinimized ? 'auto' : widget.size.height 
        }}
        animate={{ 
          scale: isDragging ? 1.02 : 1,
          opacity: isDragging ? 0.9 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="glass-surface rounded-xl border border-border/20 shadow-lg overflow-hidden">
          {/* Widget Header */}
          <div className="widget-handle flex items-center justify-between px-3 py-2 bg-card/50 border-b border-border/20 cursor-move">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Widget</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleResize('decrease')}
                className="p-1 rounded hover:bg-muted/20 transition-colors"
                title="Shrink"
              >
                <Minimize className="w-3 h-3 text-muted-foreground" />
              </button>
              
              <button
                onClick={() => handleResize('increase')}
                className="p-1 rounded hover:bg-muted/20 transition-colors"
                title="Expand"
              >
                <Maximize className="w-3 h-3 text-muted-foreground" />
              </button>
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-muted/20 transition-colors"
                title={isMinimized ? "Restore" : "Minimize"}
              >
                <div className="w-3 h-0.5 bg-muted-foreground rounded" />
              </button>
              
              <button
                onClick={() => removeWidget(widget.id)}
                className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Widget Content */}
          {!isMinimized && (
            <div className="p-0">
              {children}
            </div>
          )}
        </div>
      </motion.div>
    </Draggable>
  );
};