import { useCallback } from 'react';

/**
 * Hook to handle errors in functional components
 * This can be used to trigger error boundaries programmatically
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, errorInfo?: string) => {
    // Log error details
    console.error('Error caught by useErrorHandler:', error);
    if (errorInfo) {
      console.error('Additional info:', errorInfo);
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }

    // Re-throw to trigger error boundary
    throw error;
  }, []);

  return { handleError };
};

export default useErrorHandler;
