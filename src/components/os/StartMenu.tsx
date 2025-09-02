
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Power, Settings, User, Grid3X3, 
  Users, FileText, Brain, Calendar, Package,
  Folder, Activity, LogOut, Lock, RotateCcw, Edit,
  Contact, Video, Palette
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { useWindowStore } from '@/stores/windowStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  component: string;
  category: 'therapy' | 'productivity' | 'system';
}

const allApps: AppItem[] = [
  { id: 'patients', name: 'Patient Manager', icon: Users, component: 'PatientManager', category: 'therapy' },
  { id: 'notes', name: 'Session Notes', icon: FileText, component: 'SessionNotes', category: 'therapy' },
  { id: 'reports', name: 'Report Editor', icon: Edit, component: 'ReportEditor', category: 'therapy' },
  { id: 'ai-assistant', name: 'AI Assistant', icon: Brain, component: 'AIAssistantApp', category: 'therapy' },
  { id: 'drawing', name: 'Drawing Studio', icon: Palette, component: 'DrawingApp', category: 'therapy' },
  { id: 'contacts', name: 'Contact Manager', icon: Contact, component: 'ContactManager', category: 'therapy' },
  { id: 'meeting', name: 'Meeting Hub', icon: Video, component: 'MeetingApp', category: 'therapy' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, component: 'Calendar', category: 'productivity' },
  { id: 'remotion-store', name: 'ReMotion Store', icon: Package, component: 'ReMotionStore', category: 'system' },
  { id: 'file-explorer', name: 'File Explorer', icon: Folder, component: 'FileExplorer', category: 'productivity' },
  { id: 'task-manager', name: 'Task Manager', icon: Activity, component: 'TaskManager', category: 'system' },
  { id: 'settings', name: 'Settings', icon: Settings, component: 'Settings', category: 'system' },
];

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'therapy' | 'productivity' | 'system'>('all');
  
  const { currentUser, logout } = useOSStore();
  const { openWindow, windows, restoreWindow, setActiveWindow } = useWindowStore();

  const filteredApps = allApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const recentApps = allApps.slice(0, 4); // Mock recent apps

  const handleAppClick = (app: AppItem) => {
    // Check if window already exists
    const existingWindow = windows.find(w => w.component === app.component);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        restoreWindow(existingWindow.id);
      } else {
        setActiveWindow(existingWindow.id);
      }
    } else {
      // Open new window
      openWindow({
        title: app.name,
        component: app.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        size: { width: 800, height: 600 },
      });
    }
    onClose();
  };

  const handlePowerAction = (action: 'logout' | 'restart' | 'shutdown') => {
    switch (action) {
      case 'logout':
        logout();
        break;
      case 'restart':
        // Mock restart action
        console.log('Restarting ReMotionOS...');
        window.location.reload();
        break;
      case 'shutdown':
        // Mock shutdown action
        console.log('Shutting down ReMotionOS...');
        window.close();
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Start Menu */}
          <motion.div
            className="fixed bottom-16 left-4 z-50 w-96 max-h-[80vh] glass-surface rounded-xl shadow-2xl border border-glass-border overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="p-4 border-b border-glass-border">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground">{currentUser?.name || 'User'}</div>
                  <div className="text-sm text-muted-foreground">{currentUser?.role || 'therapist'}</div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {!searchQuery && (
                <>
                  {/* Recent Apps */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {recentApps.map((app) => (
                        <motion.button
                          key={app.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => handleAppClick(app)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <app.icon className="h-6 w-6 text-primary" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {app.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Category Filters */}
              <div className="flex space-x-2">
                {[
                  { id: 'all', name: 'All' },
                  { id: 'therapy', name: 'Therapy' },
                  { id: 'productivity', name: 'Tools' },
                  { id: 'system', name: 'System' },
                ].map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(category.id as any)}
                    className="h-8 text-xs"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Apps Grid */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {searchQuery ? 'Search Results' : 'Applications'}
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {filteredApps.map((app) => (
                    <motion.button
                      key={app.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      onClick={() => handleAppClick(app)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <app.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {app.name}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {filteredApps.length === 0 && (
                  <div className="text-center py-6">
                    <Grid3X3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No apps found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-glass-border">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAppClick({ id: 'settings', name: 'Settings', icon: Settings, component: 'Settings', category: 'system' })}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePowerAction('logout')}
                    className="h-9 w-9 p-0"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePowerAction('restart')}
                    className="h-9 w-9 p-0"
                    title="Restart"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePowerAction('shutdown')}
                    className="h-9 w-9 p-0"
                    title="Shutdown"
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
