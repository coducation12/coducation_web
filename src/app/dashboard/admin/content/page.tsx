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
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-utils';

export const dynamic = 'force-dynamic';

export default function ContentManagePage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 통합 컨텐츠 상태
  const [content, setContent] = useState({
    academy_title: '코딩메이커 학원 안내',
    academy_subtitle: '창의력과 기술이 만나는 곳, 코딩메이커 학원에 오신 것을 환영합니다.',
    academy_slides: [
      {
        title: '새로운 과정 개설 안내',
        description: '파이썬 기초와 게임 개발 특강이 개설되었습니다. 많은 관심 바랍니다.',
        image: 'https://placehold.co/600x400.png'
      },
      {
        title: '코딩 경진대회 수상 소식',
        description: '본원 학생이 전국 코딩 경진대회에서 대상을 수상했습니다!',
        image: 'https://placehold.co/600x400.png'
      },
      {
        title: '학원 시설 점검 안내',
        description: '7월 25일은 학원 시설 전체 점검으로 하루 휴강합니다.',
        image: 'https://placehold.co/600x400.png'
      }
    ],
    featured_card_1_title: '코딩메이커(중마)',
    featured_card_1_image_1: 'https://placehold.co/400x300.png',
    featured_card_1_image_2: 'https://placehold.co/400x300.png',
    featured_card_1_link: 'https://maps.google.com/?q=전남+광양시+중마동',
    featured_card_2_title: '광양코딩(창덕)',
    featured_card_2_image_1: 'https://placehold.co/400x300.png',
    featured_card_2_image_2: 'https://placehold.co/400x300.png',
    featured_card_2_link: 'https://maps.google.com/?q=전남+광양시+창덕동'
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

  const handleImageUpload = async (section: 'academy' | 'featured', slideIndex?: number, cardNumber?: number, imageNumber?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
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

          // 이미지 압축
          const compressedBlob = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85,
            outputFormat: 'webp'
          });

          console.log(`압축 후 크기: ${formatFileSize(compressedBlob.size)} (${((compressedBlob.size / file.size) * 100).toFixed(1)}%)`);

          // 압축된 파일을 File 객체로 변환
          const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          // 파일명 정리 (특수문자 제거)
          const cleanFileName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${section}/${Date.now()}-${cleanFileName}`;

          // Supabase Storage에 압축된 이미지 업로드
          const { data, error } = await supabase.storage
            .from('content-images')
            .upload(fileName, compressedFile, {
              cacheControl: '31536000', // 1년 캐시
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

          if (section === 'academy' && slideIndex !== undefined) {
            setContent(prev => ({
              ...prev,
              academy_slides: prev.academy_slides.map((slide, idx) =>
                idx === slideIndex ? { ...slide, image: urlData.publicUrl } : slide
              )
            }));
          } else if (section === 'featured' && cardNumber && imageNumber) {
            const imageKey = `featured_card_${cardNumber}_image_${imageNumber}`;
            setContent(prev => ({ ...prev, [imageKey]: urlData.publicUrl }));
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
    formData.append('academy_title', content.academy_title); // DB 기본값 유지
    formData.append('academy_subtitle', content.academy_subtitle);
    formData.append('academy_slides', JSON.stringify(content.academy_slides));
    // academy_features 필드 추가 (기본값 유지)
    formData.append('academy_features', JSON.stringify([
      {
        title: "최적의 학습 환경",
        description: "전남 광양에 위치한 저희 학원은 학생들이 코딩에만 집중할 수 있도록 쾌적하고 현대적인 학습 공간을 제공합니다."
      },
      {
        title: "체계적인 교육 철학",
        description: "프로젝트 기반 학습(PBL)을 통해 학생들이 실제 문제를 해결하며 배우는 실용적인 교육을 추구합니다."
      },
      {
        title: "소수 정예 맞춤 수업",
        description: "소수 정예로 클래스를 운영하여 강사가 학생 한 명 한 명에게 집중하고, 맞춤형 피드백을 제공합니다."
      }
    ]));
    formData.append('featured_card_1_title', content.featured_card_1_title);
    formData.append('featured_card_1_image_1', content.featured_card_1_image_1);
    formData.append('featured_card_1_image_2', content.featured_card_1_image_2);
    formData.append('featured_card_1_link', content.featured_card_1_link || '');
    formData.append('featured_card_2_title', content.featured_card_2_title);
    formData.append('featured_card_2_image_1', content.featured_card_2_image_1);
    formData.append('featured_card_2_image_2', content.featured_card_2_image_2);
    formData.append('featured_card_2_link', content.featured_card_2_link || '');

    const result = await updateContent(formData);

    if (result.success) {
      alert('모든 컨텐츠가 저장되었습니다.');
      // 저장 후 데이터 다시 로드
      const loadResult = await getContent();
      if (loadResult.success && loadResult.data) {
        setContent(loadResult.data);
      }
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
      <div className="w-full h-full flex items-center justify-center h-screen overflow-y-auto scrollbar-hide">
        <div className="text-cyan-100 text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 px-4 py-4 lg:px-12 lg:py-10 box-border pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">메인페이지 컨텐츠 관리</h1>
      </div>

      <div className="space-y-16 max-w-7xl mx-auto">

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
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    priority={currentSlideIndex === 0}
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
                    className={`w-4 h-4 rounded-full transition-all ${index === currentSlideIndex
                        ? 'bg-orange-400 scale-125 shadow-lg'
                        : 'bg-gray-400 hover:bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* 학원 지점 안내 카드 섹션 */}
            <div className="mt-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* 첫 번째 카드 - 코딩메이커(중마) */}
                <Card className="border-2 border-orange-400/30 bg-orange-900/5 overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className="space-y-2">
                      <label className="text-orange-300 text-sm font-bold tracking-wider">🏷️ 코딩메이커(중마) 제목</label>
                      <Input
                        value={content.featured_card_1_title}
                        onChange={(e) => setContent(prev => ({ ...prev, featured_card_1_title: e.target.value }))}
                        className="text-2xl font-headline text-center bg-transparent border-2 border-primary/50 text-white p-3"
                        placeholder="코딩메이커(중마)"
                      />
                      <div className="mt-2">
                        <label className="text-orange-300 text-sm font-bold tracking-wider">🔗 링크 URL</label>
                        <Input
                          value={content.featured_card_1_link || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, featured_card_1_link: e.target.value }))}
                          className="text-sm bg-transparent border-2 border-primary/50 text-white p-2"
                          placeholder="https://maps.google.com/?q=전남+광양시+중마동"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-2 p-4">
                      <div
                        className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handleImageUpload('featured', undefined, 1, 1)}
                      >
                        <Image
                          src={content.featured_card_1_image_1}
                          alt="코딩메이커 중마 외부 이미지"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Camera className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-xs font-bold">외부 이미지 변경</p>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                              <p className="text-xs">업로드 중...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handleImageUpload('featured', undefined, 1, 2)}
                      >
                        <Image
                          src={content.featured_card_1_image_2}
                          alt="코딩메이커 중마 지도"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Camera className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-xs font-bold">지도 이미지 변경</p>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                              <p className="text-xs">업로드 중...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 두 번째 카드 - 광양코딩(창덕) */}
                <Card className="border-2 border-orange-400/30 bg-orange-900/5 overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className="space-y-2">
                      <label className="text-orange-300 text-sm font-bold tracking-wider">🏷️ 광양코딩(창덕) 제목</label>
                      <Input
                        value={content.featured_card_2_title}
                        onChange={(e) => setContent(prev => ({ ...prev, featured_card_2_title: e.target.value }))}
                        className="text-2xl font-headline text-center bg-transparent border-2 border-primary/50 text-white p-3"
                        placeholder="광양코딩(창덕)"
                      />
                      <div className="mt-2">
                        <label className="text-orange-300 text-sm font-bold tracking-wider">🔗 링크 URL</label>
                        <Input
                          value={content.featured_card_2_link || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, featured_card_2_link: e.target.value }))}
                          className="text-sm bg-transparent border-2 border-primary/50 text-white p-2"
                          placeholder="https://maps.google.com/?q=전남+광양시+창덕동"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-2 p-4">
                      <div
                        className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handleImageUpload('featured', undefined, 2, 1)}
                      >
                        <Image
                          src={content.featured_card_2_image_1}
                          alt="광양코딩 창덕 외부 이미지"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Camera className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-xs font-bold">외부 이미지 변경</p>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                              <p className="text-xs">업로드 중...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handleImageUpload('featured', undefined, 2, 2)}
                      >
                        <Image
                          src={content.featured_card_2_image_2}
                          alt="광양코딩 창덕 지도"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Camera className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-xs font-bold">지도 이미지 변경</p>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                              <p className="text-xs">업로드 중...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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