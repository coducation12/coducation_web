'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { compressImage, validateImageFile } from '@/lib/image-compression';
import { uploadImageToStorage } from '@/lib/image-upload';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: (imageUrl: string) => void;
  images: string[];
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploader({ 
  onImageUpload, 
  onImageRemove, 
  images, 
  maxImages = 5,
  disabled = false 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 최대 이미지 수 확인
    if (images.length >= maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length && images.length + i < maxImages; i++) {
        const file = files[i];
        
        // 파일 유효성 검사
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          alert(validation.error);
          continue;
        }

        // 이미지 압축
        const compressedFile = await compressImage(file);
        
        // 업로드
        const imageUrl = await uploadImageToStorage(compressedFile);
        onImageUpload(imageUrl);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    onImageRemove(imageUrl);
  };

  return (
    <div className="space-y-4">
      {/* 업로드 버튼 */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || images.length >= maxImages}
          className="border-cyan-600 text-cyan-100 hover:bg-cyan-900/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? '업로드 중...' : '이미지 추가'}
        </Button>
        <span className="text-sm text-cyan-300">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 업로드된 이미지 목록 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group bg-transparent border-cyan-400/30">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={`업로드된 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imageUrl)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 안내 문구 */}
      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-cyan-400/30 rounded-lg">
          <ImageIcon className="w-12 h-12 text-cyan-400/50 mx-auto mb-2" />
          <p className="text-cyan-300 text-sm">
            JPG, PNG, WebP 파일을 업로드하세요<br />
            최대 {maxImages}개, 각 10MB 이하
          </p>
        </div>
      )}
    </div>
  );
}
