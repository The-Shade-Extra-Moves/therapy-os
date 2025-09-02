import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CalendarWidget: React.FC = () => {
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDate = today.getDate();
  
  // Generate calendar days
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const upcomingEvents = [
    { time: '10:00 AM', title: 'Session with John', type: 'appointment' },
    { time: '2:30 PM', title: 'Team Meeting', type: 'meeting' },
    { time: '4:00 PM', title: 'Sarah Follow-up', type: 'appointment' },
  ];

  return (
    <Card className="h-full glass-surface">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-4 h-4" />
          {currentMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini Calendar */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-center font-medium text-muted-foreground p-1">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`text-center p-1 rounded ${
                day === currentDate
                  ? 'bg-primary text-primary-foreground font-medium'
                  : day
                  ? 'hover:bg-muted/50 cursor-pointer'
                  : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Today's Events */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Today's Schedule
          </h4>
          <div className="space-y-1">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-muted-foreground">{event.time}</span>
                <span className="truncate">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};