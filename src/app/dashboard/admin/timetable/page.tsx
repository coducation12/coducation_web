'use client';
import React from 'react';
import { Timetable } from '@/components/common/timetable';

export const dynamic = 'force-dynamic';

export default function AdminTimetablePage() {
  return <Timetable title="학원 시간표" className="pt-16 lg:pt-2" />;
} 