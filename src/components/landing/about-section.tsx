'use client';

import Image from 'next/image';
import { NoticeCard } from '@/components/notices/notice-card';
import { getContent } from '@/lib/actions';
import { useState, useEffect } from 'react';
import type { Notice } from '@/types';

const mockNotices: Notice[] = [
  {
    id: '1',
    title: '여름방학 특강 개설 안내',
    content: '파이썬 기초와 게임 개발 특강이 개설되었습니다. 많은 관심 바랍니다.',
    author_id: 'admin-uuid',
    author_name: '관리자',
    is_notice: true,
    created_at: '2024-07-20T10:00:00Z',
  },
  {
    id: '2',
    title: '새로운 커리큘럼: 웹 풀스택 과정',
    content: 'React와 Node.js를 다루는 웹 풀스택 과정이 새롭게 추가되었습니다.',
    author_id: 'teacher-uuid-1',
    author_name: '김선생',
    is_notice: false,
    created_at: '2024-07-18T14:30:00Z',
  },
  {
    id: '3',
    title: '코딩 경진대회 수상 소식',
    content: '본원 학생이 전국 코딩 경진대회에서 대상을 수상했습니다!',
    author_id: 'admin-uuid',
    author_name: '관리자',
    is_notice: true,
    created_at: '2024-07-15T09:00:00Z',
  },
  {
    id: '4',
    title: '학원 시설 점검 안내 (7/25)',
    content: '7월 25일은 학원 시설 전체 점검으로 하루 휴강합니다.',
    author_id: 'admin-uuid',
    author_name: '관리자',
    is_notice: true,
    created_at: '2024-07-14T11:00:00Z',
  },
  {
    id: '5',
    title: '학부모 간담회 개최',
    content: '자녀의 학습 현황 공유 및 교육 상담을 위한 학부모 간담회를 개최합니다.',
    author_id: 'admin-uuid',
    author_name: '관리자',
    is_notice: false,
    created_at: '2024-07-12T10:00:00Z',
  },
  {
    id: '6',
    title: '블록코딩반 신규 모집',
    content: '초등학생을 위한 스크래치, 엔트리 블록코딩반을 새롭게 모집합니다.',
    author_id: 'teacher-uuid-3',
    author_name: '박민준 선생님',
    is_notice: false,
    created_at: '2024-07-10T15:00:00Z',
  },
];

export function AboutSection() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      const contentResult = await getContent();
      setContent(contentResult.success ? contentResult.data : null);
      setLoading(false);
    };
    loadContent();
  }, []);

  return (
    <section id="about" className="container w-full py-32 md:py-52">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
            {content?.about_title || 'About Coducation'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {content?.about_subtitle || '우리는 코딩 교육을 통해 아이들이 미래의 창의적인 인재로 성장할 수 있도록 돕습니다.'}
          </p>
          <div className="space-y-6 text-foreground/80">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-headline">우리의 미션</h3>
              <p>
                {content?.about_mission || 'Coducation은 단순한 코딩 기술 교육을 넘어, 논리적 사고력, 문제 해결 능력, 창의력을 함양하는 것을 목표로 합니다.'}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-headline">우리의 비전</h3>
              <p>
                {content?.about_vision || '우리는 모든 학생이 코딩을 통해 자신의 아이디어를 현실로 만들 수 있는 세상을 꿈꿉니다.'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-center">
          <Image
            src={content?.about_image || "https://placehold.co/600x400.png"}
            data-ai-hint="team collaboration"
            alt="Team working on code"
            width={600}
            height={400}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="mt-24">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h3 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Coducation 소식</h3>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mockNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
            ))}
        </div>
      </div>
    </section>
  );
}
