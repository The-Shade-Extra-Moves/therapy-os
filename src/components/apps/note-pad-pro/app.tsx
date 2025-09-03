import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Grid3X3, List, 
  Settings, Archive, Pin,
  FileText, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotes, useNotesFiltering } from './hooks/useNotes';
import { Note, NoteViewMode, SortOption } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';

export const NotePadPro: React.FC = () => {
  const { 
    notes, 
    isLoading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote, 
    duplicateNote,
    togglePin,
    toggleArchive 
  } = useNotes();

  const {
    filters,
    setFilters,
    searchOptions,
    setSearchOptions,
    sortOption,
    setSortOption,
    filteredAndSortedNotes,
    clearFilters
  } = useNotesFiltering(notes);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<NoteViewMode>('grid');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'archived'>('all');

  const handleCreateNote = useCallback(async () => {
    try {
      const newNote = await createNote();
      setSelectedNote(newNote);
      setIsEditorOpen(true);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [createNote]);

  const handleNoteSelect = useCallback((note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  }, []);

  const handleNoteUpdate = useCallback(async (noteId: string, updates: Partial<Note>) => {
    try {
      await updateNote(noteId, updates);
      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  }, [updateNote, selectedNote]);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    try {
      await deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditorOpen(false);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  }, [deleteNote, selectedNote]);

  const handleNoteDuplicate = useCallback(async (noteId: string) => {
    try {
      await duplicateNote(noteId);
    } catch (err) {
      console.error('Failed to duplicate note:', err);
    }
  }, [duplicateNote]);

  const getNotesToDisplay = () => {
    switch (activeTab) {
      case 'pinned':
        return filteredAndSortedNotes.pinned;
      case 'archived':
        return filteredAndSortedNotes.archived;
      default:
        return filteredAndSortedNotes.unpinned;
    }
  };

  const notesToDisplay = getNotesToDisplay();
  const hasActiveFilters = Object.keys(filters).length > 0 || searchOptions.query.trim();

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Notes</h3>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex">
      {/* Main Notes View */}
      <div className={`flex flex-col transition-all duration-300 ${
        isEditorOpen ? 'w-1/2' : 'w-full'
      }`}>
        {/* Header */}
        <div className="p-6 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                NotePad Pro
              </h1>
              <p className="text-sm text-muted-foreground">
                {notes.length} notes • {filteredAndSortedNotes.pinned.length} pinned
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNote} className="gap-2">
                <Plus className="w-4 h-4" />
                New Note
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchOptions.query}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, query: e.target.value }))}
                className="pl-9"
              />
            </div>
            
            <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated-desc">Recently Updated</SelectItem>
                <SelectItem value="created-desc">Recently Created</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchOptions.query && (
                <Badge variant="secondary">Search: "{searchOptions.query}"</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'all' | 'pinned' | 'archived')} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="gap-2">
                <FileText className="w-4 h-4" />
                All Notes
                {filteredAndSortedNotes.unpinned.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filteredAndSortedNotes.unpinned.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pinned" className="gap-2">
                <Pin className="w-4 h-4" />
                Pinned
                {filteredAndSortedNotes.pinned.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filteredAndSortedNotes.pinned.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-2">
                <Archive className="w-4 h-4" />
                Archived
                {filteredAndSortedNotes.archived.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filteredAndSortedNotes.archived.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Notes Grid/List */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto px-6 pb-6">
              <TabsContent value={activeTab} className="h-full mt-0">
                {isLoading ? (
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </div>
                ) : notesToDisplay.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {hasActiveFilters ? 'No notes match your filters' : 
                       activeTab === 'pinned' ? 'No pinned notes' :
                       activeTab === 'archived' ? 'No archived notes' : 'No notes yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters ? 'Try adjusting your search or filters' : 
                       'Create your first note to get started'}
                    </p>
                    {!hasActiveFilters && (
                      <Button onClick={handleCreateNote}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Note
                      </Button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    className={`grid gap-4 pb-4 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}
                    layout
                  >
                  <AnimatePresence>
                    {notesToDisplay.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        viewMode={viewMode}
                        isSelected={selectedNote?.id === note.id}
                        onClick={() => handleNoteSelect(note)}
                        onPin={() => togglePin(note.id)}
                        onArchive={() => toggleArchive(note.id)}
                        onDelete={() => handleNoteDelete(note.id)}
                        onDuplicate={() => handleNoteDuplicate(note.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Note Editor */}
      {isEditorOpen && selectedNote && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="w-1/2 border-l bg-background"
        >
          <NoteEditor
            note={selectedNote}
            onUpdate={(updates) => handleNoteUpdate(selectedNote.id, updates)}
            onClose={() => setIsEditorOpen(false)}
          />
        </motion.div>
      )}
    </div>
  );
};
