
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
import ReMotionStore from '@/components/apps/ReMotionStore';
import { ReportEditor } from '@/components/apps/ReportEditor';
import { TaskManager as TaskManagerApp } from '@/components/apps/TaskManager';
import { FileExplorer } from '@/components/apps/FileExplorer';
import { ContactManager } from '@/components/apps/ContactManager';

// OS Components
import { TaskManager } from '@/components/os/TaskManager';
import { NotificationCenter } from '@/components/os/NotificationCenter';
import { VirtualFileSystem } from '@/components/os/VirtualFileSystem';
import { DesktopIcon } from './DesktopIcon';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { SystemMonitorWidget } from '@/components/widgets/SystemMonitorWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import { PatientRemindersWidget } from '@/components/widgets/PatientRemindersWidget';
import { AIInsightsWidget } from '@/components/widgets/AIInsightsWidget';
import { DesktopContextMenu } from './ContextMenu';
import { VirtualDesktops } from './VirtualDesktops';
import { WidgetPanel } from '@/components/widgets/WidgetPanel';
import { DraggableWidget } from '@/components/widgets/DraggableWidget';
import { AccessibilityPanel } from './AccessibilityPanel';
import { useOSStore } from '@/stores/osStore';

const AppComponents = {
  PatientManager,
  SessionNotes,
  ReportEditor,
  AIAssistant,
  Settings,
  Calendar,
  AppStore,
  ReMotionStore,
  ContactManager,
  TaskManager: TaskManagerApp,
  FileExplorer,
  SystemTaskManager: TaskManager,
  FileManager: VirtualFileSystem,
  AccessibilityPanel: AccessibilityPanel,
};

export const Desktop: React.FC = () => {
  const { windows } = useWindowStore();
  const { desktopIcons, widgets, clearSelection, appearance, virtualDesktops } = useOSStore();
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = React.useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Track mouse for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (appearance.wallpaper.value.includes('parallax')) {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    }
  };

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

  // Get current desktop wallpaper
  const activeDesktop = virtualDesktops.find(d => d.isActive);
  const currentWallpaper = activeDesktop?.wallpaper || appearance.wallpaper.value;

  // Apply dynamic wallpaper with effects
  const wallpaperStyle = {
    background: currentWallpaper,
    opacity: appearance.wallpaper.opacity,
    transform: currentWallpaper.includes('parallax') 
      ? `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.1)` 
      : 'none',
    filter: currentWallpaper.includes('blur') ? 'blur(1px)' : 'none',
  };

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'clock':
        return <ClockWidget />;
      case 'system-monitor':
        return <SystemMonitorWidget />;
      case 'calendar':
        return <CalendarWidget />;
      case 'patient-reminders':
        return <PatientRemindersWidget />;
      case 'ai-insights':
        return <AIInsightsWidget />;
      default:
        return null;
    }
  };

  return (
    <DesktopContextMenu>
      <div 
        className={`h-screen w-screen overflow-hidden relative ${appearance.theme === 'dark' ? 'dark' : ''}`}
        style={{ background: 'hsl(var(--desktop-bg))' }}
        onMouseMove={handleMouseMove}
      >
      {/* Desktop Background with dynamic wallpaper */}
      <motion.div 
        className="absolute inset-0"
        style={wallpaperStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: appearance.wallpaper.opacity }}
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
        {widgets.map((widget) => (
          <DraggableWidget key={widget.id} widget={widget}>
            {renderWidget(widget)}
          </DraggableWidget>
        ))}
      </div>

      {/* Windows */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="relative h-full w-full pointer-events-auto">
          {windows
            .filter(window => !window.isMinimized)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderWindow)
          }
        </div>
      </div>

        {/* Virtual Desktops */}
        <VirtualDesktops />

        {/* Widget Panel */}
        <WidgetPanel 
          isOpen={isWidgetPanelOpen} 
          onClose={() => setIsWidgetPanelOpen(false)} 
        />

        {/* Notification Center */}
        <NotificationCenter 
          isOpen={isNotificationCenterOpen} 
          onClose={() => setIsNotificationCenterOpen(false)} 
        />

        {/* Taskbar */}
        <Taskbar 
          onOpenWidgets={() => setIsWidgetPanelOpen(true)}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        />
      </div>
    </DesktopContextMenu>
  );
};
