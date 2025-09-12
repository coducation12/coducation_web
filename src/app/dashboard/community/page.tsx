'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, MessageCircle, Heart, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { 
  CommunityPost,
  getCommunityPosts,
  createCommunityPost
} from '@/lib/community';
import { formatDate, roleLabels } from '@/lib/community-utils';

const badgeColorMap = {
  student: 'bg-cyan-700 text-white',
  parent: 'bg-green-700 text-white',
  teacher: 'bg-purple-700 text-white',
  admin: 'bg-red-700 text-white',
};

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 게시글 목록 로드
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

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

  const handleLike = (postId: string) => {
    // TODO: 좋아요 기능 구현 (추후 좋아요 테이블 생성 후)
    console.log('Like post:', postId);
  };

  const handlePostClick = (postId: string) => {
    router.push(`/dashboard/community/${postId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2">
        <div className="flex justify-center items-center h-64">
          <div className="text-cyan-200">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2">
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
          posts
            .sort((a, b) => {
              // 관리자 게시글을 최상단에 배치
              if (a.author.role === 'admin' && b.author.role !== 'admin') return -1;
              if (a.author.role !== 'admin' && b.author.role === 'admin') return 1;
              // 그 다음은 최신순
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .map((post) => (
            <Card
              key={post.id}
              className="transition-shadow cursor-pointer bg-transparent border border-cyan-400/30 text-cyan-100 min-h-[56px] hover:bg-cyan-900/30"
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
                    <Badge className={`w-[48px] min-w-[48px] max-w-[48px] text-xs font-bold px-0 py-0.5 flex items-center justify-center text-center ${badgeColorMap[post.author.role]}`}>{roleLabels[post.author.role]}</Badge>
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
                {/* 4열: 좋아요/댓글 */}
                <div className="flex items-center min-w-[70px] max-w-[70px] flex-shrink-0 justify-end gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleLike(post.id); }}
                    className={`flex items-center space-x-1 h-8 px-2 focus:outline-none ${post.is_liked ? 'text-pink-300' : 'text-cyan-200'}`}
                    type="button"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">{post.likes_count}</span>
                  </button>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments_count}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 