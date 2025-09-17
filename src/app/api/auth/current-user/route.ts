import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    // 에러 로그 제거 - 조용히 처리
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
