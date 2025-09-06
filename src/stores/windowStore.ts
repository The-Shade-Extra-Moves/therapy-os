import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  component: string;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
  isPoppedOut: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  previousPosition?: { x: number; y: number };
  previousSize?: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
}

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  externalWindows: Map<string, Window>;
  
  // Actions
  openWindow: (window: Omit<WindowState, 'id' | 'zIndex' | 'isActive'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  toggleFullScreen: (id: string) => void;
  popOutWindow: (id: string) => void;
  popInWindow: (id: string, externalWindow: Window) => void;
  restoreWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  getFullScreenWindow: () => WindowState | null;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 1000,
  externalWindows: new Map(),

  openWindow: (windowData) => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWindow: WindowState = {
      ...windowData,
      id,
      zIndex: get().nextZIndex,
      isActive: true,
      isFullScreen: false,
      isPoppedOut: false,
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
    set((state) => {
      const windowToMinimize = state.windows.find(w => w.id === id);
      if (!windowToMinimize) return state;
      
      // Find the next highest z-index window to make active
      const otherWindows = state.windows
        .filter(w => w.id !== id && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);
      
      const newActiveId = otherWindows.length > 0 ? otherWindows[0].id : null;
      
      return {
        windows: state.windows.map(w => {
          if (w.id === id) {
            return { ...w, isMinimized: true, isActive: false };
          } else if (w.id === newActiveId) {
            return { ...w, isActive: true };
          } else {
            return { ...w, isActive: false };
          }
        }),
        activeWindowId: newActiveId,
      };
    });
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w => {
        if (w.id === id) {
          if (w.isMaximized) {
            // Restore to previous size/position
            return { 
              ...w, 
              isMaximized: false, 
              isFullScreen: false,
              position: w.previousPosition || w.position,
              size: w.previousSize || w.size
            };
          } else {
            // Maximize - save current position/size
            return { 
              ...w, 
              isMaximized: true, 
              isFullScreen: false,
              previousPosition: w.position,
              previousSize: w.size
            };
          }
        }
        return w;
      }),
    }));
  },

  toggleFullScreen: (id) => {
    set((state) => {
      const window = state.windows.find(w => w.id === id);
      if (!window) return state;

      // Exit full screen for all other windows first
      const updatedWindows = state.windows.map(w => {
        if (w.id === id) {
          if (w.isFullScreen) {
            // Exit full screen - restore to previous state
            return { 
              ...w, 
              isFullScreen: false, 
              isMaximized: false, 
              isMinimized: false, 
              isActive: true,
              position: w.previousPosition || w.position,
              size: w.previousSize || w.size
            };
          } else {
            // Enter full screen - save current position/size
            return { 
              ...w, 
              isFullScreen: true, 
              isMaximized: false, 
              isMinimized: false, 
              isActive: true,
              previousPosition: w.isMaximized ? w.previousPosition : w.position,
              previousSize: w.isMaximized ? w.previousSize : w.size
            };
          }
        }
        return { ...w, isFullScreen: false, isActive: false };
      });

      return {
        windows: updatedWindows,
        activeWindowId: id,
      };
    });
  },

  restoreWindow: (id) => {
    set((state) => {
      const windowToRestore = state.windows.find(w => w.id === id);
      if (!windowToRestore) return state;
      
      // Give it the highest z-index when restoring
      const newZIndex = state.nextZIndex;
      
      return {
        windows: state.windows.map(w => 
          w.id === id 
            ? { ...w, isMinimized: false, isActive: true, zIndex: newZIndex }
            : { ...w, isActive: false }
        ),
        activeWindowId: id,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  setActiveWindow: (id) => {
    set((state) => {
      const window = state.windows.find(w => w.id === id);
      if (!window || window.isMinimized) return state;

      return {
        windows: state.windows.map(w => ({ ...w, isActive: w.id === id })),
        activeWindowId: id,
      };
    });
  },

  bringToFront: (id) => {
    set((state) => {
      const window = state.windows.find(w => w.id === id);
      if (!window) return state;

      const newZIndex = state.nextZIndex;
      
      return {
        windows: state.windows.map(w => 
          w.id === id 
            ? { ...w, zIndex: newZIndex, isActive: true, isMinimized: false }
            : { ...w, isActive: false }
        ),
        activeWindowId: id,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
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

  getFullScreenWindow: () => {
    return get().windows.find(w => w.isFullScreen) || null;
  },

  popOutWindow: (id) => {
    const state = get();
    const windowData = state.windows.find(w => w.id === id);
    if (!windowData) return;

    // Create new browser window
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const popoutUrl = `${currentOrigin}/popout?windowId=${id}&component=${windowData.component}&title=${encodeURIComponent(windowData.title)}`;
    
    const externalWindow = globalThis.window?.open(
      popoutUrl,
      `popout-${id}`,
      `width=1200,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no,left=100,top=100`
    );

    if (externalWindow) {
      // Store reference to external window
      state.externalWindows.set(id, externalWindow);
      
      // Hide from main OS but keep data for restoration
      set((state) => ({
        windows: state.windows.map(w => 
          w.id === id ? { ...w, isMinimized: true, isPoppedOut: true } : w
        ),
      }));

      // Focus the new window
      externalWindow.focus();

      // Listen for external window close
      const checkClosed = setInterval(() => {
        if (externalWindow.closed) {
          clearInterval(checkClosed);
          // Restore window if it was closed without explicit return
          set((state) => ({
            windows: state.windows.map(w => 
              w.id === id ? { ...w, isMinimized: false, isActive: true, isPoppedOut: false } : { ...w, isActive: false }
            ),
            activeWindowId: id,
          }));
          state.externalWindows.delete(id);
        }
      }, 1000);
    }
  },

  popInWindow: (id, externalWindow) => {
    const state = get();
    state.externalWindows.delete(id);
    
    // Restore window to main OS
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id 
          ? { ...w, isMinimized: false, isActive: true, isPoppedOut: false }
          : { ...w, isActive: false }
      ),
      activeWindowId: id,
    }));

    // Close external window if still open
    if (!externalWindow.closed) {
      externalWindow.close();
    }
  },
}));