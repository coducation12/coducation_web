'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import {
  getCommunityPosts,
  createCommunityPost
} from '@/lib/community';
import { CommunityPost } from '@/types/community';
import { getCurrentUserClient } from '@/lib/client-auth';
import { PostCard } from '@/components/community/PostCard';
import { PostForm } from '@/components/community/PostForm';
import { Pagination } from '@/components/community/Pagination';

export const dynamic = 'force-dynamic';

function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const postsPerPage = 10;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // 게시글 목록 로드
  useEffect(() => {
    loadPosts();
    loadCurrentUser();
  }, [currentPage]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUserClient();
      setCurrentUserId(user?.id || null);
      setCurrentUserRole(user?.role || null);
    } catch (error) {
      // 에러 로그 제거 - 조용히 처리
    }
  };

  const loadPosts = async (query?: string) => {
    try {
      setLoading(true);
      const result = await getCommunityPosts(currentPage, postsPerPage, query !== undefined ? query : searchQuery);
      setPosts(result.posts);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      // 에러 로그 제거 - 조용히 처리
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (title: string, content: string, images: string[] = []) => {
    try {
      setCreating(true);
      await createCommunityPost(title, content, images);
      setIsDialogOpen(false);
      await loadPosts();
    } catch (error) {
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setCurrentPage(1);
    await loadPosts(searchQuery);
    setIsSearching(false);
  };

  const handlePostClick = useCallback((postId: string) => {
    router.push(`/dashboard/community/${postId}`);
  }, [router]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커뮤니티</h1>
            <p className="text-cyan-200 mt-2 font-medium drop-shadow">
              {isSearching ? '검색 중...' : '학습에 대한 이야기를 나누고 정보를 공유해보세요'}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow">
                <Plus className="h-4 w-4 mr-2" />
                새 글 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#183c5a] border-cyan-400/30 text-cyan-100 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-cyan-100">새 글 작성</DialogTitle>
              </DialogHeader>
              <PostForm onSubmit={handleCreatePost} loading={creating} />
            </DialogContent>
          </Dialog>
        </div>

        {/* 로딩 스켈레톤 */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-transparent border border-cyan-400/30 text-cyan-100 min-h-[56px] animate-pulse rounded-lg">
              <div className="py-2 px-4 flex items-center min-h-[56px] gap-3">
                <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex-shrink-0"></div>
                <div className="flex flex-col justify-center min-w-[120px] max-w-[120px] flex-shrink-0 gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-4 bg-cyan-400/20 rounded"></div>
                    <div className="w-16 h-3 bg-cyan-400/20 rounded"></div>
                  </div>
                  <div className="w-20 h-3 bg-cyan-400/20 rounded"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="w-32 h-4 bg-cyan-400/20 rounded"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="w-48 h-3 bg-cyan-400/20 rounded"></div>
                </div>
                <div className="w-8 h-4 bg-cyan-400/20 rounded flex-shrink-0"></div>
              </div>
            </div>
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
          <p className="text-cyan-200 mt-2 font-medium drop-shadow">
            {isSearching ? '검색 중...' : '학습에 대한 이야기를 나누고 정보를 공유해보세요'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow">
              <Plus className="h-4 w-4 mr-2" />
              새 글 작성
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#183c5a] border-cyan-400/30 text-cyan-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-cyan-100">새 글 작성</DialogTitle>
            </DialogHeader>
            <PostForm onSubmit={handleCreatePost} loading={creating} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="제목, 내용, 작성자로 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-cyan-900/30 border-cyan-400/30 text-cyan-100 placeholder:text-cyan-400/50"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-cyan-300 text-lg mb-4">
            {isSearching ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
          </div>
          <p className="text-cyan-400/70">
            {isSearching ? '다른 검색어를 시도해보세요.' : '첫 번째 게시글을 작성해보세요!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onClick={handlePostClick}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={loading}
      />

      {/* 게시글 수 표시 */}
      <div className="text-center mt-6 text-cyan-300/70 text-sm">
        총 {totalCount}개의 게시글
      </div>
    </div>
  );
}

export default CommunityPage;
