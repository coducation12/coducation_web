'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, MessageCircle, ImageIcon, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { 
  CommunityPost,
  getCommunityPosts,
  createCommunityPost,
  deleteCommunityPost
} from '@/lib/community';
import { getCurrentUser } from '@/lib/actions';
import { formatDate, roleLabels } from '@/lib/community-utils';

const badgeColorMap = {
  student: 'bg-cyan-700 text-white',
  parent: 'bg-green-700 text-white',
  teacher: 'bg-purple-700 text-white',
  admin: 'bg-red-700 text-white',
};

function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const postsPerPage = 15;

  // 게시글 목록 로드 및 현재 사용자 정보 가져오기
  useEffect(() => {
    loadPosts();
    loadCurrentUser();
  }, [currentPage]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await getCommunityPosts(currentPage, postsPerPage);
      setPosts(result.posts);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || creating) return;

    try {
      setCreating(true);
      await createCommunityPost(newPost.title, newPost.content);
      setNewPost({ title: '', content: '' });
      setIsDialogOpen(false);
      // 게시글 목록 새로고침
      await loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(postId);
      await deleteCommunityPost(postId);
      // 게시글 목록 새로고침
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/dashboard/community/${postId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커뮤니티</h1>
            <p className="text-cyan-200 mt-2 font-medium drop-shadow">학습에 대한 이야기를 나누고 정보를 공유해보세요</p>
          </div>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow" onClick={() => router.push('/dashboard/community/new')}>
            새 글 작성
          </Button>
        </div>

        {/* 로딩 스켈레톤 */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="bg-transparent border border-cyan-400/30 text-cyan-100 min-h-[56px] animate-pulse">
              <CardContent className="py-2 px-4 flex items-center min-h-[56px] gap-3">
                {/* 아바타 스켈레톤 */}
                <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex-shrink-0"></div>
                
                {/* 작성자 정보 스켈레톤 */}
                <div className="flex flex-col justify-center min-w-[120px] max-w-[120px] flex-shrink-0 gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-4 bg-cyan-400/20 rounded"></div>
                    <div className="w-16 h-3 bg-cyan-400/20 rounded"></div>
                  </div>
                  <div className="w-20 h-3 bg-cyan-400/20 rounded"></div>
                </div>
                
                {/* 제목 스켈레톤 */}
                <div className="flex-1 min-w-0">
                  <div className="w-3/4 h-4 bg-cyan-400/20 rounded"></div>
                </div>
                
                {/* 댓글 수 스켈레톤 */}
                <div className="flex items-center min-w-[70px] max-w-[70px] flex-shrink-0 justify-end gap-2">
                  <div className="w-8 h-4 bg-cyan-400/20 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커뮤니티</h1>
          <p className="text-cyan-200 mt-2 font-medium drop-shadow">학습에 대한 이야기를 나누고 정보를 공유해보세요</p>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow" onClick={() => router.push('/dashboard/community/new')}>
          새 글 작성
        </Button>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyan-200">아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className={`transition-shadow cursor-pointer bg-transparent text-cyan-100 min-h-[56px] hover:bg-cyan-900/30 ${
                post.author.role === 'admin' 
                  ? 'border-2 border-cyan-400 shadow-[0_0_10px_0_rgba(0,255,255,0.3)]' 
                  : 'border border-cyan-400/30'
              }`}
              onClick={() => handlePostClick(post.id)}
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
                    <Badge className={`w-[48px] min-w-[48px] max-w-[48px] text-xs font-bold px-0 py-0.5 flex items-center justify-center text-center ${badgeColorMap[post.author.role]} hover:bg-opacity-100`}>{roleLabels[post.author.role]}</Badge>
                    {post.author.name}
                  </span>
                  <span className="text-xs text-cyan-300 mt-0.5">
                    <Calendar className="h-3 w-3 mr-1 inline" />
                    {formatDate(post.created_at)}
                  </span>
                </div>
                {/* 3열: 제목 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="block text-base font-bold text-cyan-100 text-left truncate">
                      {post.title}
                    </span>
                    {post.images && post.images.length > 0 && (
                      <ImageIcon className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
                {/* 4열: 댓글/삭제 */}
                <div className="flex items-center min-w-[70px] max-w-[70px] flex-shrink-0 justify-end gap-2">
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments_count}</span>
                  </span>
                  {currentUserId === post.user_id && (
                    <button
                      onClick={(e) => handleDeletePost(post.id, e)}
                      className="flex items-center space-x-1 h-8 px-2 focus:outline-none text-red-400 hover:text-red-300 disabled:opacity-50"
                      type="button"
                      disabled={deleting === post.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 text-cyan-200 border-cyan-400/30 hover:bg-cyan-400/10"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>이전</span>
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={
                    currentPage === pageNum
                      ? "bg-cyan-500 text-white hover:bg-cyan-600"
                      : "text-cyan-200 border-cyan-400/30 hover:bg-cyan-400/10"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 text-cyan-200 border-cyan-400/30 hover:bg-cyan-400/10"
          >
            <span>다음</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 페이지 정보 */}
      <div className="text-center mt-4 text-cyan-300 text-sm">
        총 {totalCount}개의 게시글 중 {((currentPage - 1) * postsPerPage) + 1}-{Math.min(currentPage * postsPerPage, totalCount)}개 표시
      </div>
    </div>
  );
}

export default memo(CommunityPage); 