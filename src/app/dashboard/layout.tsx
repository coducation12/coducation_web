import { DashboardSidebar } from '@/components/sidebar/dashboard-sidebar';
import { getAuthenticatedUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { User } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
