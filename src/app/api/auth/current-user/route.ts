import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 사용자 정보 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, name, role, email, phone')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Current user API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}