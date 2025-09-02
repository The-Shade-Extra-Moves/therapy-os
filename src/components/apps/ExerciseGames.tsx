import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Play, 
  Pause, 
  RotateCcw, 
  Heart, 
  Wind,
  Brain,
  Target,
  Zap,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const exercises = [
  {
    id: 'breathing',
    name: 'Deep Breathing',
    description: 'Guided breathing exercises for anxiety relief',
    icon: Wind,
    category: 'Relaxation',
    duration: '5-10 min',
    difficulty: 'Easy',
    color: 'bg-blue-500'
  },
  {
    id: 'memory',
    name: 'Memory Palace',
    description: 'Cognitive exercises to improve memory and focus',
    icon: Brain,
    category: 'Cognitive',
    duration: '10-15 min',
    difficulty: 'Medium',
    color: 'bg-purple-500'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present-moment awareness and meditation',
    icon: Heart,
    category: 'Mindfulness',
    duration: '15-20 min',
    difficulty: 'Easy',
    color: 'bg-green-500'
  },
  {
    id: 'focus',
    name: 'Focus Training',
    description: 'Attention and concentration improvement games',
    icon: Target,
    category: 'Cognitive',
    duration: '8-12 min',
    difficulty: 'Hard',
    color: 'bg-orange-500'
  },
  {
    id: 'mood',
    name: 'Mood Tracker',
    description: 'Interactive mood monitoring and regulation',
    icon: Smile,
    category: 'Emotional',
    duration: '5 min',
    difficulty: 'Easy',
    color: 'bg-pink-500'
  },
  {
    id: 'energy',
    name: 'Energy Boost',
    description: 'Quick exercises to increase mental energy',
    icon: Zap,
    category: 'Activation',
    duration: '3-5 min',
    difficulty: 'Easy',
    color: 'bg-yellow-500'
  }
];

export const ExerciseGames: React.FC = () => {
  const [activeExercise, setActiveExercise] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [timer, setTimer] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && activeExercise) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        setProgress(prev => Math.min(prev + 0.5, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeExercise]);

  const startExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId);
    setIsRunning(true);
    setProgress(0);
    setTimer(0);
  };

  const pauseExercise = () => {
    setIsRunning(!isRunning);
  };

  const resetExercise = () => {
    setActiveExercise(null);
    setIsRunning(false);
    setProgress(0);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeExerciseData = exercises.find(ex => ex.id === activeExercise);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/30">
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold">Therapeutic Exercises & Games</h1>
            <p className="text-sm text-muted-foreground">
              Interactive wellness activities for mental health
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Exercise Library */}
        <div className="w-1/2 p-6 border-r border-border/20">
          <h2 className="text-lg font-medium mb-4">Available Exercises</h2>
          <div className="space-y-4 overflow-y-auto scrollbar-thin">
            {exercises.map((exercise) => {
              const Icon = exercise.icon;
              return (
                <motion.div
                  key={exercise.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`cursor-pointer transition-all hover-lift ${
                    activeExercise === exercise.id ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${exercise.color} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{exercise.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {exercise.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {exercise.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {exercise.duration}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="mb-3">
                        {exercise.description}
                      </CardDescription>
                      <Button
                        onClick={() => startExercise(exercise.id)}
                        disabled={activeExercise === exercise.id && isRunning}
                        className="w-full"
                        size="sm"
                      >
                        {activeExercise === exercise.id && isRunning ? 'Running...' : 'Start Exercise'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Active Exercise Area */}
        <div className="w-1/2 p-6">
          <AnimatePresence mode="wait">
            {activeExercise ? (
              <motion.div
                key={activeExercise}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium">{activeExerciseData?.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {activeExerciseData?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pauseExercise}
                    >
                      {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetExercise}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Exercise Interface */}
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-mono font-bold">
                          {formatTime(timer)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Session time
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {Math.round(progress)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Complete
                        </div>
                      </div>
                    </div>
                    <Progress value={progress} className="mt-4" />
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex items-center justify-center">
                    <motion.div
                      className="text-center p-8"
                      animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
                    >
                      {activeExerciseData && (
                        <div className={`w-24 h-24 rounded-full ${activeExerciseData.color} flex items-center justify-center mx-auto mb-4`}>
                          <activeExerciseData.icon className="h-12 w-12 text-white" />
                        </div>
                      )}
                      
                      {activeExercise === 'breathing' && (
                        <div className="space-y-4">
                          <motion.div
                            className="text-lg font-medium"
                            animate={{ opacity: isRunning ? [1, 0.5, 1] : 1 }}
                            transition={{ duration: 4, repeat: isRunning ? Infinity : 0 }}
                          >
                            {isRunning ? 'Breathe in... and out...' : 'Click play to begin breathing exercise'}
                          </motion.div>
                          <div className="text-sm text-muted-foreground">
                            Follow the gentle rhythm for deep relaxation
                          </div>
                        </div>
                      )}

                      {activeExercise === 'memory' && (
                        <div className="space-y-4">
                          <div className="text-lg font-medium">
                            {isRunning ? 'Building your memory palace...' : 'Ready to enhance your memory'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Visualize and organize information spatially
                          </div>
                        </div>
                      )}

                      {activeExercise === 'mindfulness' && (
                        <div className="space-y-4">
                          <div className="text-lg font-medium">
                            {isRunning ? 'Focus on the present moment...' : 'Begin mindfulness practice'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Notice your thoughts without judgment
                          </div>
                        </div>
                      )}

                      {!['breathing', 'memory', 'mindfulness'].includes(activeExercise) && (
                        <div className="space-y-4">
                          <div className="text-lg font-medium">
                            {isRunning ? 'Exercise in progress...' : 'Ready to start'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus and follow the guided activity
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-center"
              >
                <div className="max-w-md">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Exercise Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose an exercise from the library to begin your therapeutic session
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};