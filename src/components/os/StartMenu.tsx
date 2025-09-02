import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Power, 
  Settings, 
  Grid3X3,
  Clock,
  Star,
  Folder,
  File,
  Calendar,
  Users,
  Brain,
  FileText,
  Package,
  Activity,
  Gamepad2,
  Video,
  Music,
  Image,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useOSStore } from '@/stores/osStore';
import { useWindowStore } from '@/stores/windowStore';

interface AppItem {
  id: string;
  name: string;
  icon: string;
  component: string;
  category: 'therapy' | 'productivity' | 'media' | 'communication' | 'system';
  isFavorite?: boolean;
  description?: string;
}

const allApps: AppItem[] = [
  // Therapy Suite
  { id: 'patients', name: 'Patient Manager', icon: 'Users', component: 'PatientManager', category: 'therapy', isFavorite: true, description: 'Manage patient profiles and records' },
  { id: 'notes', name: 'Session Notes', icon: 'FileText', component: 'SessionNotes', category: 'therapy', isFavorite: true, description: 'Document therapy sessions' },
  { id: 'ai', name: 'AI Assistant', icon: 'Brain', component: 'AIAssistant', category: 'therapy', isFavorite: true, description: 'AI-powered therapy insights' },
  { id: 'exercises', name: 'Exercises & Games', icon: 'Gamepad2', component: 'ExerciseGames', category: 'therapy', description: 'Therapeutic exercises and games' },
  
  // Productivity
  { id: 'calendar', name: 'Calendar', icon: 'Calendar', component: 'Calendar', category: 'productivity', isFavorite: true, description: 'Schedule and appointments' },
  { id: 'task-manager', name: 'Task Manager', icon: 'Activity', component: 'TaskManager', category: 'system', description: 'System monitoring and tasks' },
  { id: 'file-explorer', name: 'File Explorer', icon: 'Folder', component: 'FileExplorer', category: 'productivity', description: 'Browse and manage files' },
  
  // Media & Communication
  { id: 'video-calls', name: 'Video Calls', icon: 'Video', component: 'VideoCalls', category: 'communication', description: 'Secure video conferencing' },
  { id: 'messaging', name: 'Messaging', icon: 'MessageSquare', component: 'Messaging', category: 'communication', description: 'Chat and messaging' },
  { id: 'media-player', name: 'Media Player', icon: 'Music', component: 'MediaPlayer', category: 'media', description: 'Audio and video player' },
  { id: 'image-viewer', name: 'Image Viewer', icon: 'Image', component: 'ImageViewer', category: 'media', description: 'View and edit images' },
  
  // System
  { id: 'app-store', name: 'App Store', icon: 'Package', component: 'AppStore', category: 'system', description: 'Download and manage apps' },
  { id: 'settings', name: 'Settings', icon: 'Settings', component: 'Settings', category: 'system', description: 'System preferences' },
];

const iconMap = {
  Users, FileText, Brain, Calendar, Package, Folder, Activity, Settings,
  Gamepad2, Video, MessageSquare, Music, Image, Star, Clock, Grid3X3
};

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useOSStore();
  const { openWindow } = useWindowStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<'all' | 'favorites' | 'therapy' | 'productivity' | 'media' | 'communication' | 'system'>('all');

  const categories = [
    { id: 'all', name: 'All Apps', icon: Grid3X3 },
    { id: 'favorites', name: 'Favorites', icon: Star },
    { id: 'therapy', name: 'Therapy', icon: Brain },
    { id: 'productivity', name: 'Productivity', icon: FileText },
    { id: 'media', name: 'Media', icon: Music },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'system', name: 'System', icon: Settings },
  ];

  const filteredApps = allApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || 
                           (activeCategory === 'favorites' && app.isFavorite) ||
                           app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const recentApps = allApps.filter(app => app.isFavorite).slice(0, 4);

  const handleOpenApp = (app: AppItem) => {
    openWindow({
      title: app.name,
      component: app.component,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false
    });
    onClose();
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Grid3X3;
    return IconComponent;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Start Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-16 left-4 w-96 h-[600px] glass-surface rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {currentUser?.name?.charAt(0) || 'G'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{currentUser?.name || 'Guest User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser?.role || 'User'}
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 bg-muted/20 border-border/30"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex-1 flex">
                <div className="w-24 border-r border-border/20 p-2">
                  <div className="space-y-1">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant={activeCategory === category.id ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full h-16 flex-col gap-1 p-2"
                          onClick={() => setActiveCategory(category.id as any)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{category.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* App Grid */}
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                  {searchQuery === '' && activeCategory === 'all' && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Apps
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {recentApps.map((app) => {
                          const Icon = getIcon(app.icon);
                          return (
                            <Button
                              key={app.id}
                              variant="ghost"
                              className="h-16 flex-col gap-2 hover-lift"
                              onClick={() => handleOpenApp(app)}
                            >
                              <Icon className="h-6 w-6" />
                              <span className="text-xs">{app.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {filteredApps.map((app) => {
                      const Icon = getIcon(app.icon);
                      return (
                        <motion.div
                          key={app.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            className="h-20 flex-col gap-2 p-3 hover-lift relative group"
                            onClick={() => handleOpenApp(app)}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-xs text-center leading-tight">
                              {app.name}
                            </span>
                            {app.isFavorite && (
                              <Star className="absolute top-1 right-1 h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {filteredApps.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Grid3X3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No apps found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/20">
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start gap-2"
                    onClick={() => handleOpenApp(allApps.find(app => app.id === 'settings')!)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start gap-2"
                    onClick={logout}
                  >
                    <Power className="h-4 w-4" />
                    Sign Out
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