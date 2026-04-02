import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AttendanceStatus } from '../components/types';
import { useToast } from '@/hooks/use-toast';
import { AttendanceRecord } from '../components/attendance-calendar/types';
import { 
    getMonthlyAttendance, 
    saveDailyAttendance, 
    deleteAttendanceSessionAction, 
    getDailyAttendance 
} from '@/lib/actions';

export function useAttendanceCalendar(
    studentId: string, 
    teacherId?: string | null, 
    onRefresh?: () => void,
    refreshTrigger: number = 0
) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord[]>>({});
    const [loading, setLoading] = useState(false);
    const [editingDay, setEditingDay] = useState<AttendanceRecord | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    
    // 마지막으로 요청한 정보를 저장하여 중복 요청 방지
    const lastRequestRef = useRef<string>('');

    const loadMonthlyAttendance = useCallback(async (force: boolean = false) => {
        if (!studentId) return;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const requestId = `${studentId}-${year}-${month}-${teacherId}`;
        
        // 이미 같은 데이터를 요청 중이거나 요청한 적이 있다면 (강제 새로고침이 아닐 때) 건너뜀
        if (!force && lastRequestRef.current === requestId && !loading) {
            return;
        }

        try {
            setLoading(true);
            lastRequestRef.current = requestId;

            const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

            const result = await getMonthlyAttendance(studentId, startDateStr, endDateStr, teacherId);

            if (!result.success) throw new Error(result.error);
            const data = result.data;

            const recordMap: Record<string, AttendanceRecord[]> = {};
            data?.forEach((item: any) => {
                const status = (item.status === 'makeup' ? 'unregistered' : (item.status || (item.attended ? 'present' : 'absent'))) as AttendanceStatus;
                
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
    }, [studentId, currentMonth, teacherId]);

    useEffect(() => {
        loadMonthlyAttendance();
    }, [loadMonthlyAttendance, refreshTrigger]);

    const handleSaveDay = async (targetTeacherId?: string | null) => {
        if (!editingDay) return;

        const previousRecords = { ...attendanceRecords };
        const dateStr = editingDay.date;

        try {
            setIsSaving(true);
            
            // 1. 낙관적 업데이트: UI 즉시 반영
            const optimisticRecord: AttendanceRecord = { ...editingDay };
            setAttendanceRecords(prev => ({
                ...prev,
                [dateStr]: [optimisticRecord]
            }));

            const attendanceData: any = {
                id: editingDay.id,
                student_id: studentId,
                date: editingDay.date,
                status: editingDay.status,
                memo: editingDay.memo,
                session_type: editingDay.session_type || 'regular',
                teacher_id: targetTeacherId || teacherId || null,
                start_time: editingDay.start_time || null,
                end_time: editingDay.end_time || null,
            };

            const result = await saveDailyAttendance(attendanceData) as any;

            if (!result.success) throw new Error(result.error);

            // 2. 부분 업데이트: 생성된 ID 등이 있을 수 있으므로 결과 반영
            if (result.id) {
                const finalRecord: AttendanceRecord = {
                    ...optimisticRecord,
                    id: result.id
                };
                setAttendanceRecords(prev => ({
                    ...prev,
                    [dateStr]: [finalRecord]
                }));
            }

            toast({
                title: "변경사항 저장 완료",
                description: `${editingDay.date} 출결 정보가 저장되었습니다.`,
            });

            setEditingDay(null);
            if (onRefresh) onRefresh();
        } catch (error: any) {
            // 실패 시 롤백
            setAttendanceRecords(previousRecords);
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

        const previousRecords = { ...attendanceRecords };
        const dateStr = editingDay.date;

        try {
            setIsSaving(true);
            
            // 1. 낙관적 업데이트: UI 즉시 제거
            setAttendanceRecords(prev => {
                const newRecords = { ...prev };
                delete newRecords[dateStr];
                return newRecords;
            });

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
            if (onRefresh) onRefresh();
        } catch (error: any) {
            // 실패 시 롤백
            setAttendanceRecords(previousRecords);
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

    const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

    const openTodayDetail = async (isMakeup: boolean = false, initialStatus?: AttendanceStatus) => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        
        setEditingDay({ 
            date: todayStr, 
            status: initialStatus || 'present', 
            memo: '', 
            session_type: isMakeup ? 'makeup' : 'regular',
            start_time: isMakeup ? '14:00' : '10:00',
            end_time: isMakeup ? '15:30' : '11:30'
        });

        try {
            const result = await getDailyAttendance(studentId, todayStr, isMakeup ? 'makeup' : 'regular');
            const data = result.data;

            if (data) {
                setAttendanceRecords(prev => ({
                    ...prev,
                    [todayStr]: [data]
                }));

                setEditingDay(prev => {
                    const finalStatus = (data.status === 'unregistered' && initialStatus && initialStatus !== 'unregistered')
                        ? initialStatus 
                        : (data.status as AttendanceStatus);

                    return {
                        id: data.id,
                        date: data.date,
                        status: finalStatus,
                        memo: data.memo,
                        session_type: data.session_type,
                        is_makeup: data.session_type === 'makeup',
                        start_time: data.start_time,
                        end_time: data.end_time
                    };
                });
            }
        } catch (e) {
            console.error('오늘 기록 로드 실패:', e);
        }
    };

    const refresh = useCallback(() => {
        loadMonthlyAttendance(true);
    }, [loadMonthlyAttendance]);

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
        refresh
    };
}
