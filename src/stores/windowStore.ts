import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  component: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
}

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  
  // Actions
  openWindow: (window: Omit<WindowState, 'id' | 'zIndex' | 'isActive'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 1000,

  openWindow: (windowData) => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWindow: WindowState = {
      ...windowData,
      id,
      zIndex: get().nextZIndex,
      isActive: true,
    };

    set((state) => ({
      windows: [...state.windows.map(w => ({ ...w, isActive: false })), newWindow],
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    }));
  },

  closeWindow: (id) => {
    set((state) => {
      const newWindows = state.windows.filter(w => w.id !== id);
      const newActiveId = newWindows.length > 0 ? newWindows[newWindows.length - 1].id : null;
      
      return {
        windows: newWindows.map(w => ({ ...w, isActive: w.id === newActiveId })),
        activeWindowId: newActiveId,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, isMinimized: true, isActive: false } : w
      ),
      activeWindowId: state.windows.find(w => w.id !== id && !w.isMinimized)?.id || null,
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, isMinimized: false, isActive: true } : { ...w, isActive: false }
      ),
      activeWindowId: id,
    }));
  },

  setActiveWindow: (id) => {
    set((state) => {
      const window = state.windows.find(w => w.id === id);
      if (!window || window.isMinimized) return state;

      return {
        windows: state.windows.map(w => ({ ...w, isActive: w.id === id })),
        activeWindowId: id,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, position } : w
      ),
    }));
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, size } : w
      ),
    }));
  },
}));