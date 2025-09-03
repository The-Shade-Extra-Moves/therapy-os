import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
  className?: string;
}

export const SavingIndicator: React.FC<SavingIndicatorProps> = ({
  status,
  message,
  className
}) => {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Save className="w-4 h-4 animate-pulse" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'saving':
        return message || 'Saving...';
      case 'saved':
        return message || 'Saved';
      case 'error':
        return message || 'Error saving';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
            status === 'saving' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
            status === 'saved' && 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
            status === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
            className
          )}
        >
          {getIcon()}
          <span>{getMessage()}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  isSaving,
  hasUnsavedChanges,
  className
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSave}
      disabled={isSaving || !hasUnsavedChanges}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        hasUnsavedChanges
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        className
      )}
    >
      <motion.div
        animate={isSaving ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1, repeat: isSaving ? Infinity : 0 }}
      >
        <Save className="w-4 h-4" />
      </motion.div>
      {isSaving ? 'Saving...' : 'Save'}
    </motion.button>
  );
};
