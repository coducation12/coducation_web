'use client';

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { StudentList } from "./StudentList";
import { useAttendanceScheduler } from "../hooks/useAttendanceScheduler";
import { ScheduleHeader } from "./attendance-scheduler/ScheduleHeader";
import { ScheduleGrid } from "./attendance-scheduler/ScheduleGrid";

export function AttendanceScheduler({ teacherId }: { teacherId?: string }) {
  const {
    currentDate,
    students,
    allActiveStudents,
    isLoading,
    handlePrev,
    handleNext,
    handleAttendanceChange,
    refreshData
  } = useAttendanceScheduler(teacherId);

  return (
    <>
      <WeeklyCalendar currentDate={currentDate} teacherId={teacherId} />

      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <ScheduleHeader
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <CardContent className="p-0">
          <ScheduleGrid students={students} isLoading={isLoading} />
        </CardContent>
      </Card>

      <StudentList
        students={students}
        onAttendanceChange={handleAttendanceChange}
        teacherId={teacherId}
        allActiveStudents={allActiveStudents}
        onRefresh={refreshData}
      />
    </>
  );
}