import { getAuthenticatedUser } from '@/lib/auth'
import { StudentProfileClient } from './profile-client'

export default async function StudentProfilePage() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return <StudentProfileClient user={user} />;
}

