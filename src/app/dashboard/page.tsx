import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await getAuthenticatedUser();
    
    // 디버깅을 위한 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard - User data:', user);
    }

    if (user && user.role) {
        // 역할별 리다이렉트
        switch (user.role) {
            case 'student':
                redirect('/dashboard/student');
            case 'parent':
                redirect('/dashboard/parent');
            case 'teacher':
                redirect('/dashboard/teacher');
            case 'admin':
                redirect('/dashboard/admin');
            default:
                // 알 수 없는 역할인 경우
                console.error('Unknown role:', user.role);
                break;
        }
    }

    // Fallback for unhandled roles or if user is null
    return (
        <div className="flex items-center justify-center h-full">
            <Card>
                <CardHeader>
                    <CardTitle>대시보드에 오신 것을 환영합니다</CardTitle>
                    <CardDescription>
                        {user ? `역할을 찾을 수 없습니다: ${user.role}` : '사용자 정보를 찾을 수 없습니다.'} 
                        관리자에게 문의하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/" className="text-primary underline">홈으로 돌아가기</Link>
                </CardContent>
            </Card>
        </div>
    );
}
