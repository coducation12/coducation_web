import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '회원가입 유형 선택',
    description: 'Coducation 회원가입을 위해 계정 유형을 선택해 주세요.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
