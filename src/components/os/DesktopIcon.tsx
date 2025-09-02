import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Brain, Calendar, Settings, Package, 
  Folder, Activity, Monitor, Trash2 
} from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useOSStore, DesktopIcon as DesktopIconType } from '@/stores/osStore';
import { useWindowStore } from '@/stores/windowStore';

const iconMap = {
  Users,
  FileText, 
  Brain,
  Calendar,
  Settings,
  Package,
  Folder,
  Activity,
  Monitor,
  Trash2,
};

interface DesktopIconProps {
  icon: DesktopIconType;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ icon }) => {
  const { updateIconPosition, selectIcon, clearSelection, appearance } = useOSStore();
  const { openWindow } = useWindowStore();
  
  const IconComponent = iconMap[icon.icon as keyof typeof iconMap] || Package;

  const handleDragStop = (e: any, d: any) => {
    updateIconPosition(icon.id, { x: d.x, y: d.y });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectIcon(icon.id, isMultiSelect);
  };

  const handleDoubleClick = () => {
    if (icon.component) {
      openWindow({
        title: icon.name,
        component: icon.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100, y: 100 },
        size: { width: 800, height: 600 },
      });
    }
  };

  const iconSizes = {
    small: 48,
    medium: 64,
    large: 80
  };
  const iconSize = iconSizes[appearance.iconSize];

  return (
    <Rnd
      size={{ width: iconSize + 32, height: iconSize + 48 }}
      position={icon.position}
      onDragStop={handleDragStop}
      enableResizing={false}
      bounds="parent"
      dragHandleClassName="desktop-icon-drag"
    >
      <motion.div
        className={`desktop-icon-drag cursor-pointer select-none flex flex-col items-center justify-center w-full h-full p-2 rounded-lg transition-all duration-200 ${
          icon.isSelected 
            ? 'bg-primary/20 ring-2 ring-primary/50' 
            : 'hover:bg-white/10'
        }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        whileHover={appearance.animations ? { scale: 1.05 } : {}}
        whileTap={appearance.animations ? { scale: 0.95 } : {}}
        initial={appearance.animations ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: appearance.animations ? 0.2 : 0 }}
      >
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 mb-2">
          <IconComponent 
            size={iconSize * 0.5} 
            className="text-foreground drop-shadow-sm"
          />
        </div>
        
        <span className="text-xs font-medium text-foreground text-center leading-tight max-w-full break-words px-1 drop-shadow-sm">
          {icon.name}
        </span>
      </motion.div>
    </Rnd>
  );
};