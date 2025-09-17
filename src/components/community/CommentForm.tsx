'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
}

export function CommentForm({ 
  onSubmit, 
  loading = false, 
  placeholder = '댓글을 입력하세요...' 
}: CommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    try {
      await onSubmit(content);
      setContent(''); // 성공 시 입력 필드 초기화
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-cyan-900/30 border-cyan-400/30 text-cyan-100 placeholder:text-cyan-400/50 min-h-[80px]"
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {loading ? '작성 중...' : '댓글 작성'}
        </Button>
      </div>
    </form>
  );
}
