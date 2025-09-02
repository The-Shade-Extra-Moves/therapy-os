import React from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Wifi, 
  Battery, 
  Bell, 
  Settings,
  User,
  ChevronUp,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useOSStore } from '@/stores/osStore';

export const SystemTray: React.FC = () => {
  const { currentUser, appearance, updateAppearance } = useOSStore();
  const [volume, setVolume] = React.useState(75);
  const [isMuted, setIsMuted] = React.useState(false);
  const [batteryLevel, setBatteryLevel] = React.useState(85);
  const [notifications, setNotifications] = React.useState(3);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = React.useState(false);

  const time = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  const date = new Date().toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  const toggleTheme = () => {
    const newTheme = appearance.theme === 'light' ? 'dark' : 'light';
    updateAppearance({ theme: newTheme });
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-2 px-3">
      {/* System Status Icons */}
      <div className="flex items-center gap-1">
        {/* Volume */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted/20"
          onClick={handleVolumeToggle}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {/* WiFi */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted/20"
        >
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Battery */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted/20"
        >
          <div className="relative">
            <Battery className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 text-xs font-mono text-muted-foreground">
              {batteryLevel}
            </span>
          </div>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Notifications */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-muted/20 relative"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {notifications > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
          >
            {notifications}
          </Badge>
        )}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Quick Settings */}
      <Popover open={isQuickSettingsOpen} onOpenChange={setIsQuickSettingsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 hover:bg-muted/20"
          >
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 glass-surface" 
          side="top" 
          align="end"
          sideOffset={8}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Quick Settings</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-16 flex-col gap-2 btn-glass"
                  onClick={toggleTheme}
                >
                  {appearance.theme === 'light' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="text-xs">
                    {appearance.theme === 'light' ? 'Light' : 'Dark'}
                  </span>
                </Button>

                {/* Display */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-16 flex-col gap-2 btn-glass"
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">Display</span>
                </Button>
              </div>

              <Separator />

              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Volume</span>
                  <span className="text-xs text-muted-foreground">{volume}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-200"
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>

              {/* Battery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Battery</span>
                  <span className="text-xs text-muted-foreground">{batteryLevel}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent-green h-2 rounded-full transition-all duration-200"
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* User Profile */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 hover:bg-muted/20"
          >
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <User className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {currentUser?.name || 'Guest'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-4 glass-surface" 
          side="top" 
          align="end"
          sideOffset={8}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{currentUser?.name || 'Guest User'}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.email || 'guest@example.com'}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Sign Out
              </Button>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Date & Time */}
      <div className="text-right">
        <div className="text-sm font-mono font-medium">{time}</div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
    </div>
  );
};