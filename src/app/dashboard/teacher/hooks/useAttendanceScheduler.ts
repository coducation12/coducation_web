import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Student, AttendanceStatus, AttendanceSession } from "../components/types";
import { getAttendanceData } from "../lib/attendance";
import { saveAttendanceSessionAction, deleteAttendanceSessionAction } from "@/lib/actions";

// 자동 결석 처리 함수
const processAutoAbsence = (students: Student[], currentDate: Date): Student[] => {
    return students.map(student => {
        const updatedSessions = student.sessions.map(session => {
            // 이미 출석체크가 된 경우는 건드리지 않음
            if (session.attendanceTime.status !== 'unregistered' || session.attendanceTime.checkedAt) {
                return session;
            }

            // 수업 시간이 지났고 아직 미등록 상태라면 자동으로 결석 처리
            const classEndTime = new Date(currentDate);
            const [endHour, endMinute] = session.attendanceTime.end.split(':').map(Number);
            classEndTime.setHours(endHour, endMinute, 0, 0);

            if (new Date() > classEndTime) {
                return {
                    ...session,
                    attendanceTime: {
                        ...session.attendanceTime,
                        status: 'absent' as AttendanceStatus,
                        checkedAt: new Date()
                    }
                };
            }

            return session;
        }) as AttendanceSession[];

        // 세션 상태가 하나라도 변경되었는지 확인
        const isChanged = updatedSessions.some((session, idx) => session !== student.sessions[idx]);
        if (isChanged) {
            return { ...student, sessions: updatedSessions };
        }
        return student;
    });
};

export const useAttendanceScheduler = (teacherId?: string) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [allActiveStudents, setAllActiveStudents] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

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
        setRefreshTrigger(prev => prev + 1);
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
        // 이미 처리 중인 ID면 무시 (중복 클릭 방지)
        if (updatingIds.has(id)) return;

        console.log(`[Attendance] Updating session ${id} to ${value}`);
        
        setUpdatingIds(prev => new Set(prev).add(id));

        // 1. 로컬 상태 업데이트 (Optimistic UI)
        setStudents(prev => prev.map(student => {
            const sessionIdx = student.sessions.findIndex(s => s.id === id);
            if (sessionIdx === -1) return student;

            const updatedSessions = [...student.sessions];
            updatedSessions[sessionIdx] = {
                ...updatedSessions[sessionIdx],
                attendanceTime: {
                    ...updatedSessions[sessionIdx].attendanceTime,
                    status: value,
                    checkedAt: value === 'unregistered' ? undefined : new Date()
                }
            };
            return { ...student, sessions: updatedSessions };
        }));
        
        try {
            const today = currentDate.toLocaleDateString('en-CA');
            const realUserId = id.split('-').slice(0, 5).join('-');
            const isMakeup = id.includes('-makeup-');
            const sessionType = isMakeup ? 'makeup' : 'regular';

            // 현재 최신 학생 데이터에서 해당 세션 정보 찾기
            let targetSession: AttendanceSession | undefined;
            for (const student of students) {
                const s = student.sessions.find(item => item.id === id);
                if (s) {
                    targetSession = s;
                    break;
                }
            }

            if (value === 'unregistered') {
                if (isMakeup) {
                    await saveAttendanceSessionAction({
                        id: targetSession?.sessionId,
                        student_id: realUserId,
                        date: today,
                        status: 'makeup',
                        session_type: 'makeup',
                        teacher_id: teacherId || null,
                        start_time: targetSession?.attendanceTime.start,
                        end_time: targetSession?.attendanceTime.end
                    });
                } else {
                    await deleteAttendanceSessionAction(realUserId, today, 'regular');
                }
            } else {
                await saveAttendanceSessionAction({
                    id: targetSession?.sessionId,
                    student_id: realUserId,
                    date: today,
                    status: value,
                    session_type: sessionType,
                    teacher_id: teacherId || null,
                    start_time: targetSession?.attendanceTime.start,
                    end_time: targetSession?.attendanceTime.end
                });
            }

            // DB 반영 후 전체 데이터 동기화
            await refreshData();
        } catch (error) {
            console.error('출석 상태 저장 중 오류:', error);
            await refreshData();
        } finally {
            setUpdatingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    }, [currentDate, teacherId, students, updatingIds]);

    return {
        currentDate,
        students,
        allActiveStudents,
        isLoading,
        refreshTrigger,
        updatingIds,
        handlePrev,
        handleNext,
        handleAttendanceChange,
        refreshData
    };
};
