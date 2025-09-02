import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Monitor, 
  Volume2,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

const settingsCategories = [
  { id: 'profile', icon: User, label: 'Profile', active: true },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security' },
  { id: 'display', icon: Monitor, label: 'Display' },
  { id: 'audio', icon: Volume2, label: 'Audio' },
];

export const Settings: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('profile');
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [volume, setVolume] = React.useState([75]);

  const renderProfileSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 glass-surface">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-medium">Dr. Sarah Thompson</h4>
              <p className="text-sm text-muted-foreground">Licensed Therapist</p>
              <Button variant="outline" size="sm" className="mt-2">
                Change Photo
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">dr.thompson@clinic.com</p>
            </div>
            <div>
              <label className="text-sm font-medium">License Number</label>
              <p className="text-sm text-muted-foreground">LT-12345</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 glass-surface">
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 glass-surface">
        <h3 className="text-lg font-semibold mb-4">Desktop Wallpaper</h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-video bg-gradient-desktop rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition-colors"
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );

  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 glass-surface">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Desktop Notifications</p>
              <p className="text-sm text-muted-foreground">Show notifications for appointments and reminders</p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified 15 minutes before sessions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Insights</p>
              <p className="text-sm text-muted-foreground">Receive AI-generated patient insights</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderAudioSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 glass-surface">
        <h3 className="text-lg font-semibold mb-4">Audio Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">System Volume</label>
            <div className="flex items-center space-x-3 mt-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">{volume[0]}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notification Sounds</p>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile': return renderProfileSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'notifications': return renderNotificationSettings();
      case 'audio': return renderAudioSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="h-full bg-card/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Settings Sidebar */}
        <div className="w-1/3 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your ReMotionOS experience</p>
          </div>
          
          <div className="flex-1 p-2">
            {settingsCategories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors mb-1 ${
                  activeCategory === category.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                <category.icon className="h-5 w-5" />
                <span className="font-medium">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};