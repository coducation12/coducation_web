'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCommunityPost } from '@/lib/community';
import { PostForm } from '@/components/community/PostForm';

export default function CommunityNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (title: string, content: string, images: string[] = []) => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      await createCommunityPost(title, content, images);
      router.push("/dashboard/community");
    } catch (error) {
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-xl bg-[#183c5a] border border-cyan-400/30 rounded-xl p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-cyan-100">새 글 작성</h2>
        </div>
        
        <PostForm 
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
