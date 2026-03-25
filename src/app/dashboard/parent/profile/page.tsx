import { getAuthenticatedUser } from '@/lib/auth'
import { ParentProfileClient } from './profile-client'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function ParentProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'parent' && user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <ParentProfileClient user={user} />;
}
