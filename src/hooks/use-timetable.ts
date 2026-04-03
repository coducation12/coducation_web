import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getContent } from "@/lib/actions";
import { getTimetableSnapshot } from "@/lib/actions/timetable-snapshot";

export interface TimetableStudent {
    id: string;
    name: string;
    teacher: string;
    teacherId: string;
    assignedTeachers: string[];
    academy: string;
    enrollmentDate?: string;
    schedule: {
        [key: string]: {
            startTime: string;
            endTime: string;
            teacherId?: string;
        };
    };
    isSpecialEducation?: boolean;
}

export interface TimetableOptions {
    year?: number;
    month?: number;
    teacherId?: string;
    userRole?: string;
}

export const useTimetable = (options?: TimetableOptions) => {
    const [students, setStudents] = useState<TimetableStudent[]>([]);
    const [teacherNames, setTeacherNames] = useState<Record<string, { name: string, color: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
    const [unitThreshold, setUnitThreshold] = useState('8');

    const fetchStudents = async () => {
        try {
            setIsLoading(true);

            // 스냅샷 데이터 조회 (연도/월 옵션이 있는 경우)
            if (options?.year && options?.month) {
                const { data: snapshotData, error: snapshotError } = await getTimetableSnapshot(options.year, options.month);

                if (snapshotError) throw snapshotError;

                if (snapshotData) {
                    const { students: s, teacherNames: t, unitThreshold: u } = snapshotData;
                    setStudents(s || []);
                    setTeacherNames(t || {});
                    setUnitThreshold(u || '8');
                } else {
                    // 데이터가 없는 경우 빈 상태 표시
                    setStudents([]);
                    setTeacherNames({});
                    setUnitThreshold('8');
                }
                setIsLoading(false);
                return;
            }

            // 실시간 데이터 로드 (기존 로직 - 옵션이 없는 경우)
            const response = await fetch('/api/dashboard/students?all=true');
            if (!response.ok) {
                console.error('Failed to fetch students for timetable');
                setStudents([]);
                setIsLoading(false);
                return;
            }

            const json = await response.json();
            const studentsData = json.data || [];
            const teachersData = json.teachers || [];
            const currentUserId = json.userId;
            const currentUserRole = json.userRole || options?.userRole;

            const teacherMap = new Map();
            (teachersData || []).forEach((t: any) => {
                const detail = Array.isArray(t.teachers) ? t.teachers[0] : t.teachers;
                teacherMap.set(t.id, {
                    name: t.name,
                    color: detail?.label_color || '#00fff7'
                });
            });

            const activeTeacherId = (currentUserRole?.toLowerCase() === 'teacher' && currentUserId)
                ? currentUserId
                : (options?.teacherId || '');

            const convertedStudents = (studentsData || [])
                .filter((student: any) => {
                    const status = student.users?.status;
                    return status === 'active' || status === '수강';
                })
                .map((student: any) => {
                    const assignedTeachers = student.assigned_teachers || [];
                    const tId = assignedTeachers[0] || '';
                    const tData = teacherMap.get(tId);
                    const tName = tData?.name || '미배정';

                    // 각 요일별 스케줄 - 학원 전체 시간표이므로 필터링 없이 모든 스케줄 표시
                    const filteredSchedule: any = {};
                    const rawSchedule = student.attendance_schedule || {};

                    Object.entries(rawSchedule).forEach(([day, schedule]: [string, any]) => {
                        filteredSchedule[day] = schedule;
                    });

                    return {
                        id: student.user_id,
                        name: student.users?.name || '알 수 없음',
                        teacher: tName,
                        teacherId: tId,
                        assignedTeachers: assignedTeachers,
                        academy: student.users?.academy || '미지정',
                        enrollmentDate: student.enrollment_start_date,
                        isSpecialEducation: student.is_special_education,
                        schedule: filteredSchedule
                    };
                });

            setStudents(convertedStudents);
            setTeacherNames(Object.fromEntries(teacherMap.entries()));

            const { data: contentResult } = await getContent();
            if (contentResult?.unit_threshold) {
                setUnitThreshold(contentResult.unit_threshold.toString());
            }
        } catch (error) {
            console.error('시간표 데이터 로드 실패:', error);
            // 에러 발생 시에도 빈 상태로 초기화하여 로딩 종료
            setStudents([]);
            setTeacherNames({});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [options?.year, options?.month]);

    return {
        students,
        teacherNames,
        isLoading,
        hoveredStudentId,
        setHoveredStudentId,
        unitThreshold,
        refresh: fetchStudents
    };
};
