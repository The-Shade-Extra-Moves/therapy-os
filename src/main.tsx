import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import ErrorBoundary from './components/ErrorBoundary'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure you have a div with id='root' in your HTML.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Global Error Boundary caught an error:', error);
        console.error('Error Info:', errorInfo);
        
        // In production, send to error reporting service
        if (import.meta.env.PROD) {
          // Example: Sentry.captureException(error);
        }
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);
