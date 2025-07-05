'use client';

import * as React from 'react';
import type { Curriculum } from '@/types';
import { CurriculumCard } from '@/components/curriculum/curriculum-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const mockCurriculums: Curriculum[] = [
  // 기초
  {
    id: 'curriculum-uuid-1',
    title: '파이썬 기초',
    description: '프로그래밍이 처음인 입문자를 위한 파이썬 문법 및 기초 알고리즘 학습 과정입니다.',
    level: '기초',
    created_by: 'teacher-uuid-1',
    public: true,
    created_at: '2024-01-15T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'curriculum-uuid-5',
    title: 'HTML & CSS 첫걸음',
    description: '웹 페이지의 뼈대와 디자인을 만드는 기초적인 기술을 배웁니다.',
    level: '기초',
    created_by: 'teacher-uuid-2',
    public: true,
    created_at: '2024-05-01T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'curriculum-uuid-6',
    title: '스크래치로 게임 만들기',
    description: '블록 코딩을 통해 쉽고 재미있게 프로그래밍의 원리를 이해합니다.',
    level: '기초',
    created_by: 'teacher-uuid-3',
    public: true,
    created_at: '2024-05-10T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
   {
    id: 'curriculum-uuid-10',
    title: '자바스크립트 입문',
    description: '웹 페이지에 동적인 기능을 추가하는 자바스크립트의 기본 문법을 학습합니다.',
    level: '기초',
    created_by: 'teacher-uuid-2',
    public: true,
    created_at: '2024-05-15T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  // 중급
  {
    id: 'curriculum-uuid-2',
    title: '웹 개발 중급',
    description: 'HTML, CSS, JavaScript를 넘어 React를 활용한 동적인 웹 애플리케이션 개발을 학습합니다.',
    level: '중급',
    created_by: 'teacher-uuid-2',
    public: true,
    created_at: '2024-02-01T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'curriculum-uuid-7',
    title: '파이썬 데이터 분석',
    description: 'Pandas, Matplotlib 라이브러리를 활용해 데이터를 시각화하고 분석하는 방법을 배웁니다.',
    level: '중급',
    created_by: 'teacher-uuid-1',
    public: true,
    created_at: '2024-06-01T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'curriculum-uuid-8',
    title: 'Node.js 서버 개발',
    description: 'JavaScript를 사용하여 백엔드 서버를 구축하고 API를 만드는 방법을 학습합니다.',
    level: '중급',
    created_by: 'teacher-uuid-2',
    public: true,
    created_at: '2024-06-15T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  // 고급
  {
    id: 'curriculum-uuid-3',
    title: 'Unity 게임 개발',
    description: 'C#과 Unity 엔진을 사용하여 2D 및 3D 게임을 직접 만들어보는 실전 프로젝트 과정입니다.',
    level: '고급',
    created_by: 'teacher-uuid-3',
    public: true,
    created_at: '2024-03-10T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'curriculum-uuid-4',
    title: '알고리즘 심화',
    description: '자료구조와 알고리즘에 대한 깊이 있는 이해를 바탕으로 복잡한 문제 해결 능력을 기릅니다.',
    level: '고급',
    created_by: 'teacher-uuid-1',
    public: true,
    created_at: '2024-04-05T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 'curriculum-uuid-9',
    title: 'AI 모델링 입문',
    description: '머신러닝과 딥러닝의 기본 개념을 배우고, TensorFlow를 사용해 간단한 AI 모델을 만듭니다.',
    level: '고급',
    created_by: 'teacher-uuid-1',
    public: true,
    created_at: '2024-07-01T09:00:00Z',
    image: 'https://placehold.co/600x400.png',
  },
];


export function CurriculumSection() {
    const groupedCurriculums = mockCurriculums.reduce((acc, curriculum) => {
        const level = curriculum.level;
        if (!acc[level]) {
        acc[level] = [];
        }
        acc[level].push(curriculum);
        return acc;
    }, {} as Record<Curriculum['level'], Curriculum[]>);

    const levelOrder: Curriculum['level'][] = ['기초', '중급', '고급'];

    return (
        <section id="curriculum" className="container w-full py-32 md:py-52">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">체계적인 커리큘럼</h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    기초부터 심화까지, 여러분의 성장을 이끌 Coducation의 전문 교육 과정을 만나보세요.
                </p>
            </div>

            <div className="w-full space-y-12">
                {levelOrder.map((level, index) => (
                groupedCurriculums[level] && (
                    <div key={level}>
                        <h3 className="text-3xl font-bold font-headline mb-6 text-left text-primary">{level} 과정</h3>
                        <Carousel
                            opts={{
                                align: 'start',
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 3000, // 3초마다 자동 슬라이드
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
                ))}
            </div>
        </section>
    );
}
