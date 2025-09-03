export interface Note {
  id: string;
  title: string;
  content: string;
  richContent?: any; // Tiptap JSON content
  category: NoteCategory;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isArchived: boolean;
  color?: NoteColor;
  reminder?: Date;
  sharedWith?: string[];
  attachments?: Attachment[];
  version: number;
  history: NoteVersion[];
  aiSummary?: string;
  fontFamily?: FontFamily;
  wordCount?: number;
  readingTime?: number;
  spellCheck?: boolean;
  grammar?: boolean;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  content: string;
  richContent?: any;
  createdAt: Date;
  changes?: string;
  author?: string;
  commitMessage?: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'file';
  url: string;
  size: number;
  uploadedAt: Date;
  thumbnail?: string;
  duration?: number; // for audio/video
  mimeType?: string;
}

export type FontFamily = 
  | 'inter'
  | 'roboto'
  | 'noto-sans'
  | 'sf-pro'
  | 'system'
  | 'serif'
  | 'mono';

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'html' | 'markdown';

export type NoteColor = 
  | 'default'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'pink'
  | 'indigo'
  | 'teal';

export type NoteViewMode = 'list' | 'grid' | 'compact';

export type SortOption = 
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'title-asc'
  | 'title-desc';

export interface NoteFilters {
  category?: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
  isArchived?: boolean;
  hasReminder?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface NoteSearchOptions {
  query: string;
  searchInContent: boolean;
  searchInTags: boolean;
  caseSensitive: boolean;
}

export interface NoteSettings {
  defaultCategory: string;
  defaultColor: NoteColor;
  autoSave: boolean;
  autoSaveInterval: number;
  showPreview: boolean;
  enableMarkdown: boolean;
  enableRichText: boolean;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: FontFamily;
  theme: 'light' | 'dark' | 'auto';
  spellCheck: boolean;
  grammar: boolean;
  aiAssistance: boolean;
  versionControl: boolean;
}

export interface AIAssistanceOptions {
  autoSummarize: boolean;
  suggestPrompts: boolean;
  detectPatterns: boolean;
  autoComplete: boolean;
  grammarCheck: boolean;
  styleImprovement: boolean;
}

export interface EditorState {
  isRecording: boolean;
  recordingTime: number;
  selectedText: string;
  cursorPosition: number;
  undoStack: any[];
  redoStack: any[];
}

export interface NoteStats {
  totalNotes: number;
  pinnedNotes: number;
  archivedNotes: number;
  notesWithReminders: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
}
