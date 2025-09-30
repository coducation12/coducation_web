'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import {
  getCommunityPost,
  getCommunityComments,
  createCommunityComment,
  deleteCommunityPost,
  deleteCommunityComment
} from '@/lib/community';
import { getCurrentUserClient } from '@/lib/client-auth';
import { formatDate, roleLabels } from '@/lib/community-utils';
import { UserAvatar } from '@/components/community/UserAvatar';
import { RoleBadge } from '@/components/community/RoleBadge';
import { CommentCard } from '@/components/community/CommentCard';
import { CommentForm } from '@/components/community/CommentForm';

const badgeColorMap = {
  student: 'bg-cyan-700 text-white',
  parent: 'bg-green-700 text-white',
  teacher: 'bg-purple-700 text-white',
  admin: 'bg-red-700 text-white',
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  useEffect(() => {
    loadPostAndComments();
    loadCurrentUser();
  }, [params.id]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUserClient();
      setCurrentUserId(user?.id || null);
    } catch (error) {
      // 에러 로그 제거 - 조용히 처리
    }
  };

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
      // 에러 로그 제거 - 조용히 처리
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteCommunityPost(post.id);
      alert('게시글이 삭제되었습니다.');
      router.push('/dashboard/community');
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeletingComment(commentId);
      await deleteCommunityComment(commentId);
      
      // 댓글 목록에서 제거
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // 게시글의 댓글 수 업데이트
      if (post) {
        setPost({
          ...post,
          comments_count: post.comments_count - 1
        });
      }
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setDeletingComment(null);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!content.trim()) return;

    try {
      setCommenting(true);
      const newCommentData = await createCommunityComment(params.id as string, content);
      
      // 댓글 목록에 추가
      setComments(prev => [...prev, newCommentData]);
      
      // 게시글의 댓글 수 업데이트
      if (post) {
        setPost({
          ...post,
          comments_count: post.comments_count + 1
        });
      }
    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
        <div className="animate-pulse">
          <div className="h-8 bg-cyan-400/20 rounded w-32 mb-6"></div>
          <div className="bg-cyan-900/30 border border-cyan-400/30 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-cyan-400/20 rounded w-32 mb-2"></div>
                <div className="h-3 bg-cyan-400/20 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-cyan-400/20 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-cyan-400/20 rounded w-full"></div>
              <div className="h-4 bg-cyan-400/20 rounded w-5/6"></div>
              <div className="h-4 bg-cyan-400/20 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
        <div className="text-center py-12">
          <div className="text-cyan-300 text-lg mb-4">게시글을 찾을 수 없습니다.</div>
          <Button 
            onClick={() => router.push('/dashboard/community')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      {/* 뒤로가기 버튼 */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard/community')}
        className="mb-6 text-cyan-200 hover:text-cyan-100 hover:bg-cyan-900/30"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        목록으로 돌아가기
      </Button>

      {/* 게시글 상세 */}
      <Card className={`mb-6 bg-transparent text-cyan-100 ${
        post.author.role === 'admin' 
          ? 'border-2 border-cyan-400 shadow-[0_0_15px_0_rgba(0,255,255,0.4)]' 
          : 'border border-cyan-400/30'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatar 
                src={post.author.avatar} 
                name={post.author.name}
                role={post.author.role}
                size="lg"
              />
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-cyan-200 text-lg">{post.author.name}</span>
                  <RoleBadge role={post.author.role} size="md" />
                  <span className="text-sm text-cyan-300/70">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            {currentUserId === post.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeletePost}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <h1 className="text-2xl font-bold text-cyan-100 mb-4">{post.title}</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-cyan-200 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 이미지 표시 */}
          {post.images && post.images.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.images.map((imageUrl: string, index: number) => (
                <div key={index} className="relative">
                  <Image
                    src={imageUrl}
                    alt={`게시글 이미지 ${index + 1}`}
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card className="bg-transparent border border-cyan-400/30 text-cyan-100">
        <CardHeader>
          <h2 className="text-xl font-bold text-cyan-200">댓글 ({post.comments_count})</h2>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 댓글 작성 폼 */}
          <CommentForm 
            onSubmit={handleAddComment}
            loading={commenting}
          />

          {/* 댓글 목록 */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-cyan-300/70">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </div>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onDelete={handleDeleteComment}
                  isDeleting={deletingComment === comment.id}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
