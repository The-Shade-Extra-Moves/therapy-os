import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

// Import all app components
import { PatientManager } from '@/components/apps/PatientManager';
import { SessionNotes } from '@/components/apps/SessionNotes';
import { AIAssistant } from '@/components/apps/AIAssistant';
import { Settings } from '@/components/apps/Settings';
import { Calendar } from '@/components/apps/Calendar';
import { AppStore } from '@/components/apps/AppStore';
import { ReportEditor } from '@/components/apps/ReportEditor';
import { TaskManager } from '@/components/apps/TaskManager';
import { FileExplorer } from '@/components/apps/FileExplorer';
import { ContactManager } from '@/components/apps/ContactManager';
import { MeetingApp } from '@/components/apps/MeetingApp';
import { NotePadPro } from '@/components/apps/note-pad-pro';
import SearchBrowser from '@/components/apps/SearchBrowser';
import AISearchApp from '@/components/apps/AISearchApp';

// Import additional app components
import AIAssistantApp from '@/components/apps/AIAssistantApp';
import AISecretaryApp from '@/components/apps/AISecretaryApp';
import AppBuilderApp from '@/components/apps/AppBuilderApp';
import AITherapistApp from '@/components/apps/AITherapistApp';
import TherapyAppBuilder from '@/components/apps/TherapyAppBuilder';
import DrawingApp from '@/components/apps/DrawingApp';
import ReMotionStore from '@/components/apps/ReMotionStore';
import { VirtualFileSystem } from '@/components/os/VirtualFileSystem';
import { AccessibilityPanel } from '@/components/os/AccessibilityPanel';

const AppComponents = {
  'PatientManager': PatientManager,
  'SessionNotes': SessionNotes,
  'NotePadPro': NotePadPro,
  'SearchBrowser': SearchBrowser,
  'AISearchApp': AISearchApp,
  'ReportEditor': ReportEditor,
  'AIAssistant': AIAssistant,
  'AIAssistantApp': AIAssistantApp,
  'AISecretaryApp': AISecretaryApp,
  'AppBuilderApp': AppBuilderApp,
  'AITherapistApp': AITherapistApp,
  'TherapyAppBuilder': TherapyAppBuilder,
  'Settings': Settings,
  'Calendar': Calendar,
  'AppStore': AppStore,
  'ReMotionStore': ReMotionStore,
  'ContactManager': ContactManager,
  'MeetingApp': MeetingApp,
  'DrawingApp': DrawingApp,
  'TaskManager': TaskManager,
  'FileExplorer': FileExplorer,
  'SystemTaskManager': TaskManager,
  'FileManager': VirtualFileSystem,
  'AccessibilityPanel': AccessibilityPanel,
} as const;

export const PopoutWindow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isReturnRequested, setIsReturnRequested] = useState(false);
  
  const windowId = searchParams.get('windowId');
  const component = searchParams.get('component') as keyof typeof AppComponents;
  const title = searchParams.get('title') || 'App Window';

  const AppComponent = component ? AppComponents[component] : null;

  // Debug logging
  console.log('PopoutWindow Debug:', {
    windowId,
    component,
    title,
    availableComponents: Object.keys(AppComponents),
    AppComponent: !!AppComponent
  });

  const handleReturnToMain = () => {
    setIsReturnRequested(true);
    // Send message to parent window to restore this window
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'RETURN_WINDOW',
        windowId: windowId
      }, '*');
    }
    window.close();
  };

  const handleClose = () => {
    // Send message to parent window that this window is closing
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'CLOSE_EXTERNAL_WINDOW',
        windowId: windowId
      }, '*');
    }
    window.close();
  };

  // Set up communication with parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CLOSE_POPOUT' && event.data.windowId === windowId) {
        window.close();
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent that popout window is ready
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'POPOUT_READY',
        windowId: windowId
      }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [windowId]);

  // Handle window close event
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isReturnRequested && window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'POPOUT_CLOSED',
          windowId: windowId
        }, '*');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [windowId, isReturnRequested]);

  if (!AppComponent || !windowId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Window</h1>
          <p className="mb-4">This popout window is not properly configured.</p>
          <div className="mb-4 text-left bg-gray-800 p-4 rounded max-w-md">
            <p><strong>Window ID:</strong> {windowId || 'Missing'}</p>
            <p><strong>Component:</strong> {component || 'Missing'}</p>
            <p><strong>Component Found:</strong> {AppComponent ? 'Yes' : 'No'}</p>
            <p><strong>Available Components:</strong></p>
            <ul className="list-disc list-inside text-sm max-h-40 overflow-y-auto">
              {Object.keys(AppComponents).map(key => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
          <Button onClick={() => window.close()}>Close Window</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      {/* Popout Window Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h1 className="text-lg font-semibold">{decodeURIComponent(title)}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReturnToMain}
            className="h-8 px-3 hover:bg-blue-500/20 hover:text-blue-400"
            title="Return to Main Window"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
            title="Close Window"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1 overflow-hidden">
        <AppComponent />
      </div>
    </div>
  );
};
