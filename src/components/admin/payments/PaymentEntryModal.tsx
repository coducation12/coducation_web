'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, User, Phone, CreditCard, Banknote, Calendar } from "lucide-react";
import { saveTuitionPayment } from "@/lib/actions/tuition";
import { useToast } from "@/hooks/use-toast";

interface PaymentItem {
    type: string;
    amount: number;
    date: string;
    method: string;
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
    const [memo, setMemo] = useState(student.payment.memo || "");
    const [status, setStatus] = useState(student.payment.status);

    useEffect(() => {
        if (isOpen) {
            setItems(student.payment.payment_details || []);
            setMemo(student.payment.memo || "");
            setStatus(student.payment.status);
        }
    }, [isOpen, student]);

    const totalPaid = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const remaining = student.base_amount - totalPaid;

    const addItem = () => {
        const monthNum = parseInt(currentMonth.split('-')[1], 10);
        setItems([...items, {
            type: `${monthNum}월 수강료`,
            amount: student.base_amount,
            date: new Date().toISOString().split('T')[0],
            method: "카드"
        }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof PaymentItem, value: any) => {
        const newItems = [...items];
        if (field === 'amount') {
            // Remove commas before saving as number
            const numValue = Number(value.replace(/[^0-9]/g, ''));
            newItems[index] = { ...newItems[index], amount: numValue };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const formatAmount = (val: number) => {
        return val === 0 ? "" : val.toLocaleString();
    };

    // 금액에 따른 상태 추천
    useEffect(() => {
        if (totalPaid === 0) setStatus('pending');
        else if (totalPaid < student.base_amount) setStatus('partial');
        else setStatus('paid');
    }, [totalPaid, student.base_amount]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await saveTuitionPayment({
                student_id: student.student_id,
                payment_month: currentMonth,
                base_amount: student.base_amount,
                payment_details: items,
                status,
                memo,
                recorded_by: currentUserId
            });

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

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-cyan-200">결제 내역</Label>
                        <Button onClick={addItem} size="sm" variant="outline" className="border-cyan-500/50 hover:bg-cyan-900/40">
                            <Plus className="w-4 h-4 mr-1" /> 항목 추가
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20 hover:bg-transparent h-8">
                                <TableHead className="text-cyan-300 w-[110px] px-2 h-8 text-center">유형</TableHead>
                                <TableHead className="text-cyan-300 px-2 h-8 text-center">금액</TableHead>
                                <TableHead className="text-cyan-300 w-[100px] px-2 h-8 text-center">날짜</TableHead>
                                <TableHead className="text-cyan-300 w-[110px] px-2 h-8 text-center">결제 수단</TableHead>
                                <TableHead className="text-cyan-300 w-8 px-1 h-8 text-center"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow className="border-cyan-500/10 h-16">
                                    <TableCell colSpan={5} className="text-center text-cyan-500 text-xs px-2">
                                        납부 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, idx) => (
                                    <TableRow key={idx} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                        <TableCell className="px-1 py-1">
                                            <Input
                                                value={item.type}
                                                onChange={(e) => updateItem(idx, 'type', e.target.value)}
                                                className="h-7 bg-[#0a203f] border-cyan-500/20 text-xs px-2"
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
                                                className="h-7 w-full bg-[#0a203f] border border-cyan-500/20 text-[10px] rounded-md px-1 outline-none focus:ring-1 focus:ring-cyan-500"
                                            >
                                                <option value="카드">카드</option>
                                                <option value="현금">현금</option>
                                                <option value="계좌이체">계좌이체</option>
                                                <option value="결제선생">결제선생</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="px-1 py-1">
                                            <Button onClick={() => removeItem(idx)} variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/20">
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>


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
