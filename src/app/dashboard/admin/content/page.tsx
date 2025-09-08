'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, MapPin, BookOpen, Users, Camera, Save, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { updateContent, getContent } from '@/lib/actions';

export default function ContentManagePage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 통합 컨텐츠 상태
  const [content, setContent] = useState({
    about_title: 'About Coducation',
    about_subtitle: '우리는 코딩 교육을 통해 아이들이 미래의 창의적인 인재로 성장할 수 있도록 돕습니다.',
    about_mission: 'Coducation은 단순한 코딩 기술 교육을 넘어, 논리적 사고력, 문제 해결 능력, 창의력을 함양하는 것을 목표로 합니다.',
    about_vision: '우리는 모든 학생이 코딩을 통해 자신의 아이디어를 현실로 만들 수 있는 세상을 꿈꿉니다.',
    about_image: 'https://placehold.co/600x400.png',
    academy_title: '코딩메이커 학원 안내',
    academy_subtitle: '창의력과 기술이 만나는 곳, 코딩메이커 학원에 오신 것을 환영합니다.',
    academy_features: [
      {
        title: '최적의 학습 환경',
        description: '전남 광양에 위치한 저희 학원은 학생들이 코딩에만 집중할 수 있도록 쾌적하고 현대적인 학습 공간을 제공합니다.'
      },
      {
        title: '체계적인 교육 철학',
        description: '프로젝트 기반 학습(PBL)을 통해 학생들이 실제 문제를 해결하며 배우는 실용적인 교육을 추구합니다.'
      },
      {
        title: '소수 정예 맞춤 수업',
        description: '소수 정예로 클래스를 운영하여 강사가 학생 한 명 한 명에게 집중하고, 맞춤형 피드백을 제공합니다.'
      }
    ],
    academy_slides: [
      {
        title: '최첨단 학습 환경',
        description: '학생들이 창의력을 마음껏 발휘할 수 있는 현대적이고 영감을 주는 공간을 제공합니다.',
        image: 'https://placehold.co/600x400.png'
      },
      {
        title: '개인별 맞춤 지도',
        description: '소수 정예 수업으로 강사가 학생 한 명 한 명에게 집중하여 잠재력을 최대로 이끌어냅니다.',
        image: 'https://placehold.co/600x400.png'
      },
      {
        title: '실전 프로젝트 중심',
        description: '실제 문제를 해결하는 프로젝트를 통해 코딩 실력과 문제 해결 능력을 동시에 기릅니다.',
        image: 'https://placehold.co/600x400.png'
      }
    ]
  });

  // 컨텐츠 로드
  useEffect(() => {
    const loadContent = async () => {
      const result = await getContent();
      if (result.success && result.data) {
        setContent(result.data);
      }
      setIsLoading(false);
    };
    loadContent();
  }, []);

  const handleImageUpload = async (section: 'about' | 'academy', slideIndex?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          // 파일 크기 체크 (5MB 제한)
          if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            setIsUploading(false);
            return;
          }

          // 파일 형식 체크
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            alert('JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.');
            setIsUploading(false);
            return;
          }

          // 파일명 정리 (특수문자 제거)
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${section}/${Date.now()}-${cleanFileName}`;

          // Supabase Storage에 업로드 (content-images 버킷 사용)
          const { data, error } = await supabase.storage
            .from('content-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) {
            console.error('Storage 업로드 오류:', error);
            alert(`이미지 업로드에 실패했습니다: ${error.message}`);
            setIsUploading(false);
            return;
          }

          // 공개 URL 가져오기
          const { data: urlData } = supabase.storage
            .from('content-images')
            .getPublicUrl(fileName);

          console.log('업로드 성공:', urlData.publicUrl);

          if (section === 'about') {
            setContent(prev => ({ ...prev, about_image: urlData.publicUrl }));
          } else if (slideIndex !== undefined) {
            setContent(prev => ({
              ...prev,
              academy_slides: prev.academy_slides.map((slide, idx) => 
                idx === slideIndex ? { ...slide, image: urlData.publicUrl } : slide
              )
            }));
          }
        } catch (error) {
          console.error('이미지 업로드 오류:', error);
          alert('이미지 업로드 중 오류가 발생했습니다.');
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const handleSave = async () => {
    const formData = new FormData();
    // 메인 제목은 고정이므로 저장하지 않음
    formData.append('about_title', content.about_title); // DB 기본값 유지
    formData.append('about_subtitle', content.about_subtitle);
    formData.append('about_mission', content.about_mission);
    formData.append('about_vision', content.about_vision);
    formData.append('about_image', content.about_image);
    formData.append('academy_title', content.academy_title); // DB 기본값 유지
    formData.append('academy_subtitle', content.academy_subtitle);
    formData.append('academy_features', JSON.stringify(content.academy_features));
    formData.append('academy_slides', JSON.stringify(content.academy_slides));

    const result = await updateContent(formData);
    if (result.success) {
      alert('모든 컨텐츠가 저장되었습니다.');
    } else {
      alert(result.error || '저장에 실패했습니다.');
    }
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % content.academy_slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + content.academy_slides.length) % content.academy_slides.length);
  };

  // 슬라이드 관리 함수들
  const addSlide = () => {
    const newSlide = {
      title: '새 슬라이드 제목',
      description: '새 슬라이드 설명을 입력하세요.',
      image: 'https://placehold.co/600x400.png'
    };
    setContent(prev => ({
      ...prev,
      academy_slides: [...prev.academy_slides, newSlide]
    }));
    setCurrentSlideIndex(content.academy_slides.length); // 새로 추가된 슬라이드로 이동
  };

  const deleteSlide = (index: number) => {
    if (content.academy_slides.length <= 1) {
      alert('최소 1개의 슬라이드는 필요합니다.');
      return;
    }
    
    if (confirm('정말로 이 슬라이드를 삭제하시겠습니까?')) {
      setContent(prev => ({
        ...prev,
        academy_slides: prev.academy_slides.filter((_, idx) => idx !== index)
      }));
      
      // 현재 인덱스 조정
      if (currentSlideIndex >= content.academy_slides.length - 1) {
        setCurrentSlideIndex(Math.max(0, content.academy_slides.length - 2));
      }
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.academy_slides.length) return;

    const newSlides = [...content.academy_slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    
    setContent(prev => ({
      ...prev,
      academy_slides: newSlides
    }));
    
    setCurrentSlideIndex(newIndex);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-cyan-100 text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 px-4 py-4 lg:px-12 lg:py-10 box-border pt-16 lg:pt-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">메인페이지 컨텐츠 관리</h1>
      </div>
      
      <div className="space-y-16 max-w-7xl mx-auto">
        {/* About 섹션 */}
        <section className="w-full py-16 border-4 border-cyan-400/50 rounded-lg relative bg-cyan-900/10">
          <div className="absolute -top-4 left-6 bg-cyan-600 px-4 py-2 rounded text-white font-bold">
            About 섹션
          </div>
          
          <div className="container px-6 pt-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-cyan-300 text-sm font-bold tracking-wider">🏷️ 메인 제목</label>
                  <Textarea
                    value={content.about_title}
                    onChange={(e) => setContent(prev => ({ ...prev, about_title: e.target.value }))}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline bg-transparent border-2 border-cyan-400/50 text-white resize-none overflow-hidden min-h-0 p-4"
                    rows={2}
                    placeholder="제목을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-cyan-300 text-sm font-bold tracking-wider">📝 부제목</label>
                  <Textarea
                    value={content.about_subtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, about_subtitle: e.target.value }))}
                    className="text-lg text-muted-foreground bg-transparent border-2 border-cyan-400/30 resize-none p-3"
                    rows={2}
                    placeholder="부제목을 입력하세요"
                  />
                </div>
                <div className="space-y-6 text-foreground/80">
                  <div className="space-y-2">
                    <label className="text-cyan-300 text-sm font-bold tracking-wider flex items-center gap-2">
                      🎯 미션 내용
                    </label>
                    <Textarea
                      value={content.about_mission}
                      onChange={(e) => setContent(prev => ({ ...prev, about_mission: e.target.value }))}
                      className="text-base leading-relaxed bg-transparent border-2 border-cyan-400/30 resize-none p-3 text-white"
                      rows={4}
                      placeholder="미션을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-cyan-300 text-sm font-bold tracking-wider flex items-center gap-2">
                      🚀 비전 내용
                    </label>
                    <Textarea
                      value={content.about_vision}
                      onChange={(e) => setContent(prev => ({ ...prev, about_vision: e.target.value }))}
                      className="text-base leading-relaxed bg-transparent border-2 border-cyan-400/30 resize-none p-3 text-white"
                      rows={4}
                      placeholder="비전을 입력하세요"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-center">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => handleImageUpload('about')}
                >
                  <Image
                    src={content.about_image}
                    alt="Team working on code"
                    width={600}
                    height={400}
                    className="rounded-xl border-2 border-cyan-400/30"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-bold text-lg">이미지 변경</p>
                    </div>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>업로드 중...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academy 섹션 */}
        <section className="w-full py-16 border-4 border-orange-400/50 rounded-lg relative bg-orange-900/10">
          <div className="absolute -top-4 left-6 bg-orange-600 px-4 py-2 rounded text-white font-bold">
            학원 안내 섹션
          </div>
          
          <div className="container px-6 pt-8">
            <div className="flex flex-col items-center text-center space-y-6 mb-12">
              <div className="space-y-2 w-full max-w-4xl">
                <label className="text-orange-300 text-sm font-bold tracking-wider">🏷️ 메인 제목</label>
                <Textarea
                  value={content.academy_title}
                  onChange={(e) => setContent(prev => ({ ...prev, academy_title: e.target.value }))}
                  className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline bg-transparent border-2 border-orange-400/50 text-center resize-none overflow-hidden min-h-0 p-4 text-white"
                  rows={1}
                  placeholder="제목을 입력하세요"
                />
              </div>
              <div className="space-y-2 w-full max-w-2xl">
                <label className="text-orange-300 text-sm font-bold tracking-wider">📝 부제목</label>
                <Textarea
                  value={content.academy_subtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, academy_subtitle: e.target.value }))}
                  className="text-lg text-muted-foreground bg-transparent border-2 border-orange-400/30 text-center resize-none p-3"
                  rows={2}
                  placeholder="부제목을 입력하세요"
                />
              </div>
            </div>
            
            {/* 슬라이드 섹션 */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevSlide}
                    className="border-orange-400/40 text-orange-200 hover:bg-orange-400/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-orange-200 px-4 font-bold text-lg">
                    슬라이드 {currentSlideIndex + 1} / {content.academy_slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextSlide}
                    className="border-orange-400/40 text-orange-200 hover:bg-orange-400/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={addSlide}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    슬라이드 추가
                  </Button>
                  <Button
                    onClick={() => moveSlide(currentSlideIndex, 'up')}
                    disabled={currentSlideIndex === 0}
                    size="sm"
                    variant="outline"
                    className="border-orange-400/40 text-orange-200 hover:bg-orange-400/10 disabled:opacity-50"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => moveSlide(currentSlideIndex, 'down')}
                    disabled={currentSlideIndex === content.academy_slides.length - 1}
                    size="sm"
                    variant="outline"
                    className="border-orange-400/40 text-orange-200 hover:bg-orange-400/10 disabled:opacity-50"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteSlide(currentSlideIndex)}
                    disabled={content.academy_slides.length <= 1}
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 items-center bg-card rounded-xl overflow-hidden border-2 border-orange-400/30">
                <div className="p-8 md:p-12 space-y-6 order-2 md:order-1">
                  <div className="space-y-2">
                    <label className="text-orange-300 text-sm font-bold tracking-wider">🎯 슬라이드 제목</label>
                    <Input
                      value={content.academy_slides[currentSlideIndex].title}
                      onChange={(e) => {
                        const newSlides = [...content.academy_slides];
                        newSlides[currentSlideIndex].title = e.target.value;
                        setContent(prev => ({ ...prev, academy_slides: newSlides }));
                      }}
                      className="text-3xl font-bold text-primary font-headline tracking-wider bg-transparent border-2 border-primary/50 p-4"
                      placeholder="슬라이드 제목"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-orange-300 text-sm font-bold tracking-wider">📖 슬라이드 설명</label>
                    <Textarea
                      value={content.academy_slides[currentSlideIndex].description}
                      onChange={(e) => {
                        const newSlides = [...content.academy_slides];
                        newSlides[currentSlideIndex].description = e.target.value;
                        setContent(prev => ({ ...prev, academy_slides: newSlides }));
                      }}
                      className="text-lg text-muted-foreground bg-transparent border-2 border-primary/30 resize-none p-3 leading-relaxed"
                      rows={4}
                      placeholder="슬라이드 설명"
                    />
                  </div>
                </div>
                <div className="relative w-full h-96 order-1 md:order-2 cursor-pointer group"
                     onClick={() => handleImageUpload('academy', currentSlideIndex)}>
                  <Image 
                    src={content.academy_slides[currentSlideIndex].image} 
                    alt={content.academy_slides[currentSlideIndex].title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-bold text-lg">이미지 변경</p>
                    </div>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>업로드 중...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 슬라이드 도트 네비게이션 */}
              <div className="flex justify-center items-center gap-2 mt-6">
                {content.academy_slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-4 h-4 rounded-full transition-all ${
                      index === currentSlideIndex 
                        ? 'bg-orange-400 scale-125 shadow-lg' 
                        : 'bg-gray-400 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 특징 카드 섹션 */}
            <div className="w-full grid gap-8 md:grid-cols-3">
              {content.academy_features.map((feature, index) => (
                <Card key={index} className="flex flex-col border-2 border-orange-400/30 bg-orange-900/5">
                  <CardHeader className="flex flex-col items-center text-center space-y-4">
                    {index === 0 && <MapPin className="h-8 w-8 text-primary" />}
                    {index === 1 && <BookOpen className="h-8 w-8 text-primary" />}
                    {index === 2 && <Users className="h-8 w-8 text-primary" />}
                    <div className="space-y-2 w-full">
                      <label className="text-orange-300 text-xs font-bold tracking-wider">🏷️ 특징 제목</label>
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...content.academy_features];
                          newFeatures[index].title = e.target.value;
                          setContent(prev => ({ ...prev, academy_features: newFeatures }));
                        }}
                        className="text-xl font-headline text-center bg-transparent border-2 border-primary/50 font-bold p-3"
                        placeholder="특징 제목"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground flex-grow">
                    <div className="space-y-2">
                      <label className="text-orange-300 text-xs font-bold tracking-wider">📝 특징 설명</label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...content.academy_features];
                          newFeatures[index].description = e.target.value;
                          setContent(prev => ({ ...prev, academy_features: newFeatures }));
                        }}
                        className="text-sm leading-relaxed bg-transparent border-2 border-primary/30 text-center resize-none p-3 w-full"
                        rows={4}
                        placeholder="특징 설명"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      {/* 최하단 전체 저장 버튼 */}
      <div className="w-full flex justify-center py-8">
        <Button
          onClick={handleSave}
          disabled={isLoading || isUploading}
          className="bg-gradient-to-r from-cyan-600 to-orange-600 hover:from-cyan-500 hover:to-orange-500 text-white px-12 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
          size="lg"
        >
          <Save className="w-5 h-5 mr-3" />
          {isLoading || isUploading ? '저장 중...' : '전체 컨텐츠 저장'}
        </Button>
      </div>
    </div>
  );
}