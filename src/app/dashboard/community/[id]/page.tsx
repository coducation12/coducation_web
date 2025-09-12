'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, MessageCircle, Heart, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { 
  CommunityPost,
  CommunityComment,
  getCommunityPost,
  getCommunityComments,
  createCommunityComment
} from '@/lib/community';
import { formatDate, roleLabels } from '@/lib/community-utils';

const badgeColorMap = {
  student: 'bg-cyan-700 text-white',
  parent: 'bg-green-700 text-white',
  teacher: 'bg-purple-700 text-white',
  admin: 'bg-red-700 text-white',
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    loadPostAndComments();
  }, [params.id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        getCommunityPost(params.id as string),
        getCommunityComments(params.id as string)
      ]);
      
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    // TODO: 좋아요 기능 구현 (추후 좋아요 테이블 생성 후)
    console.log('Like post:', post?.id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommenting(true);
      await createCommunityComment(params.id as string, newComment);
      setNewComment('');
      // 댓글 목록 새로고침
      const updatedComments = await getCommunityComments(params.id as string);
      setComments(updatedComments);
      // 게시글 댓글 수 업데이트
      if (post) {
        setPost({
          ...post,
          comments_count: post.comments_count + 1
        });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setCommenting(false);
    }
  };



  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-cyan-200">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-cyan-200">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-cyan-200 hover:text-cyan-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로 돌아가기</span>
        </Button>
      </div>

      <Card className="mb-6 bg-transparent border border-cyan-400/30 text-cyan-100">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="text-xs bg-cyan-900 text-cyan-100">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-cyan-200 text-lg">{post.author.name}</span>
                  <Badge className={`w-[48px] min-w-[48px] max-w-[48px] text-xs font-bold px-0 py-0.5 flex items-center justify-center text-center ${badgeColorMap[post.author.role]}`}>
                    {roleLabels[post.author.role]}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-cyan-300 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(post.created_at)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl mb-4 text-cyan-100 font-bold text-center">
            {post.title}
          </CardTitle>
          <div className="mb-6">
            <div className="whitespace-pre-wrap text-cyan-100 leading-relaxed text-base font-medium">
              {post.content}
            </div>
          </div>
          
          {/* 게시글 이미지 */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-lg border border-cyan-400/30">
                    <Image
                      src={imageUrl}
                      alt={`게시글 이미지 ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-cyan-400/30">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 h-8 px-2 ${post.is_liked ? 'text-pink-300' : 'text-cyan-200'}`}
              >
                <Heart className={`h-3 w-3 ${post.is_liked ? 'fill-current' : ''}`} />
                <span className="text-xs">{post.likes_count}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-cyan-200 h-8 px-2">
                <MessageCircle className="h-3 w-3" />
                <span className="text-xs">{comments.length}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-cyan-200 h-8 px-2">
                <Share2 className="h-3 w-3" />
                <span className="text-xs">공유</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card className="bg-transparent border border-cyan-400/30">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-100 font-bold">댓글 ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 새 댓글 작성 */}
            <div className="space-y-2">
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="bg-[#1a2a3a] text-cyan-100 border-cyan-400/30"
              />
              <div className="flex justify-end">
                <Button 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow disabled:opacity-50" 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || commenting}
                >
                  {commenting ? '작성 중...' : '댓글 작성'}
                </Button>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-4 border border-cyan-400/30 rounded-lg bg-transparent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback className="text-xs bg-cyan-900 text-cyan-100">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-sm text-cyan-200">{comment.author.name}</span>
                      <Badge className={`w-[48px] min-w-[48px] max-w-[48px] text-xs font-bold px-0 py-0.5 flex items-center justify-center text-center ${badgeColorMap[comment.author.role]}`}>
                        {roleLabels[comment.author.role]}
                      </Badge>
                      <span className="text-xs text-cyan-300">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-cyan-100 leading-relaxed font-medium">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 