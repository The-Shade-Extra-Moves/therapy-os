import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Monitor } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';

interface VirtualDesktop {
  id: string;
  name: string;
  wallpaper: string;
  isActive: boolean;
}

export const VirtualDesktops: React.FC = () => {
  const { appearance } = useOSStore();
  const [desktops, setDesktops] = React.useState<VirtualDesktop[]>([
    {
      id: 'desktop-1',
      name: 'Main Desktop',
      wallpaper: 'var(--gradient-desktop)',
      isActive: true
    },
    {
      id: 'desktop-2',
      name: 'Patients',
      wallpaper: 'linear-gradient(135deg, hsl(200 70% 85%), hsl(220 60% 75%))',
      isActive: false
    }
  ]);

  const addDesktop = () => {
    const newDesktop: VirtualDesktop = {
      id: `desktop-${Date.now()}`,
      name: `Desktop ${desktops.length + 1}`,
      wallpaper: 'var(--gradient-desktop)',
      isActive: false
    };
    setDesktops([...desktops, newDesktop]);
  };

  const removeDesktop = (id: string) => {
    if (desktops.length <= 1) return;
    setDesktops(desktops.filter(d => d.id !== id));
  };

  const switchDesktop = (id: string) => {
    setDesktops(desktops.map(d => ({
      ...d,
      isActive: d.id === id
    })));
  };

  if (!appearance.animations) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 glass-surface rounded-lg"
      >
        {desktops.map((desktop) => (
          <motion.div
            key={desktop.id}
            className={`relative group cursor-pointer`}
            onClick={() => switchDesktop(desktop.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`w-16 h-10 rounded border-2 transition-all ${
                desktop.isActive 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : 'border-muted hover:border-primary/50'
              }`}
              style={{ background: desktop.wallpaper }}
            />
            
            {/* Desktop preview content */}
            <div className="absolute inset-1 rounded-sm overflow-hidden">
              <div className="w-1 h-1 bg-white/60 rounded-full absolute top-1 left-1" />
              <div className="w-1 h-1 bg-white/60 rounded-full absolute top-1 left-3" />
              <div className="w-8 h-1 bg-white/40 rounded-full absolute bottom-1 left-1/2 transform -translate-x-1/2" />
            </div>

            {/* Desktop name tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {desktop.name}
            </div>

            {/* Remove button */}
            {desktops.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDesktop(desktop.id);
                }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-2 h-2" />
              </button>
            )}
          </motion.div>
        ))}

        {/* Add new desktop button */}
        <motion.button
          onClick={addDesktop}
          className="w-16 h-10 border-2 border-dashed border-muted hover:border-primary/50 rounded flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </motion.div>
    </div>
  );
};