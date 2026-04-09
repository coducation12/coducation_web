'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/ui/image-uploader';
import { deleteImageFromStorageClient } from '@/lib/client-image-upload';

interface PostFormProps {
  onSubmit: (title: string, content: string, images: string[]) => Promise<void>;
  loading?: boolean;
  initialTitle?: string;
  initialContent?: string;
  initialImages?: string[];
}

export function PostForm({
  onSubmit,
  loading = false,
  initialTitle = '',
  initialContent = '',
  initialImages = []
}: PostFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<string[]>(initialImages);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await onSubmit(title, content, images);
      // 성공 시 폼 초기화
      setTitle('');
      setContent('');
      setImages([]);
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const handleImageRemove = (imageUrl: string) => {
    // 🟠 중요: 저장소에서 실제로 삭제하지 않습니다. 
    // 학생 진도 소스나 다른 곳에서 여전히 참조 중일 수 있기 때문입니다.
    setImages(prev => prev.filter(url => url !== imageUrl));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">제목</label>
        <Input
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-cyan-900/30 border-cyan-400/30 text-cyan-100 placeholder:text-cyan-400/50"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">내용</label>
        <Textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-cyan-900/30 border-cyan-400/30 text-cyan-100 placeholder:text-cyan-400/50 min-h-[120px]"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">이미지 (선택사항)</label>
        <ImageUploader
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          images={images}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="bg-cyan-600 hover:bg-cyan-700 text-white w-full"
        >
          {loading ? '저장 중...' : (initialTitle ? '수정 완료' : '작성 완료')}
        </Button>
      </div>
    </form>
  );
}
