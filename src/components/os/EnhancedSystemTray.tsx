import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Battery, 
  Bluetooth,
  Monitor,
  Sun,
  Moon,
  Settings,
  User,
  Bell,
  Power,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useOSStore } from '@/stores/osStore';

interface SystemTrayProps {
  onOpenNotifications?: () => void;
}

export const EnhancedSystemTray: React.FC<SystemTrayProps> = ({ onOpenNotifications }) => {
  const { appearance, updateAppearance, currentUser, logout } = useOSStore();
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isWifiEnabled, setIsWifiEnabled] = useState(true);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const currentDate = new Date().toLocaleDateString([], { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  });

  const toggleTheme = () => {
    updateAppearance({ 
      theme: appearance.theme === 'dark' ? 'light' : 'dark' 
    });
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-secondary';
    if (batteryLevel > 20) return 'text-accent';
    return 'text-destructive';
  };

  const getWifiStrength = () => {
    return Math.floor(Math.random() * 4) + 1; // Simulate wifi strength
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Actions */}
      <div className="hidden md:flex items-center gap-1">
        {/* Volume Control */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-glass-surface/50"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Volume</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-6 w-6 p-0"
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
              </div>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  setIsMuted(value[0] === 0);
                }}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {isMuted ? 'Muted' : `${volume}%`}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* WiFi Status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-glass-surface/50"
            >
              {isWifiEnabled ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wi-Fi</span>
                <Switch
                  checked={isWifiEnabled}
                  onCheckedChange={setIsWifiEnabled}
                />
              </div>
              {isWifiEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-md bg-primary/10">
                      <div>
                        <div className="text-sm font-medium">ReMotionOS-Network</div>
                        <div className="text-xs text-muted-foreground">Connected</div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1 h-3 mx-px rounded-full ${
                              i < getWifiStrength() ? 'bg-primary' : 'bg-muted'
                            }`}
                            style={{ height: `${(i + 1) * 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Bluetooth */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsBluetoothEnabled(!isBluetoothEnabled)}
          className="h-8 w-8 p-0 hover:bg-glass-surface/50"
        >
          <Bluetooth className={`w-4 h-4 ${isBluetoothEnabled ? '' : 'text-muted-foreground'}`} />
        </Button>
      </div>

      {/* Separator */}
      <Separator orientation="vertical" className="h-6" />

      {/* System Controls */}
      <div className="flex items-center gap-1">
        {/* Brightness Control */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-glass-surface/50"
            >
              {appearance.theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Brightness</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="h-6 w-6 p-0"
                >
                  {appearance.theme === 'dark' ? (
                    <Sun className="w-3 h-3" />
                  ) : (
                    <Moon className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <Slider
                value={[brightness]}
                max={100}
                step={1}
                onValueChange={(value) => setBrightness(value[0])}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {brightness}%
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="w-full"
              >
                Switch to {appearance.theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Battery Status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-glass-surface/50"
            >
              <div className="relative">
                <Battery className={`w-4 h-4 ${getBatteryColor()}`} />
                <div 
                  className={`absolute top-0.5 left-0.5 h-2 bg-current rounded-sm ${getBatteryColor()}`}
                  style={{ width: `${(batteryLevel / 100) * 10}px` }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Battery</span>
                <span className={`text-sm font-mono ${getBatteryColor()}`}>
                  {batteryLevel}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    batteryLevel > 50 ? 'bg-secondary' : 
                    batteryLevel > 20 ? 'bg-accent' : 'bg-destructive'
                  }`}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {batteryLevel > 95 ? 'Fully Charged' :
                 batteryLevel > 20 ? 'Battery Good' : 'Low Battery'}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Separator */}
      <Separator orientation="vertical" className="h-6" />

      {/* Notifications */}
      {onOpenNotifications && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onOpenNotifications}
          className="h-8 w-8 p-0 hover:bg-glass-surface/50 relative"
        >
          <Bell className="w-4 h-4" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        </Button>
      )}

      {/* Date & Time */}
      <div className="text-sm text-right select-none">
        <div className="font-medium leading-tight">{currentTime}</div>
        <div className="text-xs text-muted-foreground leading-tight">{currentDate}</div>
      </div>

      {/* User Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-glass-surface/50"
          >
            <User className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{currentUser?.name || 'Therapist'}</div>
                <div className="text-xs text-muted-foreground">{currentUser?.email || 'therapist@remotionos.com'}</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Preferences
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Monitor className="w-4 h-4 mr-2" />
                Display Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
            </div>
            
            <Separator />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <Power className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};