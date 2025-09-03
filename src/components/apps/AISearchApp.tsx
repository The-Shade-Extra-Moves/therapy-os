import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Bot, 
  Brain, 
  Sparkles, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Monitor,
  Maximize,
  Eye,
  Globe,
  Zap,
  MessageSquare,
  BookOpen,
  Lightbulb,
  Cpu
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import './AISearchApp.css';

interface AISearchAppProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function AISearchApp({ 
  isMinimized, 
  onMinimize, 
  onMaximize, 
  onClose 
}: AISearchAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'embed' | 'enhanced'>('embed');
  const [iframeKey, setIframeKey] = useState(0);
  const { appearance } = useOSStore();

  // Theme-aware classes for iframe
  const getIframeClasses = () => {
    const baseClass = 'ai-search-iframe';
    switch (appearance) {
      case 'dark':
        return `${baseClass} dark-iframe-filter`;
      case 'light':
        return `${baseClass} light-iframe-filter`;
      case 'therapy':
        return `${baseClass} therapy-iframe-filter`;
      default:
        return `${baseClass} auto-iframe-filter`;
    }
  };

  // Theme-aware container classes
  const getContainerClasses = () => {
    const baseClass = 'ai-search-container';
    switch (appearance) {
      case 'dark':
        return `${baseClass} dark-theme`;
      case 'light':
        return `${baseClass} light-theme`;
      case 'therapy':
        return `${baseClass} therapy-theme`;
      default:
        return `${baseClass} auto-theme`;
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Force iframe refresh with new search
    setIframeKey(prev => prev + 1);
    
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const getFireplexityUrl = () => {
    const baseUrl = 'http://31.220.88.167:45674/';
    if (searchQuery.trim()) {
      return `${baseUrl}?q=${encodeURIComponent(searchQuery)}`;
    }
    return baseUrl;
  };

  const renderEmbedMode = () => (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask Fireplexity AI anything..."
              className="pl-10 pr-4"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            variant="default"
            size="icon"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Status Bar */}
      <div className="px-4 py-2 bg-primary/5 border-b flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Fireplexity AI Search Engine - Powered by Advanced AI
        </span>
        <Badge variant="secondary" className="ml-auto">
          <Zap className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          key={iframeKey}
          src={getFireplexityUrl()}
          className={getIframeClasses()}
          title="Fireplexity AI Search"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
          loading="lazy"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading AI search results...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEnhancedMode = () => (
    <div className="h-full flex flex-col">
      {/* Enhanced Search Interface */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Fireplexity AI Search</h2>
          <Badge variant="outline" className="ml-auto">
            <Cpu className="h-3 w-3 mr-1" />
            Enhanced Mode
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter your AI search query..."
              className="pl-10 pr-4 h-12 text-base"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            size="lg"
            className="px-6"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Search AI
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('What is artificial intelligence?')}>
            <Bot className="h-3 w-3 mr-1" />
            AI Basics
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('Latest technology trends 2024')}>
            <Lightbulb className="h-3 w-3 mr-1" />
            Tech Trends
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('How to use machine learning?')}>
            <Brain className="h-3 w-3 mr-1" />
            ML Guide
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('Programming best practices')}>
            <BookOpen className="h-3 w-3 mr-1" />
            Programming
          </Button>
        </div>
      </div>

      {/* Embedded AI Search */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          key={iframeKey}
          src={getFireplexityUrl()}
          className={getIframeClasses()}
          title="Fireplexity AI Search - Enhanced Mode"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
          loading="lazy"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Bot className="h-12 w-12 text-primary animate-pulse" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">AI is thinking...</p>
                <p className="text-sm text-muted-foreground">Searching through knowledge base</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMinimized) {
    return null;
  }

  return (
    <div className={getContainerClasses()}>
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Fireplexity AI Search
              <Badge variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'embed' | 'enhanced')} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="embed" className="text-xs">
                    <Monitor className="h-3 w-3 mr-1" />
                    Embed
                  </TabsTrigger>
                  <TabsTrigger value="enhanced" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    Enhanced
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {onMinimize && (
                <Button variant="ghost" size="sm" onClick={onMinimize}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onMaximize && (
                <Button variant="ghost" size="sm" onClick={onMaximize}>
                  <Maximize className="h-4 w-4" />
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-[calc(100%-80px)]">
          {viewMode === 'embed' ? renderEmbedMode() : renderEnhancedMode()}
        </CardContent>
      </Card>
    </div>
  );
}
