import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, User, Bell, Palette, Shield, Monitor, Volume2,
  Moon, Sun, Laptop, Smartphone, Wifi, Key, Lock, Eye, EyeOff,
  Accessibility, Code, HelpCircle, Info, Globe, Zap, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOSStore } from '@/stores/osStore';

const settingsCategories = [
  { id: 'profile', icon: User, label: 'Profile & Account', description: 'Personal information and account settings' },
  { id: 'appearance', icon: Palette, label: 'Appearance', description: 'Themes, wallpapers, and visual customization' },
  { id: 'display', icon: Monitor, label: 'Display & Layout', description: 'Desktop layout, taskbar, and window settings' },
  { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Alert preferences and sound settings' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security', description: 'Data protection and security settings' },
  { id: 'accessibility', icon: Accessibility, label: 'Accessibility', description: 'Accessibility features and accommodations' },
  { id: 'audio', icon: Volume2, label: 'Audio & Sound', description: 'Volume controls and audio preferences' },
  { id: 'network', icon: Wifi, label: 'Network & Connectivity', description: 'Internet and connection settings' },
  { id: 'developer', icon: Code, label: 'Developer Tools', description: 'Advanced settings for developers' },
  { id: 'about', icon: Info, label: 'About & Help', description: 'System information and support' },
];

const themes = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
  { id: 'auto', name: 'Auto', icon: Laptop, description: 'Follows system preference' },
];

const wallpapers = [
  { id: 'gradient-blue', name: 'Ocean Gradient', preview: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { id: 'gradient-purple', name: 'Purple Haze', preview: 'bg-gradient-to-br from-purple-400 to-pink-400' },
  { id: 'gradient-green', name: 'Forest', preview: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: 'gradient-sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { id: 'solid-dark', name: 'Midnight', preview: 'bg-gray-900' },
  { id: 'solid-light', name: 'Cloud', preview: 'bg-gray-100' },
];

export const Settings: React.FC = () => {
  const { appearance, updateAppearance } = useOSStore();
  const [activeCategory, setActiveCategory] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  
  // Local state for various settings
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [fontSize, setFontSize] = useState([16]);
  const [autoLogin, setAutoLogin] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const renderProfileSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-lg">Dr. Sarah Thompson</h4>
              <p className="text-sm text-muted-foreground">Licensed Clinical Psychologist</p>
              <Button variant="outline" size="sm" className="mt-2">
                Change Photo
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Dr. Sarah Thompson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="dr.thompson@clinic.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input id="license" defaultValue="LT-12345-2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select defaultValue="clinical">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical">Clinical Psychology</SelectItem>
                  <SelectItem value="counseling">Counseling Psychology</SelectItem>
                  <SelectItem value="child">Child Psychology</SelectItem>
                  <SelectItem value="neuropsych">Neuropsychology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea 
              id="bio" 
              placeholder="Tell us about your background and expertise..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Theme Selection</CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue={appearance.theme} onValueChange={(value) => updateAppearance({ theme: value as any })}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <div key={theme.id} className="relative">
                  <RadioGroupItem value={theme.id} id={theme.id} className="sr-only" />
                  <Label htmlFor={theme.id} className="cursor-pointer">
                    <Card className="p-4 hover:border-primary transition-colors">
                      <div className="flex items-center space-x-3">
                        <theme.icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-muted-foreground">{theme.description}</div>
                        </div>
                      </div>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desktop Wallpaper</CardTitle>
          <CardDescription>Customize your desktop background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            defaultValue={appearance.wallpaper.type} 
            onValueChange={(value) => updateAppearance({ wallpaper: { ...appearance.wallpaper, type: value as any } })}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {wallpapers.map((wallpaper) => (
                <div key={wallpaper.id} className="relative">
                  <RadioGroupItem value={wallpaper.id} id={wallpaper.id} className="sr-only" />
                  <Label htmlFor={wallpaper.id} className="cursor-pointer">
                    <div className={`aspect-video ${wallpaper.preview} rounded-lg border-2 border-transparent hover:border-primary transition-colors relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{wallpaper.name}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="space-y-3">
            <Label>Wallpaper Opacity</Label>
            <Slider
              value={[appearance.wallpaper.opacity * 100]}
              onValueChange={(value) => updateAppearance({ wallpaper: { ...appearance.wallpaper, opacity: value[0] / 100 } })}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Current: {Math.round(appearance.wallpaper.opacity * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Window Effects</CardTitle>
          <CardDescription>Control transparency and visual effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Window Transparency</Label>
            <Slider
              value={[appearance.transparency * 100]}
              onValueChange={(value) => updateAppearance({ transparency: value[0] / 100 })}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Current: {Math.round(appearance.transparency * 100)}%
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Smooth Animations</Label>
              <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
            </div>
            <Switch
              checked={appearance.animations}
              onCheckedChange={(checked) => updateAppearance({ animations: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDisplaySettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Taskbar Configuration</CardTitle>
          <CardDescription>Customize taskbar appearance and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Taskbar Position</Label>
              <Select defaultValue={appearance.taskbarPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Taskbar Size</Label>
              <Select defaultValue={appearance.taskbarSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-hide Taskbar</Label>
              <p className="text-sm text-muted-foreground">Hide taskbar when not in use</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desktop Icons</CardTitle>
          <CardDescription>Configure desktop icon appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Icon Size</Label>
            <Select defaultValue={appearance.iconSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Desktop Icons</Label>
              <p className="text-sm text-muted-foreground">Display icons on desktop</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Snap to Grid</Label>
              <p className="text-sm text-muted-foreground">Align icons to invisible grid</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">Show popup notifications</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">Play sound with notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via email</p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">App-specific Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📅</div>
                <div>
                  <Label>Session Reminders</Label>
                  <p className="text-sm text-muted-foreground">Upcoming appointments</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <Label>AI Insights</Label>
                  <p className="text-sm text-muted-foreground">AI-generated patient insights</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📝</div>
                <div>
                  <Label>Note Reminders</Label>
                  <p className="text-sm text-muted-foreground">Session notes due</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPrivacySettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Protect your account with advanced security features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={twoFactor ? "default" : "secondary"}>
                {twoFactor ? "Enabled" : "Disabled"}
              </Badge>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatic Login</Label>
              <p className="text-sm text-muted-foreground">Stay logged in on this device</p>
            </div>
            <Switch checked={autoLogin} onCheckedChange={setAutoLogin} />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Change Password</h4>
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="w-fit">Update Password</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy</CardTitle>
          <CardDescription>Control how your data is collected and used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics & Usage Data</Label>
              <p className="text-sm text-muted-foreground">Help improve ReMotionOS</p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Crash Reports</Label>
              <p className="text-sm text-muted-foreground">Automatically send crash reports</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Encryption</Label>
              <p className="text-sm text-muted-foreground">Encrypt local data storage</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Enabled</Badge>
              <Lock className="h-4 w-4 text-green-500" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="destructive" className="w-full">
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAccessibilitySettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Visual Accessibility</CardTitle>
          <CardDescription>Improve readability and visual comfort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Font Size</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Current: {fontSize[0]}px
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">Increase color contrast</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Large Cursor</Label>
              <p className="text-sm text-muted-foreground">Use a larger mouse cursor</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audio Accessibility</CardTitle>
          <CardDescription>Audio assistance and hearing support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Screen Reader Support</Label>
              <p className="text-sm text-muted-foreground">Enable screen reader compatibility</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Audio Descriptions</Label>
              <p className="text-sm text-muted-foreground">Describe visual elements aloud</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Visual Sound Indicators</Label>
              <p className="text-sm text-muted-foreground">Show visual cues for sounds</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAudioSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>System Audio</CardTitle>
          <CardDescription>Control system-wide audio settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Master Volume</Label>
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{volume[0]}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>System Sounds</Label>
              <p className="text-sm text-muted-foreground">Play sounds for system events</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notification Sounds</Label>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Audio Output</h4>
            <div className="space-y-2">
              <Label>Output Device</Label>
              <Select defaultValue="speakers">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speakers">Built-in Speakers</SelectItem>
                  <SelectItem value="headphones">Headphones</SelectItem>
                  <SelectItem value="bluetooth">Bluetooth Device</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Audio Quality</Label>
              <Select defaultValue="high">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Faster)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Recommended)</SelectItem>
                  <SelectItem value="lossless">Lossless (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDeveloperSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Developer Tools</CardTitle>
          <CardDescription>Advanced settings for developers and power users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Debug Mode</Label>
              <p className="text-sm text-muted-foreground">Show detailed system information</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Console Access</Label>
              <p className="text-sm text-muted-foreground">Enable browser developer console</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Performance Monitoring</Label>
              <p className="text-sm text-muted-foreground">Track app performance metrics</p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Custom Scripts</h4>
            <div className="space-y-2">
              <Label>Startup Script</Label>
              <Textarea 
                placeholder="// Enter custom JavaScript to run on startup"
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            <Button variant="outline">
              <Code className="h-4 w-4 mr-2" />
              Test Script
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAboutSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Details about your ReMotionOS installation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">OS Version</Label>
              <p className="text-sm text-muted-foreground">ReMotionOS v1.0.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Build Number</Label>
              <p className="text-sm text-muted-foreground">2024.01.001</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Runtime</Label>
              <p className="text-sm text-muted-foreground">Chrome 120.0.6099.129</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Memory Usage</Label>
              <p className="text-sm text-muted-foreground">4.2 GB / 16 GB</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <HelpCircle className="h-4 w-4 mr-2" />
              Get Help & Support
            </Button>
            <Button variant="outline" className="w-full">
              <Globe className="h-4 w-4 mr-2" />
              Visit Documentation
            </Button>
            <Button variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License & Credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>© 2024 ReMotionOS. All rights reserved.</p>
          <p>Built with React, TypeScript, and Tailwind CSS.</p>
          <p>Licensed under MIT License.</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile': return renderProfileSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'display': return renderDisplaySettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'accessibility': return renderAccessibilitySettings();
      case 'audio': return renderAudioSettings();
      case 'developer': return renderDeveloperSettings();
      case 'about': return renderAboutSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="h-full bg-background">
      <div className="flex h-full">
        {/* Settings Sidebar */}
        <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50 backdrop-blur-sm">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-bold text-foreground">Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your ReMotionOS experience</p>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto">
            {settingsCategories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-start space-x-3 p-3 rounded-xl text-left transition-all duration-200 mb-2 ${
                  activeCategory === category.id 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'hover:bg-muted/50 text-foreground border border-transparent'
                }`}
              >
                <category.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{category.label}</div>
                  <div className="text-xs text-muted-foreground">{category.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};