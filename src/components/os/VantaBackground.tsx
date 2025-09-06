import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Vanta effect imports (we'll add these dynamically)
declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export interface VantaConfig {
  effect: 'waves' | 'birds' | 'clouds' | 'net' | 'rings' | 'fog' | 'dots' | 'trunk' | 
          'topology' | 'globe' | 'cells' | 'clouds2' | 'halo' | 'ripple' | 
          'wallpaper' | 'gradient' | 'solid';
  color?: string | number;
  backgroundColor?: string | number;
  intensity?: number;
  speed?: number;
  scale?: number;
  // Wallpaper specific options
  wallpaperUrl?: string;
  wallpaperType?: 'image' | 'gradient' | 'solid';
  gradientColors?: string[];
  gradientDirection?: 'vertical' | 'horizontal' | 'diagonal' | 'radial' | 'conic';
  overlayOpacity?: number;
  blurAmount?: number;
  [key: string]: any;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  type: 'unsplash' | 'gradient' | 'solid' | 'pattern';
  config: VantaConfig;
  category: 'nature' | 'abstract' | 'minimal' | 'colorful' | 'therapy' | 'space' | 'ocean';
  tags: string[];
}

export interface TherapyContext {
  sessionType: 'relaxation' | 'focus' | 'energy' | 'anxiety' | 'depression' | 'trauma';
  moodLevel: number; // 1-10
  progressStage: 'initial' | 'developing' | 'breakthrough' | 'maintenance' | 'completion';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weatherPreference?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'calm';
}

export interface VantaBackgroundProps {
  therapyContext?: TherapyContext;
  userPreference?: VantaConfig;
  transitionDuration?: number;
  onEffectChange?: (effect: string) => void;
  className?: string;
  disabled?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

// Predefined therapy-optimized configurations
const THERAPY_CONFIGS: Record<string, VantaConfig> = {
  // Relaxation Therapy
  'relaxation-waves': {
    effect: 'waves',
    color: 0x4a90e2,
    backgroundColor: 0x0a1628,
    intensity: 0.8,
    speed: 0.6,
    scale: 1.2
  },
  'relaxation-clouds': {
    effect: 'clouds',
    color: 0xffffff,
    backgroundColor: 0x87ceeb,
    intensity: 0.5,
    speed: 0.3
  },

  // Focus & Concentration
  'focus-net': {
    effect: 'net',
    color: 0x4ade80,
    backgroundColor: 0x0f172a,
    intensity: 1.0,
    speed: 0.8,
    scale: 0.8
  },
  'focus-dots': {
    effect: 'dots',
    color: 0x3b82f6,
    backgroundColor: 0x111827,
    intensity: 0.9,
    speed: 0.7
  },

  // Energy & Motivation
  'energy-birds': {
    effect: 'birds',
    color: 0xff6b35,
    backgroundColor: 0xfef3c7,
    intensity: 1.2,
    speed: 1.0,
    scale: 1.1
  },
  'energy-rings': {
    effect: 'rings',
    color: 0xf59e0b,
    backgroundColor: 0x451a03,
    intensity: 1.3,
    speed: 1.2
  },

  // Anxiety Management
  'anxiety-fog': {
    effect: 'fog',
    color: 0xd8b4fe,
    backgroundColor: 0x312e81,
    intensity: 0.4,
    speed: 0.2
  },
  'anxiety-waves-calm': {
    effect: 'waves',
    color: 0x6366f1,
    backgroundColor: 0x1e1b4b,
    intensity: 0.3,
    speed: 0.1,
    scale: 1.5
  },

  // Depression Support
  'depression-sunrise': {
    effect: 'clouds',
    color: 0xfbbf24,
    backgroundColor: 0xfef3c7,
    intensity: 0.6,
    speed: 0.4
  },
  'depression-growth': {
    effect: 'trunk',
    color: 0x10b981,
    backgroundColor: 0x064e3b,
    intensity: 0.8,
    speed: 0.5
  },

  // Trauma Therapy
  'trauma-gentle': {
    effect: 'fog',
    color: 0xf3e8ff,
    backgroundColor: 0x7c3aed,
    intensity: 0.2,
    speed: 0.1
  },

  // Classic Screensaver Effects
  '3d-flowerbox': {
    effect: 'topology',
    color: 0xff6b9d,
    backgroundColor: 0x1a1a2e,
    intensity: 0.9,
    speed: 0.8,
    scale: 1.0
  },
  '3d-maze': {
    effect: 'topology',
    color: 0x4ecdc4,
    backgroundColor: 0x2c3e50,
    intensity: 1.2,
    speed: 0.3,
    scale: 0.7
  },
  'matrix-code': {
    effect: 'net',
    color: 0x00ff41,
    backgroundColor: 0x000000,
    intensity: 1.5,
    speed: 1.2,
    scale: 0.8
  },
  'flying-pipes': {
    effect: 'trunk',
    color: 0x3498db,
    backgroundColor: 0x2c3e50,
    intensity: 1.0,
    speed: 0.7,
    scale: 0.9
  },
  'cellular-automata': {
    effect: 'cells',
    color: 0xe74c3c,
    backgroundColor: 0x34495e,
    intensity: 0.8,
    speed: 0.5,
    scale: 1.1
  },
  'cosmic-globe': {
    effect: 'globe',
    color: 0x9b59b6,
    backgroundColor: 0x2c3e50,
    intensity: 1.0,
    speed: 0.6,
    scale: 1.0
  },
  'nostalgic-pipes': {
    effect: 'trunk',
    color: 0xf39c12,
    backgroundColor: 0x2c3e50,
    intensity: 0.9,
    speed: 0.4,
    scale: 1.2
  },
  'ripple-effect': {
    effect: 'ripple',
    color: 0x3498db,
    backgroundColor: 0x2c3e50,
    intensity: 1.0,
    speed: 0.8,
    scale: 1.0
  },
  'halo-dreams': {
    effect: 'halo',
    color: 0xe67e22,
    backgroundColor: 0x34495e,
    intensity: 1.1,
    speed: 0.7,
    scale: 0.9
  }
};

// Beautiful wallpaper presets inspired by Unsplash and modern design
const WALLPAPER_PRESETS: Record<string, WallpaperPreset> = {
  // Nature wallpapers
  'mountain-sunrise': {
    id: 'mountain-sunrise',
    name: 'Mountain Sunrise',
    type: 'unsplash',
    category: 'nature',
    tags: ['mountains', 'sunrise', 'peaceful', 'warm'],
    config: {
      effect: 'wallpaper',
      wallpaperType: 'image',
      wallpaperUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      overlayOpacity: 0.1,
      blurAmount: 0
    }
  },
  'ocean-waves': {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    type: 'unsplash',
    category: 'ocean',
    tags: ['ocean', 'waves', 'calm', 'blue'],
    config: {
      effect: 'wallpaper',
      wallpaperType: 'image',
      wallpaperUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop',
      overlayOpacity: 0.2,
      blurAmount: 0
    }
  },
  'forest-path': {
    id: 'forest-path',
    name: 'Forest Path',
    type: 'unsplash',
    category: 'nature',
    tags: ['forest', 'path', 'green', 'peaceful'],
    config: {
      effect: 'wallpaper',
      wallpaperType: 'image',
      wallpaperUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
      overlayOpacity: 0.1,
      blurAmount: 0
    }
  },
  'starry-night': {
    id: 'starry-night',
    name: 'Starry Night',
    type: 'unsplash',
    category: 'space',
    tags: ['stars', 'night', 'cosmic', 'peaceful'],
    config: {
      effect: 'wallpaper',
      wallpaperType: 'image',
      wallpaperUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
      overlayOpacity: 0.3,
      blurAmount: 0
    }
  },

  // Abstract gradients
  'aurora-gradient': {
    id: 'aurora-gradient',
    name: 'Aurora Gradient',
    type: 'gradient',
    category: 'abstract',
    tags: ['aurora', 'colorful', 'vibrant', 'modern'],
    config: {
      effect: 'gradient',
      wallpaperType: 'gradient',
      gradientColors: ['#667eea', '#764ba2', '#f093fb'],
      gradientDirection: 'diagonal',
      overlayOpacity: 0
    }
  },
  'sunset-gradient': {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    type: 'gradient',
    category: 'abstract',
    tags: ['sunset', 'warm', 'orange', 'peaceful'],
    config: {
      effect: 'gradient',
      wallpaperType: 'gradient',
      gradientColors: ['#ff9a9e', '#fecfef', '#ffc3a0'],
      gradientDirection: 'vertical',
      overlayOpacity: 0
    }
  },
  'ocean-gradient': {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    type: 'gradient',
    category: 'abstract',
    tags: ['ocean', 'blue', 'calm', 'modern'],
    config: {
      effect: 'gradient',
      wallpaperType: 'gradient',
      gradientColors: ['#667eea', '#764ba2', '#667eea'],
      gradientDirection: 'radial',
      overlayOpacity: 0
    }
  },
  'forest-gradient': {
    id: 'forest-gradient',
    name: 'Forest Gradient',
    type: 'gradient',
    category: 'abstract',
    tags: ['forest', 'green', 'nature', 'calming'],
    config: {
      effect: 'gradient',
      wallpaperType: 'gradient',
      gradientColors: ['#11998e', '#38ef7d'],
      gradientDirection: 'diagonal',
      overlayOpacity: 0
    }
  },
  'cosmic-gradient': {
    id: 'cosmic-gradient',
    name: 'Cosmic Gradient',
    type: 'gradient',
    category: 'space',
    tags: ['cosmic', 'purple', 'mysterious', 'modern'],
    config: {
      effect: 'gradient',
      wallpaperType: 'gradient',
      gradientColors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
      gradientDirection: 'conic',
      overlayOpacity: 0
    }
  },

  // Minimal colors
  'soft-blue': {
    id: 'soft-blue',
    name: 'Soft Blue',
    type: 'solid',
    category: 'minimal',
    tags: ['blue', 'minimal', 'calm', 'professional'],
    config: {
      effect: 'solid',
      wallpaperType: 'solid',
      backgroundColor: '#e0f2fe',
      overlayOpacity: 0
    }
  },
  'warm-beige': {
    id: 'warm-beige',
    name: 'Warm Beige',
    type: 'solid',
    category: 'minimal',
    tags: ['beige', 'warm', 'minimal', 'cozy'],
    config: {
      effect: 'solid',
      wallpaperType: 'solid',
      backgroundColor: '#f5f5dc',
      overlayOpacity: 0
    }
  },
  'sage-green': {
    id: 'sage-green',
    name: 'Sage Green',
    type: 'solid',
    category: 'minimal',
    tags: ['green', 'sage', 'natural', 'calming'],
    config: {
      effect: 'solid',
      wallpaperType: 'solid',
      backgroundColor: '#9caf88',
      overlayOpacity: 0
    }
  },

  // Therapy-specific wallpapers
  'healing-light': {
    id: 'healing-light',
    name: 'Healing Light',
    type: 'gradient',
    category: 'therapy',
    tags: ['healing', 'light', 'therapeutic', 'hope'],
    config: {
      effect: 'gradient',
      wallpaperType: 'gradient',
      gradientColors: ['#ffeaa7', '#fab1a0', '#fd79a8'],
      gradientDirection: 'radial',
      overlayOpacity: 0.1
    }
  },
  'mindful-mist': {
    id: 'mindful-mist',
    name: 'Mindful Mist',
    type: 'unsplash',
    category: 'therapy',
    tags: ['mindful', 'mist', 'meditation', 'serene'],
    config: {
      effect: 'wallpaper',
      wallpaperType: 'image',
      wallpaperUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&blur=2',
      overlayOpacity: 0.4,
      blurAmount: 2
    }
  }
};

// Progress-based environment evolution
const PROGRESS_EVOLUTION: Record<string, VantaConfig[]> = {
  'storm-to-calm': [
    { effect: 'waves', color: 0x1f2937, backgroundColor: 0x374151, intensity: 2.0, speed: 2.0 }, // Storm
    { effect: 'waves', color: 0x374151, backgroundColor: 0x6b7280, intensity: 1.5, speed: 1.5 }, // Turbulent
    { effect: 'waves', color: 0x6b7280, backgroundColor: 0x9ca3af, intensity: 1.0, speed: 1.0 }, // Settling
    { effect: 'waves', color: 0x93c5fd, backgroundColor: 0xdbeafe, intensity: 0.7, speed: 0.7 }, // Calming
    { effect: 'waves', color: 0x60a5fa, backgroundColor: 0x3b82f6, intensity: 0.5, speed: 0.3 }  // Serene
  ],
  'darkness-to-light': [
    { effect: 'fog', color: 0x1f2937, backgroundColor: 0x111827, intensity: 0.3, speed: 0.1 },    // Darkness
    { effect: 'fog', color: 0x374151, backgroundColor: 0x1f2937, intensity: 0.4, speed: 0.2 },    // Dawn
    { effect: 'clouds', color: 0x6b7280, backgroundColor: 0x374151, intensity: 0.6, speed: 0.3 }, // Morning
    { effect: 'clouds', color: 0xfbbf24, backgroundColor: 0xfef3c7, intensity: 0.8, speed: 0.4 }, // Bright
    { effect: 'clouds', color: 0xfbbf24, backgroundColor: 0xfffbeb, intensity: 1.0, speed: 0.5 }  // Radiant
  ]
};

const VantaBackground: React.FC<VantaBackgroundProps> = ({
  therapyContext,
  userPreference,
  transitionDuration = 2000,
  onEffectChange,
  className = '',
  disabled = false,
  performanceMode = 'medium'
}) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Performance settings based on mode
  const getPerformanceConfig = (mode: string) => {
    switch (mode) {
      case 'high':
        return { scale: 1.0, maxDistance: 30, spacing: 15 };
      case 'medium':
        return { scale: 0.8, maxDistance: 25, spacing: 20 };
      case 'low':
        return { scale: 0.6, maxDistance: 20, spacing: 25 };
      default:
        return { scale: 0.8, maxDistance: 25, spacing: 20 };
    }
  };

  // Load Vanta.js effects dynamically
  useEffect(() => {
    const loadVantaEffects = async () => {
      if (disabled) return;

      try {
        // Set THREE as global for Vanta
        window.THREE = THREE;

        // Load Vanta core and effects
        const vantaPromises = [
          import('vanta/dist/vanta.waves.min.js'),
          import('vanta/dist/vanta.birds.min.js'),
          import('vanta/dist/vanta.clouds.min.js'),
          import('vanta/dist/vanta.net.min.js'),
          import('vanta/dist/vanta.rings.min.js'),
          import('vanta/dist/vanta.fog.min.js'),
          import('vanta/dist/vanta.dots.min.js'),
          import('vanta/dist/vanta.trunk.min.js'),
          // Classic screensaver effects
          import('vanta/dist/vanta.topology.min.js'),
          import('vanta/dist/vanta.globe.min.js'),
          import('vanta/dist/vanta.cells.min.js'),
          import('vanta/dist/vanta.clouds2.min.js'),
          import('vanta/dist/vanta.halo.min.js'),
          import('vanta/dist/vanta.ripple.min.js')
        ];

        await Promise.all(vantaPromises);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Vanta effects:', error);
      }
    };

    loadVantaEffects();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, [disabled]);

  // Determine configuration based on therapy context
  const getConfigForContext = (context?: TherapyContext): VantaConfig => {
    if (userPreference) return userPreference;
    if (!context) return THERAPY_CONFIGS['relaxation-waves'];

    const { sessionType, moodLevel, progressStage, timeOfDay } = context;
    
    // Select base configuration
    let baseConfig: VantaConfig;
    
    switch (sessionType) {
      case 'relaxation':
        baseConfig = moodLevel < 5 ? THERAPY_CONFIGS['anxiety-waves-calm'] : THERAPY_CONFIGS['relaxation-waves'];
        break;
      case 'focus':
        baseConfig = THERAPY_CONFIGS['focus-net'];
        break;
      case 'energy':
        baseConfig = THERAPY_CONFIGS['energy-birds'];
        break;
      case 'anxiety':
        baseConfig = moodLevel < 4 ? THERAPY_CONFIGS['anxiety-fog'] : THERAPY_CONFIGS['anxiety-waves-calm'];
        break;
      case 'depression':
        baseConfig = THERAPY_CONFIGS['depression-sunrise'];
        break;
      case 'trauma':
        baseConfig = THERAPY_CONFIGS['trauma-gentle'];
        break;
      default:
        baseConfig = THERAPY_CONFIGS['relaxation-waves'];
    }

    // Apply progress stage modifications
    if (progressStage === 'initial' && sessionType === 'depression') {
      const evolution = PROGRESS_EVOLUTION['darkness-to-light'];
      baseConfig = evolution[0];
    } else if (progressStage === 'completion' && sessionType === 'anxiety') {
      const evolution = PROGRESS_EVOLUTION['storm-to-calm'];
      baseConfig = evolution[4];
    }

    // Apply time-of-day modifications
    if (timeOfDay === 'night') {
      baseConfig = {
        ...baseConfig,
        backgroundColor: typeof baseConfig.backgroundColor === 'number' 
          ? baseConfig.backgroundColor & 0x3f3f3f 
          : 0x1a1a1a,
        intensity: (baseConfig.intensity || 1) * 0.6
      };
    }

    return baseConfig;
  };

  // Create or update Vanta effect
  const createVantaEffect = (config: VantaConfig) => {
    if (!vantaRef.current || !window.VANTA || !isLoaded) return;

    // Destroy existing effect
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
    }

    const performanceConfig = getPerformanceConfig(performanceMode);
    const finalConfig = {
      el: vantaRef.current,
      THREE: window.THREE,
      ...config,
      ...performanceConfig
    };

    try {
      switch (config.effect) {
        case 'waves':
          vantaEffect.current = window.VANTA.WAVES(finalConfig);
          break;
        case 'birds':
          vantaEffect.current = window.VANTA.BIRDS(finalConfig);
          break;
        case 'clouds':
          vantaEffect.current = window.VANTA.CLOUDS(finalConfig);
          break;
        case 'clouds2':
          vantaEffect.current = window.VANTA.CLOUDS2(finalConfig);
          break;
        case 'net':
          vantaEffect.current = window.VANTA.NET(finalConfig);
          break;
        case 'rings':
          vantaEffect.current = window.VANTA.RINGS(finalConfig);
          break;
        case 'fog':
          vantaEffect.current = window.VANTA.FOG(finalConfig);
          break;
        case 'dots':
          vantaEffect.current = window.VANTA.DOTS(finalConfig);
          break;
        case 'trunk':
          vantaEffect.current = window.VANTA.TRUNK(finalConfig);
          break;
        case 'topology':
          vantaEffect.current = window.VANTA.TOPOLOGY(finalConfig);
          break;
        case 'globe':
          vantaEffect.current = window.VANTA.GLOBE(finalConfig);
          break;
        case 'cells':
          vantaEffect.current = window.VANTA.CELLS(finalConfig);
          break;
        case 'halo':
          vantaEffect.current = window.VANTA.HALO(finalConfig);
          break;
        case 'ripple':
          vantaEffect.current = window.VANTA.RIPPLE(finalConfig);
          break;
        default:
          vantaEffect.current = window.VANTA.WAVES(finalConfig);
      }

      setCurrentEffect(config.effect);
      onEffectChange?.(config.effect);
    } catch (error) {
      console.error('Failed to create Vanta effect:', error);
    }
  };

  // Update effect when context changes
  useEffect(() => {
    if (!isLoaded || disabled) return;

    const config = getConfigForContext(therapyContext);
    
    if (config.effect !== currentEffect) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        createVantaEffect(config);
        setTimeout(() => setIsTransitioning(false), transitionDuration / 2);
      }, transitionDuration / 2);
    }
  }, [therapyContext, userPreference, isLoaded, currentEffect, disabled, transitionDuration, performanceMode]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (vantaEffect.current && vantaEffect.current.resize) {
        vantaEffect.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (disabled) {
    return (
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 ${className}`}
        style={{ zIndex: -1 }}
      />
    );
  }

  // Get current config for rendering
  const currentConfig = userPreference || getConfigForContext(therapyContext);

  // Handle wallpaper rendering
  if (currentConfig.effect === 'wallpaper' || currentConfig.effect === 'gradient' || currentConfig.effect === 'solid') {
    const renderWallpaper = () => {
      if (currentConfig.effect === 'solid') {
        return (
          <div
            className={`fixed inset-0 ${className}`}
            style={{
              zIndex: -1,
              backgroundColor: typeof currentConfig.backgroundColor === 'string' 
                ? currentConfig.backgroundColor 
                : `#${currentConfig.backgroundColor?.toString(16) || 'f5f5f5'}`
            }}
          />
        );
      }

      if (currentConfig.effect === 'gradient') {
        const { gradientColors = ['#667eea', '#764ba2'], gradientDirection = 'diagonal' } = currentConfig;
        let gradientCSS = '';
        
        switch (gradientDirection) {
          case 'vertical':
            gradientCSS = `linear-gradient(to bottom, ${gradientColors.join(', ')})`;
            break;
          case 'horizontal':
            gradientCSS = `linear-gradient(to right, ${gradientColors.join(', ')})`;
            break;
          case 'diagonal':
            gradientCSS = `linear-gradient(135deg, ${gradientColors.join(', ')})`;
            break;
          case 'radial':
            gradientCSS = `radial-gradient(circle, ${gradientColors.join(', ')})`;
            break;
          case 'conic':
            gradientCSS = `conic-gradient(${gradientColors.join(', ')})`;
            break;
          default:
            gradientCSS = `linear-gradient(135deg, ${gradientColors.join(', ')})`;
        }

        return (
          <div
            className={`fixed inset-0 ${className}`}
            style={{
              zIndex: -1,
              background: gradientCSS
            }}
          />
        );
      }

      if (currentConfig.effect === 'wallpaper') {
        const { wallpaperUrl, overlayOpacity = 0, blurAmount = 0 } = currentConfig;
        return (
          <div className={`fixed inset-0 ${className}`} style={{ zIndex: -1 }}>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${wallpaperUrl})`,
                filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'
              }}
            />
            {overlayOpacity > 0 && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity }}
              />
            )}
          </div>
        );
      }

      return null;
    };

    return (
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration / 1000 }}
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: 10 }}
          />
        )}
        <motion.div
          key={`wallpaper-${JSON.stringify(currentConfig)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration / 1000 }}
        >
          {renderWallpaper()}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <div 
        ref={vantaRef}
        className={`fixed inset-0 ${className}`}
        style={{ zIndex: -1 }}
      />
      
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration / 1000 }}
            className="fixed inset-0 bg-black pointer-events-none"
            style={{ zIndex: 0 }}
          />
        )}
      </AnimatePresence>

      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800" style={{ zIndex: -1 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/50 text-sm">Loading immersive environment...</div>
          </div>
        </div>
      )}
    </>
  );
};

// Therapy-specific preset functions
export const TherapyEnvironments = {
  getRelaxationConfig: (intensity: number = 0.8): VantaConfig => ({
    effect: 'waves',
    color: 0x4a90e2,
    backgroundColor: 0x0a1628,
    intensity: Math.max(0.1, Math.min(2.0, intensity)),
    speed: 0.6,
    scale: 1.2
  }),

  getFocusConfig: (concentration: number = 0.8): VantaConfig => ({
    effect: 'net',
    color: 0x4ade80,
    backgroundColor: 0x0f172a,
    intensity: Math.max(0.5, Math.min(1.5, concentration)),
    speed: 0.8,
    scale: 0.8
  }),

  getEnergyConfig: (energy: number = 1.0): VantaConfig => ({
    effect: 'birds',
    color: 0xff6b35,
    backgroundColor: 0xfef3c7,
    intensity: Math.max(0.8, Math.min(1.5, energy)),
    speed: Math.max(0.5, Math.min(1.5, energy)),
    scale: 1.1
  }),

  getCalmingConfig: (calmness: number = 0.5): VantaConfig => ({
    effect: 'fog',
    color: 0xd8b4fe,
    backgroundColor: 0x312e81,
    intensity: Math.max(0.1, Math.min(0.8, calmness)),
    speed: Math.max(0.1, Math.min(0.5, calmness * 0.4))
  })
};

export default VantaBackground;
