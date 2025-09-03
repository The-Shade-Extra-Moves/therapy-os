// CORS Proxy utility for SearXNG API calls
// This helps bypass CORS restrictions when calling the SearXNG instance

export interface CORSProxyConfig {
  proxyUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

const DEFAULT_CONFIG: CORSProxyConfig = {
  proxyUrl: 'https://cors-anywhere.herokuapp.com/',
  timeout: 10000,
  retryAttempts: 3
};

export class SearXNGClient {
  private baseUrl: string;
  private config: CORSProxyConfig;

  constructor(baseUrl: string, config: CORSProxyConfig = {}) {
    this.baseUrl = baseUrl;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    const { proxyUrl, timeout } = this.config;
    
    // Try direct connection first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log('Direct connection failed, trying with proxy...', error);
    }

    // Fallback to proxy if direct connection fails
    if (proxyUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${proxyUrl}${url}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
          },
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        console.error('Proxy connection also failed:', error);
        throw error;
      }
    }

    throw new Error('Both direct and proxy connections failed');
  }

  async search(query: string, category: string = 'general', options: {
    format?: string;
    safesearch?: string;
    pageno?: number;
    time_range?: string;
    language?: string;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams({
      q: query,
      category,
      format: options.format || 'json',
      safesearch: options.safesearch || '1',
      pageno: (options.pageno || 1).toString(),
      ...(options.time_range && { time_range: options.time_range }),
      ...(options.language && { language: options.language }),
    });

    const url = `${this.baseUrl}/search?${searchParams}`;
    
    try {
      const response = await this.fetchWithProxy(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SearXNG search error:', error);
      
      // Return mock data if real search fails
      return this.getMockSearchResults(query, category);
    }
  }

  async getEngines(): Promise<any> {
    try {
      const response = await this.fetchWithProxy(`${this.baseUrl}/engines`);
      
      if (!response.ok) {
        throw new Error(`Failed to get engines: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch engines:', error);
      return this.getMockEngines();
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        format: 'json'
      });

      const response = await this.fetchWithProxy(`${this.baseUrl}/autocompleter?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return this.getMockSuggestions(query);
    }
  }

  private getMockSearchResults(query: string, category: string) {
    return {
      query,
      number_of_results: 5,
      results: [
        {
          title: `Search results for "${query}"`,
          url: `${this.baseUrl}/search?q=${encodeURIComponent(query)}`,
          content: `This is a demonstration result for "${query}". In a real deployment, you would see actual search results from SearXNG.`,
          engine: 'searxng-demo',
          category,
          score: 1.0,
          publishedDate: new Date().toISOString(),
        },
        {
          title: 'SearXNG - Privacy-respecting metasearch engine',
          url: 'https://docs.searxng.org/',
          content: 'SearXNG is a free internet metasearch engine which aggregates results from various search services and databases. Users are neither tracked nor profiled.',
          engine: 'searxng-demo',
          category,
          score: 0.9,
        },
        {
          title: 'Privacy-focused Search Engines',
          url: 'https://example.com/privacy-search',
          content: 'Learn about search engines that prioritize user privacy and don\'t track your searches or store personal data.',
          engine: 'searxng-demo',
          category,
          score: 0.8,
        },
        {
          title: 'Metasearch Engine Benefits',
          url: 'https://example.com/metasearch',
          content: 'Discover the advantages of using metasearch engines that aggregate results from multiple sources while protecting your privacy.',
          engine: 'searxng-demo',
          category,
          score: 0.7,
        },
        {
          title: `${query} - Research and Information`,
          url: `https://example.com/research/${encodeURIComponent(query)}`,
          content: `Comprehensive information and research resources about ${query}. Find academic papers, articles, and expert analysis.`,
          engine: 'searxng-demo',
          category,
          score: 0.6,
        }
      ],
      answers: [],
      corrections: [],
      infoboxes: [],
      suggestions: this.getMockSuggestions(query),
      unresponsive_engines: []
    };
  }

  private getMockSuggestions(query: string): string[] {
    const suggestions = [
      `${query} definition`,
      `${query} examples`,
      `${query} research`,
      `${query} tutorial`,
      `${query} guide`
    ];
    
    return suggestions.slice(0, 3);
  }

  private getMockEngines() {
    return [
      { name: 'DuckDuckGo', shortcut: 'ddg', categories: ['general'] },
      { name: 'Bing', shortcut: 'bi', categories: ['general', 'images'] },
      { name: 'Google', shortcut: 'go', categories: ['general', 'images', 'videos'] },
      { name: 'Startpage', shortcut: 'sp', categories: ['general'] },
      { name: 'Qwant', shortcut: 'qw', categories: ['general', 'images', 'news'] }
    ];
  }

  // Method to test connectivity
  async testConnection(): Promise<{ success: boolean; method: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      // Try a simple search to test connectivity
      const response = await this.fetchWithProxy(`${this.baseUrl}/search?q=test&format=json`);
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        return { 
          success: true, 
          method: response.url.includes('cors-anywhere') ? 'proxy' : 'direct',
          latency 
        };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    }
    
    return { success: false, method: 'none' };
  }

  // Update configuration
  updateConfig(newConfig: Partial<CORSProxyConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Update base URL
  updateBaseUrl(newUrl: string) {
    this.baseUrl = newUrl;
  }
}

// Export a default instance
export const searxngClient = new SearXNGClient('http://31.220.88.167:7891');

// Export utility functions
export const formatSearchResults = (results: any[]) => {
  return results.map(result => ({
    ...result,
    publishedDate: result.publishedDate ? new Date(result.publishedDate).toLocaleDateString() : '',
    score: Math.round((result.score || 0) * 100),
  }));
};

export const getSearchCategories = () => [
  { id: 'general', name: 'Web', icon: 'Globe' },
  { id: 'images', name: 'Images', icon: 'Image' },
  { id: 'videos', name: 'Videos', icon: 'Video' },
  { id: 'news', name: 'News', icon: 'Newspaper' },
  { id: 'map', name: 'Maps', icon: 'Map' },
  { id: 'music', name: 'Music', icon: 'Music' },
  { id: 'files', name: 'Files', icon: 'Download' },
  { id: 'it', name: 'IT', icon: 'Code' },
  { id: 'science', name: 'Science', icon: 'Atom' },
];
