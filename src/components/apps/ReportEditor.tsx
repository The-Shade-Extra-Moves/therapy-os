import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, Italic, Underline, List, ListOrdered, Quote, 
  Undo, Redo, Save, FileText, Image as ImageIcon, 
  Table as TableIcon, Mic, Video, Bot, Share, 
  Settings, Palette, Type, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

export const ReportEditor: React.FC = () => {
  const [activeDocument, setActiveDocument] = useState('report-1');
  const [documents] = useState([
    { id: 'report-1', title: 'Session Report - John Doe', patient: 'John Doe', date: '2024-01-15' },
    { id: 'report-2', title: 'Progress Assessment - Jane Smith', patient: 'Jane Smith', date: '2024-01-14' }
  ]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({ multicolor: true }),
    ],
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
      
      <h2>Recommendations</h2>
      <p>Continue with current treatment plan. Schedule follow-up in one week.</p>
    `,
  });

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        <div className="flex items-center gap-1">
          {formatButton(() => {}, <FileText className="h-4 w-4" />)}
          {formatButton(() => {}, <Save className="h-4 w-4" />)}
          <Separator orientation="vertical" className="h-6" />
          {formatButton(() => editor?.chain().focus().undo().run(), <Undo className="h-4 w-4" />)}
          {formatButton(() => editor?.chain().focus().redo().run(), <Redo className="h-4 w-4" />)}
          <Separator orientation="vertical" className="h-6" />
          {formatButton(
            () => editor?.chain().focus().toggleBold().run(),
            <Bold className="h-4 w-4" />,
            editor?.isActive('bold')
          )}
          {formatButton(
            () => editor?.chain().focus().toggleItalic().run(),
            <Italic className="h-4 w-4" />,
            editor?.isActive('italic')
          )}
          {formatButton(
            () => editor?.chain().focus().toggleUnderline().run(),
            <Underline className="h-4 w-4" />,
            editor?.isActive('underline')
          )}
          <Separator orientation="vertical" className="h-6" />
          {formatButton(() => editor?.chain().focus().setTextAlign('left').run(), <AlignLeft className="h-4 w-4" />)}
          {formatButton(() => editor?.chain().focus().setTextAlign('center').run(), <AlignCenter className="h-4 w-4" />)}
          {formatButton(() => editor?.chain().focus().setTextAlign('right').run(), <AlignRight className="h-4 w-4" />)}
          <Separator orientation="vertical" className="h-6" />
          {formatButton(() => editor?.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />)}
          {formatButton(() => editor?.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />)}
          {formatButton(() => editor?.chain().focus().toggleBlockquote().run(), <Quote className="h-4 w-4" />)}
          <Separator orientation="vertical" className="h-6" />
          {formatButton(() => {}, <ImageIcon className="h-4 w-4" />)}
          {formatButton(() => {}, <TableIcon className="h-4 w-4" />)}
          {formatButton(() => {}, <Mic className="h-4 w-4" />)}
          {formatButton(() => {}, <Video className="h-4 w-4" />)}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Bot className="h-3 w-3 mr-1" />
            AI Ready
          </Badge>
          {formatButton(() => {}, <Share className="h-4 w-4" />)}
          {formatButton(() => {}, <Settings className="h-4 w-4" />)}
        </div>
      </div>

      {/* Document Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30">
        {documents.map((doc) => (
          <Button
            key={doc.id}
            variant={activeDocument === doc.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveDocument(doc.id)}
            className="h-8 text-xs"
          >
            {doc.title}
          </Button>
        ))}
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card">
          <Tabs defaultValue="patient" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient" className="mt-0 h-full">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Current Patient</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> John Doe</p>
                      <p><strong>DOB:</strong> 1985-03-15</p>
                      <p><strong>Condition:</strong> Anxiety Disorder</p>
                      <p><strong>Session #:</strong> 8</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Recent Sessions</h3>
                    <div className="space-y-2">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                        Jan 8, 2024 - CBT Session
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                        Jan 1, 2024 - Initial Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="templates" className="mt-0 h-full">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Session Report Template
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Progress Assessment
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Treatment Plan
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Therapy Goals
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="ai" className="mt-0 h-full">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">AI Suggestions</p>
                    <ul className="text-xs space-y-1">
                      <li>• Consider adding mood assessment scores</li>
                      <li>• Include homework completion status</li>
                      <li>• Document any medication changes</li>
                    </ul>
                  </div>
                  <Button size="sm" className="w-full">
                    <Bot className="h-4 w-4 mr-2" />
                    Generate Summary
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <EditorContent 
                editor={editor} 
                className="prose prose-sm max-w-none focus:outline-none"
              />
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Words: 127</span>
              <span>Characters: 892</span>
              <span>Patient: John Doe</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Autosaved</Badge>
              <span>Last saved: 2 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};