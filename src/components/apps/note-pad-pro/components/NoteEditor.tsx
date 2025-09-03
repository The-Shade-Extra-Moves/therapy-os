import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Save, Pin, Tag, Palette, Bell, Type, Brain, GitBranch, 
  Paperclip, Download, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Note, NoteColor, FontFamily, ExportFormat, Attachment, NoteVersion } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { AIAssistance } from './AIAssistance';
import { VersionControl } from './VersionControl';
import { MediaAttachments } from './MediaAttachments';
import { ExportService } from '../utils/exportService';
import { SavingIndicator, SaveButton } from './SavingIndicator';
import { ConfirmationModal } from './ConfirmationModal';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdate,
  onClose
}) => {
  // State that updates when note prop changes
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [reminder, setReminder] = useState<Date | undefined>(undefined);
  const [fontFamily, setFontFamily] = useState<FontFamily>('inter');
  const [useRichText, setUseRichText] = useState(false);
  const [spellCheck, setSpellCheck] = useState(true);
  const [grammar, setGrammar] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // UI state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  // Update local state when note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setRichContent(note.richContent || null);
    setTags(note.tags);
    setColor(note.color || 'default');
    setReminder(note.reminder ? new Date(note.reminder) : undefined);
    setFontFamily(note.fontFamily || 'inter');
    setUseRichText(!!note.richContent);
    setSpellCheck(note.spellCheck ?? true);
    setGrammar(note.grammar ?? true);
    setAttachments(note.attachments || []);
    setHasUnsavedChanges(false);
  }, [note.id]); // Only update when note ID changes

  // Calculate word count and reading time
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words/minute

  // Track changes for unsaved indicator
  useEffect(() => {
    const hasChanges = 
      title !== note.title ||
      content !== note.content ||
      JSON.stringify(richContent) !== JSON.stringify(note.richContent) ||
      JSON.stringify(tags) !== JSON.stringify(note.tags) ||
      color !== (note.color || 'default') ||
      fontFamily !== (note.fontFamily || 'inter') ||
      spellCheck !== (note.spellCheck ?? true) ||
      grammar !== (note.grammar ?? true) ||
      JSON.stringify(attachments) !== JSON.stringify(note.attachments || []) ||
      reminder?.getTime() !== note.reminder?.getTime();
    
    setHasUnsavedChanges(hasChanges);
  }, [title, content, richContent, tags, color, fontFamily, spellCheck, grammar, attachments, reminder, note]);

  const handleSave = useCallback(async () => {
    setSavingStatus('saving');
    
    try {
      // Simulate async save
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onUpdate({
        title: title.trim() || 'Untitled',
        content,
        richContent,
        tags,
        color,
        reminder,
        fontFamily,
        spellCheck,
        grammar,
        attachments,
        wordCount,
        readingTime,
        updatedAt: new Date(),
      });
      
      setSavingStatus('saved');
      setHasUnsavedChanges(false);
      
      // Clear saved status after 2 seconds
      setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (error) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus('idle'), 3000);
    }
  }, [title, content, richContent, tags, color, reminder, fontFamily, spellCheck, grammar, attachments, wordCount, readingTime, onUpdate]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleContentChange = useCallback((newContent: string, newRichContent?: any) => {
    setContent(newContent);
    if (newRichContent && useRichText) {
      setRichContent(newRichContent);
    }
  }, [useRichText]);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      await ExportService.exportNote({
        ...note,
        title,
        content,
        richContent,
        tags,
        color,
        reminder,
        fontFamily,
        spellCheck,
        wordCount,
        readingTime,
      }, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [note, title, content, richContent, tags, color, reminder, fontFamily, spellCheck, wordCount, readingTime]);

  const handleAddAttachment = useCallback((attachment: Omit<Attachment, 'id'>) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: `attachment-${Date.now()}-${Math.random()}`
    };
    setAttachments(prev => [...prev, newAttachment]);
    setHasUnsavedChanges(true);
  }, []);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    setHasUnsavedChanges(true);
  }, []);

  const handleRevertToVersion = useCallback((version: NoteVersion) => {
    setTitle(version.title);
    setContent(version.content);
    if (version.richContent) {
      setRichContent(version.richContent);
      setUseRichText(true);
    }
    setHasUnsavedChanges(true);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const hasChanges = 
      title !== note.title ||
      content !== note.content ||
      JSON.stringify(tags) !== JSON.stringify(note.tags) ||
      color !== note.color ||
      reminder?.getTime() !== note.reminder?.getTime();

    setHasUnsavedChanges(hasChanges);

    if (hasChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
    
    return undefined;
  }, [title, content, tags, color, reminder, note, handleSave]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const colorOptions: { value: NoteColor; label: string; class: string }[] = [
    { value: 'default', label: 'Default', class: 'bg-background' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-100' },
    { value: 'green', label: 'Green', class: 'bg-green-100' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-100' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-100' },
    { value: 'red', label: 'Red', class: 'bg-red-100' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-100' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-100' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-100' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-background"
    >
      {/* Header */}
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
            <SavingIndicator status={savingStatus} />
            <Badge variant="outline" className="text-xs">
              v{note.version} • {wordCount} words • {readingTime}min read
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <SaveButton
              onSave={handleSave}
              isSaving={savingStatus === 'saving'}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdate({ isPinned: !note.isPinned })}
              className={note.isPinned ? 'text-primary' : ''}
            >
              <Pin className="w-4 h-4" />
            </Button>

            {/* Export Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('pdf')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('docx')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as DOCX
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('markdown')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Markdown
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('html')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as HTML
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('txt')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Text
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Enhanced Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="rich-text" className="text-sm">Rich Text:</Label>
            <Switch
              id="rich-text"
              checked={useRichText}
              onCheckedChange={setUseRichText}
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Font Family */}
          <Select value={fontFamily} onValueChange={(value: FontFamily) => setFontFamily(value)}>
            <SelectTrigger className="w-32">
              <Type className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="noto-sans">Noto Sans</SelectItem>
              <SelectItem value="sf-pro">SF Pro</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
            </SelectContent>
          </Select>

          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Palette className="w-4 h-4" />
                Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    className={`
                      w-8 h-8 rounded border-2 transition-all
                      ${option.class}
                      ${color === option.value ? 'border-primary' : 'border-border'}
                    `}
                    onClick={() => setColor(option.value)}
                    title={option.label}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reminder */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                Reminder
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={reminder}
                onSelect={setReminder}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Writing Assistance */}
          <div className="flex items-center gap-2">
            <Label htmlFor="spell-check" className="text-sm">Spell:</Label>
            <Switch
              id="spell-check"
              checked={spellCheck}
              onCheckedChange={setSpellCheck}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="grammar" className="text-sm">Grammar:</Label>
            <Switch
              id="grammar"
              checked={grammar}
              onCheckedChange={setGrammar}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Title */}
          <div className="p-4 border-b">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Tags */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Tabbed Content Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Files ({attachments.length})
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Assist
                </TabsTrigger>
                <TabsTrigger value="versions">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Versions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 p-4">
                {useRichText ? (
                  <RichTextEditor
                    content={content}
                    richContent={richContent}
                    onChange={handleContentChange}
                    onSave={handleSave}
                    fontFamily={fontFamily}
                    spellCheck={spellCheck}
                    placeholder="Start writing your note..."
                    className="h-full"
                  />
                ) : (
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start writing your note..."
                    className="w-full h-full resize-none border-none px-0 focus-visible:ring-0 text-base leading-relaxed"
                    onKeyPress={handleKeyPress}
                    spellCheck={spellCheck}
                  />
                )}
              </TabsContent>

              <TabsContent value="attachments" className="flex-1 p-4">
                <MediaAttachments
                  attachments={attachments}
                  onAddAttachment={handleAddAttachment}
                  onRemoveAttachment={handleRemoveAttachment}
                />
              </TabsContent>

              <TabsContent value="ai" className="flex-1 p-4">
                <AIAssistance
                  note={{
                    ...note,
                    title,
                    content,
                    richContent,
                    tags,
                    color,
                    reminder,
                    fontFamily,
                    spellCheck,
                    grammar,
                    attachments,
                    wordCount,
                    readingTime,
                  }}
                  onUpdateNote={(updates) => {
                    if (updates.title !== undefined) setTitle(updates.title);
                    if (updates.content !== undefined) setContent(updates.content);
                    if (updates.richContent !== undefined) setRichContent(updates.richContent);
                    if (updates.tags !== undefined) setTags(updates.tags);
                    if (updates.aiSummary !== undefined) {
                      onUpdate({ aiSummary: updates.aiSummary });
                    }
                    setHasUnsavedChanges(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="versions" className="flex-1 p-4">
                <VersionControl
                  note={{
                    ...note,
                    title,
                    content,
                    richContent,
                    tags,
                    color,
                    reminder,
                    fontFamily,
                    spellCheck,
                    grammar,
                    attachments,
                    wordCount,
                    readingTime,
                  }}
                  onUpdateNote={onUpdate}
                  onRevertToVersion={handleRevertToVersion}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Side Preview (when enabled) */}
        {showPreview && (
          <div className="w-1/2 border-l bg-muted/30">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Preview</h3>
            </div>
            <div className="p-4">
              <h1 className="text-xl font-bold mb-4">{title || 'Untitled'}</h1>
              {useRichText ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t bg-muted/50 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>Created: {note.createdAt.toLocaleDateString()}</span>
            <span>Updated: {note.updatedAt.toLocaleDateString()}</span>
            <span>Category: {note.category?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{content.length} characters</span>
            <span>{wordCount} words</span>
            <span>{readingTime}min read</span>
            {attachments && attachments.length > 0 && <span>{attachments.length} attachments</span>}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={() => {
          setShowConfirmClose(false);
          onClose();
        }}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close this note? Your changes will be lost."
        confirmText="Close without saving"
        cancelText="Keep editing"
        variant="destructive"
      />
    </motion.div>
  );
};
