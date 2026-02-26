'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentInfo {
    id: string;
    name: string;
}

interface MakeupSessionModalProps {
    students: StudentInfo[];
    teacherId?: string;
    onSuccess: () => void;
}

export function MakeupSessionModal({ students, teacherId, onSuccess }: MakeupSessionModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState<string>('14:00');
    const [endTime, setEndTime] = useState<string>('15:30');
    const [memo, setMemo] = useState<string>('');

    const handleSubmit = async () => {
        if (!selectedStudent || !date || !startTime || !endTime) {
            alert('학생, 날짜, 시간을 모두 선택해주세요.');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('student_activity_logs')
                .insert({
                    student_id: selectedStudent,
                    activity_type: 'attendance',
                    date: date,
                    attended: true,
                    status: 'makeup',
                    is_makeup: true,
                    start_time: startTime,
                    end_time: endTime,
                    teacher_id: teacherId || null,
                    memo: memo
                });

            if (error) throw error;

            alert('보강 수업이 성공적으로 등록되었습니다.');
            setOpen(false);
            onSuccess();
            // Reset form
            setSelectedStudent('');
            setMemo('');
        } catch (error: any) {
            console.error('보강 수업 등록 실패:', error);
            alert(`등록 실패: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-cyan-500/40 text-cyan-400 hover:text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-xs sm:text-sm gap-2 h-8 sm:h-9">
                    <PlusCircle className="h-4 w-4" />
                    보강 등록
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-cyan-950 border-cyan-500/30 text-cyan-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">
                        보강 수업 등록
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-cyan-300">학생 선택</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100">
                                <SelectValue placeholder="학생을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="bg-cyan-950 border-cyan-500/30 text-cyan-100">
                                {students.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-cyan-300">보강 날짜</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-cyan-300">수업 시간</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100 flex-1"
                            />
                            <span className="text-cyan-500">~</span>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100 flex-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-cyan-300">보강 사유 / 메모</Label>
                        <Textarea
                            placeholder="예: 어제 결석으로 인한 보강 진행"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-600/50 min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-cyan-400 hover:text-cyan-100 hover:bg-cyan-900/40"
                        >
                            취소
                        </Button>
                        <Button
                            className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)] min-w-[120px]"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? '등록 중...' : '보강 완료 처리'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
