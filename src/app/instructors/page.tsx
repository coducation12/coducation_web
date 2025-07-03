import type { Instructor } from '@/types';
import { InstructorCard } from '@/components/profile/instructor-card';

const mockInstructors: Instructor[] = [
  {
    id: 'teacher-uuid-1',
    name: '김철수 선생님',
    bio: '10년 경력의 베테랑 개발자 출신 강사입니다. 쉽고 재미있는 설명으로 파이썬과 알고리즘을 가르칩니다.',
    profile_image: 'https://placehold.co/400x400.png',
    assigned_students_count: 15,
  },
  {
    id: 'teacher-uuid-2',
    name: '이영희 선생님',
    bio: '프론트엔드 전문가로, React와 Next.js를 활용한 인터랙티브 웹 개발 과정을 담당하고 있습니다.',
    profile_image: 'https://placehold.co/400x400.png',
    assigned_students_count: 12,
  },
  {
    id: 'teacher-uuid-3',
    name: '박민준 선생님',
    bio: '게임 개발에 대한 깊은 열정을 가지고 있으며, Unity와 C#을 통해 학생들의 상상력을 현실로 만들어줍니다.',
    profile_image: 'https://placehold.co/400x400.png',
    assigned_students_count: 10,
  },
];

export default function InstructorsPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">전문 강사진 소개</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          열정과 실력을 겸비한 Coducation의 전문 강사님들을 소개합니다.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {mockInstructors.map((instructor) => (
          <InstructorCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </div>
  );
}
