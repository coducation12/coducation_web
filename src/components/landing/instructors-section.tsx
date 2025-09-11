'use client';

import { useState, useEffect } from 'react';
import type { Instructor } from '@/types';
import { InstructorCard } from '@/components/ui/instructor-card';
import { InstructorDetailModal } from '@/components/ui/instructor-detail-modal';
import { getInstructors } from '@/lib/actions';

export function InstructorsSection() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getInstructors();
        
        if (result.success && result.data) {
          setInstructors(result.data);
        } else {
          setError(result.error || '강사진 정보를 불러올 수 없습니다.');
          console.error('강사진 데이터 로딩 실패:', result.error);
        }
      } catch (err) {
        console.error('강사진 정보 로딩 오류:', err);
        setError('강사진 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleInstructorClick = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInstructor(null);
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <section id="instructors" className="container w-full py-32 md:py-52">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">전문 강사진 소개</h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            열정과 실력을 겸비한 Coducation의 전문 강사님들을 소개합니다.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // 에러가 있거나 강사진이 없으면 표시하지 않음
  if (error || instructors.length === 0) {
    console.warn('강사진 섹션 숨김:', { error, instructorsCount: instructors.length });
    return null;
  }

  // 원장과 부원장을 상단 2칸으로, 나머지를 하단 3칸으로 배치
  const topInstructors = instructors.slice(0, 2); // 원장, 부원장
  const bottomInstructors = instructors.slice(2); // 나머지 강사진

  return (
    <section id="instructors" className="container w-full py-32 md:py-52">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">전문 강사진 소개</h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          열정과 실력을 겸비한 Coducation의 전문 강사님들을 소개합니다.
        </p>
      </div>

      <div className="flex flex-col items-center gap-12 w-full">
        {/* Top row with 2 cards (원장, 부원장) */}
        {topInstructors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 w-full">
            {topInstructors.map((instructor) => (
              <div key={instructor.id} className="w-[340px] h-[250px]">
                <InstructorCard 
                  instructor={instructor} 
                  onClick={() => handleInstructorClick(instructor)}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Bottom row with 3 cards (나머지 강사진) */}
        {bottomInstructors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 w-full">
            {bottomInstructors.map((instructor) => (
              <div key={instructor.id} className="w-[340px] h-[250px]">
                <InstructorCard 
                  instructor={instructor} 
                  onClick={() => handleInstructorClick(instructor)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 강사 상세 정보 모달 */}
      <InstructorDetailModal
        instructor={selectedInstructor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}