import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'therapist' | 'admin' | 'patient';
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  type: 'app' | 'folder' | 'file';
  component?: string;
  position: { x: number; y: number };
  isSelected: boolean;
}

export interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'notes' | 'system-monitor' | 'patient-reminders' | 'ai-insights';
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, any>;
}

export interface WallpaperSettings {
  type: 'gradient' | 'image' | 'color' | 'live';
  value: string;
  opacity: number;
  effects?: string[];
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto' | 'therapy';
  wallpaper: WallpaperSettings;
  taskbarPosition: 'bottom' | 'top' | 'left' | 'right';
  taskbarSize: 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  animations: boolean;
  transparency: number;
  accentColor?: string;
  fontFamily?: string;
}

export interface VirtualDesktop {
  id: string;
  name: string;
  wallpaper: string;
  isActive: boolean;
  windows: string[];
  widgets: string[];
}

interface OSStore {
  // Authentication
  isLoggedIn: boolean;
  currentUser: User | null;
  
  // Desktop
  desktopIcons: DesktopIcon[];
  widgets: Widget[];
  selectedIcons: string[];
  virtualDesktops: VirtualDesktop[];
  
  // Appearance
  appearance: AppearanceSettings;
  
  // System
  isLoginScreenVisible: boolean;
  isAppStoreOpen: boolean;
  isTaskManagerOpen: boolean;
  isFileExplorerOpen: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  addDesktopIcon: (icon: Omit<DesktopIcon, 'id'>) => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  selectIcon: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  deleteIcon: (id: string) => void;
  
  addWidget: (widget: Omit<Widget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  
  // Virtual Desktops
  addVirtualDesktop: (name?: string) => void;
  removeVirtualDesktop: (id: string) => void;
  switchVirtualDesktop: (id: string) => void;
  renameVirtualDesktop: (id: string, name: string) => void;
  
  toggleAppStore: () => void;
  toggleTaskManager: () => void;
  toggleFileExplorer: () => void;
}

export const useOSStore = create<OSStore>((set, get) => ({
  isLoggedIn: false,
  currentUser: null,
  
  desktopIcons: [
    {
      id: 'patients',
      name: 'Patient Manager',
      icon: 'Users',
      type: 'app',
      component: 'PatientManager',
      position: { x: 50, y: 50 },
      isSelected: false,
    },
    {
      id: 'notes',
      name: 'Session Notes',
      icon: 'FileText',
      type: 'app',
      component: 'SessionNotes',
      position: { x: 50, y: 150 },
      isSelected: false,
    },
    {
      id: 'reports',
      name: 'Report Editor',
      icon: 'Edit',
      type: 'app',
      component: 'ReportEditor',
      position: { x: 50, y: 250 },
      isSelected: false,
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      icon: 'Brain',
      type: 'app',
      component: 'AIAssistant',
      position: { x: 50, y: 350 },
      isSelected: false,
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      icon: 'Brain',
      type: 'app',
      component: 'AIAssistantApp',
      position: { x: 350, y: 50 },
      isSelected: false,
    },
    {
      id: 'ai-secretary',
      name: 'AI Secretary',
      icon: 'Bot',
      type: 'app',
      component: 'AISecretaryApp',
      position: { x: 450, y: 50 },
      isSelected: false,
    },
    {
      id: 'ai-therapist',
      name: 'AI Therapist',
      icon: 'Brain',
      type: 'app',
      component: 'AITherapistApp',
      position: { x: 150, y: 50 },
      isSelected: false,
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: 'Calendar',
      type: 'app',
      component: 'Calendar',
      position: { x: 50, y: 450 },
      isSelected: false,
    },
    {
      id: 'remotion-store',
      name: 'ReMotion Store',
      icon: 'Package',
      type: 'app',
      component: 'ReMotionStore',
      position: { x: 150, y: 50 },
      isSelected: false,
    },
    {
      id: 'file-explorer',
      name: 'File Explorer',
      icon: 'Folder',
      type: 'app',
      component: 'FileExplorer',
      position: { x: 150, y: 150 },
      isSelected: false,
    },
    {
      id: 'task-manager',
      name: 'Task Manager',
      icon: 'Activity',
      type: 'app',
      component: 'TaskManager',
      position: { x: 150, y: 250 },
      isSelected: false,
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: 'Settings',
      type: 'app',
      component: 'Settings',
      position: { x: 150, y: 350 },
      isSelected: false,
    },
    {
      id: 'contact-manager',
      name: 'Contact Manager',
      icon: 'Contact',
      type: 'app',
      component: 'ContactManager',
      position: { x: 250, y: 50 },
      isSelected: false,
    },
    {
      id: 'drawing-studio',
      name: 'Drawing Studio',
      icon: 'Palette',
      type: 'app',
      component: 'DrawingApp',
      position: { x: 300, y: 50 },
      isSelected: false,
    },
    {
      id: 'meeting-app',
      name: 'Meeting Hub',
      icon: 'Video',
      type: 'app',
      component: 'MeetingApp',
      position: { x: 250, y: 150 },
      isSelected: false,
    },
    {
      id: 'app-builder',
      name: 'App Builder',
      icon: 'Code',
      type: 'app',
      component: 'AppBuilderApp',
      position: { x: 350, y: 150 },
      isSelected: false,
    },
    {
      id: 'search-browser',
      name: 'Private Search',
      icon: 'Search',
      type: 'app',
      component: 'SearchBrowser',
      position: { x: 250, y: 250 },
      isSelected: false,
    },
    {
      id: 'ai-search',
      name: 'AI Search',
      icon: 'Bot',
      type: 'app',
      component: 'AISearchApp',
      position: { x: 350, y: 250 },
      isSelected: false,
    },
    {
      id: 'notepad-pro',
      name: 'NotePad Pro',
      icon: 'FileEdit',
      type: 'app',
      component: 'NotePadPro',
      position: { x: 450, y: 250 },
      isSelected: false,
    },
    {
      id: 'therapy-builder',
      name: 'Therapy Builder',
      icon: 'Heart',
      type: 'app',
      component: 'TherapyAppBuilder',
      position: { x: 450, y: 150 },
      isSelected: false,
    },
  ],
  
  widgets: [],
  selectedIcons: [],
  
  virtualDesktops: [
    {
      id: 'desktop-1',
      name: 'Main Desktop',
      wallpaper: 'var(--gradient-desktop)',
      isActive: true,
      windows: [],
      widgets: []
    },
    {
      id: 'desktop-2',
      name: 'Patients',
      wallpaper: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))',
      isActive: false,
      windows: [],
      widgets: []
    }
  ],
  
  appearance: {
    theme: 'light',
    wallpaper: {
      type: 'gradient',
      value: 'var(--gradient-desktop)',
      opacity: 1,
    },
    taskbarPosition: 'bottom',
    taskbarSize: 'medium',
    iconSize: 'medium',
    animations: true,
    transparency: 0.85,
  },
  
  isLoginScreenVisible: true,
  isAppStoreOpen: false,
  isTaskManagerOpen: false,
  isFileExplorerOpen: false,
  
  login: (user) => set({ 
    isLoggedIn: true, 
    currentUser: user, 
    isLoginScreenVisible: false 
  }),
  
  logout: () => set({ 
    isLoggedIn: false, 
    currentUser: null, 
    isLoginScreenVisible: true 
  }),
  
  addDesktopIcon: (iconData) => set((state) => ({
    desktopIcons: [...state.desktopIcons, { ...iconData, id: `icon-${Date.now()}` }]
  })),
  
  updateIconPosition: (id, position) => set((state) => ({
    desktopIcons: state.desktopIcons.map(icon =>
      icon.id === id ? { ...icon, position } : icon
    )
  })),
  
  selectIcon: (id, multiSelect = false) => set((state) => {
    if (!multiSelect) {
      return {
        selectedIcons: [id],
        desktopIcons: state.desktopIcons.map(icon => ({
          ...icon,
          isSelected: icon.id === id
        }))
      };
    }
    
    const isSelected = state.selectedIcons.includes(id);
    const newSelection = isSelected 
      ? state.selectedIcons.filter(iconId => iconId !== id)
      : [...state.selectedIcons, id];
      
    return {
      selectedIcons: newSelection,
      desktopIcons: state.desktopIcons.map(icon => ({
        ...icon,
        isSelected: newSelection.includes(icon.id)
      }))
    };
  }),
  
  clearSelection: () => set((state) => ({
    selectedIcons: [],
    desktopIcons: state.desktopIcons.map(icon => ({ ...icon, isSelected: false }))
  })),
  
  deleteIcon: (id) => set((state) => ({
    desktopIcons: state.desktopIcons.filter(icon => icon.id !== id),
    selectedIcons: state.selectedIcons.filter(iconId => iconId !== id)
  })),
  
  addWidget: (widgetData) => set((state) => ({
    widgets: [...state.widgets, { ...widgetData, id: `widget-${Date.now()}` }]
  })),
  
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map(widget =>
      widget.id === id ? { ...widget, ...updates } : widget
    )
  })),
  
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter(widget => widget.id !== id)
  })),
  
  updateAppearance: (settings) => set((state) => ({
    appearance: { ...state.appearance, ...settings }
  })),
  
  // Virtual Desktop Actions
  addVirtualDesktop: (name) => set((state) => {
    const newDesktop: VirtualDesktop = {
      id: `desktop-${Date.now()}`,
      name: name || `Desktop ${state.virtualDesktops.length + 1}`,
      wallpaper: 'var(--gradient-desktop)',
      isActive: false,
      windows: [],
      widgets: []
    };
    return { virtualDesktops: [...state.virtualDesktops, newDesktop] };
  }),
  
  removeVirtualDesktop: (id) => set((state) => {
    if (state.virtualDesktops.length <= 1) return state;
    
    const remainingDesktops = state.virtualDesktops.filter(d => d.id !== id);
    const wasActive = state.virtualDesktops.find(d => d.id === id)?.isActive;
    
    if (wasActive && remainingDesktops.length > 0) {
      remainingDesktops[0].isActive = true;
    }
    
    return { virtualDesktops: remainingDesktops };
  }),
  
  switchVirtualDesktop: (id) => set((state) => ({
    virtualDesktops: state.virtualDesktops.map(d => ({
      ...d,
      isActive: d.id === id
    }))
  })),
  
  renameVirtualDesktop: (id, name) => set((state) => ({
    virtualDesktops: state.virtualDesktops.map(d =>
      d.id === id ? { ...d, name } : d
    )
  })),
  
  toggleAppStore: () => set((state) => ({ isAppStoreOpen: !state.isAppStoreOpen })),
  toggleTaskManager: () => set((state) => ({ isTaskManagerOpen: !state.isTaskManagerOpen })),
  toggleFileExplorer: () => set((state) => ({ isFileExplorerOpen: !state.isFileExplorerOpen })),
}));