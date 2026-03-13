import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호할 라우트 패턴 정의
const PROTECTED_ROUTES = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    parent: '/dashboard/parent',
};

// 미들웨어가 실행될 경로 (정적 파일 및 API 예외처리)
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (auth route)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login|signup|assets|images).*)',
    ],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 루트 경로("/")이거나 대시보드 내부가 아니면 통과
    if (pathname === '/' || !pathname.startsWith('/dashboard')) {
        return NextResponse.next();
    }

    // 브라우저 쿠키에서 user_role 확인
    const userRoleCookie = request.cookies.get('user_role');
    const userRole = userRoleCookie?.value;

    // 1. 아예 로그인 안 된 유저가 /dashboard 에 접근하려는 경우
    if (!userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. 관리자(admin) 경로 보호 - 오직 admin만 접근 가능
    if (pathname.startsWith(PROTECTED_ROUTES.admin)) {
        if (userRole !== 'admin') {
            const forbiddenUrl = new URL('/login', request.url);
            forbiddenUrl.searchParams.set('error', 'unauthorized_admin');
            return NextResponse.redirect(forbiddenUrl);
        }
    }

    // 3. 강사(teacher) 경로 보호 - 강사와 관리자 모두 접근 가능해야 할 수도 있음 (정책에 따라)
    // 여기서는 강사만 접근 가능하도록 설정 (관리자도 강사 페이지를 볼 수 있어야 한다면 조건 추가)
    if (pathname.startsWith(PROTECTED_ROUTES.teacher)) {
        if (userRole !== 'teacher' && userRole !== 'admin') {
            const forbiddenUrl = new URL('/login', request.url);
            forbiddenUrl.searchParams.set('error', 'unauthorized_teacher');
            return NextResponse.redirect(forbiddenUrl);
        }
    }

    // 4. 학생(student) 경로 보호 
    if (pathname.startsWith(PROTECTED_ROUTES.student)) {
        if (userRole !== 'student' && userRole !== 'admin') {
            const forbiddenUrl = new URL('/login', request.url);
            forbiddenUrl.searchParams.set('error', 'unauthorized_student');
            return NextResponse.redirect(forbiddenUrl);
        }
    }

    // 5. 학부모(parent) 경로 보호
    if (pathname.startsWith(PROTECTED_ROUTES.parent)) {
        if (userRole !== 'parent' && userRole !== 'admin') {
            const forbiddenUrl = new URL('/login', request.url);
            forbiddenUrl.searchParams.set('error', 'unauthorized_parent');
            return NextResponse.redirect(forbiddenUrl);
        }
    }

    return NextResponse.next();
}
