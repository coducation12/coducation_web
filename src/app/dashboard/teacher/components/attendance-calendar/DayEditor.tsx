import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    CircleX,
    RefreshCcw,
    Trash2,
    X,
    Save
} from 'lucide-react';
import { AttendanceRecord } from './types';
import { AttendanceStatus } from '../types';

interface DayEditorProps {
    editingDay: AttendanceRecord | null;
    isSaving: boolean;
    onClose: () => void;
    onSave: () => void;
    onDelete: () => void;
    setEditingDay: React.Dispatch<React.SetStateAction<AttendanceRecord | null>>;
}

export function DayEditor({
    editingDay,
    isSaving,
    onClose,
    onSave,
    onDelete,
    setEditingDay
}: DayEditorProps) {
    if (!editingDay) return null;

    return (
        <Dialog open={!!editingDay} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] bg-cyan-950 border-cyan-500/40 text-cyan-100 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {editingDay.date} 출결 관리
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-cyan-200/70 ml-1">상태 선택</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'present', label: '출석', icon: CheckCircle2, activeClass: 'bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]' },
                                { value: 'absent', label: '결석', icon: CircleX, activeClass: 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
                                { value: 'makeup', label: '보강', icon: RefreshCcw, activeClass: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]' },
                            ].map((status) => {
                                const Icon = status.icon;
                                const isActive = editingDay.status === status.value;
                                return (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => setEditingDay(prev => prev ? { ...prev, status: status.value as AttendanceStatus } : null)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 gap-1.5
                                            ${isActive
                                                ? status.activeClass
                                                : 'bg-cyan-900/20 border-cyan-500/10 text-cyan-500/60 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? '' : 'opacity-60'}`} />
                                        <span className="text-[11px] font-black uppercase tracking-tighter">{status.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-cyan-200/70 ml-1">메모 (특이사항)</label>
                        <Textarea
                            placeholder="특이사항을 입력하세요..."
                            className="bg-cyan-900/30 border-cyan-500/30 text-cyan-100 focus:ring-cyan-400 min-h-[100px] resize-none"
                            value={editingDay.memo || ''}
                            onChange={(e) => setEditingDay(prev => prev ? { ...prev, memo: e.target.value } : null)}
                        />
                    </div>
                </div>
                <DialogFooter className="flex flex-row justify-between items-center gap-2 sm:gap-0">
                    <div className="flex-1">
                        {editingDay.id && (
                            <Button
                                variant="ghost"
                                onClick={onDelete}
                                disabled={isSaving}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 px-3"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-cyan-300 hover:bg-cyan-800/30 h-9 px-3"
                        >
                            <X className="w-4 h-4 mr-2" /> 취소
                        </Button>
                        <Button
                            onClick={onSave}
                            disabled={isSaving}
                            className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] h-9 px-4"
                        >
                            {isSaving ? "저장 중..." : (
                                <><Save className="w-4 h-4 mr-2" /> 저장하기</>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
