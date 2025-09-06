import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import VantaBackground, { VantaConfig, TherapyContext, TherapyEnvironments } from './VantaBackground';
import { useTherapySystem, useVantaTherapyContext } from '@/contexts/TherapySystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Cloud, Waves, Bird, Network, CircleDot, Eye, 
  Settings, Palette, Zap, Heart, Brain, Moon,
  Sun, Sunset, CloudRain, Wind, Sparkles, Image, Mountain,
  Camera, Paintbrush, Monitor, TreePine, Star, Flower2,
  Play, Maximize2, Grid, Layers, ChevronRight, GripVertical,
  Move, Minimize2, X
} from 'lucide-react';

interface VantaControllerProps {
  onTherapyContextChange?: (context: TherapyContext) => void;
  initialContext?: TherapyContext;
  showControls?: boolean;
  onClose?: () => void;
  className?: string;
}

// Preset therapy sessions
const THERAPY_PRESETS = {
  'morning-energy': {
    sessionType: 'energy' as const,
    moodLevel: 7,
    progressStage: 'developing' as const,
    timeOfDay: 'morning' as const,
    weatherPreference: 'sunny' as const
  },
  'midday-focus': {
    sessionType: 'focus' as const,
    moodLevel: 6,
    progressStage: 'maintenance' as const,
    timeOfDay: 'afternoon' as const,
    weatherPreference: 'sunny' as const
  },
  'evening-relaxation': {
    sessionType: 'relaxation' as const,
    moodLevel: 5,
    progressStage: 'maintenance' as const,
    timeOfDay: 'evening' as const,
    weatherPreference: 'calm' as const
  },
  'anxiety-support': {
    sessionType: 'anxiety' as const,
    moodLevel: 3,
    progressStage: 'developing' as const,
    timeOfDay: 'afternoon' as const,
    weatherPreference: 'cloudy' as const
  },
  'depression-breakthrough': {
    sessionType: 'depression' as const,
    moodLevel: 4,
    progressStage: 'breakthrough' as const,
    timeOfDay: 'morning' as const,
    weatherPreference: 'sunny' as const
  },
  'trauma-gentle': {
    sessionType: 'trauma' as const,
    moodLevel: 2,
    progressStage: 'initial' as const,
    timeOfDay: 'evening' as const,
    weatherPreference: 'calm' as const
  }
};

// Environment themes organized by category
const ENVIRONMENT_CATEGORIES = {
  nature: {
    name: 'Nature',
    icon: TreePine,
    description: 'Peaceful natural environments',
    themes: {
      'ocean-depths': {
        effect: 'waves' as const,
        color: '#1e40af',
        backgroundColor: '#0c4a6e',
        intensity: 0.8,
        speed: 0.5,
        preview: 'Deep ocean waves with calming blue tones'
      },
      'forest-canopy': {
        effect: 'trunk' as const,
        color: '#166534',
        backgroundColor: '#14532d',
        intensity: 0.7,
        speed: 0.3,
        preview: 'Gentle forest with organic tree-like structures'
      },
      'mountain-sunrise': {
        effect: 'wallpaper' as const,
        wallpaperType: 'image',
        wallpaperUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
        overlayOpacity: 0.1,
        blurAmount: 0,
        preview: 'Majestic mountain sunrise photograph'
      },
      'forest-path': {
        effect: 'wallpaper' as const,
        wallpaperType: 'image',
        wallpaperUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
        overlayOpacity: 0.1,
        blurAmount: 0,
        preview: 'Serene forest path through green woods'
      },
      'forest-gradient': {
        effect: 'gradient' as const,
        wallpaperType: 'gradient',
        gradientColors: ['#11998e', '#38ef7d'],
        gradientDirection: 'diagonal',
        preview: 'Fresh green gradient inspired by forest'
      }
    }
  },
  space: {
    name: 'Space & Cosmic',
    icon: Star,
    description: 'Cosmic and celestial themes',
    themes: {
      'cosmic-dance': {
        effect: 'rings' as const,
        color: '#f59e0b',
        backgroundColor: '#92400e',
        intensity: 1.2,
        speed: 1.0,
        preview: 'Hypnotic cosmic rings with golden hues'
      },
      'cosmic-globe': {
        effect: 'globe' as const,
        color: '#9b59b6',
        backgroundColor: '#2c3e50',
        intensity: 1.0,
        speed: 0.6,
        preview: '3D globe with cosmic purple atmosphere'
      },
      'starry-night': {
        effect: 'wallpaper' as const,
        wallpaperType: 'image',
        wallpaperUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
        overlayOpacity: 0.3,
        blurAmount: 0,
        preview: 'Beautiful starry night sky photograph'
      },
      'cosmic-gradient': {
        effect: 'gradient' as const,
        wallpaperType: 'gradient',
        gradientColors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
        gradientDirection: 'conic',
        preview: 'Multi-color cosmic gradient with purple and blue'
      }
    }
  },
  therapy: {
    name: 'Therapeutic',
    icon: Heart,
    description: 'Calming therapeutic environments',
    themes: {
      'morning-mist': {
        effect: 'fog' as const,
        color: '#f3f4f6',
        backgroundColor: '#e5e7eb',
        intensity: 0.4,
        speed: 0.2,
        preview: 'Gentle morning mist for relaxation'
      },
      'healing-light': {
        effect: 'gradient' as const,
        wallpaperType: 'gradient',
        gradientColors: ['#ffeaa7', '#fab1a0', '#fd79a8'],
        gradientDirection: 'radial',
        overlayOpacity: 0.1,
        preview: 'Warm healing light gradient'
      },
      'aurora-gradient': {
        effect: 'gradient' as const,
        wallpaperType: 'gradient',
        gradientColors: ['#667eea', '#764ba2', '#f093fb'],
        gradientDirection: 'diagonal',
        preview: 'Aurora-inspired therapeutic gradient'
      },
      'soft-blue': {
        effect: 'solid' as const,
        wallpaperType: 'solid',
        backgroundColor: '#e0f2fe',
        preview: 'Calming soft blue solid color'
      },
      'warm-beige': {
        effect: 'solid' as const,
        wallpaperType: 'solid',
        backgroundColor: '#f5f5dc',
        preview: 'Warm beige for comfort and stability'
      },
      'sage-green': {
        effect: 'solid' as const,
        wallpaperType: 'solid',
        backgroundColor: '#9caf88',
        preview: 'Natural sage green for balance'
      }
    }
  },
  abstract: {
    name: 'Abstract & Modern',
    icon: Sparkles,
    description: 'Contemporary abstract designs',
    themes: {
      'neural-network': {
        effect: 'net' as const,
        color: '#7c3aed',
        backgroundColor: '#581c87',
        intensity: 1.0,
        speed: 0.8,
        preview: 'Interconnected neural network pattern'
      },
      'cellular-life': {
        effect: 'cells' as const,
        color: '#e74c3c',
        backgroundColor: '#34495e',
        intensity: 0.8,
        speed: 0.5,
        preview: 'Dynamic cellular structures and patterns'
      },
      'dream-halo': {
        effect: 'halo' as const,
        color: '#e67e22',
        backgroundColor: '#34495e',
        intensity: 1.1,
        speed: 0.7,
        preview: 'Ethereal halos with warm orange glow'
      },
      'ripple-waves': {
        effect: 'ripple' as const,
        color: '#3498db',
        backgroundColor: '#2c3e50',
        intensity: 1.0,
        speed: 0.8,
        preview: 'Mesmerizing ripple effect patterns'
      }
    }
  },
  sky: {
    name: 'Sky & Weather',
    icon: Cloud,
    description: 'Atmospheric and weather-inspired',
    themes: {
      'sky-sanctuary': {
        effect: 'clouds' as const,
        color: '#0ea5e9',
        backgroundColor: '#0284c7',
        intensity: 0.6,
        speed: 0.4,
        preview: 'Peaceful cloudy sky sanctuary'
      },
      'cloud-dreams': {
        effect: 'clouds2' as const,
        color: '#f39c12',
        backgroundColor: '#2c3e50',
        intensity: 0.9,
        speed: 0.4,
        preview: 'Dreamy cloud formations with golden tint'
      },
      'ocean-waves-photo': {
        effect: 'wallpaper' as const,
        wallpaperType: 'image',
        wallpaperUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop',
        overlayOpacity: 0.2,
        blurAmount: 0,
        preview: 'Stunning ocean waves photograph'
      },
      'sunset-gradient': {
        effect: 'gradient' as const,
        wallpaperType: 'gradient',
        gradientColors: ['#ff9a9e', '#fecfef', '#ffc3a0'],
        gradientDirection: 'vertical',
        preview: 'Warm sunset gradient with pink and orange'
      },
      'ocean-gradient': {
        effect: 'gradient' as const,
        wallpaperType: 'gradient',
        gradientColors: ['#667eea', '#764ba2', '#667eea'],
        gradientDirection: 'radial',
        preview: 'Ocean-inspired blue gradient'
      }
    }
  },
  retro: {
    name: 'Retro Screensavers',
    icon: Monitor,
    description: 'Classic nostalgic screensaver effects',
    themes: {
      'matrix-rain': {
        effect: 'net' as const,
        color: '#00ff41',
        backgroundColor: '#000000',
        intensity: 1.5,
        speed: 1.2,
        preview: 'Classic Matrix digital rain effect'
      },
      '3d-maze': {
        effect: 'topology' as const,
        color: '#4ecdc4',
        backgroundColor: '#2c3e50',
        intensity: 1.2,
        speed: 0.3,
        preview: 'Nostalgic 3D maze exploration'
      },
      'flying-pipes': {
        effect: 'trunk' as const,
        color: '#3498db',
        backgroundColor: '#2c3e50',
        intensity: 1.0,
        speed: 0.7,
        preview: 'Classic flying through pipes screensaver'
      }
    }
  }
};

const VantaController: React.FC<VantaControllerProps> = ({
  onTherapyContextChange,
  initialContext,
  showControls = false,
  onClose,
  className = ''
}) => {
  // Use therapy system context if available
  const systemTherapyContext = useVantaTherapyContext();
  const { currentPatient, currentSession } = useTherapySystem();
  
  const [therapyContext, setTherapyContext] = useState<TherapyContext>(
    systemTherapyContext || initialContext || {
      sessionType: 'relaxation',
      moodLevel: 5,
      progressStage: 'initial',
      timeOfDay: 'afternoon'
    }
  );

  const [customConfig, setCustomConfig] = useState<VantaConfig | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('medium');
  const [transitionSpeed, setTransitionSpeed] = useState(2000);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  // Sync with system therapy context
  useEffect(() => {
    if (systemTherapyContext) {
      setTherapyContext(systemTherapyContext);
    }
  }, [systemTherapyContext]);

  // Auto-adapt based on time of day
  useEffect(() => {
    if (!adaptiveMode) return;

    const updateTimeContext = () => {
      const hour = new Date().getHours();
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      
      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      setTherapyContext(prev => ({ ...prev, timeOfDay }));
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [adaptiveMode]);

  // Notify parent of context changes
  useEffect(() => {
    onTherapyContextChange?.(therapyContext);
  }, [therapyContext, onTherapyContextChange]);

  const handlePresetSelect = (presetKey: string) => {
    const preset = THERAPY_PRESETS[presetKey as keyof typeof THERAPY_PRESETS];
    if (preset) {
      setTherapyContext(preset);
      setCustomConfig(null);
      setSelectedTheme('');
    }
  };

  const handleThemeSelect = (themeKey: string, categoryKey: string) => {
    const category = ENVIRONMENT_CATEGORIES[categoryKey as keyof typeof ENVIRONMENT_CATEGORIES];
    const theme = category?.themes[themeKey];
    if (theme) {
      setCustomConfig(theme);
      setSelectedTheme(themeKey);
      setSelectedCategory(categoryKey);
    }
  };

  const handlePreviewTheme = (themeKey: string) => {
    setPreviewTheme(themeKey);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    setPosition({ x: info.offset.x, y: info.offset.y });
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const closePanel = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback behavior if no onClose prop
      setIsControlsOpen(false);
      setIsMinimized(true);
    }
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleContextUpdate = (key: keyof TherapyContext, value: any) => {
    setTherapyContext(prev => ({ ...prev, [key]: value }));
  };

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'waves': return <Waves className="h-4 w-4" />;
      case 'birds': return <Bird className="h-4 w-4" />;
      case 'clouds': 
      case 'clouds2': return <Cloud className="h-4 w-4" />;
      case 'net': return <Network className="h-4 w-4" />;
      case 'dots': return <CircleDot className="h-4 w-4" />;
      case 'rings': return <Sparkles className="h-4 w-4" />;
      case 'fog': return <CloudRain className="h-4 w-4" />;
      case 'trunk': return <Wind className="h-4 w-4" />;
      case 'topology': return <Network className="h-4 w-4" />;
      case 'globe': return <Sparkles className="h-4 w-4" />;
      case 'cells': return <CircleDot className="h-4 w-4" />;
      case 'halo': return <Sun className="h-4 w-4" />;
      case 'ripple': return <Waves className="h-4 w-4" />;
      case 'wallpaper': return <Image className="h-4 w-4" />;
      case 'gradient': return <Paintbrush className="h-4 w-4" />;
      case 'solid': return <Monitor className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'relaxation': return <Sunset className="h-4 w-4" />;
      case 'focus': return <Brain className="h-4 w-4" />;
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'anxiety': return <Heart className="h-4 w-4" />;
      case 'depression': return <Sun className="h-4 w-4" />;
      case 'trauma': return <Moon className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={constraintsRef}>
      {/* Vanta Background */}
      <VantaBackground
        therapyContext={therapyContext}
        userPreference={customConfig || undefined}
        transitionDuration={transitionSpeed}
        performanceMode={performanceMode}
      />

      {/* Draggable Floating Controls */}
      {showControls && (
        <motion.div
          drag
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: 300, y: 0 }}
          animate={{ 
            opacity: 1, 
            x: position.x, 
            y: position.y,
            scale: isDragging ? 1.02 : 1
          }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 200 
          }}
          className={`fixed top-4 right-4 z-50 cursor-default ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px)`,
            willChange: 'transform'
          }}
        >
          <Card className={`w-80 bg-white/95 backdrop-blur-md border-0 shadow-2xl transition-all duration-200 ${
            isDragging ? 'shadow-3xl rotate-1' : 'shadow-xl'
          } ${isMinimized ? 'h-auto' : ''}`}>
            
            {/* Draggable Header */}
            <div 
              className={`cursor-grab active:cursor-grabbing select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onPointerDown={(e) => {
                e.preventDefault();
                dragControls.start(e);
              }}
            >
              <CardHeader className="pb-2 hover:bg-muted/30 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Environment Control</span>
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    {(position.x !== 0 || position.y !== 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetPosition}
                        className="h-6 w-6 p-0 hover:bg-muted/50"
                        title="Reset Position"
                      >
                        <Move className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMinimized}
                      className="h-6 w-6 p-0 hover:bg-muted/50"
                      title={isMinimized ? "Expand" : "Minimize"}
                    >
                      <Minimize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsControlsOpen(!isControlsOpen)}
                      className="h-6 w-6 p-0 hover:bg-muted/50"
                      title="Toggle Controls"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closePanel}
                      className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                      title="Close Panel"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Quick Status - Always visible */}
                <div className="flex items-center space-x-2 text-xs">
                  {currentSession && (
                    <Badge variant="default" className="flex items-center space-x-1">
                      {getSessionIcon(therapyContext.sessionType)}
                      <span>Active Session</span>
                    </Badge>
                  )}
                  {currentPatient && !currentSession && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{currentPatient.name}</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>Mood: {therapyContext.moodLevel}/10</span>
                  </Badge>
                </div>
              </CardHeader>
            </div>

            {/* Collapsible Content */}
            {(isControlsOpen && !isMinimized) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="pt-0 space-y-4 pointer-events-auto"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 text-xs">
                    <TabsTrigger value="presets" className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>Therapy</span>
                    </TabsTrigger>
                    <TabsTrigger value="environments" className="flex items-center space-x-1">
                      <Layers className="h-3 w-3" />
                      <span>Environments</span>
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center space-x-1">
                      <Settings className="h-3 w-3" />
                      <span>Custom</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="presets" className="space-y-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      Quick therapy session presets
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(THERAPY_PRESETS).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetSelect(key)}
                          className="justify-start text-xs h-10 p-3 hover:scale-[1.02] transition-transform"
                        >
                          <div className="flex items-center space-x-3">
                            {getSessionIcon(preset.sessionType)}
                            <div className="text-left">
                              <div className="font-medium capitalize">{key.replace('-', ' ')}</div>
                              <div className="text-xs text-muted-foreground">
                                Mood: {preset.moodLevel}/10 • {preset.timeOfDay}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="environments" className="space-y-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      Choose from categorized environments
                    </div>
                    
                    {selectedCategory ? (
                      <div className="space-y-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategory('')}
                          className="text-xs p-2 h-8 hover:bg-muted/50"
                        >
                          ← Back to categories
                        </Button>
                        
                        <div className="space-y-2">
                          {Object.entries(ENVIRONMENT_CATEGORIES[selectedCategory as keyof typeof ENVIRONMENT_CATEGORIES].themes).map(([themeKey, theme]) => (
                            <div key={themeKey} className="relative group">
                              <Button
                                variant={selectedTheme === themeKey ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleThemeSelect(themeKey, selectedCategory)}
                                onMouseEnter={() => handlePreviewTheme(themeKey)}
                                onMouseLeave={() => setPreviewTheme('')}
                                className="w-full justify-start text-xs h-auto p-3 hover:scale-[1.02] transition-all"
                              >
                                <div className="flex items-start space-x-3 w-full">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getEffectIcon(theme.effect)}
                                  </div>
                                  <div className="text-left flex-1">
                                    <div className="font-medium capitalize mb-1">
                                      {themeKey.replace('-', ' ')}
                                    </div>
                                    <div className="text-xs text-muted-foreground leading-tight">
                                      {theme.preview}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <Play className="h-3 w-3 opacity-50" />
                                  </div>
                                </div>
                              </Button>
                              
                              {previewTheme === themeKey && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute -right-2 top-0 transform translate-x-full z-10"
                                >
                                  <div className="w-32 h-20 rounded-md border-2 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                    {theme.effect === 'wallpaper' && theme.wallpaperUrl && (
                                      <div 
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${theme.wallpaperUrl})` }}
                                      />
                                    )}
                                    {theme.effect === 'gradient' && theme.gradientColors && (
                                      <div 
                                        className="w-full h-full"
                                        style={{ 
                                          background: `linear-gradient(135deg, ${theme.gradientColors.join(', ')})` 
                                        }}
                                      />
                                    )}
                                    {theme.effect === 'solid' && theme.backgroundColor && (
                                      <div 
                                        className="w-full h-full"
                                        style={{ backgroundColor: theme.backgroundColor }}
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                      <Maximize2 className="h-4 w-4 text-white drop-shadow" />
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(ENVIRONMENT_CATEGORIES).map(([categoryKey, category]) => {
                          const IconComponent = category.icon;
                          return (
                            <Button
                              key={categoryKey}
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCategory(categoryKey)}
                              className="justify-start text-xs h-auto p-3 hover:scale-[1.02] transition-transform"
                            >
                              <div className="flex items-center space-x-3 w-full">
                                <IconComponent className="h-4 w-4 flex-shrink-0" />
                                <div className="text-left flex-1">
                                  <div className="font-medium">{category.name}</div>
                                  <div className="text-xs text-muted-foreground leading-tight">
                                    {category.description}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <span>{Object.keys(category.themes).length}</span>
                                  <ChevronRight className="h-3 w-3" />
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      Fine-tune your therapeutic environment
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium">Session Type</Label>
                          <Select
                            value={therapyContext.sessionType}
                            onValueChange={(value) => handleContextUpdate('sessionType', value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="relaxation">🧘 Relaxation</SelectItem>
                              <SelectItem value="focus">🧠 Focus</SelectItem>
                              <SelectItem value="energy">⚡ Energy</SelectItem>
                              <SelectItem value="anxiety">❤️ Anxiety Support</SelectItem>
                              <SelectItem value="depression">☀️ Depression Support</SelectItem>
                              <SelectItem value="trauma">🌙 Trauma Care</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Progress Stage</Label>
                          <Select
                            value={therapyContext.progressStage}
                            onValueChange={(value) => handleContextUpdate('progressStage', value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="initial">🌱 Initial</SelectItem>
                              <SelectItem value="developing">🌿 Developing</SelectItem>
                              <SelectItem value="breakthrough">🌟 Breakthrough</SelectItem>
                              <SelectItem value="maintenance">🌸 Maintenance</SelectItem>
                              <SelectItem value="completion">🌺 Completion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium flex items-center justify-between">
                          <span>Mood Level</span>
                          <Badge variant="outline" className="text-xs">
                            {therapyContext.moodLevel}/10
                          </Badge>
                        </Label>
                        <div className="mt-2">
                          <Slider
                            value={[therapyContext.moodLevel]}
                            onValueChange={([value]) => handleContextUpdate('moodLevel', value)}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Low</span>
                            <span>Balanced</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Time & Weather</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Select
                            value={therapyContext.timeOfDay}
                            onValueChange={(value) => handleContextUpdate('timeOfDay', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">🌅 Morning</SelectItem>
                              <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                              <SelectItem value="evening">🌇 Evening</SelectItem>
                              <SelectItem value="night">🌙 Night</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={therapyContext.weatherPreference || 'sunny'}
                            onValueChange={(value) => handleContextUpdate('weatherPreference', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunny">☀️ Sunny</SelectItem>
                              <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                              <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                              <SelectItem value="stormy">⛈️ Stormy</SelectItem>
                              <SelectItem value="calm">🌸 Calm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Enhanced Settings */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Smart Adaptation</Label>
                      <div className="text-xs text-muted-foreground">
                        Auto-adjust based on time and context
                      </div>
                    </div>
                    <Switch
                      checked={adaptiveMode}
                      onCheckedChange={setAdaptiveMode}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Performance</Label>
                      <Select
                        value={performanceMode}
                        onValueChange={(value: any) => setPerformanceMode(value)}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">🔥 High Quality</SelectItem>
                          <SelectItem value="medium">⚖️ Balanced</SelectItem>
                          <SelectItem value="low">⚡ Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Transitions</Label>
                      <Select
                        value={transitionSpeed.toString()}
                        onValueChange={(value) => setTransitionSpeed(Number(value))}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500">⚡ Instant</SelectItem>
                          <SelectItem value="1000">🚀 Fast</SelectItem>
                          <SelectItem value="2000">🌊 Smooth</SelectItem>
                          <SelectItem value="3000">🐌 Gentle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Current Environment Status */}
                  {selectedTheme && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs font-medium mb-2">Current Environment</div>
                      <div className="flex items-center space-x-2">
                        {customConfig && getEffectIcon(customConfig.effect)}
                        <span className="text-xs capitalize">{selectedTheme.replace('-', ' ')}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {selectedCategory || 'Custom'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
                </motion.div>
              )}
            </Card>
        </motion.div>
      )}
    </div>
  );
};

export default VantaController;
