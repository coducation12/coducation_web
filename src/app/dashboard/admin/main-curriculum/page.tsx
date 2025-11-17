'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Plus, Upload, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { getMainCurriculums, updateMainCurriculums, addMainCurriculum, updateMainCurriculum, deleteMainCurriculum } from '@/lib/actions';
import { supabase } from '@/lib/supabase';
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-utils';
import type { MainCurriculum } from '@/types';

export default function MainCurriculumPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [curriculums, setCurriculums] = useState<MainCurriculum[]>([]);
  const [groupedCurriculums, setGroupedCurriculums] = useState<Record<string, MainCurriculum[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'기초' | '중급' | '고급' | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<MainCurriculum | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const levelOrder: MainCurriculum['level'][] = ['기초', '중급', '고급'];
  const levelColors = {
    '기초': 'bg-green-500',
    '중급': 'bg-yellow-500',
    '고급': 'bg-red-500',
  };

  // 커리큘럼 로드
  useEffect(() => {
    const loadCurriculums = async () => {
      setIsLoading(true);
      const result = await getMainCurriculums();
      if (result.success && result.data) {
        setCurriculums(result.data);
        // 레벨별로 그룹화
        const grouped = result.data.reduce((acc, curr) => {
          const level = curr.level;
          if (!acc[level]) {
            acc[level] = [];
          }
          acc[level].push(curr);
          return acc;
        }, {} as Record<string, MainCurriculum[]>);
        
        // 각 레벨별로 정렬 (display_order로 정렬)
        Object.keys(grouped).forEach(level => {
          grouped[level] = grouped[level]
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        });
        
        setGroupedCurriculums(grouped);
      }
      setIsLoading(false);
    };
    loadCurriculums();
  }, []);

  // 그룹화 업데이트 함수
  const updateGroupedCurriculums = () => {
    const grouped = curriculums.reduce((acc, curr) => {
      const level = curr.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(curr);
      return acc;
    }, {} as Record<string, MainCurriculum[]>);
    
    Object.keys(grouped).forEach(level => {
      grouped[level].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    });
    
    setGroupedCurriculums(grouped);
  };

  // 순서 변경
  const moveCurriculum = (curriculumId: string, direction: 'up' | 'down') => {
    const curriculum = curriculums.find(c => c.id === curriculumId);
    if (!curriculum) return;

    const level = curriculum.level;
    const levelCurriculums = groupedCurriculums[level] || [];
    const currentIndex = levelCurriculums.findIndex(c => c.id === curriculumId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= levelCurriculums.length) return;

    // 같은 레벨 내에서만 순서 변경
    const reordered = [...levelCurriculums];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    
    // display_order 업데이트
    const updatedCurriculums = curriculums.map(curr => {
      const reorderedItem = reordered.find(r => r.id === curr.id);
      if (reorderedItem && curr.level === level) {
        const newIndex = reordered.findIndex(r => r.id === curr.id);
        return {
          ...curr,
          display_order: newIndex,
        };
      }
      return curr;
    });

    setCurriculums(updatedCurriculums);

    // 그룹화 업데이트
    const grouped = updatedCurriculums.reduce((acc, curr) => {
      const level = curr.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(curr);
      return acc;
    }, {} as Record<string, MainCurriculum[]>);
    
    Object.keys(grouped).forEach(level => {
      grouped[level] = grouped[level]
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    });
    
    setGroupedCurriculums(grouped);
    
    // 순서 변경 시 자동 저장
    saveCurriculums(updatedCurriculums.filter(c => c.level === level));
  };

  // 자동 저장 함수
  const saveCurriculums = async (curriculumsToSave: MainCurriculum[]) => {
    try {
      const updates = curriculumsToSave.map(curr => ({
        id: curr.id,
        display_order: curr.display_order || 0,
      }));
      const result = await updateMainCurriculums(updates);
      if (!result.success) {
        console.error('자동 저장 실패:', result.error);
      }
    } catch (error) {
      console.error('자동 저장 중 오류:', error);
    }
  };

  // 추가 모달 열기
  const openAddModal = (level: '기초' | '중급' | '고급') => {
    setSelectedLevel(level);
    setSelectedCurriculum(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: '',
    });
    setIsModalOpen(true);
  };

  // 수정 모달 열기
  const openEditModal = (curriculum: MainCurriculum) => {
    setSelectedCurriculum(curriculum);
    setSelectedLevel(curriculum.level as '기초' | '중급' | '고급');
    setFormData({
      title: curriculum.title,
      description: curriculum.description || '',
      category: curriculum.category || '',
      image: curriculum.image || '',
    });
    setIsEditModalOpen(true);
  };

  // 추가 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLevel(null);
    setSelectedCurriculum(null);
    setIsUploading(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLevel(null);
    setSelectedCurriculum(null);
    setIsUploading(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: '',
    });
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // 파일 유효성 검사
      const validation = validateImageFile(file, 10 * 1024 * 1024); // 10MB 제한
      if (!validation.valid) {
        alert(validation.error);
        setIsUploading(false);
        return;
      }

      console.log(`원본 파일 크기: ${formatFileSize(file.size)}`);

      // 이미지 압축 (커리큘럼 이미지)
      const compressedBlob = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        outputFormat: 'webp'
      });

      console.log(`압축 후 크기: ${formatFileSize(compressedBlob.size)} (${((compressedBlob.size / file.size) * 100).toFixed(1)}%)`);

      // 압축된 파일을 File 객체로 변환
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
        lastModified: Date.now(),
      });

      // Supabase Storage에 압축된 이미지 업로드
      const fileName = `curriculum/${Date.now()}-${compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('content-images')
        .upload(fileName, compressedFile, {
          cacheControl: '31536000', // 1년 캐시
          upsert: true
        });

      if (error) {
        console.error('Storage 업로드 오류:', error);
        alert('이미지 업로드에 실패했습니다.');
        setIsUploading(false);
        return;
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('content-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image: urlData.publicUrl }));
      setIsUploading(false);

    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(`이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setIsUploading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 이미지 제거
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 커리큘럼 추가
  const handleAddCurriculum = async () => {
    if (!selectedLevel) return;

    if (!formData.title.trim()) {
      alert('과정명을 입력해주세요.');
      return;
    }

    if (!formData.category.trim()) {
      alert('분류를 입력해주세요.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('level', selectedLevel);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('image', formData.image || '');

      const result = await addMainCurriculum(formDataToSend);

      if (result.success) {
        alert('커리큘럼이 성공적으로 추가되었습니다.');
        closeModal();
        
        // 목록 다시 로드
        const loadResult = await getMainCurriculums();
        if (loadResult.success && loadResult.data) {
          setCurriculums(loadResult.data);
          updateGroupedCurriculums();
        }
      } else {
        alert(result.error || '커리큘럼 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('커리큘럼 추가 중 오류:', error);
      alert('커리큘럼 추가 중 오류가 발생했습니다.');
    }
  };

  // 커리큘럼 수정
  const handleUpdateCurriculum = async () => {
    if (!selectedCurriculum) return;

    if (!formData.title.trim()) {
      alert('과정명을 입력해주세요.');
      return;
    }

    if (!formData.category.trim()) {
      alert('분류를 입력해주세요.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', selectedCurriculum.id);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('level', selectedCurriculum.level);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('image', formData.image || '');

      const result = await updateMainCurriculum(formDataToSend);

      if (result.success) {
        alert('커리큘럼이 성공적으로 수정되었습니다.');
        closeEditModal();
        
        // 목록 다시 로드
        const loadResult = await getMainCurriculums();
        if (loadResult.success && loadResult.data) {
          setCurriculums(loadResult.data);
          updateGroupedCurriculums();
        }
      } else {
        alert(result.error || '커리큘럼 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('커리큘럼 수정 중 오류:', error);
      alert('커리큘럼 수정 중 오류가 발생했습니다.');
    }
  };

  // 커리큘럼 삭제
  const handleDeleteCurriculum = async () => {
    if (!selectedCurriculum) return;

    if (!confirm(`정말로 "${selectedCurriculum.title}" 커리큘럼을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const deleteResult = await deleteMainCurriculum(selectedCurriculum.id);
      
      if (!deleteResult.success) {
        alert(deleteResult.error || '커리큘럼 삭제에 실패했습니다.');
        return;
      }

      alert('커리큘럼이 성공적으로 삭제되었습니다.');
      closeEditModal();
      
      // 목록 다시 로드
      const loadResult = await getMainCurriculums();
      if (loadResult.success && loadResult.data) {
        setCurriculums(loadResult.data);
        updateGroupedCurriculums();
      }
    } catch (error) {
      console.error('커리큘럼 삭제 중 오류:', error);
      alert('커리큘럼 삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center h-screen overflow-y-auto scrollbar-hide">
        <div className="text-cyan-100 text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 px-4 py-4 lg:px-12 lg:py-10 box-border pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커리큘럼 관리</h1>
        <p className="text-cyan-200 mt-2">메인화면에 표시할 커리큘럼을 추가하고 순서를 조정할 수 있습니다.</p>
      </div>

      <div className="space-y-12 max-w-7xl mx-auto">
        {levelOrder.map((level) => {
          const levelCurriculums = groupedCurriculums[level] || [];
          const selectedCount = levelCurriculums.length;

          return (
            <Card key={level} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
              <CardHeader className="border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl font-bold text-cyan-100">{level} 과정</CardTitle>
                    <Badge className={`${levelColors[level]} text-white`}>
                      {selectedCount}개
                    </Badge>
                  </div>
                  <Button
                    onClick={() => openAddModal(level)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    항목 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {levelCurriculums.length === 0 ? (
                  <div className="text-center text-cyan-200 py-8">
                    <p className="mb-4">{level} 과정에 표시된 커리큘럼이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {levelCurriculums.map((curriculum, index) => {
                      const canMoveUp = index > 0;
                      const canMoveDown = index < levelCurriculums.length - 1;

                      return (
                        <div
                          key={curriculum.id}
                          className="flex items-center gap-4 p-4 rounded-lg border-2 bg-cyan-900/30 border-cyan-400/50 shadow-[0_0_12px_0_rgba(0,255,255,0.15)] transition-all"
                        >

                          {/* 커리큘럼 이미지 */}
                          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-cyan-500/30">
                            <Image
                              src={curriculum.image || 'https://placehold.co/200x200.png'}
                              alt={curriculum.title}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* 커리큘럼 정보 */}
                          <div 
                            className="flex-grow min-w-0 cursor-pointer"
                            onClick={() => openEditModal(curriculum)}
                          >
                            <h3 className="text-lg font-bold text-cyan-100 truncate hover:text-cyan-300 transition-colors">
                              {curriculum.title}
                            </h3>
                            <p className="text-sm text-cyan-200/70 line-clamp-2 mt-1">
                              {curriculum.description || '설명이 없습니다.'}
                            </p>
                          </div>

                          {/* 순서 조정 버튼 */}
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCurriculum(curriculum.id, 'up')}
                              disabled={!canMoveUp}
                              className="h-8 w-8 p-0 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCurriculum(curriculum.id, 'down')}
                              disabled={!canMoveDown}
                              className="h-8 w-8 p-0 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* 순서 표시 */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                            <span className="text-cyan-200 text-sm font-bold">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 커리큘럼 추가 모달 */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-100 text-xl font-bold">
              {selectedLevel} 과정 항목 추가
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-cyan-200">과정명 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="과정명을 입력하세요"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-cyan-200">분류 *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="분류를 입력하세요 (예: 프론트엔드, 백엔드, AI)"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-cyan-200">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="커리큘럼 설명을 입력하세요"
                rows={4}
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-cyan-200">이미지</Label>
              {formData.image ? (
                <div className="space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-cyan-400/40">
                    <Image
                      src={formData.image}
                      alt="커리큘럼 이미지 미리보기"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? '업로드 중...' : '이미지 변경'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? '업로드 중...' : '이미지 업로드'}
                  </Button>
                  <p className="text-xs text-cyan-300/70">
                    JPG, PNG, GIF 형식 (최대 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={closeModal}
                className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              >
                취소
              </Button>
              <Button
                onClick={handleAddCurriculum}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 커리큘럼 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-100 text-xl font-bold">
              커리큘럼 수정
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-cyan-200">과정명 *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="과정명을 입력하세요"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-cyan-200">분류 *</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="분류를 입력하세요 (예: 프론트엔드, 백엔드, AI)"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-cyan-200">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="커리큘럼 설명을 입력하세요"
                rows={4}
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image" className="text-cyan-200">이미지</Label>
              {formData.image ? (
                <div className="space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-cyan-400/40">
                    <Image
                      src={formData.image}
                      alt="커리큘럼 이미지 미리보기"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? '업로드 중...' : '이미지 변경'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? '업로드 중...' : '이미지 업로드'}
                  </Button>
                  <p className="text-xs text-cyan-300/70">
                    JPG, PNG, GIF 형식 (최대 10MB)
                  </p>
                </div>
              )}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteCurriculum}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                >
                  취소
                </Button>
                <Button
                  onClick={handleUpdateCurriculum}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  수정
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

