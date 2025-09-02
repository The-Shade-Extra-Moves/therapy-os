import React from 'react';
import {
  ContextMenu as ContextMenuPrimitive,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  FolderPlus, 
  Settings, 
  Palette, 
  RefreshCw, 
  Monitor, 
  Grid, 
  Image,
  Plus,
  FileText,
  Users
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { useWindowStore } from '@/stores/windowStore';

interface DesktopContextMenuProps {
  children: React.ReactNode;
  onNewFolder?: () => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ 
  children, 
  onNewFolder 
}) => {
  const { addDesktopIcon, updateAppearance, appearance } = useOSStore();
  const { openWindow } = useWindowStore();

  const handleNewFolder = () => {
    if (onNewFolder) {
      onNewFolder();
    } else {
      addDesktopIcon({
        name: 'New Folder',
        icon: 'Folder',
        type: 'folder',
        position: { x: 100, y: 100 },
        isSelected: false,
      });
    }
  };

  const handleOpenSettings = () => {
    openWindow({
      title: 'Settings',
      component: 'Settings',
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 100 },
      size: { width: 800, height: 600 },
    });
  };

  const wallpaperOptions = [
    {
      name: 'Ocean Breeze',
      value: 'linear-gradient(135deg, hsl(200 70% 85%), hsl(220 60% 75%))',
    },
    {
      name: 'Sunset Calm',
      value: 'linear-gradient(135deg, hsl(340 60% 85%), hsl(30 70% 85%))',
    },
    {
      name: 'Forest Serenity',
      value: 'linear-gradient(135deg, hsl(140 40% 85%), hsl(80 30% 80%))',
    },
  ];

  const handleWallpaperChange = (wallpaper: typeof wallpaperOptions[0]) => {
    updateAppearance({
      wallpaper: {
        type: 'gradient',
        value: wallpaper.value,
        opacity: appearance.wallpaper.opacity,
      }
    });
  };

  return (
    <ContextMenuPrimitive>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 glass-surface">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 glass-surface">
            <ContextMenuItem onClick={handleNewFolder} className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              Folder
            </ContextMenuItem>
            <ContextMenuItem className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Text Document
            </ContextMenuItem>
            <ContextMenuItem className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Patient File
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Wallpaper
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 glass-surface">
            {wallpaperOptions.map((wallpaper) => (
              <ContextMenuItem 
                key={wallpaper.name}
                onClick={() => handleWallpaperChange(wallpaper)}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ background: wallpaper.value }}
                />
                {wallpaper.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem className="flex items-center gap-2">
          <Grid className="w-4 h-4" />
          Arrange Icons
        </ContextMenuItem>

        <ContextMenuItem className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Desktop
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleOpenSettings} className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Desktop Settings
        </ContextMenuItem>

        <ContextMenuItem className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Personalize
        </ContextMenuItem>

        <ContextMenuItem className="flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Display Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuPrimitive>
  );
};