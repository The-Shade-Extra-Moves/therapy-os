import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  showRetry = true
}) => {
  return (
    <Card className="w-full h-full min-h-[200px] flex items-center justify-center">
      <CardContent className="text-center space-y-4 p-6">
        <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="text-left text-xs bg-muted p-3 rounded border max-w-md mx-auto">
            <div className="font-semibold text-destructive mb-1">
              {error.name}: {error.message}
            </div>
            <div className="text-muted-foreground max-h-20 overflow-y-auto font-mono">
              {error.stack}
            </div>
          </div>
        )}

        {showRetry && resetError && (
          <Button onClick={resetError} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorFallback;
