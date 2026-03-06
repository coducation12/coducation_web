'use client';
import React from 'react';
import { Timetable } from '@/components/common/timetable';

export const dynamic = 'force-dynamic';

export default function TimetablePage() {
  return (
    <div className="h-screen overflow-y-auto scrollbar-hide pt-16 lg:pt-0">
      <Timetable title="학원 시간표" />
    </div>
  );
}