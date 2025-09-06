
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  Menu,
  Clock,
  Wifi,
  Volume2,
  Grid3X3,
  Bell,
  Activity,
  Folder,
  Shield,
  Bot,
  Monitor,
  X,
  Maximize2,
  Minimize2,
  Square,
  MoreHorizontal,
  Package,
  Palette,
  Wallpaper,
  Image,
  ExternalLink
} from 'lucide-react';
import { useWindowStore, WindowState } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StartMenu } from './StartMenu';

const appIcons = [
  { id: 'patient-manager', icon: Users, label: 'Patients', component: 'PatientManager' },
  { id: 'session-notes', icon: FileText, label: 'Notes', component: 'SessionNotes' },
  { id: 'search-browser', icon: Shield, label: 'Private Search', component: 'SearchBrowser' },
  { id: 'ai-search', icon: Bot, label: 'AI Search', component: 'AISearchApp' },
  { id: 'ai-assistant', icon: Brain, label: 'AI Assistant', component: 'AIAssistant' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', component: 'Calendar' },
  { id: 'file-manager', icon: Folder, label: 'Files', component: 'FileManager' },
  { id: 'task-manager', icon: Activity, label: 'Task Manager', component: 'SystemTaskManager' },
  { id: 'settings', icon: Settings, label: 'Settings', component: 'Settings' },
];

// Window icon mapping for better UX
const getWindowIcon = (component: string) => {
  const iconMap: Record<string, any> = {
    PatientManager: Users,
    SessionNotes: FileText,
    SearchBrowser: Shield,
    AISearchApp: Bot,
    AIAssistant: Brain,
    Calendar: Calendar,
    FileManager: Folder,
    SystemTaskManager: Activity,
    Settings: Settings,
    ReportEditor: FileText,
    AIAssistantApp: Bot,
    AISecretaryApp: Bot,
    AppBuilderApp: Grid3X3,
    AITherapistApp: Brain,
    TherapyAppBuilder: Grid3X3,
    AppStore: Package,
    ReMotionStore: Package,
    ContactManager: Users,
    MeetingApp: Monitor,
    DrawingApp: Palette,
    TaskManager: Activity,
    FileExplorer: Folder,
    AccessibilityPanel: Settings,
  };
  return iconMap[component] || FileText;
};

interface TaskbarProps {
  onOpenWidgets?: () => void;
  onOpenNotifications?: () => void;
  onActivateScreensaver?: () => void;
  onOpenVantaController?: () => void;
  onCloseVantaController?: () => void;
  isVantaControllerOpen?: boolean;
  onOpenWallpaperSettings?: () => void;
}

// TaskbarPreview component for window hover previews
interface TaskbarPreviewProps {
  window: WindowState;
  onAction: (action: 'restore' | 'close') => void;
  isVisible: boolean;
}

const TaskbarPreview: React.FC<TaskbarPreviewProps> = ({ window, onAction, isVisible }) => {
  const IconComponent = getWindowIcon(window.component);
  
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
    >
      <Card className="p-4 bg-background/95 backdrop-blur-sm border shadow-lg min-w-[280px] max-w-[320px]">
        {/* Preview Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/10 rounded">
              <IconComponent className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium truncate max-w-[180px]">{window.title}</h4>
              <p className="text-xs text-muted-foreground">{window.component}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAction('close');
            }}
            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Window Preview Thumbnail */}
        <div className="relative bg-muted/30 rounded-md overflow-hidden mb-3 aspect-video">
          {/* Mock window content preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            {window.isMinimized ? (
              <div className="text-center">
                <Minimize2 className="w-8 h-8 text-muted-foreground mb-2 mx-auto" />
                <p className="text-xs text-muted-foreground">Window minimized</p>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <IconComponent className="w-12 h-12 text-primary/60 mb-2 mx-auto" />
                  <p className="text-xs text-muted-foreground">Live preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Window state overlay */}
          {window.isMaximized && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                <Square className="w-3 h-3 mr-1" />
                Maximized
              </Badge>
            </div>
          )}
        </div>

        {/* Preview Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant={window.isActive ? "default" : "secondary"} className="text-xs">
              {window.isActive ? 'Active' : window.isMinimized ? 'Minimized' : 'Background'}
            </Badge>
            {window.isMaximized && (
              <Badge variant="outline" className="text-xs">
                <Square className="w-3 h-3 mr-1" />
                Max
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAction('restore');
            }}
            className="h-7 text-xs"
          >
            {window.isMinimized ? 'Restore' : 'Focus'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// Enhanced TaskbarWindowItem component for Windows-style window management
interface TaskbarWindowItemProps {
  window: WindowState;
  onWindowAction: (action: 'toggle' | 'close' | 'maximize' | 'minimize', windowId: string) => void;
}

const TaskbarWindowItem = React.forwardRef<HTMLDivElement, TaskbarWindowItemProps>(
  ({ window, onWindowAction }, ref) => {
    const [showPreview, setShowPreview] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
    const IconComponent = getWindowIcon(window.component);
    
    const handleClick = () => {
      onWindowAction('toggle', window.id);
    };

    const handleContextAction = (action: 'close' | 'maximize' | 'minimize') => {
      onWindowAction(action, window.id);
    };

    const handleMouseEnter = () => {
      // Show preview after 500ms hover delay
      const timeout = setTimeout(() => {
        setShowPreview(true);
      }, 500);
      setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
      // Clear timeout and hide preview
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setShowPreview(false);
    };

    const handlePreviewAction = (action: 'restore' | 'close') => {
      setShowPreview(false);
      if (action === 'restore') {
        onWindowAction('toggle', window.id);
      } else if (action === 'close') {
        onWindowAction('close', window.id);
      }
    };

    return (
      <div className="relative">
        <ContextMenu>
          <ContextMenuTrigger asChild>
          <motion.div
            ref={ref}
            className={`
              relative h-10 min-w-[160px] max-w-[200px] px-3 py-1 rounded-md cursor-pointer
              flex items-center gap-2 text-sm font-medium transition-all duration-200
              ${window.isActive && !window.isMinimized
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' 
                : window.isPoppedOut
                  ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/20'
                  : window.isMinimized
                    ? 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground opacity-70'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }
              ${window.isMinimized ? 'border-dashed border-muted-foreground/20' : ''}
            `}
            onDoubleClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ duration: 0.2 }}
          >
          {/* Window Icon */}
          <div className={`
            flex-shrink-0 p-1 rounded
            ${window.isActive ? 'bg-primary/10' : 'bg-transparent'}
          `}>
            <IconComponent className="w-4 h-4" />
          </div>
          
          {/* Window Title */}
          <span className="truncate flex-1 text-xs">
            {window.title}
          </span>
          
          {/* Window State Indicators */}
          <div className="flex items-center gap-1">
            {window.isPoppedOut && (
              <div className="w-2.5 h-2.5 bg-purple-400 rounded-sm flex items-center justify-center" title="Opened in external window">
                <ExternalLink className="w-1.5 h-1.5 text-white" />
              </div>
            )}
            {window.isMinimized && !window.isPoppedOut && (
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse" />
            )}
            {window.isMaximized && !window.isMinimized && (
              <Square className="w-2.5 h-2.5 opacity-60" />
            )}
          </div>
          
          {/* Active indicator - only show if not minimized and active */}
          {window.isActive && !window.isMinimized && (
            <motion.div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
              layoutId="taskbar-active-indicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          
          {/* Minimized indicator */}
          {window.isMinimized && !window.isPoppedOut && (
            <motion.div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-muted-foreground/50 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
          
          {/* Popped out indicator */}
          {window.isPoppedOut && (
            <motion.div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-purple-400 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleContextAction('minimize')}>
          <Minimize2 className="w-4 h-4 mr-2" />
          {window.isMinimized ? 'Restore' : 'Minimize'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleContextAction('maximize')}>
          {window.isMaximized ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Restore Down
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 mr-2" />
              Maximize
            </>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => handleContextAction('close')}
          className="text-destructive focus:text-destructive"
        >
          <X className="w-4 h-4 mr-2" />
          Close window
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    
    {/* Hover Preview */}
    <AnimatePresence>
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={handleMouseLeave}
        >
          <TaskbarPreview
            window={window}
            onAction={handlePreviewAction}
            isVisible={showPreview}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
});

TaskbarWindowItem.displayName = 'TaskbarWindowItem';

export const Taskbar: React.FC<TaskbarProps> = ({ 
  onOpenWidgets, 
  onOpenNotifications, 
  onActivateScreensaver, 
  onOpenVantaController,
  onCloseVantaController,
  isVantaControllerOpen = false,
  onOpenWallpaperSettings
}) => {
  const { 
    windows, 
    openWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow, 
    bringToFront
  } = useWindowStore();
  const { appearance } = useOSStore();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Memoize all windows for taskbar display (including minimized)
  const taskbarWindows = useMemo(() => {
    return windows.sort((a, b) => b.zIndex - a.zIndex);
  }, [windows]);

  // Enhanced window action handler
  const handleWindowAction = (action: 'toggle' | 'close' | 'maximize' | 'minimize', windowId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    switch (action) {
      case 'toggle':
        if (window.isMinimized) {
          // If minimized, restore and bring to front
          restoreWindow(windowId);
          bringToFront(windowId);
        } else if (window.isActive) {
          // If active, minimize it
          minimizeWindow(windowId);
        } else {
          // If not active but not minimized, just bring to front
          bringToFront(windowId);
        }
        break;
      case 'close':
        closeWindow(windowId);
        break;
      case 'maximize':
        maximizeWindow(windowId);
        // Always bring to front when maximizing
        if (!window.isActive) {
          bringToFront(windowId);
        }
        break;
      case 'minimize':
        if (window.isMinimized) {
          // If already minimized, restore and bring to front
          restoreWindow(windowId);
          bringToFront(windowId);
        } else {
          // If not minimized, minimize it
          minimizeWindow(windowId);
        }
        break;
    }
  };
  // Enhanced app launch handler
  const handleAppClick = (app: typeof appIcons[0]) => {
    const existingWindow = windows.find(w => w.component === app.component);
    
    if (existingWindow) {
      handleWindowAction('toggle', existingWindow.id);
    } else {
      openWindow({
        title: app.label,
        component: app.component,
        isMinimized: false,
        isMaximized: false,
        isFullScreen: false,
        isPoppedOut: false,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        size: { width: 800, height: 600 },
      });
    }
  };

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const closeStartMenu = () => {
    setIsStartMenuOpen(false);
  };

  // Dynamic taskbar styling based on appearance settings
  const getTaskbarClasses = () => {
    const baseClasses = "fixed glass-surface border-glass-border/50 z-50";
    const sizeClasses = {
      small: "h-12",
      medium: "h-16", 
      large: "h-20"
    };
    const positionClasses = {
      bottom: "bottom-0 left-0 right-0 border-t flex items-center justify-between",
      top: "top-0 left-0 right-0 border-b flex items-center justify-between",
      left: "left-0 top-0 bottom-0 w-16 border-r flex flex-col items-center justify-start py-4",
      right: "right-0 top-0 bottom-0 w-16 border-l flex flex-col items-center justify-start py-4"
    };
    
    return `${baseClasses} ${sizeClasses[appearance.taskbarSize]} ${positionClasses[appearance.taskbarPosition]}`;
  };

  return (
    <>
      <motion.div 
        className={`${getTaskbarClasses()} px-4`}
        initial={{ 
          y: appearance.taskbarPosition === 'bottom' ? 100 : appearance.taskbarPosition === 'top' ? -100 : 0, 
          x: appearance.taskbarPosition === 'left' ? -100 : appearance.taskbarPosition === 'right' ? 100 : 0 
        }}
        animate={{ y: 0, x: 0 }}
        transition={{ duration: appearance.animations ? 0.3 : 0 }}
        style={{ 
          background: `hsl(var(--taskbar-bg) / ${appearance.transparency})`,
          backdropFilter: `blur(${appearance.transparency * 20}px)`
        }}
      >
        {/* Left Section - Start Menu & App Icons */}
        <div className={`flex items-center gap-2 ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col' 
            : 'flex-row'
        }`}>
          {/* Start Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary ${
              isStartMenuOpen ? 'bg-primary/20 text-primary' : ''
            }`}
            onClick={toggleStartMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Pinned App Icons */}
          <div className={`flex items-center gap-1 ${
            appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
              ? 'flex-col' 
              : 'flex-row'
          }`}>
            {appIcons.slice(0, 6).map((app) => {
              const isOpen = windows.some(w => w.component === app.component);
              const isActive = windows.some(w => w.component === app.component && w.isActive);
              
              return (
                <motion.div key={app.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAppClick(app)}
                    className={`
                      h-10 w-10 p-0 relative transition-all duration-200
                      ${isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : isOpen 
                          ? 'bg-muted text-foreground' 
                          : 'hover:bg-muted/50'
                      }
                    `}
                    title={app.label}
                  >
                    <app.icon className="h-4 w-4" />
                    
                    {/* App running indicator */}
                    {isOpen && (
                      <div className={`
                        absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                        w-1.5 h-1.5 rounded-full transition-all duration-200
                        ${isActive ? 'bg-primary' : 'bg-muted-foreground'}
                      `} />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Center Section - Open Windows */}
        <div className={`flex-1 flex items-center justify-center overflow-hidden ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col gap-2 max-h-64' 
            : 'flex-row gap-2 max-w-96'
        }`}>
          <AnimatePresence mode="popLayout">
            {taskbarWindows.map((window) => (
              <TaskbarWindowItem
                key={window.id}
                window={window}
                onWindowAction={handleWindowAction}
              />
            ))}
          </AnimatePresence>
          
          {/* Windows overflow indicator */}
          {taskbarWindows.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 opacity-60"
              title={`${taskbarWindows.length - 6} more windows`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right Section - System Tray & Controls */}
        <div className={`flex items-center gap-2 ${
          appearance.taskbarPosition === 'left' || appearance.taskbarPosition === 'right' 
            ? 'flex-col' 
            : 'flex-row'
        }`}>
          {/* Widgets Toggle */}
          {onOpenWidgets && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenWidgets}
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20"
              title="Open Widgets Panel"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          )}

          {/* Notifications Toggle */}
          {onOpenNotifications && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenNotifications}
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20 relative"
              title="Open Notifications"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
          )}

          {/* Screensaver Toggle */}
          {onActivateScreensaver && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onActivateScreensaver}
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20"
              title="Activate Screensaver"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          )}

          {/* Wallpaper Controller */}
          {(onOpenVantaController || onCloseVantaController) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                if (isVantaControllerOpen && onCloseVantaController) {
                  onCloseVantaController();
                } else if (!isVantaControllerOpen && onOpenVantaController) {
                  onOpenVantaController();
                }
              }}
              className={`h-8 w-8 p-0 text-foreground hover:bg-primary/20 relative group transition-all ${
                isVantaControllerOpen 
                  ? 'bg-primary/20 border border-primary/30 shadow-sm' 
                  : ''
              }`}
              title={isVantaControllerOpen ? "Close Wallpaper Controller" : "Open Wallpaper Controller"}
            >
              <Wallpaper className={`w-4 h-4 ${isVantaControllerOpen ? 'text-primary' : ''}`} />
              
              {/* Active indicator */}
              {isVantaControllerOpen && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              
              {/* Hover indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          )}

          {/* Wallpaper Settings */}
          {onOpenWallpaperSettings && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenWallpaperSettings}
              className="h-8 w-8 p-0 text-foreground hover:bg-primary/20 relative group"
              title="Wallpaper Settings & Configuration"
            >
              <Image className="w-4 h-4" />
              
              {/* Hover indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          )}
          
          {/* System Tray Icons */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wifi className="h-3 w-3" />
            <Volume2 className="h-3 w-3" />
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium hidden sm:block">{currentTime}</span>
          </div>
          
          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
            title="User Profile"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Start Menu */}
      <StartMenu isOpen={isStartMenuOpen} onClose={closeStartMenu} />
    </>
  );
};
