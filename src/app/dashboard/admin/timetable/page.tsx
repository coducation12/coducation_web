'use client';
import React from 'react';
import { Timetable } from '@/components/common/timetable';
import { DashboardPageWrapper } from '@/components/common/DashboardPageWrapper';

export const dynamic = 'force-dynamic';

export default function AdminTimetablePage() {
  return (
    <DashboardPageWrapper className="p-6">
      <Timetable title="학원 시간표" />
    </DashboardPageWrapper>
  );
}