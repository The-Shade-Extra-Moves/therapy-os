import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Highlighter as HighlightIcon,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Palette,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FontFamily } from '../types';

interface RichTextEditorProps {
  content: string;
  richContent?: any;
  onChange: (content: string, richContent: any) => void;
  onSave?: () => void;
  className?: string;
  fontFamily?: FontFamily;
  spellCheck?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

const fontFamilyMap: Record<FontFamily, string> = {
  'inter': 'Inter, sans-serif',
  'roboto': 'Roboto, sans-serif',
  'noto-sans': 'Noto Sans, sans-serif',
  'sf-pro': 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
  'system': 'system-ui, sans-serif',
  'serif': 'Georgia, Times, serif',
  'mono': 'Monaco, Consolas, monospace'
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  richContent,
  onChange,
  onSave,
  className,
  fontFamily = 'inter',
  spellCheck = true,
  readOnly = false,
  placeholder = 'Start writing...'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
        },
      }),
      Dropcursor,
      Gapcursor,
    ],
    content: richContent || content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      onChange(html, json);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[200px] px-4 py-2',
          fontFamilyMap[fontFamily]
        ),
        spellcheck: spellCheck.toString(),
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (editor && reader.result) {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const setColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const setHighlight = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  }, [editor]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    // TODO: Implement actual audio recording
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingTime(0);
    // TODO: Implement actual audio recording stop and save
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border rounded-lg bg-white dark:bg-gray-900 flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('taskList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Quote and Code */}
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Colors */}
        <Select onValueChange={setColor}>
          <SelectTrigger className="w-20 h-8">
            <Palette className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="#000000">Black</SelectItem>
            <SelectItem value="#ff0000">Red</SelectItem>
            <SelectItem value="#00ff00">Green</SelectItem>
            <SelectItem value="#0000ff">Blue</SelectItem>
            <SelectItem value="#ffff00">Yellow</SelectItem>
            <SelectItem value="#ff00ff">Magenta</SelectItem>
            <SelectItem value="#00ffff">Cyan</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setHighlight}>
          <SelectTrigger className="w-20 h-8">
            <HighlightIcon className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="#ffff00">Yellow</SelectItem>
            <SelectItem value="#00ff00">Green</SelectItem>
            <SelectItem value="#ff0000">Red</SelectItem>
            <SelectItem value="#0000ff">Blue</SelectItem>
            <SelectItem value="#ff00ff">Magenta</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Media */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          title="Upload image"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <Button
          variant={isRecording ? 'destructive' : 'ghost'}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <Mic className="w-4 h-4" />
          {isRecording && <span className="ml-1 text-xs">{recordingTime}s</span>}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="border-b p-2 flex gap-2 items-center">
          <Input
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addLink();
              if (e.key === 'Escape') setShowLinkInput(false);
            }}
            className="flex-1"
          />
          <Button size="sm" onClick={addLink}>Add</Button>
          <Button size="sm" variant="ghost" onClick={removeLink}>Remove</Button>
        </div>
      )}

      {/* Editor */}
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <EditorContent 
            editor={editor} 
            className="min-h-[300px] max-h-[60vh] overflow-y-auto px-4 py-2"
            style={{ fontFamily: fontFamilyMap[fontFamily] }}
          />
        </div>

        {/* Placeholder */}
        {editor.isEmpty && (
          <div className="absolute top-4 left-8 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
