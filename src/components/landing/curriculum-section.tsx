'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { MainCurriculum, Curriculum } from '@/types';
import { CurriculumCard } from '@/components/curriculum/curriculum-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { supabase } from '@/lib/supabase';

export function CurriculumSection() {
    const [curriculums, setCurriculums] = useState<MainCurriculum[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // DB에서 메인화면에 표시할 커리큘럼 조회
    useEffect(() => {
        const fetchCurriculums = async () => {
            try {
                const { data, error } = await supabase
                    .from('main_curriculums')
                    .select('id, title, description, category, level, image, display_order, created_at, updated_at')
                    .order('level', { ascending: true })
                    .order('display_order', { ascending: true });

                if (error) {
                    console.error('커리큘럼 조회 오류:', error);
                    setCurriculums([]);
                } else {
                    // MainCurriculum 타입에 맞게 변환
                    const formattedCurriculums: MainCurriculum[] = (data || []).map((curr: any) => ({
                        id: curr.id,
                        title: curr.title,
                        description: curr.description || '',
                        category: curr.category,
                        level: curr.level as '기초' | '중급' | '고급',
                        image: curr.image || 'https://placehold.co/600x400.png',
                        display_order: curr.display_order || 0,
                        created_at: curr.created_at,
                        updated_at: curr.updated_at,
                    }));
                    setCurriculums(formattedCurriculums);
                }
            } catch (error) {
                console.error('커리큘럼 로드 중 오류:', error);
                setCurriculums([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurriculums();
    }, []);

    // MainCurriculum을 Curriculum 타입으로 변환 (CurriculumCard 호환성)
    const curriculumForDisplay = curriculums.map(curr => ({
        id: curr.id,
        title: curr.title,
        description: curr.description || '',
        category: curr.category,
        level: curr.level,
        image: curr.image || 'https://placehold.co/600x400.png',
        checklist: [], // MainCurriculum에는 checklist가 없으므로 빈 배열
        created_by: undefined,
        public: true,
        created_at: curr.created_at,
    }));

    const groupedCurriculums = curriculumForDisplay.reduce((acc, curriculum) => {
        const level = curriculum.level;
        if (!acc[level]) {
        acc[level] = [];
        }
        acc[level].push(curriculum);
        return acc;
    }, {} as Record<'기초' | '중급' | '고급', typeof curriculumForDisplay>);

    const levelOrder: ('기초' | '중급' | '고급')[] = ['기초', '중급', '고급'];

    // 로딩 중이거나 커리큘럼이 없을 때
    if (isLoading) {
        return (
            <section id="curriculum" className="container w-full py-32 md:py-52">
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">체계적인 커리큘럼</h2>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        기초부터 심화까지, 여러분의 성장을 이끌 Coducation의 전문 교육 과정을 만나보세요.
                    </p>
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="text-muted-foreground">커리큘럼을 불러오는 중...</div>
                </div>
            </section>
        );
    }

    // 커리큘럼이 없을 때
    if (curriculums.length === 0) {
        return (
            <section id="curriculum" className="container w-full py-32 md:py-52">
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">체계적인 커리큘럼</h2>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        기초부터 심화까지, 여러분의 성장을 이끌 Coducation의 전문 교육 과정을 만나보세요.
                    </p>
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="text-muted-foreground">표시할 커리큘럼이 없습니다.</div>
                </div>
            </section>
        );
    }

    return (
        <section id="curriculum" className="container w-full py-32 md:py-52">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">체계적인 커리큘럼</h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    기초부터 심화까지, 여러분의 성장을 이끌 Coducation의 전문 교육 과정을 만나보세요.
                </p>
            </div>

            <div className="w-full space-y-12">
                {levelOrder.map((level, index) => {
                    // 각 레벨별로 다른 자동 슬라이드 간격 설정 (시간차를 두기 위해)
                    const autoplayDelays = {
                        '기초': 1800,  // 1.8초
                        '중급': 2500,  // 2.5초
                        '고급': 3200,  // 3.2초
                    };
                    const delay = autoplayDelays[level];

                    return (
                        groupedCurriculums[level] && groupedCurriculums[level].length > 0 && (
                            <div key={level}>
                                <h3 className="text-3xl font-bold font-headline mb-6 text-left text-primary">{level} 과정</h3>
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        loop: true,
                                    }}
                                    plugins={[
                                        Autoplay({
                                            delay: delay, // 레벨별로 다른 간격으로 자동 슬라이드
                                            stopOnInteraction: false, // 사용자 상호작용 시에도 계속 자동 슬라이드
                                            stopOnMouseEnter: false, // 마우스 호버 시에도 계속 자동 슬라이드
                                        })
                                    ]}
                                    className="w-full"
                                >
                                    <CarouselContent>
                                        {groupedCurriculums[level].map((curriculum) => (
                                            <CarouselItem key={curriculum.id} className="md:basis-1/2 lg:basis-1/3">
                                                <div className="p-1">
                                                    <CurriculumCard curriculum={curriculum} />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="hidden lg:flex" />
                                    <CarouselNext className="hidden lg:flex"/>
                                </Carousel>
                            </div>
                        )
                    );
                })}
            </div>
        </section>
    );
}
