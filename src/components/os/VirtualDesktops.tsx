import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Monitor, 
  Edit3, 
  Check, 
  Palette,
  Grid3X3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOSStore } from '@/stores/osStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const VirtualDesktops: React.FC = () => {
  const { 
    virtualDesktops, 
    addVirtualDesktop, 
    removeVirtualDesktop, 
    switchVirtualDesktop, 
    renameVirtualDesktop,
    updateAppearance 
  } = useOSStore();
  
  const [editingDesktop, setEditingDesktop] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);

  const activeDesktop = virtualDesktops.find(d => d.isActive);

  const handleAddDesktop = () => {
    const desktopNumber = virtualDesktops.length + 1;
    addVirtualDesktop(`Desktop ${desktopNumber}`);
  };

  const handleRemoveDesktop = (id: string) => {
    if (virtualDesktops.length > 1) {
      removeVirtualDesktop(id);
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setEditingDesktop(id);
    setNewName(currentName);
  };

  const confirmRename = (id: string) => {
    if (newName.trim()) {
      renameVirtualDesktop(id, newName.trim());
    }
    setEditingDesktop(null);
    setNewName('');
  };

  const cancelRename = () => {
    setEditingDesktop(null);
    setNewName('');
  };

  const wallpaperOptions = [
    { name: 'Default', value: 'var(--gradient-desktop)' },
    { name: 'Blue Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Purple Dream', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { name: 'Dark Mode', value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' }
  ];

  const updateDesktopWallpaper = (desktopId: string, wallpaper: string) => {
    // Update the specific desktop's wallpaper
    const updatedDesktops = virtualDesktops.map(d => 
      d.id === desktopId ? { ...d, wallpaper } : d
    );
    
    // If it's the active desktop, also update the global appearance
    if (virtualDesktops.find(d => d.id === desktopId)?.isActive) {
      updateAppearance({
        wallpaper: {
          type: 'gradient',
          value: wallpaper,
          opacity: 1
        }
      });
    }
  };

  return (
    <motion.div
      className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 z-30`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="glass-surface rounded-xl border border-border/20 shadow-xl">
        <div className="flex items-center">
          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 px-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 px-2"
              >
                {/* Virtual Desktop Indicators */}
                {virtualDesktops.map((desktop) => (
                  <motion.div
                    key={desktop.id}
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`
                        w-16 h-10 rounded-lg border-2 cursor-pointer transition-all
                        ${desktop.isActive 
                          ? 'border-primary bg-primary/20' 
                          : 'border-border/30 bg-muted/20 hover:border-primary/50'
                        }
                      `}
                      style={{ 
                        background: desktop.isActive 
                          ? `linear-gradient(135deg, ${desktop.wallpaper.replace('var(--gradient-desktop)', 'hsl(var(--primary) / 0.2)')}, transparent)`
                          : undefined
                      }}
                      onClick={() => switchVirtualDesktop(desktop.id)}
                    >
                      <div className="absolute inset-0 rounded-lg p-1">
                        <div className="w-full h-full rounded bg-card/20 flex items-center justify-center">
                          <Monitor className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Desktop Name */}
                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                      {editingDesktop === desktop.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') confirmRename(desktop.id);
                              if (e.key === 'Escape') cancelRename();
                            }}
                            className="h-6 text-xs w-16"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => confirmRename(desktop.id)}
                          >
                            <Check className="h-2 w-2" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className="text-xs text-muted-foreground truncate block cursor-pointer hover:text-foreground"
                          onClick={() => handleRename(desktop.id, desktop.name)}
                        >
                          {desktop.name}
                        </span>
                      )}
                    </div>

                    {/* Desktop Controls (on hover) */}
                    <div className="absolute -top-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-center gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Palette className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2" side="top">
                            <div className="grid grid-cols-2 gap-2">
                              {wallpaperOptions.map((option) => (
                                <Button
                                  key={option.name}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 p-2 text-xs"
                                  style={{ background: option.value }}
                                  onClick={() => updateDesktopWallpaper(desktop.id, option.value)}
                                >
                                  {option.name}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRename(desktop.id, desktop.name)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>

                        {virtualDesktops.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:text-destructive"
                            onClick={() => handleRemoveDesktop(desktop.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Desktop Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-16 h-10 border-2 border-dashed border-border/50 hover:border-primary/50"
                    onClick={handleAddDesktop}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 px-2"
              >
                {/* Current Desktop Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Monitor className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{activeDesktop?.name}</span>
                  <div className="flex items-center gap-1">
                    {virtualDesktops.map((desktop, index) => (
                      <div
                        key={desktop.id}
                        className={`w-2 h-2 rounded-full ${
                          desktop.isActive ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};