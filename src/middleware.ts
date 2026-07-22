import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Edge / Middleware 환경에서 안전하게 사용할 임시 클라이언트
const supabaseMiddlewareClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// JWT 만료 여부 검사 (atob 디코딩)
function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp;
        if (!exp) return true;
        // 만료 시간보다 10초 여유있게 세팅
        return Date.now() / 1000 >= exp - 10;
    } catch {
        return true;
    }
}

// 보호할 라우트 패턴 정의
const PROTECTED_ROUTES = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
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

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 루트 경로("/")이거나 대시보드 내부가 아니면 통과
    if (pathname === '/' || !pathname.startsWith('/dashboard')) {
        return NextResponse.next();
    }

    // 브라우저 쿠키에서 정보 확인
    const userRoleCookie = request.cookies.get('user_role');
    const userRole = userRoleCookie?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // 날짜 변경 체크 (KST 기준)
    const loginDateCookie = request.cookies.get('login_date');
    if (loginDateCookie) {
        const utc = Date.now();
        const kst = new Date(utc + 9 * 60 * 60 * 1000);
        const currentDate = kst.toISOString().split('T')[0];
        
        if (loginDateCookie.value !== currentDate) {
            console.log(`[Middleware] 날짜 변경 감지 (${loginDateCookie.value} -> ${currentDate}). 세션 만료 및 리다이렉트합니다.`);
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'session_expired');
            
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('user_id');
            response.cookies.delete('user_role');
            response.cookies.delete('auth_token');
            response.cookies.delete('refresh_token');
            response.cookies.delete('login_date');
            return response;
        }
    }

    // 강사/관리자용 만료된 토큰의 자동 리프레시 통합 처리 (RSC 쿠키 쓰기 크래시 방지 및 리프레시 토큰 로테이션 보호)
    if ((userRole === 'teacher' || userRole === 'admin') && authToken) {
        if (isTokenExpired(authToken)) {
            if (refreshToken) {
                console.log('[Middleware] 만료된 auth_token 감지. setSession으로 자동 리프레시 시도 중...');
                try {
                    const { data, error } = await supabaseMiddlewareClient.auth.setSession({
                        access_token: authToken,
                        refresh_token: refreshToken
                    });

                    if (!error && data.session) {
                        console.log('[Middleware] 세션 갱신 성공. 새 쿠키 저장 후 리다이렉트합니다.');
                        // 1회성 자기 자신으로의 리다이렉션을 거치며 브라우저에 쿠키를 온전히 덮어씁니다.
                        const response = NextResponse.redirect(request.nextUrl);
                        const COOKIE_OPTIONS = {
                            httpOnly: true,
                            path: '/',
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax' as const
                        };
                        response.cookies.set('auth_token', data.session.access_token, COOKIE_OPTIONS);
                        if (data.session.refresh_token) {
                            response.cookies.set('refresh_token', data.session.refresh_token, COOKIE_OPTIONS);
                        }
                        return response;
                    } else {
                        console.error('[Middleware] 세션 갱신 실패:', error);
                    }
                } catch (refreshErr) {
                    console.error('[Middleware] 세션 갱신 예외 발생:', refreshErr);
                }
            }

            // 갱신 토큰이 없거나 갱신 실패 시 즉각 쿠키를 다 날리고 로그아웃
            console.warn('[Middleware] 토큰이 만료되었거나 갱신에 실패하여 로그아웃 처리합니다.');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'session_expired');
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('user_id');
            response.cookies.delete('user_role');
            response.cookies.delete('auth_token');
            response.cookies.delete('refresh_token');
            response.cookies.delete('login_date');
            return response;
        }
    }

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



    return NextResponse.next();
}
