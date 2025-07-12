'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, MessageCircle, Heart } from 'lucide-react';
import { 
  Post, 
  mockPosts, 
  roleColors, 
  roleLabels, 
  formatDate 
} from '@/lib/community-data';

const badgeColorMap = {
  student: 'bg-cyan-700 text-white',
  parent: 'bg-green-700 text-white',
  teacher: 'bg-purple-700 text-white',
  admin: 'bg-red-700 text-white',
};

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: {
        name: '현재 사용자',
        role: 'student', // 실제로는 로그인된 사용자 정보에서 가져와야 함
        avatar: '/avatars/default.jpg'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '' });
    setIsDialogOpen(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handlePostClick = (postId: string) => {
    router.push(`/dashboard/community/${postId}`);
  };

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
        {posts
          .sort((a, b) => {
            // 관리자 게시글을 최상단에 배치
            if (a.author.role === 'admin' && b.author.role !== 'admin') return -1;
            if (a.author.role !== 'admin' && b.author.role === 'admin') return 1;
            // 그 다음은 최신순
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                {/* 3열: 제목 */}
                <div className="flex-1 min-w-0">
                  <span className="block text-base font-bold text-cyan-100 text-left truncate">
                    {post.title}
                  </span>
                </div>
                {/* 4열: 좋아요/댓글 */}
                <div className="flex items-center min-w-[70px] max-w-[70px] flex-shrink-0 justify-end gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleLike(post.id); }}
                    className={`flex items-center space-x-1 h-8 px-2 focus:outline-none ${post.isLiked ? 'text-pink-300' : 'text-cyan-200'}`}
                    type="button"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">{post.likes}</span>
                  </button>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
} 