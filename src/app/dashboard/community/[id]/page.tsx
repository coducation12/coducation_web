'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, MessageCircle, Heart, Share2, ArrowLeft } from 'lucide-react';
import { 
  Post, 
  Comment, 
  mockPosts, 
  mockComments, 
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const foundPost = mockPosts.find(p => p.id === params.id);
    if (foundPost) {
      setPost(foundPost);
    }
  }, [params.id]);

  const handleLike = () => {
    if (post) {
      setPost({
        ...post,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        isLiked: !post.isLiked
      });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        name: '현재 사용자',
        role: 'student', // 실제로는 로그인된 사용자 정보에서 가져와야 함
        avatar: '/avatars/default.jpg'
      },
      createdAt: new Date().toISOString()
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };



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
                  {formatDate(post.createdAt)}
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
          <div className="flex items-center justify-between pt-4 border-t border-cyan-400/30">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 h-8 px-2 ${post.isLiked ? 'text-pink-300' : 'text-cyan-200'}`}
              >
                <Heart className={`h-3 w-3 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{post.likes}</span>
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
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow" onClick={handleAddComment} disabled={!newComment.trim()}>
                  댓글 작성
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
                      <span className="text-xs text-cyan-300">{formatDate(comment.createdAt)}</span>
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