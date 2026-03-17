'use client';

import ConsultationsView from '@/components/common/ConsultationsView';
import { DashboardPageWrapper } from '@/components/common/DashboardPageWrapper';

export const dynamic = 'force-dynamic';

export default function TeacherConsultationsPage() {
  return (
    <DashboardPageWrapper>
      <ConsultationsView role="teacher" />
    </DashboardPageWrapper>
  );
}