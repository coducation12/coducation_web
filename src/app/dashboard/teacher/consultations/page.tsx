'use client';

import ConsultationsView from '@/components/common/ConsultationsView';

export const dynamic = 'force-dynamic';

export default function TeacherConsultationsPage() {
  return <ConsultationsView role="teacher" />;
}