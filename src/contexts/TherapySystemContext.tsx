import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TherapyContext as VantaTherapyContext } from '@/components/os/VantaBackground';

interface PatientData {
  id: string;
  name: string;
  currentMood: number; // 1-10
  progressStage: 'initial' | 'developing' | 'breakthrough' | 'maintenance' | 'completion';
  primaryConcerns: ('anxiety' | 'depression' | 'trauma' | 'focus')[];
  preferredEnvironments: string[];
}

interface SessionData {
  id: string;
  patientId: string;
  type: 'relaxation' | 'focus' | 'energy' | 'anxiety' | 'depression' | 'trauma';
  startTime: Date;
  duration: number; // minutes
  environment?: string;
  moodBefore?: number;
  moodAfter?: number;
}

interface TherapySystemContextType {
  // Current session
  currentSession: SessionData | null;
  currentPatient: PatientData | null;
  
  // Environment context for Vanta
  therapyContext: VantaTherapyContext;
  
  // Session management
  startSession: (patientId: string, type: VantaTherapyContext['sessionType']) => void;
  endSession: (moodAfter?: number) => void;
  updateMood: (mood: number) => void;
  updateSessionType: (type: VantaTherapyContext['sessionType']) => void;
  
  // Patient management
  setCurrentPatient: (patient: PatientData) => void;
  updatePatientProgress: (stage: VantaTherapyContext['progressStage']) => void;
  
  // Environment preferences
  setPreferredEnvironment: (environment: string) => void;
  getEnvironmentRecommendation: () => string;
  
  // Analytics
  getSessionHistory: () => SessionData[];
  getMoodTrends: () => { date: string; mood: number }[];
}

const TherapySystemContext = createContext<TherapySystemContextType | null>(null);

export const useTherapySystem = () => {
  const context = useContext(TherapySystemContext);
  if (!context) {
    throw new Error('useTherapySystem must be used within a TherapySystemProvider');
  }
  return context;
};

interface TherapySystemProviderProps {
  children: ReactNode;
}

export const TherapySystemProvider: React.FC<TherapySystemProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  
  // Derive therapy context for Vanta background
  const [therapyContext, setTherapyContext] = useState<VantaTherapyContext>({
    sessionType: 'relaxation',
    moodLevel: 5,
    progressStage: 'initial',
    timeOfDay: 'afternoon'
  });

  // Update time of day automatically
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      let timeOfDay: VantaTherapyContext['timeOfDay'];
      
      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      setTherapyContext(prev => ({ ...prev, timeOfDay }));
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update therapy context when patient or session changes
  useEffect(() => {
    if (currentSession && currentPatient) {
      setTherapyContext(prev => ({
        ...prev,
        sessionType: currentSession.type,
        moodLevel: currentSession.moodBefore || currentPatient.currentMood,
        progressStage: currentPatient.progressStage
      }));
    }
  }, [currentSession, currentPatient]);

  const startSession = (patientId: string, type: VantaTherapyContext['sessionType']) => {
    const session: SessionData = {
      id: `session-${Date.now()}`,
      patientId,
      type,
      startTime: new Date(),
      duration: 0,
      moodBefore: currentPatient?.currentMood
    };
    
    setCurrentSession(session);
    setTherapyContext(prev => ({ ...prev, sessionType: type }));
  };

  const endSession = (moodAfter?: number) => {
    if (currentSession) {
      const duration = Math.round((Date.now() - currentSession.startTime.getTime()) / (1000 * 60));
      const completedSession = {
        ...currentSession,
        duration,
        moodAfter
      };
      
      setSessionHistory(prev => [...prev, completedSession]);
      setCurrentSession(null);
      
      // Update patient's current mood if provided
      if (moodAfter && currentPatient) {
        setCurrentPatient({
          ...currentPatient,
          currentMood: moodAfter
        });
      }
    }
  };

  const updateMood = (mood: number) => {
    setTherapyContext(prev => ({ ...prev, moodLevel: mood }));
    
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, moodBefore: mood } : null);
    }
    
    if (currentPatient) {
      setCurrentPatient({ ...currentPatient, currentMood: mood });
    }
  };

  const updateSessionType = (type: VantaTherapyContext['sessionType']) => {
    setTherapyContext(prev => ({ ...prev, sessionType: type }));
    
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, type } : null);
    }
  };

  const updatePatientProgress = (stage: VantaTherapyContext['progressStage']) => {
    setTherapyContext(prev => ({ ...prev, progressStage: stage }));
    
    if (currentPatient) {
      setCurrentPatient({ ...currentPatient, progressStage: stage });
    }
  };

  const setPreferredEnvironment = (environment: string) => {
    if (currentPatient) {
      const updatedEnvironments = [...currentPatient.preferredEnvironments];
      if (!updatedEnvironments.includes(environment)) {
        updatedEnvironments.push(environment);
      }
      
      setCurrentPatient({
        ...currentPatient,
        preferredEnvironments: updatedEnvironments
      });
    }
  };

  const getEnvironmentRecommendation = (): string => {
    if (!currentPatient) return 'relaxation-waves';
    
    const { primaryConcerns, currentMood, progressStage } = currentPatient;
    
    // Base recommendation on primary concerns
    if (primaryConcerns.includes('anxiety')) {
      return currentMood < 4 ? 'anxiety-fog' : 'anxiety-waves-calm';
    } else if (primaryConcerns.includes('depression')) {
      return progressStage === 'initial' ? 'depression-growth' : 'depression-sunrise';
    } else if (primaryConcerns.includes('trauma')) {
      return 'trauma-gentle';
    } else if (primaryConcerns.includes('focus')) {
      return 'focus-net';
    }
    
    // Default based on mood
    if (currentMood < 4) {
      return 'anxiety-fog';
    } else if (currentMood > 7) {
      return 'energy-birds';
    } else {
      return 'relaxation-waves';
    }
  };

  const getSessionHistory = () => sessionHistory;

  const getMoodTrends = () => {
    return sessionHistory
      .filter(session => session.moodBefore !== undefined && session.moodAfter !== undefined)
      .map(session => ({
        date: session.startTime.toISOString().split('T')[0],
        mood: session.moodAfter || session.moodBefore || 5
      }));
  };

  const contextValue: TherapySystemContextType = {
    currentSession,
    currentPatient,
    therapyContext,
    startSession,
    endSession,
    updateMood,
    updateSessionType,
    setCurrentPatient,
    updatePatientProgress,
    setPreferredEnvironment,
    getEnvironmentRecommendation,
    getSessionHistory,
    getMoodTrends
  };

  return (
    <TherapySystemContext.Provider value={contextValue}>
      {children}
    </TherapySystemContext.Provider>
  );
};

// Utility hook for automatically updating Vanta context
export const useVantaTherapyContext = () => {
  const { therapyContext } = useTherapySystem();
  return therapyContext;
};

// Preset patient profiles for demonstration
export const DEMO_PATIENTS: PatientData[] = [
  {
    id: 'patient-1',
    name: 'Alice Johnson',
    currentMood: 4,
    progressStage: 'developing',
    primaryConcerns: ['anxiety', 'focus'],
    preferredEnvironments: ['anxiety-fog', 'focus-net']
  },
  {
    id: 'patient-2',
    name: 'Michael Chen',
    currentMood: 3,
    progressStage: 'initial',
    primaryConcerns: ['depression'],
    preferredEnvironments: ['depression-growth']
  },
  {
    id: 'patient-3',
    name: 'Sarah Williams',
    currentMood: 7,
    progressStage: 'maintenance',
    primaryConcerns: ['trauma'],
    preferredEnvironments: ['trauma-gentle', 'relaxation-waves']
  },
  {
    id: 'patient-4',
    name: 'David Rodriguez',
    currentMood: 6,
    progressStage: 'breakthrough',
    primaryConcerns: ['focus', 'anxiety'],
    preferredEnvironments: ['focus-net', 'relaxation-waves']
  }
];

export default TherapySystemContext;
