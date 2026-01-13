import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '로그인',
    description: 'Coducation 교육 시스템 로그인을 통해 학습을 시작하세요.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
