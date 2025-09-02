import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Appointment {
  id: string;
  title: string;
  patient: string;
  time: string;
  duration: string;
  type: 'session' | 'consultation' | 'followup';
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Therapy Session',
    patient: 'Sarah Johnson',
    time: '09:00 AM',
    duration: '60 min',
    type: 'session'
  },
  {
    id: '2',
    title: 'Initial Consultation',
    patient: 'Michael Chen',
    time: '11:30 AM',
    duration: '90 min',
    type: 'consultation'
  },
  {
    id: '3',
    title: 'Follow-up',
    patient: 'Emma Williams',
    time: '02:00 PM',
    duration: '45 min',
    type: 'followup'
  }
];

const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const currentDate = new Date();
const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

export const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<'month' | 'week' | 'day'>('day');

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-primary/10 border-primary/30 text-primary';
      case 'consultation': return 'bg-secondary/10 border-secondary/30 text-secondary';
      case 'followup': return 'bg-accent/10 border-accent/30 text-accent';
      default: return 'bg-muted border-border text-foreground';
    }
  };

  const renderDayView = () => (
    <div className="space-y-4">
      {/* Day Header */}
      <Card className="p-4 glass-surface">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString('default', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mockAppointments.length} appointments scheduled
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Appointment
          </Button>
        </div>
      </Card>

      {/* Time Slots */}
      <div className="space-y-2">
        {Array.from({ length: 9 }, (_, i) => {
          const hour = i + 9; // 9 AM to 5 PM
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          const appointment = mockAppointments.find(apt => apt.time.includes(hour.toString()));
          
          return (
            <motion.div
              key={hour}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="w-16 text-right text-sm text-muted-foreground">
                {timeSlot}
              </div>
              <div className="flex-1 h-16 border border-border/30 rounded-lg relative">
                {appointment && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`absolute inset-1 rounded-md border p-3 cursor-pointer ${getAppointmentColor(appointment.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{appointment.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs">{appointment.patient}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-card/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Mini Calendar Sidebar */}
        <div className="w-1/3 border-r border-border/50 p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{currentMonth}</h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {daysInWeek.map(day => (
                <div key={day} className="p-2 text-center text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6; // Adjust for month start
                const isToday = day === currentDate.getDate();
                const hasAppointment = day > 0 && day <= 31 && Math.random() > 0.7;
                
                return (
                  <button
                    key={i}
                    className={`p-2 text-center rounded hover:bg-muted transition-colors relative ${
                      isToday ? 'bg-primary text-primary-foreground' : ''
                    } ${day <= 0 || day > 31 ? 'text-muted-foreground/50' : ''}`}
                  >
                    {day > 0 && day <= 31 ? day : ''}
                    {hasAppointment && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <Card className="p-4 glass-surface">
            <h4 className="font-medium mb-3">Today's Appointments</h4>
            <div className="space-y-2">
              {mockAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-3 p-2 hover:bg-muted/30 rounded">
                  <div className={`w-2 h-2 rounded-full ${
                    appointment.type === 'session' ? 'bg-primary' :
                    appointment.type === 'consultation' ? 'bg-secondary' : 'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Calendar View */}
        <div className="flex-1 flex flex-col">
          {/* View Controls */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {renderDayView()}
          </div>
        </div>
      </div>
    </div>
  );
};