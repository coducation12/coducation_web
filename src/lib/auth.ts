import { cookies } from 'next/headers';
import { User } from '@/types';
import { supabase } from './supabase';

// 하이브리드 인증 시스템: 학생은 DB, 강사/관리자는 Auth 사용
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!userId || !userRole) {
      return null;
    }

    // 강사/관리자인 경우 Auth 토큰 검증
    if ((userRole === 'teacher' || userRole === 'admin') && authToken) {
      try {
        // Auth 토큰으로 사용자 검증
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(authToken);

        if (authError || !authUser) {
          // 토큰이 만료되었거나 유효하지 않은 경우
          if (authError?.message?.includes('expired') || authError?.status === 401) {
            console.warn('인증 세션이 만료되었습니다.');
            return null; // 만료 시 자동으로 null 반환하여 리다이렉트 유도
          }
          console.error('Auth 토큰 검증 실패:', authError);
          return null;
        }
      } catch (err: any) {
        // AuthApiError 등 예외 발생 시 (특히 토큰 만료)
        if (err.message?.includes('expired')) {
          console.warn('세션 만료 (Exception caught)');
        } else {
          console.error('Auth 검증 중 예외 발생:', err);
        }
        return null;
      }
    }

    // DB에서 사용자 정보 조회
    const { data, error } = await supabase
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
}

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
}
