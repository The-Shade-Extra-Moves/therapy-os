import React from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AIInsightsWidget: React.FC = () => {
  const insights = [
    {
      id: 1,
      type: 'trend',
      icon: TrendingUp,
      title: 'Session Patterns',
      message: 'Anxiety levels trending down 15% this week',
      confidence: 85,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'alert',
      icon: AlertTriangle,
      title: 'Patient Alert',
      message: 'Consider medication review for John D.',
      confidence: 72,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      type: 'success',
      icon: CheckCircle,
      title: 'Progress Update',
      message: 'Sarah J. showing excellent improvement',
      confidence: 91,
      color: 'text-green-600'
    }
  ];

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-4 h-4" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          
          return (
            <div key={insight.id} className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted/50">
              <div className="flex items-start gap-2">
                <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${insight.color}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Confidence: {insight.confidence}%
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t border-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};