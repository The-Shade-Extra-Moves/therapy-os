import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle, 
  RefreshCw,
  Zap,
  MessageSquare,
  FileText,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '../types';

interface AIAssistanceProps {
  note: Note;
  onUpdateNote: (updates: Partial<Note>) => void;
  className?: string;
}

interface AISuggestion {
  id: string;
  type: 'summary' | 'prompt' | 'pattern' | 'completion' | 'grammar' | 'style';
  title: string;
  content: string;
  confidence: number;
  action?: () => void;
}

interface AIPattern {
  id: string;
  type: 'mood' | 'progress' | 'research' | 'habit';
  pattern: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}

export const AIAssistance: React.FC<AIAssistanceProps> = ({
  note,
  onUpdateNote,
  className
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [patterns, setPatterns] = useState<AIPattern[]>([]);
  const [completionText, setCompletionText] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Mock AI analysis function
  const analyzeNote = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI processing
    for (let i = 0; i <= 100; i += 10) {
      setAnalysisProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate mock suggestions
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'summary',
        title: 'Auto-generated Summary',
        content: 'This note discusses therapeutic techniques and client progress, focusing on cognitive behavioral therapy approaches.',
        confidence: 85,
        action: () => onUpdateNote({ aiSummary: 'This note discusses therapeutic techniques and client progress, focusing on cognitive behavioral therapy approaches.' })
      },
      {
        id: '2',
        type: 'prompt',
        title: 'Suggested Next Steps',
        content: 'Consider adding specific examples of CBT techniques used and their effectiveness.',
        confidence: 78
      },
      {
        id: '3',
        type: 'completion',
        title: 'Content Completion',
        content: 'Based on the context, you might want to add: "The client showed significant improvement in anxiety management through mindfulness exercises."',
        confidence: 72
      },
      {
        id: '4',
        type: 'grammar',
        title: 'Grammar Suggestion',
        content: 'Consider changing "has been" to "have been" in the third paragraph for better subject-verb agreement.',
        confidence: 90
      }
    ];

    // Generate mock patterns
    const mockPatterns: AIPattern[] = [
      {
        id: '1',
        type: 'mood',
        pattern: 'Positive mood indicators increasing',
        frequency: 7,
        trend: 'up',
        insights: ['Client mentions "feeling better" 3x more than last month', 'Positive language usage increased by 45%']
      },
      {
        id: '2',
        type: 'progress',
        pattern: 'Consistent therapy goal achievement',
        frequency: 5,
        trend: 'stable',
        insights: ['85% of set goals met consistently', 'Strong adherence to homework assignments']
      }
    ];

    setSuggestions(mockSuggestions);
    setPatterns(mockPatterns);
    setIsAnalyzing(false);
  }, [onUpdateNote]);

  const generateCompletion = useCallback(() => {
    // Mock text completion based on current content
    const completions = [
      'This approach has shown promising results in similar cases.',
      'Further research indicates that combining these techniques yields better outcomes.',
      'The client\'s response suggests readiness for advanced therapeutic interventions.',
      'Documentation of this progress will be valuable for future sessions.'
    ];
    
    const randomCompletion = completions[Math.floor(Math.random() * completions.length)];
    setCompletionText(randomCompletion);
  }, []);

  const applySuggestion = useCallback((suggestion: AISuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    }
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, []);

  const getPatternIcon = (type: AIPattern['type']) => {
    switch (type) {
      case 'mood': return <TrendingUp className="w-4 h-4" />;
      case 'progress': return <CheckCircle className="w-4 h-4" />;
      case 'research': return <FileText className="w-4 h-4" />;
      case 'habit': return <BarChart3 className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'summary': return <FileText className="w-4 h-4" />;
      case 'prompt': return <Lightbulb className="w-4 h-4" />;
      case 'pattern': return <TrendingUp className="w-4 h-4" />;
      case 'completion': return <MessageSquare className="w-4 h-4" />;
      case 'grammar': return <CheckCircle className="w-4 h-4" />;
      case 'style': return <Sparkles className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    // Auto-analyze when note content changes (with debounce)
    const timer = setTimeout(() => {
      if (note.content.length > 100) {
        analyzeNote();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [note.content, analyzeNote]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* AI Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5" />
            AI Assistance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={analyzeNote} 
              disabled={isAnalyzing}
              size="sm"
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Note
                </>
              )}
            </Button>
            <Button 
              onClick={generateCompletion} 
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Suggest Text
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Analyzing content...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {completionText && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Suggested completion:
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    {completionText}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        onUpdateNote({ 
                          content: note.content + ' ' + completionText 
                        });
                        setCompletionText('');
                      }}
                    >
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setCompletionText('')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start gap-2">
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{suggestion.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {suggestion.content}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => applySuggestion(suggestion)}
                      >
                        Apply
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pattern Detection */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Detected Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.map((pattern) => (
              <div 
                key={pattern.id}
                className="p-3 border rounded-lg"
              >
                <div className="flex items-start gap-2">
                  {getPatternIcon(pattern.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{pattern.pattern}</span>
                      <Badge 
                        variant={pattern.trend === 'up' ? 'default' : pattern.trend === 'down' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {pattern.trend === 'up' ? '↗' : pattern.trend === 'down' ? '↘' : '→'} {pattern.trend}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Frequency: {pattern.frequency} occurrences
                    </div>
                    <div className="space-y-1">
                      {pattern.insights.map((insight, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5" />
            Document Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Word Count</div>
              <div className="font-medium">{note.wordCount || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">Reading Time</div>
              <div className="font-medium">{note.readingTime || 0} min</div>
            </div>
            <div>
              <div className="text-gray-500">Version</div>
              <div className="font-medium">v{note.version}</div>
            </div>
            <div>
              <div className="text-gray-500">Last Updated</div>
              <div className="font-medium">
                {note.updatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
