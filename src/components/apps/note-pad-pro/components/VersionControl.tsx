import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  GitBranch, 
  History, 
  Undo2, 
  Redo2, 
  Save, 
  GitCommit,
  Clock,
  User,
  Eye,
  GitCompare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, NoteVersion } from '../types';

interface VersionControlProps {
  note: Note;
  onUpdateNote: (updates: Partial<Note>) => void;
  onRevertToVersion: (version: NoteVersion) => void;
  className?: string;
}

interface CommitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (message: string) => void;
}

const CommitDialog: React.FC<CommitDialogProps> = ({ isOpen, onClose, onCommit }) => {
  const [commitMessage, setCommitMessage] = useState('');

  const handleCommit = () => {
    if (commitMessage.trim()) {
      onCommit(commitMessage.trim());
      setCommitMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Create Version Commit
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Commit Message</label>
            <Textarea
              placeholder="Describe the changes made..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCommit} disabled={!commitMessage.trim()}>
              <GitCommit className="w-4 h-4 mr-2" />
              Commit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface VersionCompareProps {
  isOpen: boolean;
  onClose: () => void;
  version1: NoteVersion;
  version2: NoteVersion;
}

const VersionCompare: React.FC<VersionCompareProps> = ({ 
  isOpen, 
  onClose, 
  version1, 
  version2 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare Versions: v{version1.version} → v{version2.version}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 h-[60vh]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Badge variant="outline">v{version1.version}</Badge>
              <span>{version1.createdAt.toLocaleString()}</span>
            </div>
            <ScrollArea className="h-full border rounded p-3">
              <div className="whitespace-pre-wrap text-sm">
                {version1.content}
              </div>
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Badge variant="outline">v{version2.version}</Badge>
              <span>{version2.createdAt.toLocaleString()}</span>
            </div>
            <ScrollArea className="h-full border rounded p-3">
              <div className="whitespace-pre-wrap text-sm">
                {version2.content}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const VersionControl: React.FC<VersionControlProps> = ({
  note,
  onUpdateNote,
  onRevertToVersion,
  className
}) => {
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    version1: NoteVersion;
    version2: NoteVersion;
  } | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const createCommit = useCallback((message: string) => {
    const newVersion: NoteVersion = {
      id: `v${Date.now()}`,
      noteId: note.id,
      version: note.version + 1,
      title: note.title,
      content: note.content,
      richContent: note.richContent,
      createdAt: new Date(),
      commitMessage: message,
      author: 'Current User'
    };

    onUpdateNote({
      version: note.version + 1,
      history: [newVersion, ...note.history]
    });
  }, [note, onUpdateNote]);

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId]);
    } else {
      setSelectedVersions([versionId]);
    }
  };

  const compareSelectedVersions = () => {
    if (selectedVersions.length === 2) {
      const version1 = note.history.find(v => v.id === selectedVersions[0]);
      const version2 = note.history.find(v => v.id === selectedVersions[1]);
      
      if (version1 && version2) {
        // Sort by version number to ensure correct order
        const [v1, v2] = version1.version < version2.version 
          ? [version1, version2] 
          : [version2, version1];
        
        setCompareVersions({ version1: v1, version2: v2 });
      }
    }
  };

  const getTimeDiff = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  const calculateWordChanges = (oldContent: string, newContent: string) => {
    const oldWords = oldContent.split(/\s+/).length;
    const newWords = newContent.split(/\s+/).length;
    const diff = newWords - oldWords;
    
    if (diff > 0) return `+${diff} words`;
    if (diff < 0) return `${diff} words`;
    return 'No word changes';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Version Control Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="w-5 h-5" />
            Version Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                v{note.version}
              </Badge>
              <span className="text-sm text-gray-600">
                Current version
              </span>
            </div>
            <Button 
              onClick={() => setShowCommitDialog(true)}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Commit
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Versions</div>
              <div className="font-medium">{note.history.length + 1}</div>
            </div>
            <div>
              <div className="text-gray-500">Last Modified</div>
              <div className="font-medium">{getTimeDiff(note.updatedAt)}</div>
            </div>
            <div>
              <div className="text-gray-500">Word Count</div>
              <div className="font-medium">{note.wordCount || 0}</div>
            </div>
          </div>

          {selectedVersions.length === 2 && (
            <Button 
              onClick={compareSelectedVersions}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Selected Versions
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {/* Current Version */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <GitCommit className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="font-mono">v{note.version}</Badge>
                    <Badge variant="secondary">Current</Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Working version • {getTimeDiff(note.updatedAt)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Version History */}
              {note.history.map((version, index) => {
                const isSelected = selectedVersions.includes(version.id);
                const previousVersion = note.history[index + 1];
                const wordChanges = previousVersion 
                  ? calculateWordChanges(previousVersion.content, version.content)
                  : null;

                return (
                  <div 
                    key={version.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                    onClick={() => handleVersionSelect(version.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isSelected ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}>
                        <GitCommit className={cn(
                          "w-4 h-4",
                          isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"
                        )} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">
                          v{version.version}
                        </Badge>
                        {version.commitMessage && (
                          <span className="text-sm font-medium truncate">
                            {version.commitMessage}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{version.author}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{getTimeDiff(version.createdAt)}</span>
                        {wordChanges && (
                          <>
                            <span>•</span>
                            <span>{wordChanges}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Show version preview
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevertToVersion(version);
                        }}
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Undo/Redo Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Undo2 className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={note.history.length === 0}
              onClick={() => {
                if (note.history.length > 0) {
                  onRevertToVersion(note.history[0]);
                }
              }}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo Last Change
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled
            >
              <Redo2 className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CommitDialog 
        isOpen={showCommitDialog}
        onClose={() => setShowCommitDialog(false)}
        onCommit={createCommit}
      />

      {compareVersions && (
        <VersionCompare
          isOpen={true}
          onClose={() => setCompareVersions(null)}
          version1={compareVersions.version1}
          version2={compareVersions.version2}
        />
      )}
    </div>
  );
};
