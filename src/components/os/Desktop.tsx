
import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import VantaController from './VantaController';
import DynamicWallpaper from './DynamicWallpaper';
import WallpaperSettings from './WallpaperSettings';
import Screensaver from './Screensaver';
import { Button } from '@/components/ui/button';
import './Desktop.css';

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
import { MeetingApp } from '@/components/apps/MeetingApp';
import { NotePadPro, SearchBrowser, AISearchApp } from '@/components/apps';

const AppBuilderApp = lazy(() => import('@/components/apps/AppBuilderApp'));
const AITherapistApp = lazy(() => import('@/components/apps/AITherapistApp'));

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
import { DesktopModeSwitcher } from './DesktopModeSwitcher';
import { useOSStore } from '@/stores/osStore';

const AppComponents = {
  PatientManager,
  SessionNotes,
  NotePadPro,
  SearchBrowser,
  AISearchApp,
  ReportEditor,
  AIAssistant,
  AIAssistantApp: lazy(() => import('../apps/AIAssistantApp')),
  AISecretaryApp: lazy(() => import('../apps/AISecretaryApp')),
  AppBuilderApp,
  AITherapistApp,
  TherapyAppBuilder: lazy(() => import('../apps/TherapyAppBuilder')),
  Settings,
  Calendar,
  AppStore,
  ReMotionStore,
  ContactManager,
  MeetingApp,
  DrawingApp: lazy(() => import('../apps/DrawingApp')),
  TaskManager: TaskManagerApp,
  FileExplorer,
  SystemTaskManager: TaskManager,
  FileManager: VirtualFileSystem,
  AccessibilityPanel: AccessibilityPanel,
};

export const Desktop: React.FC = () => {
  const { windows, bringToFront } = useWindowStore();
  const { desktopIcons, widgets, clearSelection, appearance, virtualDesktops, desktopMode } = useOSStore();
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = React.useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = React.useState(false);
  const [isScreensaverActive, setIsScreensaverActive] = React.useState(false);
  const [isVantaControllerOpen, setIsVantaControllerOpen] = React.useState(false);
  const [isWallpaperSettingsOpen, setIsWallpaperSettingsOpen] = React.useState(false);
  const [wallpaperCategory, setWallpaperCategory] = React.useState('nature');
  const [wallpaperInterval, setWallpaperInterval] = React.useState(10);
  const [wallpaperTransitions, setWallpaperTransitions] = React.useState(true);
  const [wallpaperStatic, setWallpaperStatic] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  
  // Focus management for intelligent layering
  const [focusedElement, setFocusedElement] = React.useState<{ type: 'window' | 'widget' | 'icon', id: string } | null>(null);
  const [activeWindows, setActiveWindows] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Widget mapping for performance
  const widgetComponents = React.useMemo(() => ({
    clock: ClockWidget,
    'system-monitor': SystemMonitorWidget,
    calendar: CalendarWidget,
    'patient-reminders': PatientRemindersWidget,
    'ai-insights': AIInsightsWidget,
  }), []);

  // Track active windows
  React.useEffect(() => {
    setActiveWindows(windows.filter(w => !w.isMinimized).map(w => w.id));
  }, [windows]);

  // Determine what should be shown based on mode and state
  const showIcons = desktopMode === 'normal' || desktopMode === 'icons';
  const showWidgets = desktopMode === 'normal' || desktopMode === 'widgets'; 
  const showWindows = desktopMode === 'normal' || desktopMode === 'windows';

  // Handle focus management with memoized handlers
  const handleElementFocus = React.useCallback((type: 'window' | 'widget' | 'icon', id: string) => {
    setFocusedElement({ type, id });
    
    // Bring windows to front using global z-index management
    if (type === 'window') {
      bringToFront(id);
    }
  }, [bringToFront]);

  const handleElementBlur = React.useCallback(() => {
    setFocusedElement(null);
  }, []);

  // Abstracted click handler to reduce duplication
  const handleClick = React.useCallback((type: 'window' | 'widget' | 'icon', id: string) => 
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleElementFocus(type, id);
    }, [handleElementFocus]);

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
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading app…</div>}>
          <AppComponent />
        </Suspense>
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

  const renderWidget = React.useCallback((widget: any) => {
    const WidgetComponent = widgetComponents[widget.type as keyof typeof widgetComponents];
    return WidgetComponent ? <WidgetComponent /> : null;
  }, [widgetComponents]);

  return (
    <DesktopContextMenu>
      <div 
        className={`h-screen w-screen overflow-hidden relative ${appearance.theme === 'dark' ? 'dark' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Dynamic Background System */}
        {appearance.vantaEnabled && isVantaControllerOpen && (
          <VantaController
            showControls={appearance.showVantaControls || false}
            onClose={() => setIsVantaControllerOpen(false)}
            className="absolute inset-0"
          />
        )}

        {/* Dynamic Wallpaper (when Vanta is disabled or closed) */}
        {(!appearance.vantaEnabled || !isVantaControllerOpen) && (
          <DynamicWallpaper
            isEnabled={true}
            interval={wallpaperInterval}
            category={wallpaperCategory}
            enableTransitions={wallpaperTransitions}
            isStatic={wallpaperStatic}
            className="absolute inset-0"
          />
        )}

        {/* Fallback Static Wallpaper */}
        {!appearance.vantaEnabled && (
          <motion.div 
            className="absolute inset-0 opacity-30"
            style={wallpaperStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Desktop Mode Switcher */}
        <DesktopModeSwitcher isVisible={!isScreensaverActive} />

        {/* Desktop Content Area with Intelligent Layering */}
        <div 
          ref={containerRef}
          className="absolute inset-0 p-8 pb-20"
          onClick={() => {
            clearSelection();
            handleElementBlur();
          }}
        >
          {/* Desktop Icons Layer - Base Layer (z-index: 10-19) */}
          {showIcons && (
            <motion.div 
              className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-6 auto-rows-max"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {desktopIcons.map((icon, index) => (
                <div
                  key={icon.id}
                  className={`
                    flex justify-center items-start relative min-h-[120px] transition-all duration-300 desktop-layer-icon
                    ${desktopMode === 'icons' ? 'scale-110 hover:scale-125' : 'hover:scale-105'}
                    ${focusedElement?.type === 'icon' && focusedElement?.id === icon.id ? 'ring-2 ring-blue-400 rounded-lg desktop-element-focused' : ''}
                  `}
                  data-element-id={icon.id}
                  data-element-type="icon"
                  data-base-index={index}
                  onClick={handleClick('icon', icon.id)}
                >
                  <DesktopIcon icon={icon} />
                </div>
              ))}
            </motion.div>
          )}
        
          {/* Widgets Layer - Middle Layer (z-index: 20-39) */}
          {showWidgets && (
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {widgets.map((widget, index) => (
                <div 
                  key={widget.id} 
                  className={`
                    transition-all duration-300 pointer-events-auto desktop-layer-widget
                    ${desktopMode === 'widgets' ? 'ring-2 ring-purple-400/50 rounded-lg' : ''}
                    ${focusedElement?.type === 'widget' && focusedElement?.id === widget.id ? 'ring-2 ring-purple-400 rounded-lg shadow-lg desktop-element-focused' : ''}
                  `}
                  data-element-id={widget.id}
                  data-element-type="widget"
                  data-base-index={index}
                  onFocus={() => handleElementFocus('widget', widget.id)}
                  onBlur={handleElementBlur}
                  onClick={handleClick('widget', widget.id)}
                >
                  <DraggableWidget widget={widget}>
                    {renderWidget(widget)}
                  </DraggableWidget>
                </div>
              ))}
              
              {/* Widget Management Overlay for widgets mode */}
              {desktopMode === 'widgets' && (
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white pointer-events-auto z-50">
                  <h3 className="text-sm font-semibold mb-2">Widget Management</h3>
                  <p className="text-xs text-white/70 mb-3">Click widgets to focus • Drag to reposition</p>
                  <Button
                    size="sm"
                    onClick={() => setIsWidgetPanelOpen(true)}
                    className="text-xs"
                  >
                    Add Widget
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Windows Layer - Top Layer (z-index: 40-1000) */}
        {showWindows && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative h-full w-full pointer-events-auto">
              {windows
                .filter(window => !window.isMinimized)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((window) => (
                  <motion.div
                    key={window.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      desktop-layer-window transition-all duration-300
                      ${desktopMode === 'windows' ? 'ring-2 ring-blue-400/50 rounded-lg overflow-hidden' : ''}
                      ${focusedElement?.type === 'window' && focusedElement?.id === window.id ? 'ring-2 ring-blue-400 shadow-2xl desktop-element-focused' : ''}
                    `}
                    data-element-id={window.id}
                    data-element-type="window"
                    data-base-index={window.zIndex}
                    onFocus={() => handleElementFocus('window', window.id)}
                    onBlur={handleElementBlur}
                    onClick={handleClick('window', window.id)}
                  >
                    {renderWindow(window)}
                  </motion.div>
                ))
              }
              
              {/* Windows Management Overlay for windows mode */}
              {desktopMode === 'windows' && activeWindows.length > 0 && (
                <motion.div 
                  className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white pointer-events-auto z-50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-sm font-semibold mb-2">Window Manager</h3>
                  <p className="text-xs text-white/70 mb-3">
                    {activeWindows.length} open • Click to focus
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {windows.filter(w => !w.isMinimized).slice(0, 5).map((window) => (
                      <button
                        key={window.id}
                        onClick={() => handleElementFocus('window', window.id)}
                        className={`
                          block w-full text-left text-xs px-2 py-1 rounded truncate max-w-32 transition-colors
                          ${focusedElement?.type === 'window' && focusedElement?.id === window.id 
                            ? 'bg-blue-500 text-white' 
                            : 'text-white/80 hover:bg-white/10'
                          }
                        `}
                      >
                        {window.title}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Smart Management Help - shown when no apps but widgets/icons exist */}
              {activeWindows.length === 0 && (widgets.length > 0 || desktopIcons.length > 0) && (
                <motion.div 
                  className="absolute bottom-20 left-4 bg-black/70 backdrop-blur-lg rounded-lg p-3 text-white pointer-events-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <h4 className="text-xs font-medium mb-1">Smart Desktop</h4>
                  <p className="text-xs text-white/70">
                    Click icons to open apps • Focus elements to bring to front
                  </p>
                  {widgets.length > 0 && (
                    <p className="text-xs text-white/60 mt-1">
                      Widgets are interactive and draggable
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}

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
          onActivateScreensaver={() => setIsScreensaverActive(true)}
          onOpenVantaController={() => setIsVantaControllerOpen(true)}
          onCloseVantaController={() => setIsVantaControllerOpen(false)}
          isVantaControllerOpen={isVantaControllerOpen}
          onOpenWallpaperSettings={() => setIsWallpaperSettingsOpen(true)}
        />

        {/* Screensaver */}
        <Screensaver 
          isActive={isScreensaverActive}
          onDeactivate={() => setIsScreensaverActive(false)}
          autoActivateAfter={10}
          showClock={true}
          showControls={false}
        />

        {/* Wallpaper Settings Modal */}
        <WallpaperSettings
          isOpen={isWallpaperSettingsOpen}
          onClose={() => setIsWallpaperSettingsOpen(false)}
          currentCategory={wallpaperCategory}
          currentInterval={wallpaperInterval}
          enableTransitions={wallpaperTransitions}
          isStatic={wallpaperStatic}
          onCategoryChange={setWallpaperCategory}
          onIntervalChange={setWallpaperInterval}
          onTransitionsToggle={setWallpaperTransitions}
          onStaticToggle={setWallpaperStatic}
        />
      </div>
    </DesktopContextMenu>
  );
};
