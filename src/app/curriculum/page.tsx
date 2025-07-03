import { Suspense } from 'react';
import { getCurriculumsByLevel } from '@/lib/curriculum-actions';
import { CurriculumSlider } from '@/components/curriculum/curriculum-slider';

export default function CurriculumPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">체계적인 커리큘럼</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          기초부터 심화까지, 여러분의 성장을 이끌 Coducation의 전문 교육 과정을 만나보세요.
        </p>
      </div>

      <Suspense fallback={<CurriculumLoadingSkeleton />}>
        <CurriculumContent />
      </Suspense>
    </div>
  );
}

async function CurriculumContent() {
  // 병렬로 모든 레벨의 커리큘럼을 가져옴
  const [basicCurriculums, intermediateCurriculums, advancedCurriculums] = await Promise.all([
    getCurriculumsByLevel('기초'),
    getCurriculumsByLevel('중급'),
    getCurriculumsByLevel('고급')
  ]);

  return (
    <div className="space-y-16">
      <CurriculumSlider level="기초" curriculums={basicCurriculums} />
      <CurriculumSlider level="중급" curriculums={intermediateCurriculums} />
      <CurriculumSlider level="고급" curriculums={advancedCurriculums} />
    </div>
  );
}

function CurriculumLoadingSkeleton() {
  return (
    <div className="space-y-16">
      {['기초', '중급', '고급'].map((level) => (
        <div key={level} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 