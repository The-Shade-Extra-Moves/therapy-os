import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Check, Monitor } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const VirtualDesktops: React.FC = () => {
  const { 
    appearance, 
    virtualDesktops, 
    addVirtualDesktop, 
    removeVirtualDesktop, 
    switchVirtualDesktop,
    renameVirtualDesktop 
  } = useOSStore();
  
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const handleStartEdit = (desktop: any) => {
    setEditingId(desktop.id);
    setEditName(desktop.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameVirtualDesktop(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditName('');
    }
  };

  if (!appearance.animations) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 glass-surface rounded-lg"
      >
        {virtualDesktops.map((desktop) => (
          <motion.div
            key={desktop.id}
            className={`relative group cursor-pointer`}
            onClick={() => switchVirtualDesktop(desktop.id)}
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
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {editingId === desktop.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-24 h-6 px-2 text-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={handleSaveEdit}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>{desktop.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(desktop);
                    }}
                  >
                    <Edit2 className="w-2 h-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Remove button */}
            {virtualDesktops.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeVirtualDesktop(desktop.id);
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
          onClick={() => addVirtualDesktop()}
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