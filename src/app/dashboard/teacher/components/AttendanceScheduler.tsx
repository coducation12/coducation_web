'use client';

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { StudentList } from "./StudentList";
import { useAttendanceScheduler } from "../hooks/useAttendanceScheduler";
import { ScheduleHeader } from "./attendance-scheduler/ScheduleHeader";
import { ScheduleGrid } from "./attendance-scheduler/ScheduleGrid";
import StudentModal from "@/components/common/StudentModal";
import { getStudentDetailsForEdit, getTeachersAndAcademies, updateStudent } from "@/lib/actions";

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

  // 학생 수정 모달 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [academies, setAcademies] = useState<string[]>([]);

  // 학생 이름 클릭 시 상세 정보 로드 및 모달 오픈
  const handleStudentClick = async (userId: string) => {
    try {
      // 1. 메타데이터 (강사, 학원) 로드 (미리 로드되지 않은 경우)
      if (teachers.length === 0) {
        const metaResult = await getTeachersAndAcademies();
        if (metaResult.success) {
          setTeachers(metaResult.teachers || []);
          setAcademies(metaResult.academies || []);
        }
      }

      // 2. 학생 상세 정보 로드
      const result = await getStudentDetailsForEdit(userId, teacherId);
      if (result.success) {
        setSelectedStudentForEdit(result.data);
        setIsEditModalOpen(true);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('학생 정보 로드 중 오류:', error);
      alert('학생 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleSaveStudent = async (formData: any) => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'classSchedules') {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      });

      const result = await updateStudent(form);
      if (result.success) {
        setIsEditModalOpen(false);
        refreshData(); // 목록 새로고침
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('학생 정보 저장 중 오류:', error);
      alert('학생 정보 저장 중 오류가 발생했습니다.');
    }
  };

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
        onStudentClick={handleStudentClick}
      />

      <StudentModal
        mode="edit"
        student={selectedStudentForEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveStudent}
        teachers={teacherId ? teachers.filter(t => t.id === teacherId) : teachers}
        academies={academies}
      />
    </>
  );
}