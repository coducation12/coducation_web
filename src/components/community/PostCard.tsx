'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MessageCircle, ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/community-utils';
import { CommunityPost } from '@/types/community';
import { ROLE_LABELS, BADGE_COLOR_MAP } from '@/lib/community-constants';
import Image from 'next/image';

interface PostCardProps {
  post: CommunityPost;
  currentUserId: string | null;
  currentUserRole: string | null;
  onClick: (postId: string) => void;
}


export const PostCard = memo(function PostCard({ post, currentUserId, currentUserRole, onClick }: PostCardProps) {
  const isCurrentUser = currentUserId === post.user_id;
  const isAdmin = currentUserRole === 'admin';

  return (
    <Card
      className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isCurrentUser 
          ? 'border border-cyan-400/30 border-l-4 border-l-cyan-400' 
          : post.author.role === 'admin'
          ? 'border border-cyan-400/30 border-l-4 border-l-red-400'
          : 'border border-cyan-400/30'
      }`}
      onClick={() => onClick(post.id)}
    >
      <CardContent className="py-2 px-4 flex items-center min-h-[56px] gap-3 whitespace-nowrap overflow-x-auto">
        {/* 1열: 아바타 */}
        <div className="flex items-center justify-center min-w-[44px] max-w-[44px] flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="text-xs bg-cyan-900 text-cyan-100">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* 2열: 작성자(분류)/작성일 */}
        <div className="flex flex-col justify-center min-w-[120px] max-w-[120px] flex-shrink-0">
          <span className="font-semibold text-xs text-cyan-100 leading-tight flex items-center gap-1">
            <Badge className={`w-[48px] min-w-[48px] max-w-[48px] text-xs font-bold px-0 py-0.5 flex items-center justify-center text-center ${BADGE_COLOR_MAP[post.author.role]} hover:bg-opacity-100`}>
              {ROLE_LABELS[post.author.role]}
            </Badge>
            {post.author.name}
          </span>
          <span className="text-xs text-cyan-300/70 mt-1">
            {formatDate(post.created_at)}
          </span>
        </div>
        
        {/* 3열: 제목 */}
        <div className="flex-1 min-w-0 flex items-center">
          <h3 className="text-sm font-medium text-cyan-100 truncate">
            {post.title}
          </h3>
        </div>
        
        {/* 4열: 이미지 아이콘 */}
        <div className="flex items-center justify-center min-w-[20px] max-w-[20px] flex-shrink-0">
          {post.images && post.images.length > 0 && (
            <ImageIcon className="h-4 w-4 text-cyan-400" />
          )}
        </div>
        
        {/* 5열: 댓글 수 */}
        <div className="flex items-center justify-center min-w-[40px] max-w-[40px] flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-cyan-300">
            <MessageCircle className="h-3 w-3" />
            <span>{post.comments_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
