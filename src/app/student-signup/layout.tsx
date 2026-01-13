import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '학생 회원가입',
    description: 'Coducation 코딩 교육 서비스를 시작하기 위한 학생 회원가입 페이지입니다.',
};

export default function StudentSignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
