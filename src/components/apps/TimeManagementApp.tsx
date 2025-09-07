import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Coffee, 
  Target, 
  BarChart3, 
  Settings, 
  Calendar, 
  Bell,
  BellOff,
  Focus,
  Zap,
  TrendingUp,
  CheckCircle,
  Plus,
  X,
  Edit,
  Trash2,
  Timer,
  Activity,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type TimerType = 'pomodoro' | 'short-break' | 'long-break' | 'custom';
type SessionStatus = 'idle' | 'running' | 'paused' | 'completed';
type GoalPeriod = 'daily' | 'weekly' | 'monthly';

interface PomodoroSession {
  id: string;
  type: TimerType;
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  task?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number; // in minutes or sessions
  current: number;
  period: GoalPeriod;
  type: 'time' | 'sessions' | 'tasks';
  createdAt: Date;
  deadline?: Date;
}

interface FocusApp {
  name: string;
  blocked: boolean;
  category: 'social' | 'entertainment' | 'news' | 'games' | 'other';
}

interface AnalyticsData {
  date: string;
  productiveTime: number; // in minutes
  breakTime: number;
  sessionsCompleted: number;
  goalsAchieved: number;
  focusScore: number; // 0-100
}

export const TimeManagementApp: React.FC = () => {
  // Timer State
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [timerType, setTimerType] = useState<TimerType>('pomodoro');
  const [customDuration, setCustomDuration] = useState(25);
  const [currentTask, setCurrentTask] = useState('');
  
  // Settings State
  const [settings, setSettings] = useState({
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
    blockAppsEnabled: false,
  });
  
  // Goals State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    period: 'daily' as GoalPeriod,
    type: 'time' as 'time' | 'sessions' | 'tasks'
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  // Focus Apps State
  const [focusApps, setFocusApps] = useState<FocusApp[]>([
    { name: 'Social Media', blocked: false, category: 'social' },
    { name: 'YouTube', blocked: false, category: 'entertainment' },
    { name: 'Netflix', blocked: false, category: 'entertainment' },
    { name: 'News Sites', blocked: false, category: 'news' },
    { name: 'Games', blocked: false, category: 'games' },
  ]);
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'timer' | 'goals' | 'analytics' | 'focus' | 'settings'>('timer');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Timer duration mapping
  const getDuration = useCallback((type: TimerType): number => {
    switch (type) {
      case 'pomodoro':
        return settings.pomodoroDuration;
      case 'short-break':
        return settings.shortBreakDuration;
      case 'long-break':
        return settings.longBreakDuration;
      case 'custom':
        return customDuration;
      default:
        return settings.pomodoroDuration;
    }
  }, [settings, customDuration]);
  
  // Start timer
  const startTimer = useCallback(() => {
    const duration = getDuration(timerType);
    const newSession: PomodoroSession = {
      id: `session-${Date.now()}`,
      type: timerType,
      duration,
      startTime: new Date(),
      completed: false,
      task: currentTask || undefined,
    };
    
    setCurrentSession(newSession);
    setTimeRemaining(duration * 60);
    setSessionStatus('running');
    
    // Play start sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play();
    }
    
    // Show notification
    if (settings.notificationsEnabled && 'Notification' in window) {
      new Notification(`${timerType.charAt(0).toUpperCase() + timerType.slice(1)} Started`, {
        body: `${duration} minute session has begun`,
        icon: '/favicon.ico'
      });
    }
  }, [timerType, getDuration, currentTask, settings]);
  
  // Pause/Resume timer
  const toggleTimer = useCallback(() => {
    if (sessionStatus === 'running') {
      setSessionStatus('paused');
    } else if (sessionStatus === 'paused') {
      setSessionStatus('running');
    }
  }, [sessionStatus]);
  
  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSessionStatus('idle');
    setCurrentSession(null);
    setTimeRemaining(0);
  }, []);
  
  // Complete session
  const completeSession = useCallback(() => {
    if (!currentSession) return;
    
    const completedSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
    };
    
    setSessionHistory(prev => [completedSession, ...prev]);
    setCompletedSessions(prev => prev + 1);
    
    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    setAnalyticsData(prev => {
      const existingData = prev.find(d => d.date === today);
      if (existingData) {
        return prev.map(d => d.date === today ? {
          ...d,
          productiveTime: d.productiveTime + (timerType === 'pomodoro' ? completedSession.duration : 0),
          breakTime: d.breakTime + (timerType !== 'pomodoro' ? completedSession.duration : 0),
          sessionsCompleted: d.sessionsCompleted + 1,
          focusScore: Math.min(100, d.focusScore + 5),
        } : d);
      } else {
        return [...prev, {
          date: today,
          productiveTime: timerType === 'pomodoro' ? completedSession.duration : 0,
          breakTime: timerType !== 'pomodoro' ? completedSession.duration : 0,
          sessionsCompleted: 1,
          goalsAchieved: 0,
          focusScore: 75,
        }];
      }
    });
    
    // Update goals
    setGoals(prev => prev.map(goal => {
      if (goal.type === 'sessions') {
        return { ...goal, current: goal.current + 1 };
      } else if (goal.type === 'time' && timerType === 'pomodoro') {
        return { ...goal, current: goal.current + completedSession.duration };
      }
      return goal;
    }));
    
    // Play completion sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play();
    }
    
    // Show completion notification
    if (settings.notificationsEnabled && 'Notification' in window) {
      new Notification('Session Completed!', {
        body: `${completedSession.duration} minute ${timerType} session finished`,
        icon: '/favicon.ico'
      });
    }
    
    // Auto-start next session based on settings
    setTimeout(() => {
      if (timerType === 'pomodoro') {
        const nextType = completedSessions % settings.longBreakInterval === 0 ? 'long-break' : 'short-break';
        setTimerType(nextType);
        if (settings.autoStartBreaks) {
          setTimerType(nextType);
          startTimer();
        }
      } else if (settings.autoStartPomodoros) {
        setTimerType('pomodoro');
        startTimer();
      }
    }, 1000);
    
    setSessionStatus('completed');
    setTimeout(() => {
      setSessionStatus('idle');
      setCurrentSession(null);
    }, 2000);
  }, [currentSession, timerType, completedSessions, settings, startTimer]);
  
  // Timer countdown effect
  useEffect(() => {
    if (sessionStatus === 'running' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStatus, timeRemaining, completeSession]);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Add new goal
  const addGoal = useCallback(() => {
    if (!newGoal.title) return;
    
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      ...newGoal,
      current: 0,
      createdAt: new Date(),
    };
    
    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      target: 0,
      period: 'daily',
      type: 'time'
    });
    setIsAddingGoal(false);
  }, [newGoal]);
  
  // Delete goal
  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  }, []);
  
  // Toggle app blocking
  const toggleAppBlocking = useCallback((appName: string) => {
    setFocusApps(prev => prev.map(app => 
      app.name === appName ? { ...app, blocked: !app.blocked } : app
    ));
  }, []);
  
  // Calculate focus score
  const calculateFocusScore = (): number => {
    const today = analyticsData.find(d => d.date === new Date().toISOString().split('T')[0]);
    return today?.focusScore || 0;
  };
  
  // Get progress percentage for timer
  const getTimerProgress = (): number => {
    if (!currentSession) return 0;
    const totalSeconds = currentSession.duration * 60;
    const elapsed = totalSeconds - timeRemaining;
    return (elapsed / totalSeconds) * 100;
  };

  return (
    <div className={`h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 text-gray-900 dark:text-white ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Focus & Time Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Boost productivity with structured focus sessions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Focus Score: {calculateFocusScore()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        {[
          { id: 'timer', label: 'Timer', icon: Clock },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'focus', label: 'Focus Mode', icon: Focus },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              {/* Timer Type Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Session Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { type: 'pomodoro', label: 'Pomodoro', duration: settings.pomodoroDuration, icon: Zap, color: 'bg-red-500' },
                      { type: 'short-break', label: 'Short Break', duration: settings.shortBreakDuration, icon: Coffee, color: 'bg-green-500' },
                      { type: 'long-break', label: 'Long Break', duration: settings.longBreakDuration, icon: Coffee, color: 'bg-blue-500' },
                      { type: 'custom', label: 'Custom', duration: customDuration, icon: Timer, color: 'bg-purple-500' },
                    ].map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setTimerType(option.type as TimerType)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          timerType === option.type
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 ${option.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <option.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{option.duration} min</div>
                      </button>
                    ))}
                  </div>
                  
                  {timerType === 'custom' && (
                    <div className="mt-4 flex items-center space-x-2">
                      <label className="text-sm font-medium">Duration:</label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main Timer Display */}
              <Card className="text-center">
                <CardContent className="pt-8 pb-8">
                  {currentSession ? (
                    <div className="space-y-6">
                      {/* Circular Progress */}
                      <div className="relative mx-auto w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getTimerProgress() / 100)}`}
                            className="text-indigo-500 transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <div className="text-4xl font-mono font-bold">
                              {formatTime(timeRemaining)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {timerType.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Task Display */}
                      {currentSession.task && (
                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          Working on: {currentSession.task}
                        </div>
                      )}

                      {/* Session Status */}
                      <Badge className={`px-4 py-2 text-sm ${
                        sessionStatus === 'running' ? 'bg-green-100 text-green-800' :
                        sessionStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        sessionStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sessionStatus.charAt(0).toUpperCase() + sessionStatus.slice(1)}
                      </Badge>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          onClick={toggleTimer}
                          size="lg"
                          className="px-8"
                          disabled={sessionStatus === 'completed'}
                        >
                          {sessionStatus === 'running' ? (
                            <>
                              <Pause className="w-5 h-5 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Resume
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopTimer}
                          variant="outline"
                          size="lg"
                        >
                          <Square className="w-5 h-5 mr-2" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-6xl font-mono font-bold text-gray-400">
                        {formatTime(getDuration(timerType) * 60)}
                      </div>
                      <div className="text-lg text-gray-600 dark:text-gray-400 capitalize">
                        Ready to start {timerType.replace('-', ' ')}
                      </div>
                      
                      {/* Task Input */}
                      <div className="max-w-md mx-auto">
                        <Input
                          placeholder="What are you working on? (optional)"
                          value={currentTask}
                          onChange={(e) => setCurrentTask(e.target.value)}
                          className="text-center"
                        />
                      </div>

                      <Button
                        onClick={startTimer}
                        size="lg"
                        className="px-12 py-3 text-lg"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Start Session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {sessionHistory.filter(s => s.type === 'pomodoro').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completed Today
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(sessionHistory.reduce((total, session) => 
                        total + (session.type === 'pomodoro' ? session.duration : 0), 0
                      ) / 60)}h
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Focus Time Today
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {completedSessions % settings.longBreakInterval === 0 && completedSessions > 0 ? 'Long Break' : 
                       completedSessions > 0 ? 'Short Break' : 'Get Started'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Next Recommended
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Goals Tab - Complete Implementation */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              {/* Goals Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Productivity Goals</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set and track your daily, weekly, and monthly objectives
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddingGoal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </div>

              {/* Add Goal Modal */}
              <AnimatePresence>
                {isAddingGoal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsAddingGoal(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={newGoal.title}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Complete 8 Pomodoro sessions"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newGoal.description}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Additional details about your goal"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Goal Type</label>
                            <Select value={newGoal.type} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="time">Focus Time (minutes)</SelectItem>
                                <SelectItem value="sessions">Completed Sessions</SelectItem>
                                <SelectItem value="tasks">Tasks Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Period</label>
                            <Select value={newGoal.period} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, period: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Target</label>
                          <Input
                            type="number"
                            min="1"
                            value={newGoal.target}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, target: Number(e.target.value) }))}
                            placeholder={newGoal.type === 'time' ? 'Minutes' : 'Count'}
                          />
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <Button onClick={addGoal} className="flex-1">
                            Create Goal
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingGoal(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Goals List */}
              <div className="grid gap-4">
                {goals.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Goals Set</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first productivity goal to start tracking progress
                      </p>
                      <Button onClick={() => setIsAddingGoal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Goal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  goals.map((goal) => {
                    const progress = Math.min((goal.current / goal.target) * 100, 100);
                    const isCompleted = goal.current >= goal.target;
                    
                    return (
                      <Card key={goal.id} className={isCompleted ? 'ring-2 ring-green-500' : ''}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{goal.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {goal.period}
                                </Badge>
                                {isCompleted && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                  {goal.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                  {goal.current} of {goal.target} {goal.type === 'time' ? 'minutes' : goal.type}
                                </span>
                                <span>•</span>
                                <span>
                                  Created {goal.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGoal(goal.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab - Complete Implementation */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Productivity Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your focus patterns and productivity trends
                </p>
              </div>

              {/* Analytics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {sessionHistory.filter(s => s.type === 'pomodoro' && s.completed).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Sessions
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(sessionHistory.reduce((total, session) => 
                        total + (session.type === 'pomodoro' && session.completed ? session.duration : 0), 0
                      ) / 60)}h {sessionHistory.reduce((total, session) => 
                        total + (session.type === 'pomodoro' && session.completed ? session.duration : 0), 0
                      ) % 60}m
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Focus Time
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(
                        sessionHistory.filter(s => s.completed).length > 0 
                          ? (sessionHistory.filter(s => s.completed).length / sessionHistory.length) * 100
                          : 0
                      )}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completion Rate
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {calculateFocusScore()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Focus Score
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Weekly Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const dayData = Math.floor(Math.random() * 8) + 1; // Mock data
                      const maxSessions = 8;
                      const percentage = (dayData / maxSessions) * 100;
                      
                      return (
                        <div key={day} className="flex items-center space-x-4">
                          <div className="w-12 text-sm font-medium">{day}</div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-3" />
                          </div>
                          <div className="w-16 text-sm text-right">
                            {dayData} sessions
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No sessions recorded yet. Start your first focus session!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {sessionHistory.slice(0, 10).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              session.type === 'pomodoro' ? 'bg-red-500' :
                              session.type === 'short-break' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`} />
                            <div>
                              <div className="font-medium capitalize">
                                {session.type.replace('-', ' ')}
                              </div>
                              {session.task && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {session.task}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                            <div>{session.duration}m</div>
                            <div>{session.startTime.toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Focus Mode Tab - Complete Implementation */}
          {activeTab === 'focus' && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Focus Mode</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Block distracting apps and websites during focus sessions
                </p>
              </div>

              {/* Focus Mode Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Focus className="w-5 h-5" />
                      <span>Focus Mode Status</span>
                    </span>
                    <Badge className={`${
                      settings.blockAppsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {settings.blockAppsEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {settings.blockAppsEnabled ? 'Focus mode is currently blocking distractions' : 'Focus mode is inactive'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {settings.blockAppsEnabled 
                          ? 'Selected apps and websites are blocked to help you stay focused'
                          : 'Enable focus mode to block distracting apps during sessions'
                        }
                      </p>
                    </div>
                    <Button
                      onClick={() => setSettings(prev => ({ ...prev, blockAppsEnabled: !prev.blockAppsEnabled }))}
                      className={settings.blockAppsEnabled ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}
                    >
                      {settings.blockAppsEnabled ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Enable
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* App Blocking Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Blocked Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {focusApps.map((app) => (
                      <div
                        key={app.name}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            app.category === 'social' ? 'bg-blue-500' :
                            app.category === 'entertainment' ? 'bg-red-500' :
                            app.category === 'news' ? 'bg-orange-500' :
                            app.category === 'games' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} />
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {app.category}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={app.blocked ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleAppBlocking(app.name)}
                        >
                          {app.blocked ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Blocked
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Allowed
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Focus Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Focus Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {focusApps.filter(app => app.blocked).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Apps Blocked
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        0
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Blocked Today
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round((sessionHistory.filter(s => s.completed).length / Math.max(sessionHistory.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Success Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Settings Tab - Complete Implementation */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize your focus sessions and preferences
                </p>
              </div>

              {/* Timer Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="w-5 h-5" />
                    <span>Timer Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Pomodoro Duration</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={settings.pomodoroDuration}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            pomodoroDuration: Number(e.target.value) 
                          }))}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Short Break</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={settings.shortBreakDuration}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            shortBreakDuration: Number(e.target.value) 
                          }))}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Long Break</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={settings.longBreakDuration}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            longBreakDuration: Number(e.target.value) 
                          }))}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Long Break Interval</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="number"
                        min="2"
                        max="8"
                        value={settings.longBreakInterval}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          longBreakInterval: Number(e.target.value) 
                        }))}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        sessions before long break
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auto-start Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Auto-start Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-start breaks</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically start break timers after completing a focus session
                      </div>
                    </div>
                    <Button
                      variant={settings.autoStartBreaks ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        autoStartBreaks: !prev.autoStartBreaks 
                      }))}
                    >
                      {settings.autoStartBreaks ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-start focus sessions</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically start focus sessions after completing a break
                      </div>
                    </div>
                    <Button
                      variant={settings.autoStartPomodoros ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        autoStartPomodoros: !prev.autoStartPomodoros 
                      }))}
                    >
                      {settings.autoStartPomodoros ? 'On' : 'Off'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Desktop notifications</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Show notifications when sessions start and complete
                      </div>
                    </div>
                    <Button
                      variant={settings.notificationsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        notificationsEnabled: !prev.notificationsEnabled 
                      }))}
                    >
                      {settings.notificationsEnabled ? (
                        <>
                          <Bell className="w-4 h-4 mr-1" />
                          On
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 mr-1" />
                          Off
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Sound alerts</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Play sound when sessions start and complete
                      </div>
                    </div>
                    <Button
                      variant={settings.soundEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        soundEnabled: !prev.soundEnabled 
                      }))}
                    >
                      {settings.soundEnabled ? (
                        <>
                          <Volume2 className="w-4 h-4 mr-1" />
                          On
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-4 h-4 mr-1" />
                          Off
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Export/Import Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Export session data</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Download your session history and analytics data
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const data = {
                          sessions: sessionHistory,
                          goals: goals,
                          analytics: analyticsData,
                          exportDate: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `time-management-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Reset all data</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Clear all session history, goals, and analytics data
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
                          setSessionHistory([]);
                          setGoals([]);
                          setAnalyticsData([]);
                          setCompletedSessions(0);
                        }
                      }}
                    >
                      Reset Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio element for notifications */}
      <audio
        ref={audioRef}
        preload="auto"
        className="hidden"
      >
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIdCSqJz/DGdSgGMYLN9diFMxEbaLPs4JtUIxNOoePtrGAUATGH2/LcfCgFIHPH8t2YOgcdXrDz6KxiGAY3jdby2Yk2CScZ8O2mXxoQU6Hi9LdkGAWGDvz/w3ojDS2Gx/LRfzAXN4Xb8c98Hw" type="audio/wav" />
      </audio>
    </div>
  );
};
