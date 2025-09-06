import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Image, 
  Clock, 
  Palette, 
  Mountain, 
  Waves, 
  Star, 
  Sun,
  TreePine,
  Sparkles,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { WALLPAPER_CATEGORIES } from './DynamicWallpaper';

interface WallpaperSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: string;
  currentInterval: number;
  enableTransitions: boolean;
  isStatic: boolean;
  onCategoryChange: (category: string) => void;
  onIntervalChange: (interval: number) => void;
  onTransitionsToggle: (enabled: boolean) => void;
  onStaticToggle: (enabled: boolean) => void;
}

const categoryIcons = {
  nature: TreePine,
  landscapes: Mountain,
  abstract: Sparkles,
  minimal: Circle,
  space: Star,
  ocean: Waves,
  mountains: Mountain,
  sunset: Sun
};

const categoryDescriptions = {
  nature: 'Lush forests, wildlife, and natural landscapes',
  landscapes: 'Scenic vistas, valleys, and panoramic views',
  abstract: 'Artistic patterns, colors, and creative designs',
  minimal: 'Clean, simple, and elegant compositions',
  space: 'Cosmic scenes, galaxies, and celestial bodies',
  ocean: 'Seascapes, waves, and marine environments',
  mountains: 'Majestic peaks, ranges, and alpine scenery',
  sunset: 'Golden hour, sunrise, and twilight moments'
};

const WallpaperSettings: React.FC<WallpaperSettingsProps> = ({
  isOpen,
  onClose,
  currentCategory,
  currentInterval,
  enableTransitions,
  isStatic,
  onCategoryChange,
  onIntervalChange,
  onTransitionsToggle,
  onStaticToggle
}) => {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedInterval, setSelectedInterval] = useState(currentInterval);
  const [selectedTransitions, setSelectedTransitions] = useState(enableTransitions);
  const [selectedStatic, setSelectedStatic] = useState(isStatic);

  const handleSave = () => {
    onCategoryChange(selectedCategory);
    onIntervalChange(selectedInterval);
    onTransitionsToggle(selectedTransitions);
    onStaticToggle(selectedStatic);
    onClose();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleIntervalChange = (value: number[]) => {
    setSelectedInterval(value[0]);
  };

  const handleTransitionsToggle = () => {
    setSelectedTransitions(!selectedTransitions);
  };

  const handleStaticToggle = () => {
    setSelectedStatic(!selectedStatic);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <Card className="bg-background/95 backdrop-blur-md border-border/50 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Wallpaper Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your dynamic wallpaper experience
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <h3 className="font-medium">Wallpaper Category</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(WALLPAPER_CATEGORIES).map(([key, value]) => {
                      const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
                      const isSelected = selectedCategory === value;
                      
                      return (
                        <motion.button
                          key={key}
                          onClick={() => handleCategorySelect(value)}
                          className={`p-4 rounded-lg border transition-all text-left ${
                            isSelected
                              ? 'bg-primary/10 border-primary/30 shadow-sm'
                              : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`font-medium capitalize ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {key}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {categoryDescriptions[key as keyof typeof categoryDescriptions]}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Interval Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <h3 className="font-medium">Change Interval</h3>
                    <Badge variant="secondary" className="text-xs">
                      {formatTime(selectedInterval)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <Slider
                      value={[selectedInterval]}
                      onValueChange={handleIntervalChange}
                      min={5}
                      max={300}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5s</span>
                      <span>Fast</span>
                      <span>Normal</span>
                      <span>Slow</span>
                      <span>5m</span>
                    </div>
                  </div>
                </div>

                {/* Transitions Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="font-medium">Visual Effects</h3>
                    <Badge variant={selectedTransitions ? "default" : "secondary"} className="text-xs">
                      {selectedTransitions ? 'Enhanced' : 'Simple'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium mb-1">Smooth Transitions</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTransitions 
                          ? 'Enable beautiful fade effects and smooth animations between wallpapers'
                          : 'Use simple image changes without transitions for better performance'
                        }
                      </p>
                    </div>
                    <Button
                      variant={selectedTransitions ? "default" : "outline"}
                      size="sm"
                      onClick={handleTransitionsToggle}
                      className="ml-4"
                    >
                      {selectedTransitions ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>

                {/* Static Mode Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    <h3 className="font-medium">Wallpaper Mode</h3>
                    <Badge variant={selectedStatic ? "secondary" : "default"} className="text-xs">
                      {selectedStatic ? 'Static' : 'Cycling'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium mb-1">Static Wallpaper</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedStatic 
                          ? 'Display a single wallpaper without automatic changes'
                          : 'Automatically cycle through different wallpapers at set intervals'
                        }
                      </p>
                    </div>
                    <Button
                      variant={selectedStatic ? "secondary" : "default"}
                      size="sm"
                      onClick={handleStaticToggle}
                      className="ml-4"
                    >
                      {selectedStatic ? 'Static' : 'Cycling'}
                    </Button>
                  </div>
                </div>

                {/* Preview Info */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Dynamic Wallpapers</h4>
                      <p className="text-sm text-muted-foreground">
                        Beautiful high-resolution images from Unsplash that automatically change 
                        based on your selected interval. Categories include curated collections 
                        for the best visual experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} className="flex-1">
                    Apply Settings
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WallpaperSettings;
