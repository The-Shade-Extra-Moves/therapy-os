import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Globe, 
  Image, 
  Video, 
  Newspaper, 
  Map, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Clock,
  Shield,
  Filter,
  Download,
  Share2,
  Bookmark,
  History,
  Wifi,
  WifiOff,
  Music,
  Code,
  Atom,
  Save,
  FileText,
  Monitor,
  Maximize,
  Eye,
  Archive,
  Tag,
  Hash,
  Table,
  BookOpen,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { searxngClient, getSearchCategories, formatSearchResults } from './SearchBrowser/searxng-client';
import { SearchResponse, SearchResult, SavedSearch, SearchMode } from './SearchBrowser/types';
import { SearchExporter, exportFormats } from './SearchBrowser/export-service';
import { SearchStorage } from './SearchBrowser/storage-service';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine: string;
  category: string;
  score: number;
  publishedDate?: string;
  thumbnail?: string;
  filesize?: string;
  template?: string;
}

interface SearchResponse {
  query: string;
  number_of_results: number;
  results: SearchResult[];
  answers: any[];
  corrections: any[];
  infoboxes: any[];
  suggestions: string[];
  unresponsive_engines: string[];
}

const SEARXNG_BASE_URL = searxngClient.getBaseUrl();

const searchModes: SearchMode[] = [
  {
    id: 'enhanced',
    name: 'Enhanced Mode',
    icon: 'Eye',
    description: 'Advanced search with filtering, saving, and export'
  },
  {
    id: 'direct',
    name: 'Direct Mode',
    icon: 'Monitor',
    description: 'Direct iframe embed of SearXNG interface'
  }
];

export default function SearchBrowser() {
  const [mode, setMode] = useState<'enhanced' | 'direct'>('enhanced');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('general');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; method: string; latency?: number } | null>(null);
  const [iframeSrc, setIframeSrc] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentSaveData, setCurrentSaveData] = useState<{ query: string; results: SearchResult[]; category: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Test connection on component mount
  useEffect(() => {
    testSearXNGConnection();
    // Set initial iframe src for direct mode
    setIframeSrc(`${SEARXNG_BASE_URL}?preferences=1`);
  }, []);

  const testSearXNGConnection = async () => {
    try {
      const status = await searxngClient.testConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({ success: false, method: 'none' });
    }
  };

  // Load search history, bookmarks, and saved searches from localStorage
  useEffect(() => {
    setSearchHistory(SearchStorage.getSearchHistory());
    setBookmarks(SearchStorage.getBookmarks());
    setSavedSearches(SearchStorage.getSavedSearches());
  }, []);

  const performSearch = async (searchQuery: string, searchCategory: string = category) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searxngClient.search(searchQuery, searchCategory);
      setResults(data);

      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        SearchStorage.addToHistory(searchQuery);
        setSearchHistory(SearchStorage.getSearchHistory());
      }

      // Update suggestions
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }

      // Get additional suggestions
      try {
        const additionalSuggestions = await searxngClient.getSuggestions(searchQuery);
        setSuggestions(prev => [...new Set([...prev, ...additionalSuggestions])].slice(0, 5));
      } catch (suggError) {
        console.log('Failed to get additional suggestions:', suggError);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError('CORS_ERROR');
      
      // Create demo results to show the interface functionality
      const demoResults: SearchResponse = {
        query: searchQuery,
        number_of_results: 5,
        results: [
          {
            title: `Demo: Search results for "${searchQuery}"`,
            url: `${SEARXNG_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`,
            content: `This is a demonstration of the SearXNG search interface. The actual search for "${searchQuery}" is blocked by CORS policy. Click "Open in SearXNG" to search directly on the SearXNG instance.`,
            engine: 'demo',
            category: searchCategory,
            score: 1.0
          },
          {
            title: 'CORS Resolution Guide',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
            content: 'To enable direct searching, configure CORS headers on your SearXNG instance by adding the appropriate Access-Control-Allow-Origin headers.',
            engine: 'demo',
            category: searchCategory,
            score: 0.9
          },
          {
            title: 'SearXNG Configuration',
            url: 'https://docs.searxng.org/',
            content: 'Learn how to configure SearXNG for web applications by modifying the settings.yml file to allow cross-origin requests.',
            engine: 'demo',
            category: searchCategory,
            score: 0.8
          },
          {
            title: 'Alternative: Browser Extension',
            url: 'https://addons.mozilla.org/firefox/addon/searxng/',
            content: 'Consider using a SearXNG browser extension to bypass CORS restrictions and search directly from your browser.',
            engine: 'demo',
            category: searchCategory,
            score: 0.7
          },
          {
            title: 'Privacy-First Search Benefits',
            url: 'https://searx.org/',
            content: 'SearXNG provides privacy-focused metasearch without tracking, combining results from multiple search engines while protecting user privacy.',
            engine: 'demo',
            category: searchCategory,
            score: 0.6
          }
        ],
        answers: [],
        corrections: [],
        infoboxes: [],
        suggestions: ['privacy search', 'metasearch engine', 'CORS configuration', 'browser extension'],
        unresponsive_engines: []
      };
      setResults(demoResults);
      setSuggestions(demoResults.suggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, category);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion, category);
  };

  const handleBookmark = (result: SearchResult) => {
    SearchStorage.addBookmark(result);
    setBookmarks(SearchStorage.getBookmarks());
  };

  const handleRemoveBookmark = (url: string) => {
    SearchStorage.removeBookmark(url);
    setBookmarks(SearchStorage.getBookmarks());
  };

  const handleSaveSearch = () => {
    if (results) {
      setCurrentSaveData({
        query: results.query,
        results: results.results,
        category: category
      });
      setSaveDialogOpen(true);
    }
  };

  const handleSaveConfirm = (notes: string, tags: string[]) => {
    if (currentSaveData) {
      const savedSearch: SavedSearch = {
        id: `search_${Date.now()}`,
        query: currentSaveData.query,
        category: currentSaveData.category,
        results: currentSaveData.results,
        timestamp: new Date(),
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined
      };
      
      SearchStorage.saveSearch(savedSearch);
      setSavedSearches(SearchStorage.getSavedSearches());
      setSaveDialogOpen(false);
      setCurrentSaveData(null);
    }
  };

  const handleExport = async (format: string, search?: SavedSearch) => {
    const searchToExport = search || (currentSaveData ? {
      id: 'temp',
      query: currentSaveData.query,
      category: currentSaveData.category,
      results: currentSaveData.results,
      timestamp: new Date()
    } : null);

    if (!searchToExport) return;

    try {
      switch (format) {
        case 'pdf':
          await SearchExporter.exportToPDF(searchToExport as SavedSearch);
          break;
        case 'html':
          await SearchExporter.exportToHTML(searchToExport as SavedSearch);
          break;
        case 'json':
          await SearchExporter.exportToJSON(searchToExport as SavedSearch);
          break;
        case 'csv':
          await SearchExporter.exportToCSV(searchToExport as SavedSearch);
          break;
        case 'markdown':
          await SearchExporter.exportToMarkdown(searchToExport as SavedSearch);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDirectSearch = (searchQuery: string) => {
    if (mode === 'direct') {
      const searchUrl = `${SEARXNG_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&category=${category}`;
      setIframeSrc(searchUrl);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (query) {
      performSearch(query, newCategory);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const openInSearXNG = () => {
    window.open(`${SEARXNG_BASE_URL}/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const categories = getSearchCategories();

  const getCategoryIcon = (iconName: string) => {
    const icons = {
      Globe, Image, Video, Newspaper, Map, Music, Download, Code, Atom
    };
    return icons[iconName as keyof typeof icons] || Globe;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Private Search</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mode Selection */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'enhanced' | 'direct')}>
              <TabsList>
                <TabsTrigger value="enhanced" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Enhanced
                </TabsTrigger>
                <TabsTrigger value="direct" className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Direct
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Badge variant="secondary" className="flex items-center gap-1">
              {connectionStatus?.success ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              SearXNG @ {SEARXNG_BASE_URL.replace('http://', '')}
              {connectionStatus?.latency && (
                <span className="text-xs">({connectionStatus.latency}ms)</span>
              )}
            </Badge>
          </div>
        </div>

        {/* Search Form */}
        {mode === 'enhanced' && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search privately with SearXNG..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
            <Button type="button" variant="outline" onClick={openInSearXNG}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={testSearXNGConnection}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {results && (
              <>
                <Button type="button" variant="outline" onClick={handleSaveSearch}>
                  <Save className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Search Results</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      {exportFormats.map((format) => {
                        const IconComponent = format.icon === 'FileText' ? FileText : 
                                            format.icon === 'Globe' ? Globe :
                                            format.icon === 'Code' ? Code :
                                            format.icon === 'Table' ? Table :
                                            format.icon === 'Hash' ? Hash : FileText;
                        return (
                          <Button
                            key={format.format}
                            variant="outline"
                            onClick={() => handleExport(format.format)}
                            className="flex items-center gap-2"
                          >
                            <IconComponent className="h-4 w-4" />
                            {format.name}
                          </Button>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </form>
        )}

        {mode === 'direct' && (
          <form onSubmit={(e) => { e.preventDefault(); handleDirectSearch(query); }} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search directly in SearXNG iframe..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!query.trim()}>
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button type="button" variant="outline" onClick={openInSearXNG}>
              <Maximize className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Category Tabs - Enhanced Mode Only */}
        {mode === 'enhanced' && (
          <Tabs value={category} onValueChange={handleCategoryChange}>
            <TabsList className="grid w-full grid-cols-6">
              {categories.slice(0, 6).map((cat) => {
                const IconComponent = getCategoryIcon(cat.icon);
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1">
                    <IconComponent className="h-4 w-4" />
                    {cat.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {categories.length > 6 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {categories.slice(6).map((cat) => {
                  const IconComponent = getCategoryIcon(cat.icon);
                  return (
                    <Button
                      key={cat.id}
                      variant={category === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(cat.id)}
                      className="flex items-center gap-1"
                    >
                      <IconComponent className="h-3 w-3" />
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            )}
          </Tabs>
        )}
      </div>

      {mode === 'enhanced' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Enhanced Mode */}
          <div className="w-80 border-r bg-muted/20 p-4 space-y-4 overflow-y-auto">
          {/* Connection Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {connectionStatus?.success ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">Status:</span>{' '}
                  {connectionStatus?.success ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-red-600">CORS Blocked</span>
                  )}
                </div>
                {connectionStatus?.latency && (
                  <div className="text-xs">
                    <span className="font-medium">Latency:</span> {connectionStatus.latency}ms
                  </div>
                )}
                <div className="text-xs">
                  <span className="font-medium">Method:</span> {connectionStatus?.method || 'None'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={openInSearXNG}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Direct
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-auto p-2 text-left"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((historyQuery, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-auto p-2 text-left"
                      onClick={() => {
                        setQuery(historyQuery);
                        performSearch(historyQuery);
                      }}
                    >
                      <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                      {historyQuery}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Bookmarks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {bookmarks.slice(0, 5).map((bookmark, index) => (
                    <div key={index} className="p-2 rounded border">
                      <div className="font-medium text-xs truncate">
                        {bookmark.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {bookmark.url}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4">
              <Card className="border-destructive">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <WifiOff className="h-4 w-4" />
                    <span className="font-medium">CORS Connection Blocked</span>
                  </div>
                  {error === 'CORS_ERROR' ? (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        The SearXNG instance at <code className="bg-muted px-1 rounded">{SEARXNG_BASE_URL}</code> doesn't allow cross-origin requests from this web application.
                      </p>
                      <div className="bg-muted/50 p-3 rounded">
                        <p className="text-sm font-medium mb-2">Solutions:</p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• <strong>Direct Access:</strong> Click "Open in SearXNG" button to search directly</li>
                          <li>• <strong>Server Config:</strong> Add CORS headers to your SearXNG settings.yml</li>
                          <li>• <strong>Browser Extension:</strong> Install a SearXNG browser extension</li>
                          <li>• <strong>Proxy Server:</strong> Set up a CORS proxy for your SearXNG instance</li>
                        </ul>
                      </div>
                      <p className="text-xs text-blue-600">
                        📝 The interface below shows demo results to demonstrate functionality.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">{error}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Note: To enable full functionality, configure CORS headers in your SearXNG instance or use a CORS proxy.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {results && (
            <div className="p-4 space-y-4">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  About {results.number_of_results.toLocaleString()} results for "{results.query}"
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={openInSearXNG}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in SearXNG
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                              <a 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                {result.title}
                              </a>
                            </h3>
                            <div className="text-xs text-green-600 mt-1">
                              {result.url}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(result)}
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {result.content}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {result.engine}
                          </Badge>
                          {result.publishedDate && (
                            <span>{formatDate(result.publishedDate)}</span>
                          )}
                          {result.filesize && (
                            <span>Size: {result.filesize}</span>
                          )}
                          <span>Score: {(result.score * 100).toFixed(0)}%</span>
                        </div>

                        {result.thumbnail && (
                          <img 
                            src={result.thumbnail} 
                            alt={result.title}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Unresponsive Engines */}
              {results.unresponsive_engines.length > 0 && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Unresponsive engines:</span>{' '}
                      {results.unresponsive_engines.join(', ')}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!results && !loading && !error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-medium">Private Search Ready</h3>
                  <p className="text-muted-foreground mt-2">
                    Search privately with SearXNG - no tracking, no ads, just results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      ) : (
        /* Direct Mode - Iframe Embed */
        <div className="flex-1 flex flex-col">
          <div className="flex-1 border rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-none"
              title="SearXNG Direct Search"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Search Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Query</label>
              <p className="text-sm text-muted-foreground">{currentSaveData?.query}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <p className="text-sm text-muted-foreground">{currentSaveData?.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Results</label>
              <p className="text-sm text-muted-foreground">{currentSaveData?.results.length} results</p>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add notes about this search..."
                id="search-notes"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (optional)</label>
              <Input
                placeholder="Enter tags separated by commas"
                id="search-tags"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const notes = (document.getElementById('search-notes') as HTMLTextAreaElement)?.value;
                  const tagsInput = (document.getElementById('search-tags') as HTMLInputElement)?.value;
                  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
                  handleSaveConfirm(notes, tags);
                }}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
