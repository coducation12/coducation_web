'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, User, Phone, CreditCard, Banknote, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { saveTuitionPayment, getStudentPaymentHistory } from "@/lib/actions/tuition";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentItem {
    targetMonth: string; // "YYYY-MM-01" 형식
    amount: number;
    baseAmount?: number; // 해당 월의 기준 학원비 (Override용)
    date: string;
    method: string;
    isNew?: boolean; // 신규 추가 항목 여부
    isEdited?: boolean; // 현재 세션에서 수정된 항목 여부
}

interface PaymentEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        student_id: string;
        name: string;
        phone: string;
        parent_name?: string;
        parent_phone?: string;
        base_amount: number;
        payment: {
            status: string;
            total_paid_amount: number;
            payment_details: PaymentItem[];
            memo?: string;
        };
    };
    currentMonth: string;
    currentUserId: string;
    onSuccess: () => void;
}

export function PaymentEntryModal({ isOpen, onClose, student, currentMonth, currentUserId, onSuccess }: PaymentEntryModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<PaymentItem[]>([]);
    const [memo, setMemo] = useState(student.payment?.memo || "");
    const [status, setStatus] = useState(student.payment?.status || 'pending');
    const [viewYear, setViewYear] = useState(new Date(currentMonth).getFullYear());

    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            if (isOpen && student.student_id) {
                // 모달을 열거나 학생이 바뀌면 이전 데이터를 초기화 (깜빡임 방지)
                setItems([]);
                setMemo("");

                try {
                    setHistoryLoading(true);
                    const res = await getStudentPaymentHistory(student.student_id);
                    if (res.success && res.data) {
                        const allItems: PaymentItem[] = [];
                        res.data.forEach((p: any) => {
                            if (p.payment_details && Array.isArray(p.payment_details) && p.payment_details.length > 0) {
                                const mappedItems = p.payment_details.map((item: any) => ({
                                    ...item,
                                    targetMonth: item.targetMonth || p.payment_month,
                                    baseAmount: item.baseAmount || p.base_amount || student.base_amount
                                }));
                                allItems.push(...mappedItems);
                            } else {
                                // 내역은 없지만 레코드는 있는 경우 (미납 등)
                                allItems.push({
                                    targetMonth: p.payment_month,
                                    amount: p.total_paid_amount || 0,
                                    baseAmount: p.base_amount || student.base_amount,
                                    date: p.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                                    method: p.total_paid_amount > 0 ? "기존기록" : "결제선생"
                                });
                            }
                        });
                        setItems(allItems.sort((a, b) => b.targetMonth.localeCompare(a.targetMonth)));
                    } else {
                        // 기록이 없을 경우 student.payment?.payment_details 매핑
                        const initialItems = (student.payment?.payment_details || []).map(item => ({
                            ...item,
                            baseAmount: item.baseAmount || student.base_amount
                        }));
                        setItems(initialItems);
                    }
                } catch (error) {
                    console.error("Load history error:", error);
                    setItems(student.payment?.payment_details || []);
                } finally {
                    setHistoryLoading(false);
                }
                setMemo(student.payment?.memo || "");
                setStatus(student.payment?.status || 'pending');
                setViewYear(new Date(currentMonth).getFullYear());
            }
        };
        loadHistory();
    }, [isOpen, student]);

    const currentMonthItems = items.filter(item => item.targetMonth === currentMonth);
    const totalPaid = currentMonthItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    // 현재 달의 학원비 기준 (아이템이 있으면 첫 번째 아이템의 baseAmount, 없으면 학생 기본값)
    const effectiveBaseAmount = currentMonthItems[0]?.baseAmount ?? student.base_amount;
    const remaining = effectiveBaseAmount - totalPaid;

    const addItem = () => {
        // 현재 보고 있는 연도(viewYear)와 현재 달의 월 정보를 조합하여 기본값 설정
        const currentMonthObj = new Date(currentMonth);
        const defaultTargetMonth = `${viewYear}-${String(currentMonthObj.getMonth() + 1).padStart(2, '0')}-01`;

        setItems([...items, {
            targetMonth: defaultTargetMonth,
            amount: student.base_amount,
            baseAmount: student.base_amount,
            date: new Date().toISOString().split('T')[0],
            method: "결제선생",
            isNew: true
        }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof PaymentItem, value: any) => {
        const newItems = [...items];
        if (field === 'amount' || field === 'baseAmount') {
            // Remove commas before saving as number
            const cleanValue = value.replace(/[^0-9]/g, '');
            const numValue = cleanValue === '' ? 0 : Number(cleanValue);
            newItems[index] = { ...newItems[index], [field]: numValue, isEdited: true };

            // 만약 같은 달의 다른 항목이 있다면 baseAmount 동기화 (사용자 편의)
            if (field === 'baseAmount') {
                const targetMonth = newItems[index].targetMonth;
                newItems.forEach((item, i) => {
                    if (item.targetMonth === targetMonth) {
                        newItems[i] = { ...item, baseAmount: numValue, isEdited: true };
                    }
                });
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value, isEdited: true };
        }
        setItems(newItems);
    };

    const formatAmount = (val: number) => {
        if (val === 0) return "0";
        return val.toLocaleString();
    };

    // 금액에 따른 상태 추천
    useEffect(() => {
        if (totalPaid === 0) setStatus('pending');
        else if (totalPaid < effectiveBaseAmount) setStatus('partial');
        else setStatus('paid');
    }, [totalPaid, effectiveBaseAmount]);

    const handleSave = async () => {
        try {
            setLoading(true);
            // UI 전용 속성 제거 후 저장
            const cleanItems = items.map(({ isNew, isEdited, ...rest }) => rest);

            const res = await saveTuitionPayment({
                student_id: student.student_id,
                payment_details: cleanItems,
                memo: memo,
                recorded_by: currentUserId
            });
            // base_amount는 이제 payment_details 내부의 baseAmount를 통해 서버에서 처리됨

            if (res.success) {
                toast({ title: "저장 완료", description: `${student.name} 학생의 수납 정보를 업데이트했습니다.` });
                onSuccess();
                onClose();
            } else {
                throw new Error(res.error);
            }
        } catch (error: any) {
            toast({ title: "저장 실패", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#0a1837] border-cyan-500/30 text-cyan-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-cyan-400" />
                        수납 정보 입력 - {student.name} ({currentMonth.slice(0, 7)})
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/20 mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-cyan-300">
                            <User className="w-3 h-3" /> 학생 연락처
                        </div>
                        <p className="text-sm font-medium">{student.phone || "미등록"}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-cyan-300">
                            <Phone className="w-3 h-3" /> 학부모 ({student.parent_name || "미등록"})
                        </div>
                        <p className="text-sm font-medium">{student.parent_phone || "미등록"}</p>
                    </div>
                    <div className="space-y-1 col-span-2 pt-2 border-t border-cyan-500/10">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-cyan-300">기준 학원비: {student.base_amount.toLocaleString()}원</span>
                            <span className="text-sm font-bold text-cyan-400">잔액: {remaining.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pr-1">
                    <div className="flex justify-between items-center relative px-1 h-8">
                        <Label className="text-cyan-200 text-sm">결제 내역</Label>

                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 h-full">
                            <button onClick={() => setViewYear(prev => prev - 1)} className="text-cyan-500 hover:text-cyan-300 transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xl font-bold text-cyan-100 min-w-[60px] text-center font-mono tracking-wider">
                                {viewYear}
                            </span>
                            <button onClick={() => setViewYear(prev => prev + 1)} className="text-cyan-500 hover:text-cyan-300 transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {historyLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />}
                            <Button onClick={addItem} size="sm" variant="outline" className="border-cyan-500/50 hover:bg-cyan-900/40 h-8 text-xs">
                                <Plus className="w-4 h-4 mr-1" /> 항목 추가
                            </Button>
                        </div>
                    </div>

                    <div
                        className="overflow-y-auto max-h-[300px] border border-cyan-500/10 rounded-lg"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            div::-webkit-scrollbar { display: none; }
                        `}} />
                        <Table className="relative">
                            <TableHeader className="sticky top-0 bg-[#0a1837] z-10 shadow-[0_1px_0_rgba(0,255,247,0.1)]">
                                <TableRow className="border-cyan-500/20 hover:bg-transparent h-9">
                                    <TableHead className="text-cyan-300 w-[100px] px-2 h-9 text-center text-xs">납부월</TableHead>
                                    <TableHead className="text-cyan-300 px-2 h-9 text-center text-xs">학원비</TableHead>
                                    <TableHead className="text-cyan-300 px-2 h-9 text-center text-xs">납부금액</TableHead>
                                    <TableHead className="text-cyan-300 w-[100px] px-2 h-9 text-center text-xs">결제일</TableHead>
                                    <TableHead className="text-cyan-300 w-[100px] px-2 h-9 text-center text-xs">수단</TableHead>
                                    <TableHead className="text-cyan-300 w-8 px-1 h-9 text-center text-xs"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 || items.filter(i => i.targetMonth.startsWith(viewYear.toString())).length === 0 ? (
                                    <TableRow className="border-cyan-500/10 h-16">
                                        <TableCell colSpan={6} className="text-center text-cyan-500 text-xs px-2">
                                            {viewYear}년도 납부 내역이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item, idx) => {
                                        // 선택된 연도에 해당하거나, 이번 세션에서 새로 추가/수정한 항목만 표시
                                        // 단, 새로 추가된 항목도 기본은 currentMonth이므로 viewYear와 다를 수 있음.
                                        // 사용자가 연도를 넘기면 해당 연도 내역만 보여주는게 목적이므로 targetMonth의 연도 비교가 핵심.
                                        if (!item.targetMonth.startsWith(viewYear.toString()) && !item.isNew && !item.isEdited) return null;

                                        // 추가 조건: 새로 추가했거나 수정한 항목이라도, 연도를 바꿨을 때 그 연도에 속하지 않으면 숨김처리 (사용자 혼란 방지)
                                        if (!item.targetMonth.startsWith(viewYear.toString())) return null;

                                        return (
                                            <TableRow key={idx} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                                <TableCell className="px-1 py-1">
                                                    <select
                                                        value={parseInt(item.targetMonth.split('-')[1])}
                                                        onChange={(e) => updateItem(idx, 'targetMonth', `${viewYear}-${e.target.value.padStart(2, '0')}-01`)}
                                                        className="h-7 w-full bg-[#0a203f] border border-cyan-500/20 text-xs rounded px-1 outline-none text-center font-mono text-cyan-100"
                                                    >
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                            <option key={m} value={m}>{m}월</option>
                                                        ))}
                                                    </select>
                                                </TableCell>
                                                <TableCell className="px-1 py-1">
                                                    <Input
                                                        type="text"
                                                        value={formatAmount(item.baseAmount || 0)}
                                                        onChange={(e) => updateItem(idx, 'baseAmount', e.target.value)}
                                                        className="h-7 bg-[#0a203f] border-cyan-500/30 text-xs px-2 text-right font-mono"
                                                    />
                                                </TableCell>
                                                <TableCell className="px-1 py-1">
                                                    <Input
                                                        type="text"
                                                        value={formatAmount(item.amount)}
                                                        onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                                                        className="h-7 bg-[#0a203f] border-cyan-500/20 text-xs px-2 text-right font-mono"
                                                    />
                                                </TableCell>
                                                <TableCell className="px-1 py-1">
                                                    <Input
                                                        type="date"
                                                        value={item.date}
                                                        onChange={(e) => updateItem(idx, 'date', e.target.value)}
                                                        className="h-7 bg-[#0a203f] border-cyan-500/20 text-[10px] px-1"
                                                    />
                                                </TableCell>
                                                <TableCell className="px-1 py-1">
                                                    <select
                                                        value={item.method}
                                                        onChange={(e) => updateItem(idx, 'method', e.target.value)}
                                                        className="h-7 w-full bg-[#0a203f] border border-cyan-500/20 text-[11.5px] rounded-md px-1 outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                                                    >
                                                        <option value="결제선생">결제선생</option>
                                                        <option value="계좌이체">계좌이체</option>
                                                        <option value="카드">카드</option>
                                                        <option value="현금">현금</option>
                                                    </select>
                                                </TableCell>
                                                <TableCell className="px-1 py-1">
                                                    <Button onClick={() => removeItem(idx)} variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/20">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>


                    <div className="space-y-2">
                        <Label className="text-cyan-200">비고 (메모)</Label>
                        <Input
                            placeholder="예: 카드/현금 복합결제, 특정 기간 분할 납부 등"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="bg-[#0a203f] border-cyan-500/20"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>취소</Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    >
                        {loading ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
