import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AttendanceStatus } from '../components/types';
import { useToast } from '@/hooks/use-toast';
import { AttendanceRecord } from '../components/attendance-calendar/types';

export function useAttendanceCalendar(studentId: string) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
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

            const { data, error } = await supabase
                .from('student_activity_logs')
                .select('id, date, attended, status, memo, is_makeup, activity_type, start_time, end_time')
                .eq('student_id', studentId)
                .gte('date', startDateStr)
                .lte('date', endDateStr);

            if (error) throw error;

            const recordMap: Record<string, AttendanceRecord> = {};
            data?.forEach((item: any) => {
                let status: AttendanceStatus;
                if (item.status) {
                    status = item.status as AttendanceStatus;
                } else if (item.activity_type === 'typing' || item.attended) {
                    status = 'present';
                } else {
                    status = 'absent';
                }

                // 가장 최근의 attendance 타입 기록 우선 (혹은 typing 기록 포함)
                if (item.activity_type === 'attendance' || !recordMap[item.date]) {
                    recordMap[item.date] = {
                        id: item.id,
                        date: item.date,
                        status: status,
                        memo: item.memo,
                        is_makeup: item.is_makeup,
                        start_time: item.start_time,
                        end_time: item.end_time
                    };
                }
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
    }, [studentId, currentMonth]);

    const handleSaveDay = async (teacherId?: string | null) => {
        if (!editingDay) return;

        try {
            setIsSaving(true);
            const attendanceData: any = {
                student_id: studentId,
                activity_type: 'attendance',
                date: editingDay.date,
                attended: editingDay.status === 'present' || editingDay.status === 'makeup',
                status: editingDay.status,
                memo: editingDay.memo,
                teacher_id: teacherId || null,
            };

            let query;
            if (editingDay.id) {
                query = supabase
                    .from('student_activity_logs')
                    .update(attendanceData)
                    .eq('id', editingDay.id);
            } else {
                // ID가 없는 경우 같은 날짜/타입의 기록이 있는지 먼저 확인
                const { data: existing } = await supabase
                    .from('student_activity_logs')
                    .select('id, is_makeup, start_time, end_time')
                    .eq('student_id', studentId)
                    .eq('date', editingDay.date)
                    .eq('activity_type', 'attendance')
                    .maybeSingle();

                if (existing) {
                    if (existing.is_makeup) attendanceData.is_makeup = true;
                    if (existing.start_time && !attendanceData.start_time) attendanceData.start_time = existing.start_time;
                    if (existing.end_time && !attendanceData.end_time) attendanceData.end_time = existing.end_time;

                    query = supabase
                        .from('student_activity_logs')
                        .update(attendanceData)
                        .eq('id', existing.id);
                } else {
                    query = supabase
                        .from('student_activity_logs')
                        .insert(attendanceData);
                }
            }

            const { error } = await query;
            if (error) throw error;

            toast({
                title: "변경사항 저장 완료",
                description: `${editingDay.date} 출결 정보가 저장되었습니다.`,
            });

            setEditingDay(null);
            loadMonthlyAttendance();
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
            const { error } = await supabase
                .from('student_activity_logs')
                .delete()
                .eq('id', editingDay.id);

            if (error) throw error;

            toast({
                title: "삭제 완료",
                description: `${editingDay.date} 출결 기록이 삭제되었습니다.`,
            });

            setEditingDay(null);
            loadMonthlyAttendance();
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
        setEditingDay({ date: todayStr, status: 'present', memo: '' });

        try {
            const { data } = await supabase
                .from('student_activity_logs')
                .select('id, date, status, memo, is_makeup, start_time, end_time')
                .eq('student_id', studentId)
                .eq('date', todayStr)
                .eq('activity_type', 'attendance')
                .maybeSingle();

            if (data) {
                setEditingDay({
                    id: data.id,
                    date: data.date,
                    status: data.status as AttendanceStatus,
                    memo: data.memo,
                    is_makeup: data.is_makeup,
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
