import { useEffect } from 'react';
import { useOSStore } from '@/stores/osStore';

export const useTheme = () => {
  const { appearance } = useOSStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme class
    if (appearance.theme === 'dark') {
      root.classList.add('dark');
    } else if (appearance.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme - detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply wallpaper CSS variables for dynamic backgrounds
    if (appearance.wallpaper.type === 'gradient') {
      root.style.setProperty('--current-wallpaper', appearance.wallpaper.value);
    } else if (appearance.wallpaper.type === 'color') {
      root.style.setProperty('--current-wallpaper', appearance.wallpaper.value);
    }

    // Apply animations preference
    if (!appearance.animations) {
      root.style.setProperty('--duration-fast', '0s');
      root.style.setProperty('--duration-normal', '0s');
      root.style.setProperty('--duration-slow', '0s');
    } else {
      root.style.setProperty('--duration-fast', '0.15s');
      root.style.setProperty('--duration-normal', '0.3s');
      root.style.setProperty('--duration-slow', '0.5s');
    }
  }, [appearance]);

  return { theme: appearance.theme };
};