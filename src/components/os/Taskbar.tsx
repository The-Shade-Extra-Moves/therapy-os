
import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Grid3X3, Search, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWindowStore } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';

interface TaskbarProps {
  onOpenWidgets?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ onOpenWidgets }) => {
  const { windows } = useWindowStore();
  const { appearance } = useOSStore();
  const [isStartMenuOpen, setIsStartMenuOpen] = React.useState(false);

  const getAppIcon = (component: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      PatientManager: () => <div className="w-5 h-5 bg-blue-500 rounded" />,
      SessionNotes: () => <div className="w-5 h-5 bg-green-500 rounded" />,
      AIAssistant: () => <div className="w-5 h-5 bg-purple-500 rounded" />,
      Settings: () => <div className="w-5 h-5 bg-gray-500 rounded" />,
      Calendar: () => <div className="w-5 h-5 bg-red-500 rounded" />,
      AppStore: () => <div className="w-5 h-5 bg-indigo-500 rounded" />,
      TaskManager: () => <div className="w-5 h-5 bg-orange-500 rounded" />,
      FileExplorer: () => <div className="w-5 h-5 bg-yellow-500 rounded" />,
    };
    
    const IconComponent = iconMap[component] || (() => <div className="w-5 h-5 bg-gray-400 rounded" />);
    return <IconComponent />;
  };

  return (
    <>
      <motion.div
        className={`fixed ${appearance.taskbarPosition === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 h-12 glass-surface border-t border-border/20 flex items-center justify-between px-2 z-40`}
        initial={{ y: appearance.taskbarPosition === 'bottom' ? 100 : -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Left Section - Start Menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-muted/20 transition-colors"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          >
            <Menu className="h-4 w-4 mr-2" />
            <span className="hidden sm:block text-sm font-medium">Start</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-muted/20 transition-colors"
            onClick={() => {/* TODO: Global search */}}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Section - Running Apps */}
        <div className="flex items-center gap-1 flex-1 justify-center max-w-2xl">
          {windows.map((window) => (
            <motion.div
              key={window.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 gap-2 hover:bg-muted/20 transition-colors ${
                  !window.isMinimized ? 'bg-muted/30' : ''
                }`}
                onClick={() => {
                  // Focus or restore window
                  console.log('Focus window:', window.id);
                }}
              >
                {getAppIcon(window.component)}
                <span className="hidden md:block text-xs max-w-20 truncate">
                  {window.title}
                </span>
                {!window.isMinimized && (
                  <div className="w-1 h-1 bg-primary rounded-full" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Right Section - System Tray */}
        <div className="flex items-center gap-2">
          {onOpenWidgets && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-muted/20 transition-colors"
              onClick={onOpenWidgets}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-muted/20 transition-colors"
            onClick={() => {/* TODO: Show desktop */}}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <SystemTray />
        </div>
      </motion.div>

      {/* Start Menu */}
      <StartMenu 
        isOpen={isStartMenuOpen} 
        onClose={() => setIsStartMenuOpen(false)} 
      />
    </>
  );
};
