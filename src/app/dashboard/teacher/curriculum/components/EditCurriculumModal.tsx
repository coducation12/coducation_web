'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressImageToBase64, validateImageFile, formatFileSize } from '@/lib/image-utils';

export interface CurriculumData {
  id: string;
  title: string;
  category: string;
  level: '기초' | '중급' | '고급';
  students: number;
  status: 'preparing' | 'completed';
  description?: string;
  image?: string;
  courses?: string[];
}

interface EditCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: CurriculumData | null;
  onUpdateCurriculum: (data: CurriculumData) => void;
}

export default function EditCurriculumModal({
  isOpen,
  onClose,
  curriculum,
  onUpdateCurriculum
}: EditCurriculumModalProps) {
  const [formData, setFormData] = useState<CurriculumData>({
    id: '',
    title: '',
    category: '',
    level: '기초',
    students: 0,
    status: 'preparing',
    description: '',
    image: '',
    courses: ['']
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // curriculum이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    if (curriculum) {
      setFormData({
        ...curriculum,
        courses: curriculum.courses || ['']
      });
    }
  }, [curriculum]);

  const handleAddCourse = () => {
    setFormData(prev => ({
      ...prev,
      courses: [...(prev.courses || []), '']
    }));
  };

  const handleRemoveCourse = (index: number) => {
    if (formData.courses && formData.courses.length > 1) {
      setFormData(prev => ({
        ...prev,
        courses: prev.courses?.filter((_, i) => i !== index) || ['']
      }));
    }
  };

  const handleCourseChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses?.map((course, i) => i === index ? value : course) || ['']
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        setIsUploading(false);
        return;
      }

      // 파일 형식 체크
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, GIF 파일만 업로드 가능합니다.');
        setIsUploading(false);
        return;
      }

      // RLS 정책 문제로 인해 임시로 Base64 방식 사용
      // TODO: Supabase Storage RLS 정책 설정 후 다시 Supabase Storage 사용

      // 이미지 압축을 위한 Canvas 사용
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // 이미지 크기 조정 (최대 800px)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height);

        // 압축된 Base64 생성 (품질 0.7)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, image: compressedDataUrl }));
        setIsUploading(false);
      };

      img.onerror = (error: any) => {
        console.error('이미지 로드 오류:', error);
        alert('이미지를 로드하는 중 오류가 발생했습니다.');
        setIsUploading(false);
      };

      // FileReader로 이미지 로드
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (error: any) => {
        console.error('파일 읽기 오류:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(`이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    const filteredCourses = formData.courses?.filter(course => course.trim() !== '') || [];

    if (!formData.title.trim() || !formData.category.trim() || filteredCourses.length === 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    onUpdateCurriculum({
      ...formData,
      courses: filteredCourses
    });

    onClose();
  };

  const handleCancel = () => {
    // 원본 데이터로 복원
    if (curriculum) {
      setFormData({
        ...curriculum,
        courses: curriculum.courses || ['']
      });
    }
    onClose();
  };

  if (!curriculum) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-100 text-xl font-bold">커리큘럼 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-cyan-200">과정명 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="과정명을 입력하세요"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-cyan-200">분류 *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="분류를 입력하세요 (예: 프론트엔드, 백엔드, AI)"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
              />
            </div>
          </div>

          {/* 레벨 선택 */}
          <div className="space-y-2">
            <Label htmlFor="level" className="text-cyan-200">레벨 *</Label>
            <Select value={formData.level} onValueChange={(value: '기초' | '중급' | '고급') => setFormData(prev => ({ ...prev, level: value }))}>
              <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-cyan-400/40">
                <SelectItem value="기초" className="text-cyan-100 hover:bg-cyan-900/20">기초</SelectItem>
                <SelectItem value="중급" className="text-cyan-100 hover:bg-cyan-900/20">중급</SelectItem>
                <SelectItem value="고급" className="text-cyan-100 hover:bg-cyan-900/20">고급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 상태 선택 */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-cyan-200">상태</Label>
            <Select value={formData.status} onValueChange={(value: 'preparing' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-cyan-400/40">
                <SelectItem value="preparing" className="text-cyan-100 hover:bg-cyan-900/20">준비중</SelectItem>
                <SelectItem value="completed" className="text-cyan-100 hover:bg-cyan-900/20">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-cyan-200">설명 <span className="text-cyan-400 text-xs">(선택)</span></Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="커리큘럼에 대한 상세 설명을 입력하세요"
              className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 min-h-[100px]"
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <Label className="text-cyan-200">대표 이미지 <span className="text-cyan-400 text-xs">(선택)</span></Label>
            <div className="space-y-3">
              {formData.image ? (
                <div className="relative w-full h-48 rounded-lg border border-cyan-500/30 overflow-hidden">
                  <Image
                    src={formData.image.startsWith('data:') ? formData.image : formData.image}
                    alt="커리큘럼 이미지"
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    onError={(e) => {
                      console.error('이미지 로드 실패:', formData.image);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    onClick={removeImage}
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 z-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>업로드 중...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? '업로드 중...' : '이미지 선택'}
                  </Button>
                  <p className="text-cyan-400/60 text-sm mt-2">JPG, PNG, GIF 파일을 선택하세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 과정 리스트 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-cyan-200">과정 리스트 *</Label>
              <Button
                type="button"
                onClick={handleAddCourse}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                과정 추가
              </Button>
            </div>

            <Card className="bg-background/20 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {formData.courses?.map((course, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-cyan-600/30 border border-cyan-500/50 rounded-full flex items-center justify-center">
                        <span className="text-cyan-200 text-sm font-medium">{index + 1}</span>
                      </div>
                      <Input
                        value={course}
                        onChange={(e) => handleCourseChange(index, e.target.value)}
                        placeholder={`${index + 1}번째 과정을 입력하세요`}
                        className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                      />
                      {formData.courses && formData.courses.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveCourse(index)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-cyan-500/20">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              <X className="w-4 h-4 mr-1" />
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 