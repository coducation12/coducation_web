import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await getAuthenticatedUser();

    if (user) {
        // Redirect to the role-specific dashboard
        if (user.role === 'student') redirect('/dashboard/student');
        if (user.role === 'parent') redirect('/dashboard/parent');
        if (user.role === 'teacher') redirect('/dashboard/teacher');
        if (user.role.startsWith('admin')) redirect('/dashboard/admin');
    }

    // Fallback for unhandled roles or if user is null
    return (
        <div className="flex items-center justify-center h-full">
            <Card>
                <CardHeader>
                    <CardTitle>대시보드에 오신 것을 환영합니다</CardTitle>
                    <CardDescription>역할을 찾을 수 없습니다. 관리자에게 문의하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/" className="text-primary underline">홈으로 돌아가기</Link>
                </CardContent>
            </Card>
        </div>
    );
}
