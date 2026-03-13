import React from 'react';
import { Timetable } from '@/components/common/timetable';
import { DashboardPageWrapper } from '@/components/common/DashboardPageWrapper';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function TimetablePage() {
  const user = await getAuthenticatedUser();

  return (
    <DashboardPageWrapper className="p-6">
      <Timetable 
        title="학원 시간표" 
        teacherId={user?.id} 
        userRole={user?.role} 
      />
    </DashboardPageWrapper>
  );
}