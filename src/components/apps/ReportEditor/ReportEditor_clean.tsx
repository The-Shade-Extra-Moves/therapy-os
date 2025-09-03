import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeBlock from '@tiptap/extension-code-block';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, ListChecks, Quote, Minus,
  Undo, Redo, Save, Image as ImageIcon, 
  Table as TableIcon, Link as LinkIcon, Bot, Share, 
  Type, AlignLeft, AlignCenter, AlignRight,
  Download, Eye, Plus, Printer,
  Heading1, Heading2, Heading3, 
  Highlighter, RotateCcw
} from 'lucide-react';

export const ReportEditor: React.FC = () => {
  const [activeDocument, setActiveDocument] = useState('report-1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  
  const [documents, setDocuments] = useState([
    { 
      id: 'report-1', 
      title: 'Session Report - John Doe', 
      patient: 'John Doe', 
      date: '2024-01-15',
      type: 'session-report',
      content: `
        <h1>Therapy Session Report</h1>
        <p><strong>Patient:</strong> John Doe</p>
        <p><strong>Date:</strong> January 15, 2024</p>
        <p><strong>Session Duration:</strong> 60 minutes</p>
        
        <h2>Session Overview</h2>
        <p>Today's session focused on cognitive behavioral therapy techniques for anxiety management. The patient showed significant improvement in identifying trigger patterns.</p>
        
        <h2>Progress Notes</h2>
        <ul>
          <li>Completed anxiety scale assessment (score: 6/10)</li>
          <li>Practiced breathing exercises</li>
          <li>Discussed homework assignments</li>
        </ul>
        
        <h2>Treatment Goals</h2>
        <p>Continue working on anxiety reduction strategies and improve coping mechanisms.</p>
      `
    },
    { 
      id: 'report-2', 
      title: 'Progress Assessment - Jane Smith', 
      patient: 'Jane Smith', 
      date: '2024-01-14',
      type: 'progress-assessment',
      content: `
        <h1>Progress Assessment Report</h1>
        <p><strong>Patient:</strong> Jane Smith</p>
        <p><strong>Assessment Date:</strong> January 14, 2024</p>
        
        <h2>Assessment Summary</h2>
        <p>Significant improvement in mood stability and social interactions over the past month.</p>
      `
    }
  ]);

  const currentDocument = documents.find(doc => doc.id === activeDocument);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({ 
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Strike,
      CodeBlock.configure({
        languageClassPrefix: 'language-',
      }),
    ],
    content: currentDocument?.content || '',
    editorProps: {
      attributes: {
        class: 'min-h-[500px] p-4 focus:outline-none prose prose-sm max-w-none',
      },
    },
  });

  // Update editor content when switching documents
  React.useEffect(() => {
    if (editor && currentDocument) {
      editor.commands.setContent(currentDocument.content);
    }
  }, [activeDocument, editor, currentDocument]);

  // Colors for text and highlighting
  const textColors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', 
    '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const highlightColors = [
    '#FEF3C7', '#FECACA', '#FED7D7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FCE7F3', '#F9FAFB', '#FEF2F2'
  ];

  // Helper functions
  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  const saveDocument = useCallback(() => {
    if (editor && currentDocument) {
      const content = editor.getHTML();
      setDocuments(prev => prev.map(doc => 
        doc.id === activeDocument 
          ? { ...doc, content }
          : doc
      ));
      toast.success('Document saved successfully!');
    }
  }, [editor, currentDocument, activeDocument]);

  const exportDocument = useCallback(() => {
    if (editor && currentDocument) {
      const content = editor.getHTML();
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDocument.title}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Document exported successfully!');
    }
  }, [editor, currentDocument]);

  const formatButton = (action: () => void, icon: React.ReactNode, isActive?: boolean) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={action}
      className={`h-8 w-8 p-0 ${isActive ? 'bg-accent' : ''}`}
    >
      {icon}
    </Button>
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        {/* File Operations */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={saveDocument}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={exportDocument}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Formatting Tools */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().undo().run(),
            <Undo className="h-4 w-4" />,
            false
          )}
          {formatButton(
            () => editor.chain().focus().redo().run(),
            <RotateCcw className="h-4 w-4" />,
            false
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().toggleBold().run(),
            <Bold className="h-4 w-4" />,
            editor.isActive('bold')
          )}
          {formatButton(
            () => editor.chain().focus().toggleItalic().run(),
            <Italic className="h-4 w-4" />,
            editor.isActive('italic')
          )}
          {formatButton(
            () => editor.chain().focus().toggleUnderline().run(),
            <UnderlineIcon className="h-4 w-4" />,
            editor.isActive('underline')
          )}
          {formatButton(
            () => editor.chain().focus().toggleStrike().run(),
            <Strikethrough className="h-4 w-4" />,
            editor.isActive('strike')
          )}
          {formatButton(
            () => editor.chain().focus().toggleCode().run(),
            <Code className="h-4 w-4" />,
            editor.isActive('code')
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            <Heading1 className="h-4 w-4" />,
            editor.isActive('heading', { level: 1 })
          )}
          {formatButton(
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            <Heading2 className="h-4 w-4" />,
            editor.isActive('heading', { level: 2 })
          )}
          {formatButton(
            () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            <Heading3 className="h-4 w-4" />,
            editor.isActive('heading', { level: 3 })
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().setTextAlign('left').run(),
            <AlignLeft className="h-4 w-4" />,
            editor.isActive({ textAlign: 'left' })
          )}
          {formatButton(
            () => editor.chain().focus().setTextAlign('center').run(),
            <AlignCenter className="h-4 w-4" />,
            editor.isActive({ textAlign: 'center' })
          )}
          {formatButton(
            () => editor.chain().focus().setTextAlign('right').run(),
            <AlignRight className="h-4 w-4" />,
            editor.isActive({ textAlign: 'right' })
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          {formatButton(
            () => editor.chain().focus().toggleBulletList().run(),
            <List className="h-4 w-4" />,
            editor.isActive('bulletList')
          )}
          {formatButton(
            () => editor.chain().focus().toggleOrderedList().run(),
            <ListOrdered className="h-4 w-4" />,
            editor.isActive('orderedList')
          )}
          {formatButton(
            () => editor.chain().focus().toggleTaskList().run(),
            <ListChecks className="h-4 w-4" />,
            editor.isActive('taskList')
          )}
          {formatButton(
            () => editor.chain().focus().toggleBlockquote().run(),
            <Quote className="h-4 w-4" />,
            editor.isActive('blockquote')
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
            {showColorPicker && (
              <div className="absolute top-full mt-1 p-2 bg-popover border rounded-md shadow-lg z-50">
                <div className="grid grid-cols-5 gap-1">
                  {textColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className="h-8 w-8 p-0"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            {showHighlightPicker && (
              <div className="absolute top-full mt-1 p-2 bg-popover border rounded-md shadow-lg z-50">
                <div className="grid grid-cols-5 gap-1">
                  {highlightColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert Tools */}
        <div className="flex items-center gap-1">
          {formatButton(
            setLink,
            <LinkIcon className="h-4 w-4" />,
            editor.isActive('link')
          )}
          {formatButton(
            addImage,
            <ImageIcon className="h-4 w-4" />,
            false
          )}
          {formatButton(
            insertTable,
            <TableIcon className="h-4 w-4" />,
            false
          )}
          {formatButton(
            () => editor.chain().focus().setHorizontalRule().run(),
            <Minus className="h-4 w-4" />,
            false
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* AI Assistant */}
        <Button variant="outline" size="sm">
          <Bot className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document List Sidebar */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Documents</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <Select value={activeDocument} onValueChange={setActiveDocument}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`cursor-pointer transition-colors ${
                    activeDocument === doc.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setActiveDocument(doc.id)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{doc.title}</CardTitle>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Patient: {doc.patient}</p>
                      <p>Date: {doc.date}</p>
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Document Header */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{currentDocument?.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Patient: {currentDocument?.patient} • Date: {currentDocument?.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentDocument?.type}</Badge>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-8">
              <EditorContent 
                editor={editor} 
                className="min-h-[600px] focus-within:outline-none"
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-2 border-t bg-card flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Ready</span>
            </div>
            <div>
              Last saved: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
