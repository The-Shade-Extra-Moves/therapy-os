import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Type, 
  Volume2, 
  MousePointer, 
  Contrast,
  ZoomIn,
  RotateCcw,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useOSStore } from '@/stores/osStore';

export const AccessibilityPanel: React.FC = () => {
  const { appearance, updateAppearance } = useOSStore();

  const accessibilitySettings = [
    {
      id: 'high-contrast',
      label: 'High Contrast Mode',
      description: 'Increase contrast for better visibility',
      icon: Contrast,
      enabled: false
    },
    {
      id: 'large-text',
      label: 'Large Text',
      description: 'Increase text size throughout the interface',
      icon: Type,
      enabled: false
    },
    {
      id: 'screen-reader',
      label: 'Screen Reader Support',
      description: 'Enhanced compatibility with screen readers',
      icon: Volume2,
      enabled: true
    },
    {
      id: 'reduced-motion',
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: MousePointer,
      enabled: false
    },
    {
      id: 'focus-indicators',
      label: 'Enhanced Focus Indicators',
      description: 'More visible keyboard navigation indicators',
      icon: Eye,
      enabled: true
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Accessibility</h2>
          <p className="text-sm text-muted-foreground">
            Customize ReMotionOS for your accessibility needs
          </p>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quick Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => updateAppearance({ iconSize: 'large' })}
          >
            <ZoomIn className="w-5 h-5" />
            <span className="text-sm">Zoom In</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => updateAppearance({ theme: appearance.theme === 'dark' ? 'light' : 'dark' })}
          >
            <Contrast className="w-5 h-5" />
            <span className="text-sm">Toggle Theme</span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Icon Size Control */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Icon Size</Label>
        <div className="space-y-2">
          <Slider
            value={[appearance.iconSize === 'small' ? 0 : appearance.iconSize === 'medium' ? 1 : 2]}
            max={2}
            step={1}
            onValueChange={(value) => {
              const sizes = ['small', 'medium', 'large'] as const;
              updateAppearance({ iconSize: sizes[value[0]] });
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Small</span>
            <span>Medium</span>
            <span>Large</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Accessibility Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Accessibility Features</h3>
        
        {accessibilitySettings.map((setting) => (
          <motion.div
            key={setting.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3">
              <setting.icon className="w-5 h-5 text-primary" />
              <div>
                <Label className="font-medium">{setting.label}</Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
            </div>
            <Switch 
              checked={setting.enabled}
              onCheckedChange={() => {}}
            />
          </motion.div>
        ))}
      </div>

      <Separator />

      {/* Reset Options */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button className="flex-1">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
      </div>
    </div>
  );
};