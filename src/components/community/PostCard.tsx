'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ImageIcon, Lock } from 'lucide-react';
import { formatDate } from '@/lib/community-utils';
import { CommunityPost } from '@/types/community';
import { ROLE_LABELS, BADGE_COLOR_MAP } from '@/lib/community-constants';
import { UserAvatar } from './UserAvatar';
import { toggleShowOnMain } from '@/lib/community';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';

interface PostCardProps {
  post: CommunityPost;
  currentUserId: string | null;
  currentUserRole: string | null;
  onClick: (postId: string) => void;
}


export const PostCard = memo(function PostCard({ post, currentUserId, currentUserRole, onClick }: PostCardProps) {
  const isCurrentUser = currentUserId === post.user_id;
  const isAuthorized = currentUserRole === 'admin' || currentUserRole === 'teacher';
  const hasImages = post.images && post.images.length > 0;
  const { toast } = useToast();
  const [showOnMain, setShowOnMain] = useState(post.show_on_main || false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleShowOnMain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling || !hasImages) return;

    try {
      setIsToggling(true);
      const newStatus = !showOnMain;
      await toggleShowOnMain(post.id, newStatus);
      setShowOnMain(newStatus);
      toast({
        title: newStatus ? "작품 게시 설정" : "작품 게시 해제",
        description: `"${post.title}" 게시글이 메인 화면에 ${newStatus ? '게시' : '제외'}됩니다.`
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "게시 설정 변경에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card
      className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${isCurrentUser
          ? 'border border-cyan-400/30 border-l-4 border-l-cyan-400'
          : post.author.role === 'admin'
            ? 'border border-cyan-400/30 border-l-4 border-l-red-400'
            : 'border border-cyan-400/30'
        }`}
      onClick={() => onClick(post.id)}
    >
      <CardContent className="py-2 px-3 sm:px-4 flex items-center min-h-[64px] gap-2 sm:gap-3 overflow-hidden">
        {/* 1열: 아바타 (모바일 숨김) */}
        <div className="hidden sm:flex items-center justify-center min-w-[40px] max-w-[40px] flex-shrink-0">
          <UserAvatar
            src={post.author.role === 'admin' ? '/android-chrome-512x512.png' : (post.author.profile_image_url || post.author.avatar)}
            name={post.author.name}
            role={post.author.role}
            size="sm"
          />
        </div>

        {/* 2열: 작성자(분류) / 작성일 (모바일은 작성자만) */}
        <div className="flex flex-col justify-center min-w-[70px] sm:min-w-[120px] sm:max-w-[120px] flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <Badge className={`w-fit min-w-[36px] text-[9px] sm:text-xs font-bold px-1 py-0 flex items-center justify-center text-center ${BADGE_COLOR_MAP[post.author.role]} hover:bg-opacity-100 shrink-0`}>
              {ROLE_LABELS[post.author.role]}
            </Badge>
            <span className="font-semibold text-[10px] sm:text-xs text-cyan-100 leading-tight truncate">
              {post.author.name}
            </span>
          </div>
          <span className="hidden sm:block text-[10px] sm:text-xs text-cyan-300/70 mt-1">
            {formatDate(post.created_at)}
          </span>
        </div>

        {/* 3열: 제목 (공간 극대화) */}
        <div className="flex-1 min-w-0 flex items-center">
          <h3 className="text-xs sm:text-sm font-medium text-cyan-100 truncate">
            {post.title}
          </h3>
        </div>

        {/* 4열: 이미지 아이콘 */}
        <div className="flex items-center justify-center min-w-[16px] max-w-[16px] flex-shrink-0">
          {hasImages && (
            <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
          )}
        </div>

        {/* 5열: 댓글 수 */}
        <div className="flex items-center justify-center min-w-[32px] max-w-[32px] flex-shrink-0">
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-cyan-300">
            <MessageCircle className="h-3 w-3" />
            <span>{post.comments_count}</span>
          </div>
        </div>

        {/* 6열: 작품 게시 토글 (강사/관리자 전용) */}
        {isAuthorized && (
          <div className="flex items-center gap-2 pl-2 border-l border-cyan-400/20 flex-shrink-0 ml-1">
            <div 
              className={`flex flex-col items-center gap-1 ${!hasImages ? 'opacity-40 grayscale cursor-not-allowed' : ''}`} 
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                id={`main-toggle-${post.id}`}
                checked={showOnMain && hasImages}
                disabled={!hasImages || isToggling}
                onCheckedChange={(checked: boolean) => {
                  if (!isToggling && hasImages) {
                    const toggle = async () => {
                      try {
                        setIsToggling(true);
                        await toggleShowOnMain(post.id, checked);
                        setShowOnMain(checked);
                        toast({
                          title: checked ? "작품 게시 설정" : "작품 게시 해제",
                          description: `"${post.title}" 게시글이 메인 화면에 ${checked ? '게시' : '제외'}됩니다.`
                        });
                      } catch (error) {
                        toast({
                          title: "오류 발생",
                          description: "게시 설정 변경에 실패했습니다.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsToggling(false);
                      }
                    };
                    toggle();
                  }
                }}
                className="data-[state=checked]:bg-cyan-500"
              />
              <Label 
                htmlFor={`main-toggle-${post.id}`} 
                className={`text-[9px] font-bold whitespace-nowrap ${hasImages ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                작품게시
              </Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
