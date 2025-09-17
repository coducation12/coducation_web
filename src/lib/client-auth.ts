import { User } from '@/types';
import { supabase } from './supabase';

// 클라이언트에서 사용할 수 있는 사용자 정보 가져오기 함수
export async function getCurrentUserClient(): Promise<User | null> {
  try {
    // httpOnly 쿠키는 클라이언트에서 직접 접근할 수 없으므로
    // 서버 액션을 통해 사용자 정보를 가져옴
    const response = await fetch('/api/auth/current-user', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    // 에러 로그 제거 - 조용히 처리
    return null;
  }
}

// 클라이언트에서 사용할 수 있는 로그아웃 함수
export async function logoutClient() {
  try {
    // 로컬 스토리지에서 사용자 정보 삭제
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
      localStorage.removeItem('profile_image');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}
