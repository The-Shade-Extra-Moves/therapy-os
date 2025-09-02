import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Activity, Brain, Users } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { ClockWidget } from './ClockWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { CalendarWidget } from './CalendarWidget';
import { PatientRemindersWidget } from './PatientRemindersWidget';
import { AIInsightsWidget } from './AIInsightsWidget';

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableWidgets = [
  { type: 'clock', name: 'Clock', icon: Clock, component: ClockWidget },
  { type: 'calendar', name: 'Calendar', icon: Calendar, component: CalendarWidget },
  { type: 'system-monitor', name: 'System Monitor', icon: Activity, component: SystemMonitorWidget },
  { type: 'patient-reminders', name: 'Patient Reminders', icon: Users, component: PatientRemindersWidget },
  { type: 'ai-insights', name: 'AI Insights', icon: Brain, component: AIInsightsWidget },
];

export const WidgetPanel: React.FC<WidgetPanelProps> = ({ isOpen, onClose }) => {
  const { widgets, addWidget, removeWidget, appearance } = useOSStore();

  const handleAddWidget = (widgetType: string) => {
    const existingWidget = widgets.find(w => w.type === widgetType);
    if (existingWidget) return;

    addWidget({
      type: widgetType as any,
      position: { x: 50 + widgets.length * 20, y: 50 + widgets.length * 20 },
      size: { width: 280, height: 200 },
      settings: {},
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Widget Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 glass-surface border-l z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Desktop Widgets</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Widgets</h3>
                <div className="space-y-2">
                  {availableWidgets.map((widget) => {
                    const isActive = widgets.some(w => w.type === widget.type);
                    const IconComponent = widget.icon;
                    
                    return (
                      <div
                        key={widget.type}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isActive 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-muted/30 border-muted hover:bg-muted/50 cursor-pointer'
                        }`}
                        onClick={() => !isActive && handleAddWidget(widget.type)}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{widget.name}</span>
                        </div>
                        {isActive && (
                          <span className="text-xs text-primary font-medium">Active</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {widgets.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Widgets</h3>
                  <div className="space-y-2">
                    {widgets.map((widget) => {
                      const widgetInfo = availableWidgets.find(w => w.type === widget.type);
                      if (!widgetInfo) return null;
                      
                      const IconComponent = widgetInfo.icon;
                      
                      return (
                        <div
                          key={widget.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted"
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm">{widgetInfo.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveWidget(widget.id)}
                            className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};