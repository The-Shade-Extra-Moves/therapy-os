import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note, NoteFilters, NoteSearchOptions, SortOption, NoteSettings } from '../types';
import { filterNotes, searchNotes, sortNotes, generateNoteId, createEmptyNote } from '../utils/noteUtils';

// Mock data for development - replace with real API calls
const createMockNotes = (): Note[] => [
  // Note 1 - Simple Project Ideas
  {
    id: 'note_1',
    title: 'Project Ideas',
    content: 'Brainstorming new project concepts:\n\n1. Task management app\n2. Recipe organizer\n3. Fitness tracker\n\nNeed to research market demand for each.',
    richContent: null,
    category: { id: 'work', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
    tags: ['brainstorming', 'projects', 'ideas'],
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T14:20:00'),
    isPinned: true,
    isArchived: false,
    color: 'blue',
    attachments: [],
    version: 1,
    history: [],
    fontFamily: 'inter',
    wordCount: 28,
    readingTime: 1,
    spellCheck: true,
    grammar: true
  },

  // Note 2 - Meeting Notes with History
  {
    id: 'note_2',
    title: 'Meeting Notes - Q1 Planning',
    content: '<h2>Q1 Planning Meeting</h2><p><strong>Date:</strong> January 14, 2024</p><p><strong>Attendees:</strong> Sarah, Mike, Jennifer, Alex</p><h3>Key Decisions:</h3><ul><li>Budget approval for new tools ($50,000)</li><li>Team expansion timeline (Q2 2024)</li><li>Product roadmap priorities</li></ul><blockquote><p>Focus on user experience improvements in Q1</p></blockquote><h3>Action Items:</h3><ol><li>Schedule follow-up with stakeholders</li><li>Prepare budget breakdown</li><li>Create hiring timeline</li></ol>',
    richContent: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Q1 Planning Meeting' }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Date:' }, { type: 'text', text: ' January 14, 2024' }] }
      ]
    },
    category: { id: 'work', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
    tags: ['meeting', 'planning', 'q1', 'budget'],
    createdAt: new Date('2024-01-14T09:00:00'),
    updatedAt: new Date('2024-01-14T16:45:00'),
    isPinned: false,
    isArchived: false,
    color: 'default',
    reminder: new Date('2024-01-21T09:00:00'),
    attachments: [
      {
        id: 'att_1',
        name: 'Q1_Budget_Draft.pdf',
        type: 'file',
        url: 'blob:example-url-1',
        size: 245760,
        uploadedAt: new Date('2024-01-14T10:15:00'),
        mimeType: 'application/pdf'
      }
    ],
    version: 3,
    history: [
      {
        id: 'v2',
        noteId: 'note_2',
        version: 2,
        title: 'Meeting Notes - Q1 Planning',
        content: 'Added action items and budget details...',
        createdAt: new Date('2024-01-14T14:30:00'),
        commitMessage: 'Added action items and budget details'
      },
      {
        id: 'v1',
        noteId: 'note_2',
        version: 1,
        title: 'Meeting Notes - Q1 Planning',
        content: 'Initial meeting notes...',
        createdAt: new Date('2024-01-14T09:00:00'),
        commitMessage: 'Initial draft'
      }
    ],
    fontFamily: 'inter',
    wordCount: 85,
    readingTime: 2,
    spellCheck: true,
    grammar: true,
    aiSummary: 'Q1 planning meeting covering $50k budget approval, Q2 team expansion, and product roadmap priorities with focus on UX improvements.'
  },

  // Note 3 - Reading List with Emojis
  {
    id: 'note_3',
    title: 'Reading List 2024',
    content: '<h1>📚 Reading List 2024</h1><h2>🎯 Currently Reading</h2><ul><li><strong>Project Hail Mary</strong> by Andy Weir</li><li><em>Progress:</em> 65% complete</li></ul><h2>📖 Fiction Queue</h2><ul><li>The Seven Husbands of Evelyn Hugo</li><li>Klara and the Sun</li><li>The Midnight Library</li></ul><h2>🧠 Non-Fiction Queue</h2><ul><li><mark>Atomic Habits</mark> (Priority read)</li><li>The Psychology of Money</li><li>Thinking, Fast and Slow</li></ul><h2>📝 Notes</h2><blockquote><p>Focus on books that improve productivity and mindset in Q1</p></blockquote>',
    richContent: null,
    category: { id: 'personal', name: 'Personal', color: '#10B981', icon: 'User' },
    tags: ['books', 'reading', 'personal-growth', '2024-goals'],
    createdAt: new Date('2024-01-12T19:15:00'),
    updatedAt: new Date('2024-01-16T20:30:00'),
    isPinned: true,
    isArchived: false,
    color: 'green',
    attachments: [],
    version: 2,
    history: [
      {
        id: 'v1',
        noteId: 'note_3',
        version: 1,
        title: 'Reading List',
        content: 'Initial reading list...',
        createdAt: new Date('2024-01-12T19:15:00'),
        commitMessage: 'Initial reading list'
      }
    ],
    fontFamily: 'serif',
    wordCount: 65,
    readingTime: 2,
    spellCheck: true,
    grammar: true
  },

  // Note 4 - Recipe with Rich Formatting
  {
    id: 'note_4',
    title: 'Recipe: Chicken Tikka Masala',
    content: '<h1>🍛 Chicken Tikka Masala</h1><p><em>Prep time: 30 min | Cook time: 45 min | Serves: 4</em></p><h2>🛒 Ingredients</h2><h3>For the Chicken:</h3><ul><li>2 lbs chicken breast, cubed</li><li>1 cup plain yogurt</li><li>2 tsp garam masala</li><li>1 tsp turmeric</li><li>1 tsp cumin</li><li>Salt to taste</li></ul><h3>For the Sauce:</h3><ul><li>1 cup heavy cream</li><li>2 cans (14 oz) tomato sauce</li><li>1 onion, diced</li><li>4 garlic cloves, minced</li><li>1 inch ginger, grated</li></ul><h2>👨‍🍳 Instructions</h2><ol><li><strong>Marinate:</strong> Mix chicken with yogurt and spices for 2 hours</li><li><strong>Cook chicken:</strong> Pan-fry until golden brown</li><li><strong>Make sauce:</strong> Sauté onions, add tomato sauce and cream</li><li><strong>Combine:</strong> Add chicken to sauce, simmer 20 minutes</li><li><strong>Serve:</strong> With basmati rice and naan bread</li></ol><blockquote><p>💡 <strong>Chef\'s Tip:</strong> Add a pinch of sugar to balance the acidity of tomatoes</p></blockquote>',
    richContent: null,
    category: { id: 'recipes', name: 'Recipes', color: '#F59E0B', icon: 'ChefHat' },
    tags: ['indian', 'chicken', 'dinner', 'comfort-food'],
    createdAt: new Date('2024-01-10T16:45:00'),
    updatedAt: new Date('2024-01-10T17:00:00'),
    isPinned: false,
    isArchived: false,
    color: 'orange',
    attachments: [
      {
        id: 'att_2',
        name: 'chicken_tikka_final.jpg',
        type: 'image',
        url: 'blob:example-url-2',
        size: 156700,
        uploadedAt: new Date('2024-01-10T17:00:00'),
        thumbnail: 'blob:example-url-2',
        mimeType: 'image/jpeg'
      }
    ],
    version: 1,
    history: [],
    fontFamily: 'inter',
    wordCount: 128,
    readingTime: 3,
    spellCheck: true,
    grammar: true
  },

  // Note 5 - COMPREHENSIVE NOTE with ALL FEATURES
  {
    id: 'note_5',
    title: 'Complete Therapy Session Analysis - Client Case Study',
    content: '<h1>🧠 Comprehensive Therapy Session Analysis</h1><p><strong>Client ID:</strong> TC-2024-001 | <strong>Session #:</strong> 12 | <strong>Date:</strong> January 18, 2024</p><p><mark style="background-color: #ffeb3b;">⚠️ CONFIDENTIAL - Protected Health Information</mark></p><hr><h2>📋 Session Overview</h2><p><strong>Duration:</strong> 50 minutes<br><strong>Session Type:</strong> Individual Cognitive Behavioral Therapy<br><strong>Modality:</strong> In-person<br><strong>Primary Focus:</strong> Anxiety management and cognitive restructuring</p><h2>🎯 Treatment Goals Progress</h2><ol><li><strong>Reduce anxiety symptoms</strong> - ✅ <em>Significant improvement noted</em></li><li><strong>Develop coping strategies</strong> - 🔄 <em>In progress, good engagement</em></li><li><strong>Improve sleep quality</strong> - ⚠️ <em>Some improvement, needs more work</em></li></ol><h2>🗣️ Session Content</h2><h3>Opening Check-in (10 minutes)</h3><ul><li>Client reported <mark>improved mood</mark> since last session</li><li>Sleep quality: 6/10 (improvement from 4/10)</li><li>Anxiety levels: 4/10 daily average (down from 7/10)</li></ul><h3>Therapeutic Interventions (30 minutes)</h3><blockquote><p><strong>CBT Technique:</strong> Thought Record Exercise</p><p>Worked on identifying and challenging negative automatic thoughts related to work performance.</p></blockquote><ol><li><strong>Thought identification:</strong> "I always mess things up at work"</li><li><strong>Evidence examination:</strong> Listed recent successes and achievements</li><li><strong>Balanced thought:</strong> "Sometimes I make mistakes, but I also have many successes"</li></ol><h3>Homework Assignment</h3><ul><li>📝 Complete daily thought records</li><li>🧘‍♀️ Practice progressive muscle relaxation (15 min/day)</li><li>📱 Use anxiety tracking app</li></ul><h2>📊 Clinical Observations</h2><table><tr><th>Domain</th><th>Rating (1-10)</th><th>Notes</th></tr><tr><td>Mood</td><td>7</td><td>Noticeably brighter affect</td></tr><tr><td>Anxiety</td><td>4</td><td>Significant reduction</td></tr><tr><td>Engagement</td><td>9</td><td>Highly motivated and participatory</td></tr><tr><td>Insight</td><td>8</td><td>Growing self-awareness</td></tr></table><h2>🎨 Mindfulness Exercise</h2><blockquote><p><em>"Take a moment to notice five things you can see, four things you can hear, three things you can touch, two things you can smell, and one thing you can taste."</em></p><p>Client responded well to grounding technique, reported immediate calming effect.</p></blockquote><h2>🔍 Risk Assessment</h2><ul><li><strong>Suicidal ideation:</strong> ❌ None reported</li><li><strong>Self-harm:</strong> ❌ No current behaviors</li><li><strong>Substance use:</strong> ❌ No concerns</li><li><strong>Safety plan:</strong> ✅ Current and reviewed</li></ul><h2>📈 Treatment Plan Updates</h2><ol><li>Continue weekly CBT sessions</li><li>Introduce mindfulness-based interventions</li><li>Consider sleep hygiene consultation</li><li>Schedule psychiatric consultation for medication review</li></ol><h2>🧩 Integration with Other Treatment</h2><p>Coordinating with:</p><ul><li><strong>Psychiatrist:</strong> Dr. Smith - next appointment 1/25/24</li><li><strong>Primary Care:</strong> Annual physical scheduled</li><li><strong>Support Groups:</strong> Anxiety support group Wednesdays</li></ul><h2>💭 Therapist Reflections</h2><blockquote><p>Client showing remarkable progress in developing insight and applying CBT techniques. The reduction in anxiety symptoms is encouraging. Need to address sleep issues more directly in upcoming sessions. Consider incorporating more somatic interventions.</p></blockquote><h2>📅 Next Session Planning</h2><ul><li><strong>Date:</strong> January 25, 2024</li><li><strong>Goals:</strong> Review homework, sleep hygiene education, relaxation training</li><li><strong>Materials needed:</strong> Sleep diary template, relaxation audio</li></ul><hr><p><small><em>Session documented by: Dr. Jane Thompson, LCSW<br>Date of documentation: January 18, 2024<br>Review date: January 25, 2024</em></small></p>',
    richContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            { type: 'text', text: '🧠 Comprehensive Therapy Session Analysis' }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Client ID:' },
            { type: 'text', text: ' TC-2024-001 | ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Session #:' },
            { type: 'text', text: ' 12' }
          ]
        }
      ]
    },
    category: { id: 'therapy', name: 'Therapy Notes', color: '#8B5CF6', icon: 'Brain' },
    tags: ['cbt', 'anxiety', 'progress-notes', 'confidential', 'client-tc001'],
    createdAt: new Date('2024-01-18T15:30:00'),
    updatedAt: new Date('2024-01-18T18:45:00'),
    isPinned: true,
    isArchived: false,
    color: 'purple',
    reminder: new Date('2024-01-25T14:00:00'),
    attachments: [
      {
        id: 'att_3',
        name: 'session_12_audio_notes.mp3',
        type: 'audio',
        url: 'blob:example-url-3',
        size: 2456789,
        uploadedAt: new Date('2024-01-18T16:00:00'),
        duration: 180,
        mimeType: 'audio/mpeg'
      },
      {
        id: 'att_4',
        name: 'thought_record_worksheet.pdf',
        type: 'file',
        url: 'blob:example-url-4',
        size: 345678,
        uploadedAt: new Date('2024-01-18T16:15:00'),
        mimeType: 'application/pdf'
      },
      {
        id: 'att_5',
        name: 'client_progress_chart.png',
        type: 'image',
        url: 'blob:example-url-5',
        size: 234567,
        uploadedAt: new Date('2024-01-18T17:00:00'),
        thumbnail: 'blob:example-url-5',
        mimeType: 'image/png'
      },
      {
        id: 'att_6',
        name: 'relaxation_exercise_video.mp4',
        type: 'video',
        url: 'blob:example-url-6',
        size: 15678900,
        uploadedAt: new Date('2024-01-18T17:30:00'),
        duration: 900,
        mimeType: 'video/mp4'
      }
    ],
    version: 5,
    history: [
      {
        id: 'v4',
        noteId: 'note_5',
        version: 4,
        title: 'Complete Therapy Session Analysis - Client Case Study',
        content: 'Added risk assessment and treatment plan updates...',
        createdAt: new Date('2024-01-18T17:45:00'),
        commitMessage: 'Added comprehensive risk assessment and updated treatment plan',
        author: 'Dr. Jane Thompson'
      },
      {
        id: 'v3',
        noteId: 'note_5',
        version: 3,
        title: 'Therapy Session Analysis - Client Case Study',
        content: 'Added clinical observations and mindfulness exercise details...',
        createdAt: new Date('2024-01-18T17:00:00'),
        commitMessage: 'Enhanced with clinical observations and mindfulness content',
        author: 'Dr. Jane Thompson'
      },
      {
        id: 'v2',
        noteId: 'note_5',
        version: 2,
        title: 'Session Notes - TC-001',
        content: 'Added therapeutic interventions and homework assignment...',
        createdAt: new Date('2024-01-18T16:30:00'),
        commitMessage: 'Detailed therapeutic interventions and assignments',
        author: 'Dr. Jane Thompson'
      },
      {
        id: 'v1',
        noteId: 'note_5',
        version: 1,
        title: 'Session 12 - Initial Notes',
        content: 'Basic session overview and check-in notes...',
        createdAt: new Date('2024-01-18T15:30:00'),
        commitMessage: 'Initial session documentation',
        author: 'Dr. Jane Thompson'
      }
    ],
    fontFamily: 'inter',
    wordCount: 456,
    readingTime: 8,
    spellCheck: true,
    grammar: true,
    aiSummary: 'Comprehensive therapy session #12 for client TC-2024-001 showing significant progress in anxiety management through CBT techniques. Key improvements in mood (7/10) and anxiety reduction (4/10 from 7/10). Sleep quality remains an area for continued focus. Client demonstrates high engagement and growing insight. Treatment plan updated to include mindfulness interventions and sleep hygiene focus.'
  }
];

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockNotes = createMockNotes();
        setNotes(mockNotes);
        setError(null);
      } catch (err) {
        setError('Failed to load notes');
        console.error('Error loading notes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const createNote = useCallback(async (noteData: Partial<Note> = {}): Promise<Note> => {
    try {
      const newNote: Note = {
        id: generateNoteId(),
        ...createEmptyNote(),
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      throw err;
    }
  }, []);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>): Promise<void> => {
    try {
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      ));
    } catch (err) {
      setError('Failed to update note');
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    try {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      setError('Failed to delete note');
      throw err;
    }
  }, []);

  const duplicateNote = useCallback(async (noteId: string): Promise<Note> => {
    const originalNote = notes.find(note => note.id === noteId);
    if (!originalNote) throw new Error('Note not found');

    return createNote({
      ...originalNote,
      title: `${originalNote.title} (Copy)`,
      isPinned: false
    });
  }, [notes, createNote]);

  const togglePin = useCallback(async (noteId: string): Promise<void> => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      await updateNote(noteId, { isPinned: !note.isPinned });
    }
  }, [notes, updateNote]);

  const toggleArchive = useCallback(async (noteId: string): Promise<void> => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      await updateNote(noteId, { isArchived: !note.isArchived });
    }
  }, [notes, updateNote]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePin,
    toggleArchive
  };
};

export const useNotesFiltering = (notes: Note[]) => {
  const [filters, setFilters] = useState<NoteFilters>({});
  const [searchOptions, setSearchOptions] = useState<NoteSearchOptions>({
    query: '',
    searchInContent: true,
    searchInTags: true,
    caseSensitive: false
  });
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');

  const filteredAndSortedNotes = useMemo(() => {
    let result = notes;
    
    // Apply filters
    result = filterNotes(result, filters);
    
    // Apply search
    result = searchNotes(result, searchOptions);
    
    // Apply sorting
    result = sortNotes(result, sortOption);
    
    // Separate pinned notes
    const pinnedNotes = result.filter(note => note.isPinned && !note.isArchived);
    const unpinnedNotes = result.filter(note => !note.isPinned && !note.isArchived);
    const archivedNotes = result.filter(note => note.isArchived);
    
    return {
      all: result,
      pinned: pinnedNotes,
      unpinned: unpinnedNotes,
      archived: archivedNotes
    };
  }, [notes, filters, searchOptions, sortOption]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchOptions(prev => ({ ...prev, query: '' }));
  }, []);

  return {
    filters,
    setFilters,
    searchOptions,
    setSearchOptions,
    sortOption,
    setSortOption,
    filteredAndSortedNotes,
    clearFilters
  };
};

export const useNoteSettings = () => {
  const [settings, setSettings] = useState<NoteSettings>({
    defaultCategory: 'general',
    defaultColor: 'default',
    autoSave: true,
    autoSaveInterval: 2000,
    showPreview: true,
    enableMarkdown: true,
    enableRichText: true,
    fontSize: 'medium',
    fontFamily: 'inter',
    theme: 'auto',
    spellCheck: true,
    grammar: true,
    aiAssistance: true,
    versionControl: true
  });

  const updateSettings = useCallback((updates: Partial<NoteSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    settings,
    updateSettings
  };
};
