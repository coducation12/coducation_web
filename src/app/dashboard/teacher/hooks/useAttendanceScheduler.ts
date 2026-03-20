import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Student, AttendanceStatus } from "../components/types";
import { getAttendanceData } from "../lib/attendance";
import { saveAttendanceSessionAction, deleteAttendanceSessionAction } from "@/lib/actions";

// 자동 결석 처리 함수
const processAutoAbsence = (students: Student[], currentDate: Date): Student[] => {
    return students.map(student => {
        // 이미 출석체크가 된 경우는 건드리지 않음
        if (student.attendanceTime.status !== 'unregistered' || student.attendanceTime.checkedAt) {
            return student;
        }

        // 수업 시간이 지났고 아직 미등록 상태라면 자동으로 결석 처리
        const classEndTime = new Date(currentDate);
        const [endHour, endMinute] = student.attendanceTime.end.split(':').map(Number);
        classEndTime.setHours(endHour, endMinute, 0, 0);

        if (new Date() > classEndTime) {
            return {
                ...student,
                attendanceTime: {
                    ...student.attendanceTime,
                    status: 'absent',
                    checkedAt: new Date()
                }
            };
        }

        return student;
    });
};

export const useAttendanceScheduler = (teacherId?: string) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [allActiveStudents, setAllActiveStudents] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 모든 활성 학생 목록 가져오기 (보강 등록용)
    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                const today = new Date().toLocaleDateString('en-CA');
                const res = await fetch(`/api/dashboard/attendance?date=${today}`);
                if (!res.ok) return;

                const { students } = await res.json();

                const activeList = (students || [])
                    .map((s: any) => ({
                        id: s.user_id,
                        name: s.users?.name || '알 수 없음'
                    }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name, 'ko-KR'));
                setAllActiveStudents(activeList);
            } catch (err) {
                console.error("Failed to fetch all active students via secure API", err);
            }
        };
        fetchAllStudents();
    }, []);

    // 날짜 변경 시 학생 데이터 새로 불러오기
    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            const studentsData = await getAttendanceData(currentDate, teacherId);
            setStudents(studentsData);
            setIsLoading(false);
        };

        fetchStudents();
    }, [currentDate, teacherId]);

    const refreshData = async () => {
        const studentsData = await getAttendanceData(currentDate, teacherId);
        setStudents(studentsData);
    };

    // 자동 결석 처리 (1분마다 체크)
    useEffect(() => {
        const interval = setInterval(() => {
            setStudents(prev => processAutoAbsence(prev, currentDate));
        }, 60000); // 1분마다 체크

        return () => clearInterval(interval);
    }, [currentDate]);

    const handlePrev = useCallback(() => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 1);
            return d;
        });
    }, []);

    const handleNext = useCallback(() => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 1);
            return d;
        });
    }, []);

    const handleAttendanceChange = useCallback(async (id: string, value: AttendanceStatus) => {
        console.log(`[Attendance] Updating ${id} to ${value} via Server Action`);
        // 로컬 상태 업데이트
        setStudents(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                attendanceTime: {
                    ...s.attendanceTime,
                    status: value,
                    checkedAt: value === 'unregistered' ? undefined : new Date()
                }
            } : s
        ));

        // 데이터베이스에 출석 기록 저장 (서버 액션을 통해 RLS 우회)
        try {
            const today = currentDate.toLocaleDateString('en-CA');
            const realUserId = id.split('-').slice(0, 5).join('-');

            // 1. 'unregistered'인 경우 기록 삭제
            if (value === 'unregistered') {
                const sessionType = id.includes('-makeup-') ? 'makeup' : 'regular';
                const result = await deleteAttendanceSessionAction(
                    realUserId,
                    today,
                    sessionType
                );

                if (!result.success) {
                    console.error('출석 기록 삭제 실패:', result.error);
                }
                return;
            }

            // 2. 출석 데이터 준비
            const student = students.find(s => s.id === id);
            const sessionType = id.includes('-makeup-') ? 'makeup' : (value === 'makeup' ? 'makeup' : 'regular');
            const attendanceData: any = {
                id: student?.sessionId,
                student_id: realUserId,
                date: today,
                status: value,
                session_type: sessionType,
                teacher_id: teacherId || null
            };

            const result = await saveAttendanceSessionAction(attendanceData);

            if (!result.success) {
                console.error('출석 기록 저장 실패:', result.error);
            }
        } catch (error) {
            console.error('출석 상태 저장 중 오류:', error);
        }
    }, [currentDate, teacherId]);

    return {
        currentDate,
        students,
        allActiveStudents,
        isLoading,
        handlePrev,
        handleNext,
        handleAttendanceChange,
        refreshData
    };
};
