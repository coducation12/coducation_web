import { cache } from 'react';
import { cookies } from 'next/headers';
import { User } from '@/types';
import { supabase, supabaseAdmin } from './supabase';

// 하이브리드 인증 시스템: 학생은 DB, 강사/관리자는 Auth 사용
export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!userId || !userRole) {
      return null;
    }

    if (userRole === 'teacher' || userRole === 'admin') {
      if (!authToken) {
        console.warn(`보안 경고: ${userRole} 권한 요청이나 auth_token이 없습니다. 접근을 차단합니다.`);
        return null;
      }

      try {
        // Auth 토큰으로 사용자 검증
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(authToken);

        if (authError || !authUser) {
          // 토큰이 만료되었거나 유효하지 않은 경우 refresh_token으로 갱신 시도
          const refreshToken = cookieStore.get('refresh_token')?.value;
          
          if (refreshToken) {
            console.log('Access token 만료됨. Refresh token으로 세션 갱신 시도 중...');
            const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
              access_token: authToken,
              refresh_token: refreshToken
            });

            if (!refreshError && refreshData.session) {
              console.log('세션 갱신 성공');
              // 새로운 토큰들을 쿠키에 저장
              const COOKIE_OPTIONS = { 
                httpOnly: true, 
                path: '/', 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const
              };
              
              cookieStore.set('auth_token', refreshData.session.access_token, COOKIE_OPTIONS);
              if (refreshData.session.refresh_token) {
                cookieStore.set('refresh_token', refreshData.session.refresh_token, COOKIE_OPTIONS);
              }
              
              // 갱신된 정보로 다시 진행 가능하나, 이미 getUser에서 실패했으므로 
              // refreshData.user를 사용하여 계속 진행
              if (!refreshData.user) return null;
            } else {
              console.error('Refresh token으로 세션 갱신 실패:', refreshError);
              return null;
            }
          } else {
            if (authError?.message?.includes('expired') || authError?.status === 401) {
              console.warn('인증 세션이 만료되었습니다.');
            } else {
              console.error('Auth 토큰 검증 실패:', authError);
            }
            return null;
          }
        }
      } catch (err: any) {
        // AuthApiError 등 예외 발생 시
        console.error('Auth 검증 중 예외 발생:', err);
        return null;
      }
    }

    // DB에서 사용자 정보 조회 (학생이거나, Admin/Teacher 토큰 검증이 성공하거나 갱신된 경우만 여기까지 도달)
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return data as User;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
});

// 하이브리드 로그아웃: 강사/관리자는 Auth 로그아웃도 수행
export async function logout() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value;
  const authToken = cookieStore.get('auth_token')?.value;

  // 강사/관리자인 경우 Auth 로그아웃
  if ((userRole === 'teacher' || userRole === 'admin') && authToken) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Auth 로그아웃 실패:', error);
    }
  }

  // 쿠키 삭제
  cookieStore.delete('user_id');
  cookieStore.delete('user_role');
  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');
}
