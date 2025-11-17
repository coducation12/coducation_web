'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { getMainCurriculums, updateMainCurriculums } from '@/lib/actions';
import type { Curriculum } from '@/types';

interface CurriculumWithSelection extends Curriculum {
  show_on_main?: boolean;
  main_display_order?: number;
}

export default function MainCurriculumPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [curriculums, setCurriculums] = useState<CurriculumWithSelection[]>([]);
  const [groupedCurriculums, setGroupedCurriculums] = useState<Record<string, CurriculumWithSelection[]>>({});

  const levelOrder: Curriculum['level'][] = ['기초', '중급', '고급'];
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
        }, {} as Record<string, CurriculumWithSelection[]>);
        
        // 각 레벨별로 정렬 (show_on_main이 true인 것 먼저, 그 다음 main_display_order)
        Object.keys(grouped).forEach(level => {
          grouped[level].sort((a, b) => {
            if (a.show_on_main && !b.show_on_main) return -1;
            if (!a.show_on_main && b.show_on_main) return 1;
            return (a.main_display_order || 0) - (b.main_display_order || 0);
          });
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
    }, {} as Record<string, CurriculumWithSelection[]>);
    
    Object.keys(grouped).forEach(level => {
      grouped[level].sort((a, b) => {
        if (a.show_on_main && !b.show_on_main) return -1;
        if (!a.show_on_main && b.show_on_main) return 1;
        return (a.main_display_order || 0) - (b.main_display_order || 0);
      });
    });
    
    setGroupedCurriculums(grouped);
  };

  // 메인화면 표시 토글
  const toggleShowOnMain = (curriculumId: string) => {
    setCurriculums(prev => {
      const updated = prev.map(curr => {
        if (curr.id === curriculumId) {
          const newShowOnMain = !curr.show_on_main;
          return {
            ...curr,
            show_on_main: newShowOnMain,
            main_display_order: newShowOnMain ? (curr.main_display_order || 0) : 0,
          };
        }
        return curr;
      });
      
      // 그룹화 업데이트
      const grouped = updated.reduce((acc, curr) => {
        const level = curr.level;
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(curr);
        return acc;
      }, {} as Record<string, CurriculumWithSelection[]>);
      
      Object.keys(grouped).forEach(level => {
        grouped[level].sort((a, b) => {
          if (a.show_on_main && !b.show_on_main) return -1;
          if (!a.show_on_main && b.show_on_main) return 1;
          return (a.main_display_order || 0) - (b.main_display_order || 0);
        });
      });
      
      setGroupedCurriculums(grouped);
      return updated;
    });
  };

  // 순서 변경
  const moveCurriculum = (curriculumId: string, direction: 'up' | 'down') => {
    const curriculum = curriculums.find(c => c.id === curriculumId);
    if (!curriculum || !curriculum.show_on_main) return;

    const level = curriculum.level;
    const levelCurriculums = groupedCurriculums[level] || [];
    const currentIndex = levelCurriculums.findIndex(c => c.id === curriculumId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= levelCurriculums.length) return;

    // 같은 레벨 내에서만 순서 변경
    const reordered = [...levelCurriculums];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    
    // main_display_order 업데이트
    const updatedCurriculums = curriculums.map(curr => {
      const reorderedItem = reordered.find(r => r.id === curr.id);
      if (reorderedItem && curr.show_on_main) {
        const newIndex = reordered.findIndex(r => r.id === curr.id);
        return {
          ...curr,
          main_display_order: newIndex,
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
    }, {} as Record<string, CurriculumWithSelection[]>);
    
    Object.keys(grouped).forEach(level => {
      grouped[level].sort((a, b) => {
        if (a.show_on_main && !b.show_on_main) return -1;
        if (!a.show_on_main && b.show_on_main) return 1;
        return (a.main_display_order || 0) - (b.main_display_order || 0);
      });
    });
    
    setGroupedCurriculums(grouped);
  };

  // 저장
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateMainCurriculums(curriculums);
      if (result.success) {
        alert('메인화면 커리큘럼이 성공적으로 저장되었습니다.');
        // 저장 후 다시 로드
        const loadResult = await getMainCurriculums();
        if (loadResult.success && loadResult.data) {
          setCurriculums(loadResult.data);
          updateGroupedCurriculums();
        }
      } else {
        alert(result.error || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
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
        <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">메인화면 커리큘럼 관리</h1>
        <p className="text-cyan-200 mt-2">메인화면에 표시할 커리큘럼을 선택하고 순서를 조정할 수 있습니다.</p>
      </div>

      <div className="space-y-12 max-w-7xl mx-auto">
        {levelOrder.map((level) => {
          const levelCurriculums = groupedCurriculums[level] || [];
          const selectedCount = levelCurriculums.filter(c => c.show_on_main).length;

          return (
            <Card key={level} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
              <CardHeader className="border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl font-bold text-cyan-100">{level} 과정</CardTitle>
                    <Badge className={`${levelColors[level]} text-white`}>
                      선택됨: {selectedCount}개
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {levelCurriculums.length === 0 ? (
                  <div className="text-center text-cyan-200 py-8">
                    {level} 레벨의 커리큘럼이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {levelCurriculums.map((curriculum, index) => {
                      const isSelected = curriculum.show_on_main || false;
                      const canMoveUp = isSelected && index > 0 && levelCurriculums[index - 1]?.show_on_main;
                      const canMoveDown = isSelected && index < levelCurriculums.length - 1 && levelCurriculums[index + 1]?.show_on_main;

                      return (
                        <div
                          key={curriculum.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'bg-cyan-900/30 border-cyan-400/50 shadow-[0_0_12px_0_rgba(0,255,255,0.15)]'
                              : 'bg-transparent border-cyan-500/20'
                          }`}
                        >
                          {/* 선택 체크박스 */}
                          <button
                            onClick={() => toggleShowOnMain(curriculum.id)}
                            className={`flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-400'
                                : 'bg-transparent border-cyan-500/40'
                            }`}
                          >
                            {isSelected && <Check className="w-5 h-5 text-white" />}
                          </button>

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
                          <div className="flex-grow min-w-0">
                            <h3 className="text-lg font-bold text-cyan-100 truncate">{curriculum.title}</h3>
                            <p className="text-sm text-cyan-200/70 line-clamp-2 mt-1">
                              {curriculum.description || '설명이 없습니다.'}
                            </p>
                          </div>

                          {/* 순서 조정 버튼 (선택된 경우만) */}
                          {isSelected && (
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
                          )}

                          {/* 순서 표시 */}
                          {isSelected && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                              <span className="text-cyan-200 text-sm font-bold">
                                {levelCurriculums.filter(c => c.show_on_main).findIndex(c => c.id === curriculum.id) + 1}
                              </span>
                            </div>
                          )}
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

      {/* 저장 버튼 */}
      <div className="w-full flex justify-center py-8 mt-8">
        <Button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-12 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
          size="lg"
        >
          <Save className="w-5 h-5 mr-3" />
          {isSaving ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>
    </div>
  );
}

