"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createCommunityPost } from "@/lib/community";
import { ImageUploader } from "@/components/ui/image-uploader";
import { deleteImageFromStorage } from "@/lib/image-upload";

export default function CommunityNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      await createCommunityPost(title, content, images);
      router.push("/dashboard/community");
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시글 작성에 실패했습니다.');
      // 게시글 작성 실패 시 업로드된 이미지들 삭제
      for (const imageUrl of images) {
        try {
          await deleteImageFromStorage(imageUrl);
        } catch (deleteError) {
          console.error('Failed to delete image:', deleteError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const handleImageRemove = async (imageUrl: string) => {
    try {
      await deleteImageFromStorage(imageUrl);
      setImages(prev => prev.filter(url => url !== imageUrl));
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-xl bg-[#183c5a] border border-cyan-400/30 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-cyan-100 mb-6 text-center">새 글 작성</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">제목</label>
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-[#1a2a3a] text-cyan-100 border-cyan-400/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">내용</label>
            <Textarea
              placeholder="내용을 입력하세요"
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="bg-[#1a2a3a] text-cyan-100 border-cyan-400/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">이미지</label>
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              images={images}
              maxImages={5}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/community")}>취소</Button>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow" disabled={loading}>
              {loading ? "작성 중..." : "작성하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 