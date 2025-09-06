import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ErrorFallback } from "./components/ErrorFallback";
import { TherapySystemProvider } from "@/contexts/TherapySystemContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      throwOnError: true, // Enable error boundaries for queries
    },
    mutations: {
      throwOnError: true, // Enable error boundaries for mutations
    },
  },
});

const App = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Log to external service in production
      console.error('App Error:', error);
      console.error('Error Info:', errorInfo);
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TherapySystemProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense 
              fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Loading application...</p>
                  </div>
                </div>
              }
            >
              <ErrorBoundary fallback={<ErrorFallback title="Page Error" />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </BrowserRouter>
        </TherapySystemProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
