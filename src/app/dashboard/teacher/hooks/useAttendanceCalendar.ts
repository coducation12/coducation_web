import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AttendanceStatus } from '../components/types';
import { useToast } from '@/hooks/use-toast';
import { AttendanceRecord } from '../components/attendance-calendar/types';

export function useAttendanceCalendar(studentId: string, teacherId?: string | null, onRefresh?: () => void) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord[]>>({});
    const [loading, setLoading] = useState(false);
    const [editingDay, setEditingDay] = useState<AttendanceRecord | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const loadMonthlyAttendance = async () => {
        if (!studentId) return;

        try {
            setLoading(true);
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

            const { getMonthlyAttendance } = await import('@/lib/actions');
            const result = await getMonthlyAttendance(studentId, startDateStr, endDateStr, teacherId);

            if (!result.success) throw new Error(result.error);
            const data = result.data;

            const recordMap: Record<string, AttendanceRecord[]> = {};
            data?.forEach((item: any) => {
                const status = (item.status || (item.attended ? 'present' : 'absent')) as AttendanceStatus;
                
                if (!recordMap[item.date]) {
                    recordMap[item.date] = [];
                }

                recordMap[item.date].push({
                    id: item.id,
                    date: item.date,
                    status: status,
                    memo: item.memo,
                    is_makeup: item.session_type === 'makeup',
                    session_type: item.session_type,
                    start_time: item.start_time,
                    end_time: item.end_time
                });
            });
            setAttendanceRecords(recordMap);
        } catch (error: any) {
            console.error('출석부 로드 실패:', JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMonthlyAttendance();
    }, [studentId, currentMonth, teacherId]);

    const handleSaveDay = async (teacherId?: string | null) => {
        if (!editingDay) return;

        try {
            setIsSaving(true);
            const attendanceData: any = {
                id: editingDay.id,
                student_id: studentId,
                date: editingDay.date,
                status: editingDay.status,
                memo: editingDay.memo,
                session_type: editingDay.session_type || 'regular',
                teacher_id: teacherId || null,
            };

            const { saveDailyAttendance } = await import('@/lib/actions');
            const result = await saveDailyAttendance(attendanceData);

            if (!result.success) throw new Error(result.error);

            toast({
                title: "변경사항 저장 완료",
                description: `${editingDay.date} 출결 정보가 저장되었습니다.`,
            });

            setEditingDay(null);
            loadMonthlyAttendance();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('저장 실패:', JSON.stringify(error, null, 2));
            toast({
                title: "저장 실패",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDay = async () => {
        if (!editingDay || !editingDay.id) return;
        if (!confirm(`${editingDay.date} 기록을 삭제하시겠습니까?`)) return;

        try {
            setIsSaving(true);
            const { deleteAttendanceSessionAction } = await import('@/lib/actions');
            const result = await deleteAttendanceSessionAction(
                studentId,
                editingDay.date,
                editingDay.session_type || 'regular'
            );

            if (!result.success) throw new Error(result.error);

            toast({
                title: "삭제 완료",
                description: `${editingDay.date} 출결 기록이 삭제되었습니다.`,
            });

            setEditingDay(null);
            loadMonthlyAttendance();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('삭제 실패:', JSON.stringify(error, null, 2));
            toast({
                title: "삭제 실패",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const openTodayDetail = async () => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        // 임시 데이터로 먼저 열기
        setEditingDay({ date: todayStr, status: 'present', memo: '', session_type: 'regular' });

        try {
            const { getDailyAttendance } = await import('@/lib/actions');
            const result = await getDailyAttendance(studentId, todayStr);
            const data = result.data;

            if (data) {
                setAttendanceRecords(prev => ({
                    ...prev,
                    [todayStr]: data ? [data] : []
                }));
                setEditingDay({
                    id: data.id,
                    date: data.date,
                    status: data.status as AttendanceStatus,
                    memo: data.memo,
                    session_type: data.session_type,
                    is_makeup: data.session_type === 'makeup',
                    start_time: data.start_time,
                    end_time: data.end_time
                });
            }
        } catch (e) {
            console.error('오늘 기록 로드 실패:', e);
        }
    };

    return {
        currentMonth,
        setCurrentMonth,
        attendanceRecords,
        loading,
        editingDay,
        setEditingDay,
        isSaving,
        handleSaveDay,
        handleDeleteDay,
        nextMonth,
        prevMonth,
        openTodayDetail,
        refresh: loadMonthlyAttendance
    };
}
