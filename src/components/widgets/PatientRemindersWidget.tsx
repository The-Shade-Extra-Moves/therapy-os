import React from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PatientRemindersWidget: React.FC = () => {
  const reminders = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      type: 'Follow-up Call',
      time: '2:00 PM',
      priority: 'high' as const,
      notes: 'Post-session check-in'
    },
    {
      id: 2,
      patient: 'Michael Chen',
      type: 'Session Prep',
      time: '3:30 PM',
      priority: 'medium' as const,
      notes: 'Review previous notes'
    },
    {
      id: 3,
      patient: 'Emma Davis',
      type: 'Insurance Update',
      time: 'Tomorrow',
      priority: 'low' as const,
      notes: 'Verify coverage'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'muted';
      default: return 'muted';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? AlertCircle : Clock;
  };

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4" />
          Patient Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => {
          const PriorityIcon = getPriorityIcon(reminder.priority);
          
          return (
            <div key={reminder.id} className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{reminder.patient}</h4>
                  <p className="text-xs text-muted-foreground">{reminder.type}</p>
                </div>
                <Badge variant={getPriorityColor(reminder.priority) as any} className="ml-2 flex-shrink-0">
                  <PriorityIcon className="w-3 h-3 mr-1" />
                  {reminder.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{reminder.notes}</span>
                <span className="font-medium">{reminder.time}</span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t border-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {reminders.length} active reminders
          </p>
        </div>
      </CardContent>
    </Card>
  );
};