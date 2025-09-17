'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/community-utils';
import { CommunityComment } from '@/types/community';
import { ROLE_LABELS, BADGE_COLOR_MAP } from '@/lib/community-constants';

interface CommentCardProps {
  comment: CommunityComment;
  currentUserId: string | null;
  onDelete: (commentId: string) => void;
  isDeleting?: boolean;
}


export const CommentCard = memo(function CommentCard({ comment, currentUserId, onDelete, isDeleting = false }: CommentCardProps) {
  const isCurrentUser = currentUserId === comment.user_id;

  return (
    <Card className="mb-3 bg-cyan-900/20 border border-cyan-400/20">
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback className="text-xs bg-cyan-900 text-cyan-100">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm text-cyan-200">
                  {comment.author.name}
                </span>
                <Badge className={`text-xs font-bold px-2 py-0.5 ${BADGE_COLOR_MAP[comment.author.role]}`}>
                  {ROLE_LABELS[comment.author.role]}
                </Badge>
                <span className="text-xs text-cyan-300/70">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              
              <p className="text-sm text-cyan-100 leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
          
          {isCurrentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
