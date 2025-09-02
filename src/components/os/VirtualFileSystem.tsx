import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  File, 
  Download, 
  Upload, 
  Search, 
  Grid, 
  List,
  Star,
  Clock,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share,
  FolderPlus,
  FileText,
  Image,
  Video,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  modified: Date;
  created: Date;
  parent?: string;
  mimeType?: string;
  starred: boolean;
  tags: string[];
  thumbnail?: string;
}

export const VirtualFileSystem: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock file system data
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: '1',
      name: 'Patient Files',
      type: 'folder',
      modified: new Date('2024-01-15'),
      created: new Date('2024-01-01'),
      starred: true,
      tags: ['patients', 'confidential']
    },
    {
      id: '2',
      name: 'Session Notes',
      type: 'folder',
      modified: new Date('2024-01-20'),
      created: new Date('2024-01-01'),
      starred: false,
      tags: ['notes', 'therapy']
    },
    {
      id: '3',
      name: 'Resources',
      type: 'folder',
      modified: new Date('2024-01-18'),
      created: new Date('2024-01-01'),
      starred: false,
      tags: ['resources', 'templates']
    },
    {
      id: '4',
      name: 'Therapy_Plan_Template.pdf',
      type: 'file',
      size: 245760,
      modified: new Date('2024-01-22'),
      created: new Date('2024-01-15'),
      starred: true,
      tags: ['template', 'therapy'],
      mimeType: 'application/pdf'
    },
    {
      id: '5',
      name: 'Relaxation_Audio.mp3',
      type: 'file',
      size: 5242880,
      modified: new Date('2024-01-20'),
      created: new Date('2024-01-10'),
      starred: false,
      tags: ['audio', 'relaxation'],
      mimeType: 'audio/mpeg'
    },
    {
      id: '6',
      name: 'Patient_Progress_Chart.png',
      type: 'file',
      size: 102400,
      modified: new Date('2024-01-19'),
      created: new Date('2024-01-18'),
      starred: false,
      tags: ['chart', 'progress'],
      mimeType: 'image/png'
    }
  ]);

  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-5 h-5 text-primary" />;
    }
    
    if (item.mimeType?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-secondary" />;
    }
    if (item.mimeType?.startsWith('audio/')) {
      return <Music className="w-5 h-5 text-accent" />;
    }
    if (item.mimeType?.startsWith('video/')) {
      return <Video className="w-5 h-5 text-destructive" />;
    }
    if (item.mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-orange-500" />;
    }
    
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredItems = fileSystem.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleStar = (id: string) => {
    setFileSystem(prev => 
      prev.map(item => 
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">File Manager</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="h-auto p-1">
            ReMotionOS
          </Button>
          <span>/</span>
          <span>Files</span>
        </div>
      </div>

      {/* File Grid/List */}
      <ScrollArea className="flex-1">
        {viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  ${selectedItems.includes(item.id) ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'}
                `}
                onClick={() => toggleItemSelection(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 relative">
                    {getFileIcon(item)}
                    {item.starred && (
                      <Star 
                        className="absolute -top-1 -right-1 w-3 h-3 text-accent fill-accent" 
                      />
                    )}
                  </div>
                  <h4 className="text-sm font-medium truncate w-full" title={item.name}>
                    {item.name}
                  </h4>
                  {item.size && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(item.size)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                className={`
                  p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer
                  ${selectedItems.includes(item.id) ? 'bg-primary/10' : ''}
                `}
                onClick={() => toggleItemSelection(item.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getFileIcon(item)}
                    {item.starred && (
                      <Star className="w-4 h-4 text-accent fill-accent" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(item.modified)}</span>
                      {item.size && <span>{formatFileSize(item.size)}</span>}
                      <div className="flex gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStar(item.id)}>
                      <Star className="w-4 h-4 mr-2" />
                      {item.starred ? 'Unstar' : 'Star'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Status Bar */}
      {selectedItems.length > 0 && (
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};