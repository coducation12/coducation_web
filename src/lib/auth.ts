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

    // 날짜 변경 체크 (KST 기준)
    const loginDate = cookieStore.get('login_date')?.value;
    if (loginDate) {
      const utc = Date.now();
      const kst = new Date(utc + 9 * 60 * 60 * 1000);
      const currentDate = kst.toISOString().split('T')[0];
      if (loginDate !== currentDate) {
        console.log(`[RSC] 날짜 변경 감지 (${loginDate} -> ${currentDate}). 세션 만료 처리.`);
        return null;
      }
    }

    if (userRole === 'teacher' || userRole === 'admin') {
      if (!authToken) {
        console.warn(`보안 경고: ${userRole} 권한 요청이나 auth_token이 없습니다. 접근을 차단합니다.`);
        return null;
      }

      try {
        // Auth 토큰으로 사용자 검증
        // 미들웨어가 이미 만료 토큰을 갱신해주었으므로, 여기서는 토큰 유효성만 확인합니다.
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(authToken);

        if (authError || !authUser) {
          if (authError?.message?.includes('expired') || authError?.status === 401) {
            console.warn('인증 세션이 만료되었습니다. 미들웨어에서 갱신되지 않은 토큰입니다.');
          } else {
            console.error('Auth 토큰 검증 실패:', authError);
          }
          return null;
        }
      } catch (err: any) {
        console.error('Auth 검증 중 예외 발생:', err);
        return null;
      }
    }

    // DB에서 사용자 정보 조회 (학생이거나, Admin/Teacher 토큰 검증이 성공한 경우만 여기까지 도달)
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    // 실시간 정지/비활성화 상태 검증
    if (data.status !== 'active') {
      console.warn(`보안 경고: 사용자 ${data.username}의 계정이 비활성화 상태(${data.status})입니다. 접근을 차단합니다.`);
      return null;
    }

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
