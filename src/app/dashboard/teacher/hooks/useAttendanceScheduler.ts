import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Student, AttendanceStatus } from "../components/types";
import { getAttendanceData } from "../lib/attendance";

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
            const { data } = await supabase
                .from('students')
                .select(`
          user_id,
          users:users!students_user_id_fkey(name, status)
        `);

            const activeList = (data || [])
                .filter((s: any) => s.users?.status === 'active' || !s.users?.status)
                .map((s: any) => ({
                    id: s.user_id,
                    name: s.users?.name || '알 수 없음'
                }));
            setAllActiveStudents(activeList);
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

        // 데이터베이스에 출석 기록 저장
        try {
            const today = currentDate.toLocaleDateString('en-CA');
            // ID에서 순수 UUID만 추출 (uuid-regular 또는 uuid-makeup-logid 형식 대응)
            const realUserId = id.split('-').slice(0, 5).join('-');

            // 1. 'unregistered'인 경우 기록 삭제
            if (value === 'unregistered') {
                const { error: deleteError } = await supabase
                    .from('student_activity_logs')
                    .delete()
                    .eq('student_id', realUserId)
                    .eq('activity_type', 'attendance')
                    .eq('date', today);

                if (deleteError) console.error('출석 기록 삭제 실패:', JSON.stringify(deleteError, null, 2));
                return;
            }

            // 2. 기존 출석 기록 확인
            const { data: existing, error: checkError } = await supabase
                .from('student_activity_logs')
                .select('id, is_makeup, start_time, end_time')
                .eq('student_id', realUserId)
                .eq('activity_type', 'attendance')
                .eq('date', today)
                .maybeSingle();

            if (checkError) {
                console.error('출석 기록 확인 중 오류:', JSON.stringify(checkError, null, 2));
                return;
            }

            const attendanceData: any = {
                student_id: realUserId,
                activity_type: 'attendance',
                date: today,
                attended: value === 'present' || value === 'makeup',
                status: value,
                teacher_id: teacherId || null,
            };

            // 보강 기록인 경우 해당 속성 유지
            if (existing?.is_makeup || value === 'makeup') {
                attendanceData.is_makeup = true;
                if (existing?.start_time) attendanceData.start_time = existing.start_time;
                if (existing?.end_time) attendanceData.end_time = existing.end_time;
            }

            if (existing) {
                const { error } = await supabase
                    .from('student_activity_logs')
                    .update(attendanceData)
                    .eq('id', existing.id);

                if (error) console.error('출석 업데이트 실패:', JSON.stringify(error, null, 2));
            } else {
                attendanceData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('student_activity_logs')
                    .insert(attendanceData);

                if (error) console.error('출석 기록 생성 실패:', JSON.stringify(error, null, 2));
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
