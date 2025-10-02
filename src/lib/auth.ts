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
          console.error('Auth 토큰 검증 실패:', authError);
          return null;
        }
      } catch (authError) {
        console.error('Auth 검증 중 오류:', authError);
        // Auth 검증 실패해도 DB에서 사용자 정보는 조회
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
