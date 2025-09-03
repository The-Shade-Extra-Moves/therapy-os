import { SavedSearch } from './types';

export class SearchStorage {
  private static STORAGE_KEY = 'searxng-saved-searches';
  private static HISTORY_KEY = 'searxng-search-history';
  private static BOOKMARKS_KEY = 'searxng-bookmarks';

  static getSavedSearches(): SavedSearch[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data).map((search: any) => ({
        ...search,
        timestamp: new Date(search.timestamp)
      }));
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  }

  static saveSearch(search: SavedSearch): void {
    try {
      const searches = this.getSavedSearches();
      const updatedSearches = [search, ...searches.filter(s => s.id !== search.id)];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  static deleteSearch(id: string): void {
    try {
      const searches = this.getSavedSearches();
      const updatedSearches = searches.filter(s => s.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  }

  static getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(this.HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  static addToHistory(query: string): void {
    try {
      const history = this.getSearchHistory();
      const updatedHistory = [query, ...history.filter(q => q !== query)].slice(0, 20);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }

  static clearHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  static getBookmarks(): any[] {
    try {
      const data = localStorage.getItem(this.BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  static addBookmark(result: any): void {
    try {
      const bookmarks = this.getBookmarks();
      if (!bookmarks.find(b => b.url === result.url)) {
        const updatedBookmarks = [result, ...bookmarks].slice(0, 50);
        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  }

  static removeBookmark(url: string): void {
    try {
      const bookmarks = this.getBookmarks();
      const updatedBookmarks = bookmarks.filter(b => b.url !== url);
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }
}
