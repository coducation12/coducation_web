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
}

export interface TimetableOptions {
    year?: number;
    month?: number;
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
            const { data: studentsData, error: studentsError } = await supabase
                .from('students')
                .select(`
          user_id,
          assigned_teachers,
          attendance_schedule,
          enrollment_start_date,
          users!students_user_id_fkey(name, academy, status)
        `);

            if (studentsError) throw studentsError;

            const teacherIds = new Set<string>();
            (studentsData || []).forEach((student: any) => {
                if (student.assigned_teachers && Array.isArray(student.assigned_teachers)) {
                    student.assigned_teachers.forEach((id: string) => teacherIds.add(id));
                }
            });

            const { data: teachersData, error: teachersError } = await supabase
                .from('users')
                .select(`
          id, 
          name,
          teachers(label_color)
        `)
                .in('id', Array.from(teacherIds));

            if (teachersError) throw teachersError;

            const teacherMap = new Map();
            (teachersData || []).forEach((t: any) => {
                const detail = Array.isArray(t.teachers) ? t.teachers[0] : t.teachers;
                teacherMap.set(t.id, {
                    name: t.name,
                    color: detail?.label_color || '#00fff7'
                });
            });

            const convertedStudents = (studentsData || [])
                .filter((student: any) => student.users?.status === 'active')
                .map((student: any) => {
                    const assignedTeachers = student.assigned_teachers || [];
                    const tId = assignedTeachers[0] || '';
                    const tData = teacherMap.get(tId);
                    const tName = tData?.name || '미배정';

                    return {
                        id: student.user_id,
                        name: student.users?.name || '알 수 없음',
                        teacher: tName,
                        teacherId: tId,
                        assignedTeachers: assignedTeachers,
                        academy: student.users?.academy || '미지정',
                        enrollmentDate: student.enrollment_start_date,
                        schedule: student.attendance_schedule || {}
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
