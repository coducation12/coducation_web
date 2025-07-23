import { cookies } from 'next/headers';
import { User } from '@/types';
import { supabase } from './supabase';

// TODO: 배포 후 정상화 - Supabase Auth로 복원 필요
// 현재는 개발 편의를 위해 쿠키 기반 인증 사용
// 배포 후에는 createServerComponentClient({ cookies }) 사용하여 보안 강화 필요

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;
    
    if (!userId || !userRole) {
      return null;
    }

    // TODO: 배포 후 정상화 - Supabase Auth 사용
    // const supabase = createServerComponentClient({ cookies });
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return null;

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

// TODO: 배포 후 정상화 - 로그아웃 함수도 Supabase Auth 사용으로 변경 필요
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
  cookieStore.delete('user_role');
}
