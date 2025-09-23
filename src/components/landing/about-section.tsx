'use client';

import Image from 'next/image';
import { getContent } from '@/lib/actions';
import { useState, useEffect } from 'react';


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

    </section>
  );
}
