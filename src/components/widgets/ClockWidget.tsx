import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const dateString = time.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });

  return (
    <motion.div
      className="h-full w-full p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">System Time</span>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-mono font-bold text-foreground">
          {timeString}
        </div>
        <div className="text-sm text-muted-foreground">
          {dateString}
        </div>
      </div>
    </motion.div>
  );
};