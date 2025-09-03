import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pin, Archive, Trash2, Copy, MoreVertical, 
  Calendar, Tag, Paperclip, Bell 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Note } from '../types';
import { noteColors, formatRelativeTime, extractTextFromContent } from '../utils/noteUtils';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  viewMode?: 'list' | 'grid' | 'compact';
  onClick?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected = false,
  viewMode = 'grid',
  onClick,
  onPin,
  onArchive,
  onDelete,
  onDuplicate
}) => {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const cardClasses = `
    ${noteColors[note.color || 'default']}
    ${isSelected ? 'ring-2 ring-primary' : ''}
    ${viewMode === 'compact' ? 'h-24' : viewMode === 'list' ? 'h-32' : 'min-h-[200px]'}
    cursor-pointer transition-all duration-200 hover:shadow-md
  `;

  const excerpt = extractTextFromContent(note.content, viewMode === 'compact' ? 50 : 120);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="relative"
    >
      <Card className={cardClasses} onClick={onClick}>
        {/* Pin indicator */}
        {note.isPinned && (
          <div className="absolute top-2 right-2 z-10">
            <Pin className="w-4 h-4 text-primary fill-current" />
          </div>
        )}

        {/* Reminder indicator */}
        {note.reminder && new Date(note.reminder) > new Date() && (
          <div className="absolute top-2 left-2 z-10">
            <Bell className="w-4 h-4 text-orange-500" />
          </div>
        )}

        <CardContent className={`p-4 ${viewMode === 'compact' ? 'py-2' : ''}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-foreground truncate ${
                viewMode === 'compact' ? 'text-sm' : 'text-base'
              }`}>
                {note.title || 'Untitled'}
              </h3>
              
              {viewMode !== 'compact' && (
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatRelativeTime(note.updatedAt)}
                  </span>
                  {note.category && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {note.category.name}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin?.(); }}>
                  <Pin className="w-4 h-4 mr-2" />
                  {note.isPinned ? 'Unpin' : 'Pin'} Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive?.(); }}>
                  <Archive className="w-4 h-4 mr-2" />
                  {note.isArchived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content preview */}
          {viewMode !== 'compact' && (
            <div className="mb-3">
              <p className={`text-muted-foreground leading-relaxed ${
                viewMode === 'list' ? 'text-sm line-clamp-2' : 'text-sm line-clamp-4'
              }`}>
                {excerpt}
              </p>
            </div>
          )}

          {/* Tags and attachments */}
          {viewMode === 'grid' && (
            <div className="space-y-2">
              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs px-2 py-0 h-5"
                    >
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Attachments indicator */}
              {note.attachments && note.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="w-3 h-3" />
                  <span>{note.attachments.length} attachment{note.attachments.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Compact mode info */}
          {viewMode === 'compact' && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatRelativeTime(note.updatedAt)}</span>
              <div className="flex items-center gap-2">
                {note.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {note.tags.length}
                  </span>
                )}
                {note.attachments && note.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    {note.attachments.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
