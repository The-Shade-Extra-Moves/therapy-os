import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VantaBackground, { VantaConfig } from './VantaBackground';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Power, Pause, Play, RotateCcw, Shuffle, Volume2, VolumeX
} from 'lucide-react';

interface ScreensaverProps {
  isActive: boolean;
  onDeactivate: () => void;
  autoActivateAfter?: number; // minutes
  showClock?: boolean;
  showControls?: boolean;
  enableAudio?: boolean;
}

// Classic screensaver configurations with nostalgic themes
const SCREENSAVER_CONFIGS: VantaConfig[] = [
  // Matrix-style digital rain
  {
    effect: 'net',
    color: 0x00ff41,
    backgroundColor: 0x000000,
    intensity: 1.8,
    speed: 1.5,
    scale: 0.7
  },
  // 3D Maze exploration
  {
    effect: 'topology',
    color: 0x4ecdc4,
    backgroundColor: 0x2c3e50,
    intensity: 1.3,
    speed: 0.4,
    scale: 0.8
  },
  // Flying through space pipes
  {
    effect: 'trunk',
    color: 0x3498db,
    backgroundColor: 0x1a1a2e,
    intensity: 1.1,
    speed: 0.8,
    scale: 1.0
  },
  // Cosmic globe journey
  {
    effect: 'globe',
    color: 0x9b59b6,
    backgroundColor: 0x2c3e50,
    intensity: 1.2,
    speed: 0.7,
    scale: 1.1
  },
  // Cellular life simulation
  {
    effect: 'cells',
    color: 0xe74c3c,
    backgroundColor: 0x34495e,
    intensity: 0.9,
    speed: 0.6,
    scale: 1.2
  },
  // Dream-like halos
  {
    effect: 'halo',
    color: 0xf39c12,
    backgroundColor: 0x2c3e50,
    intensity: 1.4,
    speed: 0.5,
    scale: 0.9
  },
  // Rippling digital water
  {
    effect: 'ripple',
    color: 0x1abc9c,
    backgroundColor: 0x2c3e50,
    intensity: 1.0,
    speed: 0.9,
    scale: 1.0
  },
  // Ethereal cloud formations
  {
    effect: 'clouds2',
    color: 0xecf0f1,
    backgroundColor: 0x34495e,
    intensity: 0.8,
    speed: 0.3,
    scale: 1.3
  }
];

const SCREENSAVER_NAMES = [
  'Digital Matrix Rain',
  '3D Maze Explorer',
  'Space Pipe Dreams', 
  'Cosmic Globe Journey',
  'Cellular Life Forms',
  'Aurora Dream Halos',
  'Digital Ripple Pool',
  'Ethereal Cloud Dance'
];

const Screensaver: React.FC<ScreensaverProps> = ({
  isActive,
  onDeactivate,
  autoActivateAfter = 10,
  showClock = true,
  showControls = false,
  enableAudio = false
}) => {
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showUI, setShowUI] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(enableAudio);
  const intervalRef = useRef<NodeJS.Timeout>();
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  // Auto-cycle through configurations
  useEffect(() => {
    if (!isActive || !isPlaying) return;

    intervalRef.current = setInterval(() => {
      setCurrentConfigIndex(prev => (prev + 1) % SCREENSAVER_CONFIGS.length);
    }, 30000); // Change every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPlaying]);

  // Track idle time for auto-activation
  useEffect(() => {
    if (isActive) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIdleTime(0);
    };

    const updateIdleTime = () => {
      const now = Date.now();
      const timeSinceActivity = Math.floor((now - lastActivityRef.current) / 1000 / 60);
      setIdleTime(timeSinceActivity);
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Update idle time every minute
    idleTimerRef.current = setInterval(updateIdleTime, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [isActive]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case ' ':
          onDeactivate();
          break;
        case 'ArrowRight':
        case 'n':
          setCurrentConfigIndex(prev => (prev + 1) % SCREENSAVER_CONFIGS.length);
          break;
        case 'ArrowLeft':
        case 'p':
          setCurrentConfigIndex(prev => prev === 0 ? SCREENSAVER_CONFIGS.length - 1 : prev - 1);
          break;
        case 'Pause':
        case 'k':
          setIsPlaying(!isPlaying);
          break;
        case 's':
          setCurrentConfigIndex(Math.floor(Math.random() * SCREENSAVER_CONFIGS.length));
          break;
        case 'c':
          setShowUI(!showUI);
          break;
        case 'm':
          setAudioEnabled(!audioEnabled);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, isPlaying, showUI, audioEnabled, onDeactivate]);

  // Mouse movement shows UI temporarily
  useEffect(() => {
    if (!isActive) return;

    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowUI(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowUI(false), 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isActive]);

  const currentConfig = SCREENSAVER_CONFIGS[currentConfigIndex];
  const currentName = SCREENSAVER_NAMES[currentConfigIndex];

  if (!isActive) {
    // Show idle time indicator when approaching auto-activation
    if (idleTime >= autoActivateAfter - 2) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Badge variant="outline" className="bg-black/80 text-white border-white/20">
            Screensaver activating in {autoActivateAfter - idleTime} min
          </Badge>
        </motion.div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black cursor-none">
      {/* Vanta Background */}
      <VantaBackground
        userPreference={currentConfig}
        disabled={!isPlaying}
        performanceMode="high"
        transitionDuration={2000}
      />

      {/* Clock Display */}
      {showClock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-8 left-8 text-white/80 font-mono"
        >
          <div className="text-6xl font-light">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xl mt-2 opacity-60">
            {new Date().toLocaleDateString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </motion.div>
      )}

      {/* Screensaver Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-8 left-8 text-white/60"
      >
        <div className="text-sm font-medium">{currentName}</div>
        <div className="text-xs mt-1 opacity-60">
          {currentConfigIndex + 1} of {SCREENSAVER_CONFIGS.length}
        </div>
      </motion.div>

      {/* Controls UI */}
      <AnimatePresence>
        {(showUI || showControls) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 right-8 flex space-x-2"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentConfigIndex(prev => (prev + 1) % SCREENSAVER_CONFIGS.length)}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentConfigIndex(Math.floor(Math.random() * SCREENSAVER_CONFIGS.length))}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onDeactivate}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <Power className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute top-8 right-8 text-white/40 text-xs"
      >
        <div>ESC or SPACE: Exit</div>
        <div>←/→: Change effect</div>
        <div>PAUSE: Play/Pause</div>
        <div>S: Shuffle</div>
        <div>C: Show/Hide controls</div>
      </motion.div>
    </div>
  );
};

export default Screensaver;
