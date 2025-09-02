import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Settings, 
  Power, 
  User, 
  Star,
  Grid,
  Clock,
  Folder,
  Brain,
  Users,
  FileText,
  Calendar,
  Activity,
  Plus,
  Heart,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWindowStore } from '@/stores/windowStore';
import { useOSStore } from '@/stores/osStore';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppCategory {
  name: string;
  icon: React.ElementType;
  apps: AppItem[];
}

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  component: string;
  category: string;
  isFavorite: boolean;
  isRecent: boolean;
  isNew?: boolean;
}

export const EnhancedStartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const { openWindow } = useWindowStore();
  const { currentUser, logout } = useOSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');
  const [favorites, setFavorites] = useState<string[]>(['PatientManager', 'AIAssistant', 'Calendar']);

  const allApps: AppItem[] = [
    {
      id: 'patient-manager',
      name: 'Patient Manager',
      description: 'Manage patient profiles and records',
      icon: Users,
      component: 'PatientManager',
      category: 'Therapy',
      isFavorite: true,
      isRecent: true
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      description: 'Intelligent therapy recommendations',
      icon: Brain,
      component: 'AIAssistant',
      category: 'AI Tools',
      isFavorite: true,
      isRecent: true
    },
    {
      id: 'session-notes',
      name: 'Session Notes',
      description: 'Record and manage therapy sessions',
      icon: FileText,
      component: 'SessionNotes',
      category: 'Therapy',
      isFavorite: false,
      isRecent: true
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Schedule appointments and sessions',
      icon: Calendar,
      component: 'Calendar',
      category: 'Productivity',
      isFavorite: true,
      isRecent: false
    },
    {
      id: 'file-manager',
      name: 'File Manager',
      description: 'Organize patient files and documents',
      icon: Folder,
      component: 'FileManager',
      category: 'System',
      isFavorite: false,
      isRecent: false
    },
    {
      id: 'task-manager',
      name: 'Task Manager',
      description: 'Monitor system performance',
      icon: Activity,
      component: 'SystemTaskManager',
      category: 'System',
      isFavorite: false,
      isRecent: false
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Customize your ReMotionOS experience',
      icon: Settings,
      component: 'Settings',
      category: 'System',
      isFavorite: false,
      isRecent: false
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Accessibility and assistive features',
      icon: Heart,
      component: 'AccessibilityPanel',
      category: 'System',
      isFavorite: false,
      isRecent: false,
      isNew: true
    }
  ];

  const categories: AppCategory[] = [
    {
      name: 'Therapy',
      icon: Heart,
      apps: allApps.filter(app => app.category === 'Therapy')
    },
    {
      name: 'AI Tools',
      icon: Zap,
      apps: allApps.filter(app => app.category === 'AI Tools')
    },
    {
      name: 'Productivity',
      icon: Clock,
      apps: allApps.filter(app => app.category === 'Productivity')
    },
    {
      name: 'System',
      icon: Settings,
      apps: allApps.filter(app => app.category === 'System')
    }
  ];

  const filteredApps = allApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'favorites':
        return matchesSearch && favorites.includes(app.component);
      case 'recent':
        return matchesSearch && app.isRecent;
      default:
        return matchesSearch;
    }
  });

  const toggleFavorite = (component: string) => {
    setFavorites(prev => 
      prev.includes(component) 
        ? prev.filter(fav => fav !== component)
        : [...prev, component]
    );
  };

  const handleAppClick = (app: AppItem) => {
    openWindow({
      title: app.name,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { width: 800, height: 600 },
    });
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Start Menu Panel */}
          <motion.div
            className="fixed bottom-20 left-4 w-96 h-[600px] glass-surface border rounded-xl z-50 flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-primary">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold">Welcome back!</h3>
                  <p className="text-sm text-white/80">{currentUser?.name || 'Therapist'}</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="p-3 border-b bg-muted/30">
              <div className="flex gap-1">
                {(['all', 'favorites', 'recent'] as const).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 capitalize"
                  >
                    {tab === 'favorites' && <Star className="w-3 h-3 mr-1" />}
                    {tab === 'recent' && <Clock className="w-3 h-3 mr-1" />}
                    {tab === 'all' && <Grid className="w-3 h-3 mr-1" />}
                    {tab}
                  </Button>
                ))}
              </div>
            </div>

            {/* Apps List */}
            <ScrollArea className="flex-1 p-3">
              {searchTerm ? (
                // Search Results
                <div className="space-y-2">
                  {filteredApps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No apps found</p>
                    </div>
                  ) : (
                    filteredApps.map((app) => (
                      <motion.div
                        key={app.id}
                        className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => handleAppClick(app)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <app.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{app.name}</h4>
                              {app.isNew && <Badge variant="secondary" className="text-xs">New</Badge>}
                              {favorites.includes(app.component) && (
                                <Star className="w-3 h-3 text-accent fill-accent" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{app.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(app.component);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star className={`w-4 h-4 ${favorites.includes(app.component) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                // Categories View
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center gap-2 mb-2">
                        <category.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {category.apps.map((app) => (
                          <motion.div
                            key={app.id}
                            className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group text-center"
                            onClick={() => handleAppClick(app)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative">
                              <app.icon className="w-6 h-6 text-primary" />
                              {app.isNew && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                              )}
                              {favorites.includes(app.component) && (
                                <Star className="absolute -top-1 -left-1 w-3 h-3 text-accent fill-accent" />
                              )}
                            </div>
                            <h4 className="font-medium text-xs">{app.name}</h4>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/30 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => handleAppClick(allApps.find(app => app.component === 'Settings')!)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Power className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};