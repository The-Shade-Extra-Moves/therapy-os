import { Note, NoteFilters, NoteSearchOptions, SortOption } from '../types';

/**
 * Utility functions for note operations
 */

export const noteColors = {
  default: 'bg-background border-border',
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  green: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  red: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
  pink: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
  indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800',
  teal: 'bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800',
} as const;

export const generateNoteId = (): string => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createEmptyNote = (): Omit<Note, 'id'> => ({
  title: '',
  content: '',
  richContent: null,
  category: {
    id: 'general',
    name: 'General',
    color: '#6B7280',
    icon: 'FileText'
  },
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isPinned: false,
  isArchived: false,
  color: 'default',
  attachments: [],
  version: 1,
  history: [],
  fontFamily: 'inter',
  wordCount: 0,
  readingTime: 0,
  spellCheck: true,
  grammar: true
});

export const filterNotes = (notes: Note[], filters: NoteFilters): Note[] => {
  return notes.filter(note => {
    // Category filter
    if (filters.category && note.category.id !== filters.category) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        note.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Color filter
    if (filters.color && note.color !== filters.color) {
      return false;
    }

    // Pinned filter
    if (filters.isPinned !== undefined && note.isPinned !== filters.isPinned) {
      return false;
    }

    // Archived filter
    if (filters.isArchived !== undefined && note.isArchived !== filters.isArchived) {
      return false;
    }

    // Reminder filter
    if (filters.hasReminder !== undefined) {
      const hasReminder = !!note.reminder;
      if (hasReminder !== filters.hasReminder) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const noteDate = new Date(note.createdAt);
      if (noteDate < filters.dateRange.from || noteDate > filters.dateRange.to) {
        return false;
      }
    }

    return true;
  });
};

export const searchNotes = (notes: Note[], searchOptions: NoteSearchOptions): Note[] => {
  if (!searchOptions.query.trim()) return notes;

  const query = searchOptions.caseSensitive 
    ? searchOptions.query 
    : searchOptions.query.toLowerCase();

  return notes.filter(note => {
    const title = searchOptions.caseSensitive ? note.title : note.title.toLowerCase();
    const content = searchOptions.caseSensitive ? note.content : note.content.toLowerCase();
    const tags = note.tags.map(tag => searchOptions.caseSensitive ? tag : tag.toLowerCase());

    // Search in title (always enabled)
    if (title.includes(query)) return true;

    // Search in content
    if (searchOptions.searchInContent && content.includes(query)) return true;

    // Search in tags
    if (searchOptions.searchInTags && tags.some(tag => tag.includes(query))) return true;

    return false;
  });
};

export const sortNotes = (notes: Note[], sortOption: SortOption): Note[] => {
  const sortedNotes = [...notes];

  switch (sortOption) {
    case 'created-desc':
      return sortedNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'created-asc':
      return sortedNotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'updated-desc':
      return sortedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case 'updated-asc':
      return sortedNotes.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    case 'title-asc':
      return sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return sortedNotes.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sortedNotes;
  }
};

export const extractTextFromContent = (content: string, maxLength = 150): string => {
  // Remove markdown syntax for preview
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .trim();

  return plainText.length > maxLength 
    ? `${plainText.substring(0, maxLength)}...`
    : plainText;
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export const generateNoteExcerpt = (note: Note): string => {
  if (note.content.trim()) {
    return extractTextFromContent(note.content);
  }
  return 'No content';
};

export const validateNote = (note: Partial<Note>): string[] => {
  const errors: string[] = [];

  if (!note.title?.trim()) {
    errors.push('Title is required');
  }

  if (note.title && note.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (note.content && note.content.length > 50000) {
    errors.push('Content must be less than 50,000 characters');
  }

  if (note.tags && note.tags.length > 20) {
    errors.push('Maximum 20 tags allowed');
  }

  return errors;
};
