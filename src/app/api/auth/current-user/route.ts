import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // getAuthenticatedUser를 사용하여 통합된 방식으로 사용자 검증
    // (학생은 쿠키 기반, 강사/관리자는 Supabase Auth 세션까지 검사)
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 민감 정보 제외하고 필요한 정보만 반환
    const filteredUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      profile_image_url: user.profile_image_url
    };

    return NextResponse.json(filteredUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}