export interface SearchResult {
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
  domain?: string;
  snippet?: string;
}

export interface SearchResponse {
  query: string;
  number_of_results: number;
  results: SearchResult[];
  answers: any[];
  corrections: any[];
  infoboxes: any[];
  suggestions: string[];
  unresponsive_engines: string[];
  query_time?: number;
}

export interface SavedSearch {
  id: string;
  query: string;
  category: string;
  results: SearchResult[];
  timestamp: Date;
  notes?: string;
  tags?: string[];
}

export interface SearchMode {
  id: 'enhanced' | 'direct';
  name: string;
  icon: string;
  description: string;
}

export interface ExportFormat {
  format: 'pdf' | 'html' | 'json' | 'csv' | 'markdown';
  name: string;
  icon: string;
}
