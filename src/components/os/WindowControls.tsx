import React from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Maximize2, X, Minus, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWindowStore } from '@/stores/windowStore';

interface WindowControlsProps {
  windowId: string;
  isMaximized: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onRestore: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  windowId,
  isMaximized,
  isMinimized,
  onMinimize,
  onMaximize,
  onClose,
  onRestore
}) => {
  return (
    <div className="flex items-center gap-1">
      {/* Minimize */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted/20 rounded-full"
          onClick={onMinimize}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </motion.div>

      {/* Maximize/Restore */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted/20 rounded-full"
          onClick={isMaximized ? onRestore : onMaximize}
        >
          {isMaximized ? (
            <RotateCcw className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </Button>
      </motion.div>

      {/* Close */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </motion.div>
    </div>
  );
};