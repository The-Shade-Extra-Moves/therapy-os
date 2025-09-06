import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  PanelTopClose, 
  RectangleHorizontal, 
  Monitor,
  Settings,
  Layers3,
  Grid3X3,
  MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useOSStore, DesktopMode } from '@/stores/osStore';

interface DesktopModeSwitcherProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const DESKTOP_MODES = [
  {
    id: 'normal' as DesktopMode,
    name: 'Normal View',
    description: 'Default desktop with all elements visible',
    icon: Monitor,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    shortcut: 'F1'
  },
  {
    id: 'icons' as DesktopMode,
    name: 'Icons Only',
    description: 'Focus on desktop icons and shortcuts',
    icon: Grid3X3,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600',
    shortcut: 'F2'
  },
  {
    id: 'widgets' as DesktopMode,
    name: 'Widgets View',
    description: 'Manage and organize desktop widgets',
    icon: PanelTopClose,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    shortcut: 'F3'
  },
  {
    id: 'windows' as DesktopMode,
    name: 'Windows Mode',
    description: 'Focus on open applications and windows',
    icon: RectangleHorizontal,
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    shortcut: 'F4'
  }
];

export const DesktopModeSwitcher: React.FC<DesktopModeSwitcherProps> = ({ 
  isVisible = true,
  onClose
}) => {
  const { desktopMode, setDesktopMode, appearance } = useOSStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey) return;
      
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setDesktopMode('normal');
          break;
        case 'F2':
          e.preventDefault();
          setDesktopMode('icons');
          break;
        case 'F3':
          e.preventDefault();
          setDesktopMode('widgets');
          break;
        case 'F4':
          e.preventDefault();
          setDesktopMode('windows');
          break;
        case 'Tab':
          if (e.ctrlKey) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isExpanded, setDesktopMode]);

  const handleModeChange = (mode: DesktopMode) => {
    setDesktopMode(mode);
    if (appearance.animations) {
      // Add haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const currentModeData = DESKTOP_MODES.find(mode => mode.id === desktopMode);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 bg-black/80 backdrop-blur-lg border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-white" />
                  <h3 className="text-sm font-semibold text-white">Desktop Modes</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:bg-white/10"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {DESKTOP_MODES.map((mode) => {
                  const IconComponent = mode.icon;
                  const isActive = desktopMode === mode.id;
                  
                  return (
                    <motion.div
                      key={mode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => handleModeChange(mode.id)}
                        className={`
                          w-full h-auto p-3 flex flex-col items-center gap-2 text-left
                          ${isActive 
                            ? `bg-gradient-to-br ${mode.gradient} text-white shadow-lg ring-2 ring-white/20` 
                            : 'hover:bg-white/10 text-white/80'
                          }
                          transition-all duration-200
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg 
                          ${isActive ? 'bg-white/20' : 'bg-white/10'}
                        `}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xs font-medium">
                            {mode.name}
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            {mode.description}
                          </div>
                          
                          <Badge 
                            variant="secondary" 
                            className="mt-2 text-xs bg-black/20 text-white border-0"
                          >
                            {mode.shortcut}
                          </Badge>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-xs text-white/60 text-center">
                  Use F1-F4 keys or Ctrl+Tab to switch modes
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(true)}
              className="bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 text-white p-3"
            >
              <div className="flex items-center gap-2">
                {currentModeData && (
                  <>
                    <currentModeData.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {currentModeData.name}
                    </span>
                    <MousePointer2 className="w-3 h-3 opacity-60" />
                  </>
                )}
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
