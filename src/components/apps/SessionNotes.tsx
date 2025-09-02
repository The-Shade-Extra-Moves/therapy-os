import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Plus, Search, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface Note {
  id: string;
  title: string;
  patient: string;
  date: string;
  content: string;
  tags: string[];
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Anxiety Session - Week 3',
    patient: 'Sarah Johnson',
    date: '2024-01-15',
    content: 'Patient showed significant improvement in managing anxiety triggers. We discussed coping strategies and practiced breathing exercises.',
    tags: ['anxiety', 'breathing', 'progress']
  },
  {
    id: '2',
    title: 'Initial Assessment',
    patient: 'Michael Chen',
    date: '2024-01-12',
    content: 'First session focused on understanding patient background and establishing treatment goals. Patient is motivated and engaged.',
    tags: ['assessment', 'goals', 'initial']
  }
];

export const SessionNotes: React.FC = () => {
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState('');

  const filteredNotes = mockNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (selectedNote) {
      // Update note logic here
      setSelectedNote({ ...selectedNote, content: editContent });
      setIsEditing(false);
    }
  };

  return (
    <div className="h-full bg-card/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Notes List */}
        <div className="w-1/3 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center space-x-2 mb-3">
              <h2 className="text-lg font-semibold text-foreground">Session Notes</h2>
              <Button size="sm" className="ml-auto">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                className={`p-4 border-b border-border/30 cursor-pointer transition-colors ${
                  selectedNote?.id === note.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground line-clamp-1">{note.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{note.patient}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{note.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{note.tags.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <motion.div
              key={selectedNote.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full"
            >
              {/* Note Header */}
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedNote.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{selectedNote.patient}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedNote.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveNote}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleEditNote(selectedNote)}>
                        Edit Note
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 p-6">
                {isEditing ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full resize-none text-base leading-relaxed"
                    placeholder="Write your session notes here..."
                  />
                ) : (
                  <Card className="p-6 h-full glass-surface">
                    <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                      {selectedNote.content}
                    </div>
                  </Card>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a note to view or edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};