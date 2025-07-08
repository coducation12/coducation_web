
import type { Instructor } from '@/types';
import { InstructorCard } from '@/components/ui/instructor-card';

const mockInstructors: Instructor[] = [
  {
    id: 'teacher-uuid-1',
    name: '김철수 선생님',
    bio: '10년 경력의 베테랑 개발자 출신 강사입니다. 쉽고 재미있는 설명으로 파이썬과 알고리즘을 가르칩니다.',
    profile_image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'teacher-uuid-2',
    name: '이영희 선생님',
    bio: '프론트엔드 전문가로, React와 Next.js를 활용한 인터랙티브 웹 개발 과정을 담당하고 있습니다.',
    profile_image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'teacher-uuid-3',
    name: '박민준 선생님',
    bio: '게임 개발에 대한 깊은 열정을 가지고 있으며, Unity와 C#을 통해 학생들의 상상력을 현실로 만들어줍니다.',
    profile_image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'teacher-uuid-4',
    name: '최지아 선생님',
    bio: '데이터 사이언스와 머신러닝 전문가입니다. 실용적인 예제로 AI의 세계를 안내합니다.',
    profile_image: 'https://placehold.co/400x400.png',
  },
];

export function InstructorsSection() {
  const topInstructor = mockInstructors[0];
  const bottomInstructors = mockInstructors.slice(1);

  return (
    <section id="instructors" className="container w-full py-32 md:py-52">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">전문 강사진 소개</h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          열정과 실력을 겸비한 Coducation의 전문 강사님들을 소개합니다.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 w-full">
        {/* Top row with 1 centered card */}
        {topInstructor && (
          <div className="flex justify-center w-full">
            <div className="w-full max-w-sm">
              <InstructorCard instructor={topInstructor} />
            </div>
          </div>
        )}
        
        {/* Bottom row with 3 cards */}
        {bottomInstructors.length > 0 && (
            <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-8 md:flex-row">
                {bottomInstructors.map((instructor) => (
                    <div key={instructor.id} className="w-full max-w-sm">
                        <InstructorCard instructor={instructor} />
                    </div>
                ))}
            </div>
        )}
      </div>
    </section>
  );
}
