
import React from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { Window } from './Window';
import { Taskbar } from './Taskbar';

// App Components
import { PatientManager } from '@/components/apps/PatientManager';
import { SessionNotes } from '@/components/apps/SessionNotes';
import { AIAssistant } from '@/components/apps/AIAssistant';
import { Settings } from '@/components/apps/Settings';
import { Calendar } from '@/components/apps/Calendar';
import { AppStore } from '@/components/apps/AppStore';
import { TaskManager } from '@/components/apps/TaskManager';
import { FileExplorer } from '@/components/apps/FileExplorer';
import { DesktopIcon } from './DesktopIcon';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { SystemMonitorWidget } from '@/components/widgets/SystemMonitorWidget';
import { useOSStore } from '@/stores/osStore';

const AppComponents = {
  PatientManager,
  SessionNotes,
  AIAssistant,
  Settings,
  Calendar,
  AppStore,
  TaskManager,
  FileExplorer,
};

export const Desktop: React.FC = () => {
  const { windows } = useWindowStore();
  const { desktopIcons, widgets, clearSelection } = useOSStore();

  const renderWindow = (window: any) => {
    const AppComponent = AppComponents[window.component as keyof typeof AppComponents];
    
    if (!AppComponent) {
      return (
        <div className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <div className="text-lg font-medium">App not found</div>
            <div className="text-sm">Component: {window.component}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Available components: {Object.keys(AppComponents).join(', ')}
          </div>
        </div>
      );
    }

    return (
      <Window key={window.id} window={window}>
        <AppComponent />
      </Window>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-desktop relative">
      {/* Desktop Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-desktop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Desktop Icons Area */}
      <div 
        className="absolute inset-0 p-8 pb-20"
        onClick={clearSelection}
      >
        {/* Desktop Icons */}
        {desktopIcons.map((icon) => (
          <DesktopIcon key={icon.id} icon={icon} />
        ))}
        
        {/* Widgets */}
        {widgets.map((widget) => {
          switch (widget.type) {
            case 'clock':
              return (
                <div 
                  key={widget.id}
                  className="absolute"
                  style={{ 
                    left: widget.position.x, 
                    top: widget.position.y,
                    width: widget.size.width,
                    height: widget.size.height 
                  }}
                >
                  <ClockWidget />
                </div>
              );
            case 'system-monitor':
              return (
                <div 
                  key={widget.id}
                  className="absolute"
                  style={{ 
                    left: widget.position.x, 
                    top: widget.position.y,
                    width: widget.size.width,
                    height: widget.size.height 
                  }}
                >
                  <SystemMonitorWidget />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Windows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-full w-full pointer-events-auto">
          {windows
            .filter(window => !window.isMinimized)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderWindow)
          }
        </div>
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
};
