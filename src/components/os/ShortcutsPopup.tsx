import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Command, 
  Keyboard,
  Search,
  Maximize2,
  Minimize2,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  XCircle,
  Monitor,
  ExternalLink,
  RotateCcw,
  Star,
  Globe,
  Layers,
  Settings,
  Volume2,
  Copy,
  Clipboard,
  Scissors,
  Save,
  Play,
  SkipBack,
  SkipForward,
  VolumeX,
  Target,
  RefreshCw,
  Power,
  AlertTriangle,
  Heart,
  Palette,
  Code,
  Zap,
  Camera,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShortcutsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string[];
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  level: 'Essential' | 'Basic' | 'Intermediate' | 'Advanced';
  usage: 'high' | 'medium' | 'low';
}

interface ShortcutCategory {
  category: string;
  color: string;
  description: string;
  shortcuts: Shortcut[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    category: 'Navigation',
    color: 'blue',
    description: 'Navigate through the system efficiently',
    shortcuts: [
      { key: ['⌘', 'Space'], description: 'Open Spotlight Search', icon: Search, level: 'Essential', usage: 'high' },
      { key: ['⌘', '?'], description: 'Show Keyboard Shortcuts', icon: Keyboard, level: 'Essential', usage: 'medium' },
      { key: ['Alt', 'Tab'], description: 'Switch Between Windows', icon: ArrowRight, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'W'], description: 'Close Active Window', icon: X, level: 'Basic', usage: 'high' },
      { key: ['⌘', '`'], description: 'Cycle Through App Windows', icon: Layers, level: 'Intermediate', usage: 'medium' },
      { key: ['⌘', 'T'], description: 'New Tab/Window', icon: ExternalLink, level: 'Basic', usage: 'high' },
    ]
  },
  {
    category: 'Window Management',
    color: 'purple',
    description: 'Master window controls and layouts',
    shortcuts: [
      { key: ['F11'], description: 'Toggle Full Screen', icon: Monitor, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'M'], description: 'Minimize Window', icon: Minimize2, level: 'Basic', usage: 'medium' },
      { key: ['⌘', '↑'], description: 'Maximize Window', icon: Maximize2, level: 'Basic', usage: 'high' },
      { key: ['⌘', '→'], description: 'Snap Right', icon: ArrowRight, level: 'Intermediate', usage: 'medium' },
      { key: ['⌘', '←'], description: 'Snap Left', icon: ArrowLeft, level: 'Intermediate', usage: 'medium' },
      { key: ['⌘', 'Shift', 'O'], description: 'Pop Out Window', icon: ExternalLink, level: 'Advanced', usage: 'low' },
      { key: ['⌘', 'Ctrl', '→'], description: 'Move to Next Desktop', icon: Globe, level: 'Advanced', usage: 'low' },
      { key: ['⌘', 'Ctrl', '←'], description: 'Move to Previous Desktop', icon: Globe, level: 'Advanced', usage: 'low' },
    ]
  },
  {
    category: 'Productivity',
    color: 'green',
    description: 'Boost your workflow and efficiency',
    shortcuts: [
      { key: ['⌘', 'C'], description: 'Copy', icon: Copy, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'V'], description: 'Paste', icon: Clipboard, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'X'], description: 'Cut', icon: Scissors, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'Z'], description: 'Undo', icon: RotateCcw, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'Shift', 'Z'], description: 'Redo', icon: RefreshCw, level: 'Basic', usage: 'medium' },
      { key: ['⌘', 'S'], description: 'Save', icon: Save, level: 'Essential', usage: 'high' },
      { key: ['⌘', 'A'], description: 'Select All', icon: Target, level: 'Basic', usage: 'high' },
      { key: ['⌘', 'F'], description: 'Find/Search', icon: Search, level: 'Essential', usage: 'high' },
    ]
  },
  {
    category: 'System Control',
    color: 'red',
    description: 'Control system functions and settings',
    shortcuts: [
      { key: ['⌘', 'R'], description: 'Refresh/Reload', icon: RotateCcw, level: 'Basic', usage: 'medium' },
      { key: ['Esc'], description: 'Cancel/Close Dialog', icon: XCircle, level: 'Essential', usage: 'high' },
      { key: ['↑', '↓'], description: 'Navigate Lists', icon: ArrowUp, level: 'Basic', usage: 'high' },
      { key: ['Enter'], description: 'Confirm/Execute', icon: CornerDownLeft, level: 'Essential', usage: 'high' },
      { key: ['⌘', ','], description: 'Open Preferences', icon: Settings, level: 'Basic', usage: 'medium' },
      { key: ['⌘', 'Q'], description: 'Quit Application', icon: Power, level: 'Basic', usage: 'medium' },
      { key: ['⌘', 'Shift', 'Q'], description: 'Force Quit', icon: AlertTriangle, level: 'Advanced', usage: 'low' },
    ]
  },
  {
    category: 'Media & Audio',
    color: 'orange',
    description: 'Control media playback and audio',
    shortcuts: [
      { key: ['Space'], description: 'Play/Pause', icon: Play, level: 'Basic', usage: 'medium' },
      { key: ['⌘', '↑'], description: 'Volume Up', icon: Volume2, level: 'Basic', usage: 'medium' },
      { key: ['⌘', '↓'], description: 'Volume Down', icon: Volume2, level: 'Basic', usage: 'medium' },
      { key: ['⌘', 'Shift', 'M'], description: 'Mute/Unmute', icon: VolumeX, level: 'Basic', usage: 'medium' },
      { key: ['→'], description: 'Skip Forward', icon: SkipForward, level: 'Basic', usage: 'low' },
      { key: ['←'], description: 'Skip Backward', icon: SkipBack, level: 'Basic', usage: 'low' },
    ]
  },
  {
    category: 'Advanced Features',
    color: 'indigo',
    description: 'Power user shortcuts and hidden features',
    shortcuts: [
      { key: ['⌘', 'Shift', 'C'], description: 'Color Picker', icon: Palette, level: 'Advanced', usage: 'low' },
      { key: ['⌘', 'Shift', '4'], description: 'Screenshot Selection', icon: Camera, level: 'Intermediate', usage: 'medium' },
      { key: ['⌘', 'Shift', '3'], description: 'Screenshot Full Screen', icon: Camera, level: 'Basic', usage: 'medium' },
      { key: ['⌘', 'Option', 'I'], description: 'Developer Tools', icon: Code, level: 'Advanced', usage: 'low' },
      { key: ['⌘', 'Shift', 'P'], description: 'Command Palette', icon: Zap, level: 'Advanced', usage: 'medium' },
      { key: ['⌘', 'K'], description: 'Quick Actions', icon: Zap, level: 'Advanced', usage: 'low' },
    ]
  }
];

const levelColors: Record<Shortcut['level'], string> = {
  Essential: 'bg-red-500/10 text-red-600 border-red-200',
  Basic: 'bg-blue-500/10 text-blue-600 border-blue-200',
  Intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  Advanced: 'bg-purple-500/10 text-purple-600 border-purple-200'
};

const usageIndicators: Record<Shortcut['usage'], { color: string; label: string }> = {
  high: { color: 'bg-green-500', label: 'Frequently Used' },
  medium: { color: 'bg-yellow-500', label: 'Occasionally Used' },
  low: { color: 'bg-gray-500', label: 'Rarely Used' }
};

export const ShortcutsPopup: React.FC<ShortcutsPopupProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | Shortcut['level']>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['⌘ Space', '⌘ ?', 'Alt Tab', 'F11']);

  // Filter shortcuts based on search and filters
  const filteredCategories = shortcutCategories.filter(category => {
    return category.shortcuts.some(shortcut => 
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.key.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut => {
      const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.key.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || shortcut.level === selectedLevel;
      const matchesFavorites = !showFavorites || favorites.includes(shortcut.key.join(' '));
      return matchesSearch && matchesLevel && matchesFavorites;
    })
  })).filter(category => category.shortcuts.length > 0);

  const toggleFavorite = (shortcut: string[]) => {
    const key = shortcut.join(' ');
    setFavorites(prev => 
      prev.includes(key) 
        ? prev.filter(f => f !== key)
        : [...prev, key]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100001] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl">
                    <Keyboard className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Zap className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Master your workflow with {shortcutCategories.reduce((total, cat) => total + cat.shortcuts.length, 0)} powerful shortcuts
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="flex items-center space-x-2"
                >
                  <Star className={`h-4 w-4 ${showFavorites ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  <span>Favorites ({favorites.length})</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters and Search */}
            <div className="px-8 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/20 dark:border-gray-700/20">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search shortcuts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label htmlFor="level-select" className="text-sm text-gray-600 dark:text-gray-400">Level:</label>
                      <select 
                        id="level-select"
                        value={selectedLevel} 
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
                      >
                        <option value="all">All Levels</option>
                        <option value="Essential">Essential</option>
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredCategories.reduce((total, cat) => total + cat.shortcuts.length, 0)} shortcuts
                  </div>
                </div>
                
                <TabsList className="grid w-full grid-cols-7 gap-1">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {shortcutCategories.map((category) => (
                    <TabsTrigger key={category.category} value={category.category.toLowerCase()} className="text-xs">
                      {category.category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Enhanced Content */}
            <div className="p-8 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <div className={`w-3 h-3 bg-gradient-to-r from-${category.color}-400 to-${category.color}-600 rounded-full mr-3`} />
                        {category.category}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {category.shortcuts.length}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2">
                      {category.shortcuts.map((shortcut, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: categoryIndex * 0.1 + index * 0.05 
                          }}
                          className="group relative flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
                        >
                          {/* Usage Indicator */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${usageIndicators[shortcut.usage].color}`} />
                          
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                              <shortcut.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {shortcut.description}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${levelColors[shortcut.level]} shrink-0`}
                                >
                                  {shortcut.level}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {usageIndicators[shortcut.usage].label}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(shortcut.key)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star className={`w-3 h-3 ${favorites.includes(shortcut.key.join(' ')) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                            </Button>
                            
                            <div className="flex items-center space-x-1">
                              {shortcut.key.map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  <kbd className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    {key === '⌘' ? (
                                      <Command className="w-3 h-3" />
                                    ) : key === '↑' ? (
                                      <ArrowUp className="w-3 h-3" />
                                    ) : key === '↓' ? (
                                      <ArrowDown className="w-3 h-3" />
                                    ) : key === '←' ? (
                                      <ArrowLeft className="w-3 h-3" />
                                    ) : key === '→' ? (
                                      <ArrowRight className="w-3 h-3" />
                                    ) : key === 'F11' ? (
                                      <Monitor className="w-3 h-3" />
                                    ) : key === 'Enter' ? (
                                      <CornerDownLeft className="w-3 h-3" />
                                    ) : key === 'Esc' ? (
                                      <XCircle className="w-3 h-3" />
                                    ) : (
                                      key
                                    )}
                                  </kbd>
                                  {keyIndex < shortcut.key.length - 1 && (
                                    <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="px-8 py-6 border-t border-gray-200/20 dark:border-gray-700/20 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Command className="w-4 h-4 mr-1" />
                      Press 
                      <kbd className="mx-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘ /</kbd>
                      anytime to view shortcuts
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Essential</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Basic</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Intermediate</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Advanced</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      // Export shortcuts as JSON
                      const data = JSON.stringify(shortcutCategories, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'keyboard-shortcuts.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-2">
                    <Heart className="w-3 h-3 text-red-500 fill-current" />
                    <span>TherapyOS v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
