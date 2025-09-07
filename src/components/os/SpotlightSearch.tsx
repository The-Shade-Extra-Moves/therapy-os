import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  FileText, 
  Users, 
  Calendar,
  Settings,
  Brain,
  Shield,
  Bot,
  Folder,
  ArrowRight,
  X
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'app' | 'file' | 'setting' | 'action';
  icon: React.ComponentType<any>;
  action: () => void;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const appSearchData = [
  { 
    id: 'patient-manager', 
    title: 'Patient Manager', 
    subtitle: 'Manage patient records and information',
    type: 'app' as const, 
    icon: Users, 
    component: 'PatientManager' 
  },
  { 
    id: 'session-notes', 
    title: 'Session Notes', 
    subtitle: 'Take and manage therapy session notes',
    type: 'app' as const, 
    icon: FileText, 
    component: 'SessionNotes' 
  },
  { 
    id: 'ai-assistant', 
    title: 'AI Assistant', 
    subtitle: 'Get AI-powered therapy insights',
    type: 'app' as const, 
    icon: Brain, 
    component: 'AIAssistant' 
  },
  { 
    id: 'calendar', 
    title: 'Calendar', 
    subtitle: 'Schedule and manage appointments',
    type: 'app' as const, 
    icon: Calendar, 
    component: 'Calendar' 
  },
  { 
    id: 'settings', 
    title: 'Settings', 
    subtitle: 'Configure system preferences',
    type: 'app' as const, 
    icon: Settings, 
    component: 'Settings' 
  },
  { 
    id: 'search-browser', 
    title: 'Private Search', 
    subtitle: 'Secure web browsing',
    type: 'app' as const, 
    icon: Shield, 
    component: 'SearchBrowser' 
  },
  { 
    id: 'ai-search', 
    title: 'AI Search', 
    subtitle: 'Advanced AI-powered search',
    type: 'app' as const, 
    icon: Bot, 
    component: 'AISearchApp' 
  },
  { 
    id: 'file-explorer', 
    title: 'File Explorer', 
    subtitle: 'Browse and manage files',
    type: 'app' as const, 
    icon: Folder, 
    component: 'FileExplorer' 
  },
];

const actionSearchData = [
  {
    id: 'new-patient',
    title: 'New Patient',
    subtitle: 'Create a new patient record',
    type: 'action' as const,
    icon: Users,
  },
  {
    id: 'new-session',
    title: 'New Session Note',
    subtitle: 'Start a new therapy session note',
    type: 'action' as const,
    icon: FileText,
  },
  {
    id: 'schedule-appointment',
    title: 'Schedule Appointment',
    subtitle: 'Book a new appointment',
    type: 'action' as const,
    icon: Calendar,
  },
];

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWindow } = useWindowStore();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search and filter results
  useEffect(() => {
    if (!query.trim()) {
      const recentApps = appSearchData.slice(0, 6);
      setResults(recentApps.map(app => ({
        ...app,
        action: () => {
          openWindow({
            title: app.title,
            component: app.component,
            isMinimized: false,
            isMaximized: false,
            isFullScreen: false,
            isPoppedOut: false,
            position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
            size: { width: 800, height: 600 },
          });
          onClose();
        }
      })));
      return;
    }

    const searchTerm = query.toLowerCase();
    const appResults = appSearchData
      .filter(app => 
        app.title.toLowerCase().includes(searchTerm) ||
        app.subtitle?.toLowerCase().includes(searchTerm)
      )
      .map(app => ({
        ...app,
        action: () => {
          openWindow({
            title: app.title,
            component: app.component,
            isMinimized: false,
            isMaximized: false,
            isFullScreen: false,
            isPoppedOut: false,
            position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
            size: { width: 800, height: 600 },
          });
          onClose();
        }
      }));

    const actionResults = actionSearchData
      .filter(action =>
        action.title.toLowerCase().includes(searchTerm) ||
        action.subtitle?.toLowerCase().includes(searchTerm)
      )
      .map(action => ({
        ...action,
        action: () => {
          // Handle actions here
          console.log(`Executing action: ${action.id}`);
          onClose();
        }
      }));

    setResults([...appResults, ...actionResults]);
    setSelectedIndex(0);
  }, [query, openWindow, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100000] flex items-start justify-center pt-32"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="flex items-center px-6 py-4 border-b border-gray-200/20 dark:border-gray-700/20">
              <Search className="w-6 h-6 text-gray-400 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for apps, files, and more..."
                className="flex-1 text-lg bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      className={`
                        flex items-center px-6 py-3 cursor-pointer transition-all duration-150
                        ${index === selectedIndex 
                          ? 'bg-blue-500/10 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                        }
                      `}
                      onClick={result.action}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className={`
                        p-2 rounded-lg mr-4
                        ${index === selectedIndex 
                          ? 'bg-blue-500/20 text-blue-600' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }
                      `}>
                        <result.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400">
                        {result.type === 'app' && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-2">
                            App
                          </span>
                        )}
                        {result.type === 'action' && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded mr-2">
                            Action
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Recent Apps
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200/20 dark:border-gray-700/20 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">↵</kbd>
                    <span className="ml-1">Open</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">esc</kbd>
                    <span className="ml-1">Close</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Command className="w-3 h-3 mr-1" />
                  <span>Spotlight Search</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
