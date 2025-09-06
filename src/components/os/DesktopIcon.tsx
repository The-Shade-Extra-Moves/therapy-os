import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Brain, Calendar, Settings, Package, 
  Folder, Activity, Monitor, Trash2, Bot, Search,
  Heart, Stethoscope, PenTool, Palette, Camera,
  MessageSquare, BookOpen, BarChart3, Shield,
  Sparkles, Waves, TreePine, Edit, Contact,
  Video, Code, FileEdit, Hammer, Zap, Phone,
  Globe, Mail
} from 'lucide-react';
import { useOSStore, DesktopIcon as DesktopIconType } from '@/stores/osStore';
import { useWindowStore } from '@/stores/windowStore';
import { Badge } from '@/components/ui/badge';

// Enhanced icon mapping with colors and categories
const ICON_CONFIG = {
  // Core Therapy Apps
  'PatientManager': { 
    icon: Users, 
    color: 'bg-blue-500', 
    accent: 'text-blue-100', 
    gradient: 'from-blue-500 to-blue-600',
    category: 'therapy',
    description: 'Manage therapy patients and sessions'
  },
  'SessionNotes': { 
    icon: FileText, 
    color: 'bg-green-500', 
    accent: 'text-green-100',
    gradient: 'from-green-500 to-green-600', 
    category: 'therapy',
    description: 'Session notes and documentation'
  },
  'AITherapistApp': { 
    icon: Brain, 
    color: 'bg-purple-500', 
    accent: 'text-purple-100',
    gradient: 'from-purple-500 to-purple-600',
    category: 'ai',
    description: 'AI-powered therapy assistance'
  },
  'AIAssistant': { 
    icon: Bot, 
    color: 'bg-indigo-500', 
    accent: 'text-indigo-100',
    gradient: 'from-indigo-500 to-indigo-600',
    category: 'ai',
    description: 'Intelligent AI assistant'
  },
  'AIAssistantApp': { 
    icon: Brain, 
    color: 'bg-violet-500', 
    accent: 'text-violet-100',
    gradient: 'from-violet-500 to-violet-600',
    category: 'ai',
    description: 'Advanced AI assistant with therapy focus'
  },
  'AISecretaryApp': { 
    icon: Bot, 
    color: 'bg-emerald-500', 
    accent: 'text-emerald-100',
    gradient: 'from-emerald-500 to-emerald-600',
    category: 'ai',
    description: 'AI-powered secretary and scheduler'
  },
  'AISearchApp': { 
    icon: Search, 
    color: 'bg-sky-500', 
    accent: 'text-sky-100',
    gradient: 'from-sky-500 to-sky-600',
    category: 'ai',
    description: 'Intelligent search and discovery'
  },
  
  // Professional Tools
  'ReportEditor': { 
    icon: PenTool, 
    color: 'bg-orange-500', 
    accent: 'text-orange-100',
    gradient: 'from-orange-500 to-orange-600',
    category: 'tools',
    description: 'Create professional therapy reports'
  },
  'TaskManager': { 
    icon: BarChart3, 
    color: 'bg-cyan-500', 
    accent: 'text-cyan-100',
    gradient: 'from-cyan-500 to-cyan-600',
    category: 'tools',
    description: 'Manage tasks and productivity'
  },
  'Calendar': { 
    icon: Calendar, 
    color: 'bg-red-500', 
    accent: 'text-red-100',
    gradient: 'from-red-500 to-red-600',
    category: 'tools',
    description: 'Schedule appointments and events'
  },
  
  // Creative & Wellness
  'DrawingApp': { 
    icon: Palette, 
    color: 'bg-pink-500', 
    accent: 'text-pink-100',
    gradient: 'from-pink-500 to-pink-600',
    category: 'creative',
    description: 'Digital art and expression therapy'
  },
  'MindfulnessApp': { 
    icon: Heart, 
    color: 'bg-rose-500', 
    accent: 'text-rose-100',
    gradient: 'from-rose-500 to-rose-600',
    category: 'wellness',
    description: 'Guided mindfulness and meditation'
  },
  'ContactManager': { 
    icon: Phone, 
    color: 'bg-amber-500', 
    accent: 'text-amber-100',
    gradient: 'from-amber-500 to-amber-600',
    category: 'tools',
    description: 'Manage contacts and communications'
  },
  'MeetingApp': { 
    icon: Video, 
    color: 'bg-blue-600', 
    accent: 'text-blue-100',
    gradient: 'from-blue-600 to-blue-700',
    category: 'tools',
    description: 'Video meetings and telehealth sessions'
  },
  'AppBuilderApp': { 
    icon: Code, 
    color: 'bg-slate-600', 
    accent: 'text-slate-100',
    gradient: 'from-slate-600 to-slate-700',
    category: 'tools',
    description: 'Build custom therapy applications'
  },
  'NotePadPro': { 
    icon: FileEdit, 
    color: 'bg-lime-500', 
    accent: 'text-lime-100',
    gradient: 'from-lime-500 to-lime-600',
    category: 'tools',
    description: 'Advanced note-taking and journaling'
  },
  'TherapyAppBuilder': { 
    icon: Hammer, 
    color: 'bg-fuchsia-500', 
    accent: 'text-fuchsia-100',
    gradient: 'from-fuchsia-500 to-fuchsia-600',
    category: 'therapy',
    description: 'Build custom therapy tools and workflows'
  },
  'ReMotionStore': { 
    icon: Package, 
    color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
    accent: 'text-white',
    gradient: 'from-purple-500 to-pink-500',
    category: 'system',
    description: 'Discover and install therapy applications'
  },
  
  // System & Utilities
  'Settings': { 
    icon: Settings, 
    color: 'bg-slate-500', 
    accent: 'text-slate-100',
    gradient: 'from-slate-500 to-slate-600',
    category: 'system',
    description: 'System preferences and configuration'
  },
  'FileExplorer': { 
    icon: Folder, 
    color: 'bg-yellow-500', 
    accent: 'text-yellow-900',
    gradient: 'from-yellow-500 to-yellow-600',
    category: 'system',
    description: 'Browse files and documents'
  },
  'SearchBrowser': { 
    icon: Shield, 
    color: 'bg-teal-500', 
    accent: 'text-teal-100',
    gradient: 'from-teal-500 to-teal-600',
    category: 'tools',
    description: 'Private and secure web browsing'
  },
  
  // Entertainment & Store
  'AppStore': { 
    icon: Package, 
    color: 'bg-violet-500', 
    accent: 'text-violet-100',
    gradient: 'from-violet-500 to-violet-600',
    category: 'system',
    description: 'Discover and install new applications'
  },
  
  // Default fallback
  'default': { 
    icon: Package, 
    color: 'bg-gray-500', 
    accent: 'text-gray-100',
    gradient: 'from-gray-500 to-gray-600',
    category: 'other',
    description: 'Application'
  }
};

const getIconComponent = (iconName: string) => {
  // Map old/invalid icon names to valid Lucide icons
  const iconMap: { [key: string]: any } = {
    'Users': Users,
    'FileText': FileText,
    'Brain': Brain,
    'Calendar': Calendar,
    'Settings': Settings,
    'Package': Package,
    'Folder': Folder,
    'Activity': Activity,
    'Bot': Bot,
    'Search': Search,
    'Heart': Heart,
    'Palette': Palette,
    'Edit': Edit,
    'Contact': Phone, // Contact icon doesn't exist in Lucide, use Phone
    'Video': Video,
    'Code': Code,
    'FileEdit': FileEdit,
    'Hammer': Hammer,
    // Add fallback for any missing icons
    'default': Package
  };
  
  return iconMap[iconName] || iconMap['default'];
};

const getIconConfig = (componentName: string) => {
  // First try to get config by component name
  if (ICON_CONFIG[componentName]) {
    return ICON_CONFIG[componentName];
  }
  
  // Fallback to default
  return ICON_CONFIG['default'];
};
const CATEGORY_COLORS = {
  therapy: 'border-blue-300 bg-blue-50',
  ai: 'border-purple-300 bg-purple-50',
  tools: 'border-orange-300 bg-orange-50',
  creative: 'border-pink-300 bg-pink-50',
  wellness: 'border-rose-300 bg-rose-50',
  system: 'border-slate-300 bg-slate-50',
  other: 'border-gray-300 bg-gray-50'
};

interface DesktopIconProps {
  icon: DesktopIconType;
  isFirstTime?: boolean;
  showTooltip?: boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  icon, 
  isFirstTime = false, 
  showTooltip = true 
}) => {
  const { selectIcon, clearSelection, appearance } = useOSStore();
  const { openWindow } = useWindowStore();
  
  // Get icon configuration
  const config = getIconConfig(icon.component || 'default');
  const IconComponent = config.icon;
  const categoryColor = CATEGORY_COLORS[config.category as keyof typeof CATEGORY_COLORS];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectIcon(icon.id, isMultiSelect);
  };

  const handleDoubleClick = () => {
    if (icon.component) {
      openWindow({
        title: icon.name,
        component: icon.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100, y: 100 },
        size: { width: 800, height: 600 },
      });
    }
  };

  const iconSizes = {
    small: 48,
    medium: 64,
    large: 80
  };
  const iconSize = iconSizes[appearance.iconSize];

  return (
    <div className="relative w-full max-w-[120px]">
      <motion.div
        className="cursor-pointer select-none relative group w-full"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        whileHover={appearance.animations ? { scale: 1.05 } : {}}
        whileTap={appearance.animations ? { scale: 0.95 } : {}}
        initial={appearance.animations ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: appearance.animations ? 0.3 : 0, delay: Math.random() * 0.2 }}
      >
        {/* Enhanced Icon Container */}
        <div className="flex flex-col items-center justify-center w-full h-full p-2">
          {/* Icon with gradient background */}
          <div className={`
            relative p-4 rounded-2xl shadow-lg mb-2 transition-all duration-200
            bg-gradient-to-br ${config.gradient}
            ${icon.isSelected 
              ? 'ring-2 ring-white ring-offset-2 ring-offset-black/20 scale-105' 
              : 'hover:scale-110 hover:shadow-xl'
            }
          `}>
            <IconComponent 
              size={iconSize * 0.6} 
              className={`${config.accent} drop-shadow-sm`}
            />
            
            {/* Category badge */}
            <div className={`
              absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
              ${config.color.replace('bg-', 'bg-').replace('-500', '-400')}
            `} />
          </div>
          
          {/* App name with better typography */}
          <div className="text-center w-full">
            <span className="text-xs font-semibold text-white drop-shadow-lg leading-tight block max-w-full">
              {icon.name}
            </span>
            
            {/* Category indicator */}
            <Badge 
              variant="secondary" 
              className="mt-1 text-xs opacity-75 bg-black/20 text-white border-0"
            >
              {config.category}
            </Badge>
          </div>
        </div>

        {/* Tooltip on hover */}
        {showTooltip && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none z-50"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0, y: 0 }}
            whileHover={{ opacity: 1, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 max-w-48 text-center backdrop-blur-sm border border-white/10">
              <div className="font-medium mb-1">{icon.name}</div>
              <div className="text-gray-300">{config.description}</div>
            </div>
          </motion.div>
        )}

        {/* New app indicator for first-time users */}
        {isFirstTime && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};