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

    const yearFilteredItems = items
        .map((item, originalIdx) => ({ item, originalIdx }))
        .filter(({ item }) => {
            if (!item.targetMonth.startsWith(viewYear.toString()) && !item.isNew && !item.isEdited) return false;
            if (!item.targetMonth.startsWith(viewYear.toString())) return false;
            return true;
        });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[96vw] max-w-2xl max-h-[92vh] flex flex-col p-3.5 sm:p-6 bg-[#0a1837] border-cyan-500/30 text-cyan-100 overflow-hidden">
                <DialogHeader className="shrink-0 pb-1">
                    <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-cyan-100">
                        <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span className="truncate">수납 정보 입력 - {student.name} ({currentMonth.slice(0, 7)})</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 min-h-0">
                    {/* 학생 요약 카드 */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                        <div className="space-y-0.5 sm:space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-cyan-300">
                                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 학생 연락처
                            </div>
                            <p className="text-xs sm:text-sm font-medium font-mono text-cyan-100">{student.phone || "미등록"}</p>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-cyan-300">
                                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 학부모 ({student.parent_name || "-"})
                            </div>
                            <p className="text-xs sm:text-sm font-medium font-mono text-cyan-100">{student.parent_phone || "미등록"}</p>
                        </div>
                        <div className="space-y-1 col-span-2 pt-2 border-t border-cyan-500/10">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-[11px] sm:text-xs text-cyan-300">
                                    기준 학원비: <span className="font-mono font-medium text-cyan-100">{student.base_amount.toLocaleString()}원</span>
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-cyan-400">
                                    잔액: <span className="font-mono text-cyan-300">{remaining.toLocaleString()}원</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 결제 내역 컨트롤 */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 px-1">
                            <Label className="text-cyan-200 text-xs sm:text-sm font-semibold shrink-0">결제 내역</Label>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setViewYear(prev => prev - 1)}
                                    className="p-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/30 rounded transition-all"
                                    title="이전 연도"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <span className="text-base sm:text-lg font-bold text-cyan-100 min-w-[50px] sm:min-w-[60px] text-center font-mono tracking-wider">
                                    {viewYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setViewYear(prev => prev + 1)}
                                    className="p-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/30 rounded transition-all"
                                    title="다음 연도"
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {historyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
                                <Button
                                    type="button"
                                    onClick={addItem}
                                    size="sm"
                                    variant="outline"
                                    className="border-cyan-500/50 hover:bg-cyan-900/40 h-7 sm:h-8 text-[11px] sm:text-xs px-2 sm:px-3 text-cyan-200"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> 항목 추가
                                </Button>
                            </div>
                        </div>

                        {/* 내역 없을 때 */}
                        {yearFilteredItems.length === 0 ? (
                            <div className="py-8 text-center text-cyan-500 text-xs border border-cyan-500/15 rounded-lg bg-cyan-950/10">
                                {viewYear}년도 납부 내역이 없습니다.
                            </div>
                        ) : (
                            <>
                                {/* 1) 모바일 뷰 (< sm): 카드형 목록 */}
                                <div className="sm:hidden space-y-2">
                                    {yearFilteredItems.map(({ item, originalIdx }) => (
                                        <div key={originalIdx} className="p-2.5 bg-[#0a203f]/80 border border-cyan-500/25 rounded-lg space-y-2 shadow-sm">
                                            <div className="flex items-center gap-1.5">
                                                <select
                                                    value={parseInt(item.targetMonth.split('-')[1])}
                                                    onChange={(e) => updateItem(originalIdx, 'targetMonth', `${viewYear}-${e.target.value.padStart(2, '0')}-01`)}
                                                    className="h-8 w-[68px] bg-[#07172e] border border-cyan-500/30 text-xs rounded px-1 outline-none text-center font-mono font-bold text-cyan-100 shrink-0"
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                        <option key={m} value={m}>{m}월</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={item.method}
                                                    onChange={(e) => updateItem(originalIdx, 'method', e.target.value)}
                                                    className="h-8 w-[80px] bg-[#07172e] border border-cyan-500/30 text-[11px] rounded px-1 outline-none text-center text-cyan-200 shrink-0"
                                                >
                                                    <option value="결제선생">결제선생</option>
                                                    <option value="계좌이체">계좌이체</option>
                                                    <option value="카드">카드</option>
                                                    <option value="현금">현금</option>
                                                </select>
                                                <Input
                                                    type="date"
                                                    value={item.date}
                                                    onChange={(e) => updateItem(originalIdx, 'date', e.target.value)}
                                                    className="h-8 bg-[#07172e] border-cyan-500/30 text-[11px] px-1.5 flex-1 min-w-[100px] text-cyan-100"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => removeItem(originalIdx)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30 shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-cyan-500/15">
                                                <div>
                                                    <label className="text-[10px] text-cyan-400 font-medium block mb-0.5">학원비 (원)</label>
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatAmount(item.baseAmount || 0)}
                                                        onChange={(e) => updateItem(originalIdx, 'baseAmount', e.target.value)}
                                                        className="h-8 bg-[#07172e] border-cyan-500/30 text-xs px-2 text-right font-mono font-medium text-cyan-100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-green-400 font-medium block mb-0.5">납부금액 (원)</label>
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatAmount(item.amount)}
                                                        onChange={(e) => updateItem(originalIdx, 'amount', e.target.value)}
                                                        className="h-8 bg-[#07172e] border-cyan-500/30 text-xs px-2 text-right font-mono font-bold text-green-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 2) 태블릿/데스크톱 뷰 (>= sm): 테이블형 목록 */}
                                <div className="hidden sm:block overflow-x-auto border border-cyan-500/15 rounded-lg max-h-[300px]">
                                    <Table className="relative min-w-[560px]">
                                        <TableHeader className="sticky top-0 bg-[#0a1837] z-10 shadow-[0_1px_0_rgba(0,255,247,0.1)]">
                                            <TableRow className="border-cyan-500/20 hover:bg-transparent h-9">
                                                <TableHead className="text-cyan-300 w-[80px] px-2 h-9 text-center text-xs">납부월</TableHead>
                                                <TableHead className="text-cyan-300 min-w-[100px] px-2 h-9 text-center text-xs">학원비</TableHead>
                                                <TableHead className="text-cyan-300 min-w-[100px] px-2 h-9 text-center text-xs">납부금액</TableHead>
                                                <TableHead className="text-cyan-300 w-[125px] px-2 h-9 text-center text-xs">결제일</TableHead>
                                                <TableHead className="text-cyan-300 w-[95px] px-2 h-9 text-center text-xs">수단</TableHead>
                                                <TableHead className="text-cyan-300 w-8 px-1 h-9 text-center text-xs"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {yearFilteredItems.map(({ item, originalIdx }) => (
                                                <TableRow key={originalIdx} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                                    <TableCell className="px-1 py-1">
                                                        <select
                                                            value={parseInt(item.targetMonth.split('-')[1])}
                                                            onChange={(e) => updateItem(originalIdx, 'targetMonth', `${viewYear}-${e.target.value.padStart(2, '0')}-01`)}
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
                                                            inputMode="numeric"
                                                            value={formatAmount(item.baseAmount || 0)}
                                                            onChange={(e) => updateItem(originalIdx, 'baseAmount', e.target.value)}
                                                            className="h-7 bg-[#0a203f] border-cyan-500/30 text-xs px-2 text-right font-mono"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-1 py-1">
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={formatAmount(item.amount)}
                                                            onChange={(e) => updateItem(originalIdx, 'amount', e.target.value)}
                                                            className="h-7 bg-[#0a203f] border-cyan-500/20 text-xs px-2 text-right font-mono text-green-300 font-bold"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-1 py-1">
                                                        <Input
                                                            type="date"
                                                            value={item.date}
                                                            onChange={(e) => updateItem(originalIdx, 'date', e.target.value)}
                                                            className="h-7 bg-[#0a203f] border-cyan-500/20 text-[10px] px-1"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-1 py-1">
                                                        <select
                                                            value={item.method}
                                                            onChange={(e) => updateItem(originalIdx, 'method', e.target.value)}
                                                            className="h-7 w-full bg-[#0a203f] border border-cyan-500/20 text-[11.5px] rounded-md px-1 outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                                                        >
                                                            <option value="결제선생">결제선생</option>
                                                            <option value="계좌이체">계좌이체</option>
                                                            <option value="카드">카드</option>
                                                            <option value="현금">현금</option>
                                                        </select>
                                                    </TableCell>
                                                    <TableCell className="px-1 py-1">
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeItem(originalIdx)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 비고 (메모) */}
                    <div className="space-y-1.5">
                        <Label className="text-cyan-200 text-xs sm:text-sm font-medium">비고 (메모)</Label>
                        <Input
                            placeholder="예: 카드/현금 복합결제, 특정 기간 분할 납부 등"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="bg-[#0a203f] border-cyan-500/20 text-xs sm:text-sm h-8 sm:h-9 text-cyan-100"
                        />
                    </div>
                </div>

                <DialogFooter className="shrink-0 pt-3 border-t border-cyan-500/20 flex flex-row justify-end gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40"
                    >
                        취소
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-8 sm:h-9 px-5 sm:px-8 text-xs sm:text-sm shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> 저장 중...
                            </span>
                        ) : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
