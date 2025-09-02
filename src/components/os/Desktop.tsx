import React from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { Window } from './Window';
import { Taskbar } from './Taskbar';

// App Components
import { PatientManager } from '@/components/apps/PatientManager';
import { SessionNotes } from '@/components/apps/SessionNotes';
import { AIAssistant } from '@/components/apps/AIAssistant';
import { Settings } from '@/components/apps/Settings';
import { Calendar } from '@/components/apps/Calendar';

const AppComponents = {
  PatientManager,
  SessionNotes,
  AIAssistant,
  Settings,
  Calendar,
};

export const Desktop: React.FC = () => {
  const { windows } = useWindowStore();

  const renderWindow = (window: any) => {
    const AppComponent = AppComponents[window.component as keyof typeof AppComponents];
    
    if (!AppComponent) {
      return <div className="p-4 text-center text-muted-foreground">App not found</div>;
    }

    return (
      <Window key={window.id} window={window}>
        <AppComponent />
      </Window>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-desktop relative">
      {/* Desktop Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-desktop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Desktop Icons Area */}
      <div className="absolute inset-0 p-8 pb-20">
        <motion.div 
          className="grid grid-cols-1 gap-6 w-fit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Desktop shortcuts can be added here */}
        </motion.div>
      </div>

      {/* Windows */}
      <div className="absolute inset-0">
        {windows.map(renderWindow)}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
};