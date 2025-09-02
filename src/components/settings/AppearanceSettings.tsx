import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Image, Monitor, Sun, Moon, Laptop, Sparkles, Layers } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const wallpaperOptions = [
  {
    id: 'gradient-default',
    name: 'Default Gradient',
    type: 'gradient' as const,
    value: 'var(--gradient-desktop)',
    preview: 'linear-gradient(135deg, hsl(220 30% 92%), hsl(220 25% 88%))',
    effects: []
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Breeze',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, hsl(200 70% 85%), hsl(220 60% 75%))',
    preview: 'linear-gradient(135deg, hsl(200 70% 85%), hsl(220 60% 75%))',
    effects: ['blur', 'parallax']
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Calm',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, hsl(340 60% 85%), hsl(30 70% 85%))',
    preview: 'linear-gradient(135deg, hsl(340 60% 85%), hsl(30 70% 85%))',
    effects: ['blur']
  },
  {
    id: 'gradient-forest',
    name: 'Forest Serenity',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, hsl(140 40% 85%), hsl(80 30% 80%))',
    preview: 'linear-gradient(135deg, hsl(140 40% 85%), hsl(80 30% 80%))',
    effects: ['parallax']
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora Dreams',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, hsl(270 70% 85%), hsl(180 60% 80%), hsl(320 70% 85%))',
    preview: 'linear-gradient(135deg, hsl(270 70% 85%), hsl(180 60% 80%), hsl(320 70% 85%))',
    effects: ['blur', 'parallax']
  },
  {
    id: 'gradient-cosmic',
    name: 'Cosmic Therapy',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, hsl(240 80% 15%), hsl(260 70% 25%), hsl(280 60% 35%))',
    preview: 'linear-gradient(135deg, hsl(240 80% 15%), hsl(260 70% 25%), hsl(280 60% 35%))',
    effects: ['blur']
  },
  {
    id: 'color-light',
    name: 'Pure Light',
    type: 'color' as const,
    value: 'hsl(220 25% 95%)',
    preview: 'hsl(220 25% 95%)',
    effects: []
  },
  {
    id: 'color-dark',
    name: 'Deep Space',
    type: 'color' as const,
    value: 'hsl(220 25% 8%)',
    preview: 'hsl(220 25% 8%)',
    effects: []
  },
  {
    id: 'live-particles',
    name: 'Floating Particles',
    type: 'live' as const,
    value: 'particles',
    preview: 'linear-gradient(135deg, hsl(220 30% 92%), hsl(220 25% 88%))',
    effects: ['live']
  }
];

const themeOptions = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { id: 'auto', name: 'Auto', icon: Laptop, description: 'Follows system preference' },
  { id: 'therapy', name: 'Therapy Pro', icon: Monitor, description: 'Optimized for therapy sessions' },
];

const taskbarPositions = [
  { id: 'bottom', name: 'Bottom' },
  { id: 'top', name: 'Top' },
  { id: 'left', name: 'Left' },
  { id: 'right', name: 'Right' },
];

const sizeOptions = [
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' },
];

export const AppearanceSettings: React.FC = () => {
  const { appearance, updateAppearance } = useOSStore();

  const handleWallpaperChange = (wallpaper: typeof wallpaperOptions[0]) => {
    updateAppearance({
      wallpaper: {
        type: wallpaper.type,
        value: wallpaper.value,
        opacity: appearance.wallpaper.opacity,
      }
    });
  };

  const handleTransparencyChange = (value: number[]) => {
    updateAppearance({ transparency: value[0] / 100 });
  };

  const handleOpacityChange = (value: number[]) => {
    updateAppearance({
      wallpaper: {
        ...appearance.wallpaper,
        opacity: value[0] / 100,
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Theme</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={appearance.theme}
            onValueChange={(value) => updateAppearance({ theme: value as any })}
            className="grid grid-cols-3 gap-4"
          >
            {themeOptions.map((theme) => (
              <div key={theme.id} className="space-y-2">
                <RadioGroupItem
                  value={theme.id}
                  id={theme.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={theme.id}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <theme.icon className="mb-2 h-6 w-6" />
                  {theme.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Wallpaper Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Wallpaper</span>
          </CardTitle>
          <CardDescription>
            Customize your desktop background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wallpaperOptions.map((wallpaper) => (
              <motion.div
                key={wallpaper.id}
                className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                  appearance.wallpaper.value === wallpaper.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleWallpaperChange(wallpaper)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="w-full h-24 rounded-lg relative overflow-hidden"
                  style={{ background: wallpaper.preview }}
                >
                  {/* Effect indicators */}
                  {wallpaper.effects && wallpaper.effects.length > 0 && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      {wallpaper.effects.includes('blur') && (
                        <div className="w-4 h-4 bg-primary/80 rounded-full flex items-center justify-center">
                          <Sparkles className="w-2 h-2 text-white" />
                        </div>
                      )}
                      {wallpaper.effects.includes('parallax') && (
                        <div className="w-4 h-4 bg-secondary/80 rounded-full flex items-center justify-center">
                          <Layers className="w-2 h-2 text-white" />
                        </div>
                      )}
                      {wallpaper.effects.includes('live') && (
                        <div className="w-4 h-4 bg-accent/80 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-lg bg-black/0 hover:bg-black/10 transition-colors" />
                <div className="p-2">
                  <p className="text-xs font-medium text-center">{wallpaper.name}</p>
                  {wallpaper.effects && wallpaper.effects.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {wallpaper.effects.join(' • ')}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Wallpaper Opacity</Label>
            <div className="px-3">
              <Slider
                value={[appearance.wallpaper.opacity * 100]}
                onValueChange={handleOpacityChange}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Transparent</span>
              <span>{Math.round(appearance.wallpaper.opacity * 100)}%</span>
              <span>Opaque</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Interface</span>
          </CardTitle>
          <CardDescription>
            Customize the desktop interface elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Taskbar Position */}
          <div className="space-y-3">
            <Label>Taskbar Position</Label>
            <RadioGroup
              value={appearance.taskbarPosition}
              onValueChange={(value) => updateAppearance({ taskbarPosition: value as any })}
              className="grid grid-cols-2 gap-4"
            >
              {taskbarPositions.map((position) => (
                <div key={position.id} className="space-y-2">
                  <RadioGroupItem
                    value={position.id}
                    id={`position-${position.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`position-${position.id}`}
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {position.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Taskbar Size */}
          <div className="space-y-3">
            <Label>Taskbar Size</Label>
            <RadioGroup
              value={appearance.taskbarSize}
              onValueChange={(value) => updateAppearance({ taskbarSize: value as any })}
              className="grid grid-cols-3 gap-4"
            >
              {sizeOptions.map((size) => (
                <div key={size.id} className="space-y-2">
                  <RadioGroupItem
                    value={size.id}
                    id={`taskbar-${size.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`taskbar-${size.id}`}
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {size.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Icon Size */}
          <div className="space-y-3">
            <Label>Icon Size</Label>
            <RadioGroup
              value={appearance.iconSize}
              onValueChange={(value) => updateAppearance({ iconSize: value as any })}
              className="grid grid-cols-3 gap-4"
            >
              {sizeOptions.map((size) => (
                <div key={size.id} className="space-y-2">
                  <RadioGroupItem
                    value={size.id}
                    id={`icon-${size.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`icon-${size.id}`}
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {size.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Transparency */}
          <div className="space-y-2">
            <Label>Window Transparency</Label>
            <div className="px-3">
              <Slider
                value={[appearance.transparency * 100]}
                onValueChange={handleTransparencyChange}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Opaque</span>
              <span>{Math.round(appearance.transparency * 100)}%</span>
              <span>Transparent</span>
            </div>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Smooth transitions and effects
              </p>
            </div>
            <Switch
              checked={appearance.animations}
              onCheckedChange={(checked) => updateAppearance({ animations: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};