import type { Notice } from '@/types';
import { NoticeCard } from './notice-card';

// Mock data, in a real app this would come from Supabase
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
];


export function NoticesSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">공지사항 및 업데이트</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Coducation의 새로운 소식과 커리큘럼 업데이트를 확인하세요.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
                    {mockNotices.slice(0, 3).map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </div>
            </div>
        </section>
    );
}
