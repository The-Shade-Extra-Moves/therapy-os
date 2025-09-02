import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, File, Home, HardDrive, Trash2, Search,
  ArrowLeft, ArrowRight, RefreshCw, Plus, Upload,
  Download, Copy, Grid3X3, List, MoreVertical,
  Star, Clock, SortAsc, Scissors
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  icon?: string;
  extension?: string;
  isSelected: boolean;
}

interface FolderStructure {
  path: string;
  items: FileItem[];
}

const mockFileSystem: Record<string, FolderStructure> = {
  '/': {
    path: '/',
    items: [
      { id: '1', name: 'Documents', type: 'folder', modified: '2024-01-15', isSelected: false },
      { id: '2', name: 'Patient Files', type: 'folder', modified: '2024-01-14', isSelected: false },
      { id: '3', name: 'Session Notes', type: 'folder', modified: '2024-01-13', isSelected: false },
      { id: '4', name: 'Templates', type: 'folder', modified: '2024-01-12', isSelected: false },
      { id: '5', name: 'Downloads', type: 'folder', modified: '2024-01-11', isSelected: false },
    ]
  },
  '/Documents': {
    path: '/Documents',
    items: [
      { id: '6', name: 'Reports', type: 'folder', modified: '2024-01-10', isSelected: false },
      { id: '7', name: 'Therapy_Plan.pdf', type: 'file', size: '2.4 MB', modified: '2024-01-15', extension: 'pdf', isSelected: false },
      { id: '8', name: 'Assessment_Form.docx', type: 'file', size: '1.2 MB', modified: '2024-01-14', extension: 'docx', isSelected: false },
      { id: '9', name: 'Progress_Notes.txt', type: 'file', size: '156 KB', modified: '2024-01-13', extension: 'txt', isSelected: false },
    ]
  },
  '/Patient Files': {
    path: '/Patient Files',
    items: [
      { id: '10', name: 'John_Doe', type: 'folder', modified: '2024-01-15', isSelected: false },
      { id: '11', name: 'Jane_Smith', type: 'folder', modified: '2024-01-14', isSelected: false },
      { id: '12', name: 'Michael_Johnson', type: 'folder', modified: '2024-01-13', isSelected: false },
      { id: '13', name: 'Archive', type: 'folder', modified: '2024-01-10', isSelected: false },
    ]
  },
  '/Session Notes': {
    path: '/Session Notes',
    items: [
      { id: '14', name: '2024-01-15_Session1.md', type: 'file', size: '45 KB', modified: '2024-01-15', extension: 'md', isSelected: false },
      { id: '15', name: '2024-01-14_Session2.md', type: 'file', size: '38 KB', modified: '2024-01-14', extension: 'md', isSelected: false },
      { id: '16', name: '2024-01-13_Session3.md', type: 'file', size: '42 KB', modified: '2024-01-13', extension: 'md', isSelected: false },
      { id: '17', name: 'Voice_Notes', type: 'folder', modified: '2024-01-12', isSelected: false },
    ]
  },
};

export const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');

  const currentFolder = mockFileSystem[currentPath] || mockFileSystem['/'];
  
  const filteredItems = currentFolder.items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'modified':
          return new Date(b.modified).getTime() - new Date(a.modified).getTime();
        case 'size':
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return (a.size || '0').localeCompare(b.size || '0');
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const pathSegments = currentPath.split('/').filter(Boolean);

  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    if (mockFileSystem[newPath]) {
      setCurrentPath(newPath);
      setSelectedItems(new Set());
    }
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
    setSelectedItems(new Set());
  };

  const navigateToPath = (index: number) => {
    const newPath = '/' + pathSegments.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (itemId: string, multiSelect = false) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (!multiSelect) {
        newSet.clear();
      }
      
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      
      return newSet;
    });
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') return <Folder className="w-5 h-5 text-blue-500" />;
    
    switch (item.extension) {
      case 'pdf': return <File className="w-5 h-5 text-red-500" />;
      case 'docx': case 'doc': return <File className="w-5 h-5 text-blue-600" />;
      case 'txt': case 'md': return <File className="w-5 h-5 text-gray-500" />;
      default: return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (size?: string) => {
    return size || '—';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const Breadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentPath('/')}
        className="h-8 px-2"
      >
        <Home className="w-4 h-4" />
      </Button>
      
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <span className="text-muted-foreground">/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToPath(index)}
            className="h-8 px-2 text-foreground"
          >
            {segment}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );

  const FileItem: React.FC<{ item: FileItem }> = ({ item }) => {
    const isSelected = selectedItems.has(item.id);
    
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-primary/20 ring-2 ring-primary/50' 
                : 'hover:bg-muted/50'
            }`}
            onClick={(e) => toggleItemSelection(item.id, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => {
              if (item.type === 'folder') {
                navigateToFolder(item.name);
              }
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  {getFileIcon(item)}
                </div>
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.type === 'file' ? formatFileSize(item.size) : 'Folder'}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {getFileIcon(item)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                </div>
                <div className="text-sm text-muted-foreground w-20 text-right">
                  {formatFileSize(item.size)}
                </div>
                <div className="text-sm text-muted-foreground w-24 text-right">
                  {formatDate(item.modified)}
                </div>
              </div>
            )}
          </motion.div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </ContextMenuItem>
          <ContextMenuItem>
            <Scissors className="w-4 h-4 mr-2" />
            Cut
          </ContextMenuItem>
          <ContextMenuItem>
            <Download className="w-4 h-4 mr-2" />
            Download
          </ContextMenuItem>
          <ContextMenuItem className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateUp}
              disabled={currentPath === '/'}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <Breadcrumb />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="modified">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>

          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {selectedItems.size > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Scissors className="w-4 h-4 mr-2" />
                Cut
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' 
            : 'space-y-1'
        }`}>
          {filteredItems.map((item) => (
            <FileItem key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'This folder is empty'}
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
        {filteredItems.length} items • {selectedItems.size} selected
      </div>
    </div>
  );
};