'use client';

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CreditCard, Users, TrendingUp, AlertCircle, ChevronLeft, ChevronRight, Phone, User } from "lucide-react";
import { getTuitionDashboardData } from "@/lib/actions/tuition";
import { PaymentEntryModal } from "./PaymentEntryModal";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface TuitionDashboardProps {
    currentUserId: string;
    currentUserRole: string;
}

export function TuitionDashboard({ currentUserId, currentUserRole }: TuitionDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentMonth, currentUserId, currentUserRole]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getTuitionDashboardData(currentMonth, currentUserId, currentUserRole);
            if (res.success) {
                setData(res.data || []);
            }
        } catch (error) {
            console.error("Fetch dashboard data error:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedData = useMemo(() => {
        let result = data.filter(item => {
            const name = item.name || "";
            const phone = item.phone || "";
            const teacherNames = item.teacher_names || "";
            const subject = item.subject || "";

            const matchesSearch =
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                phone.includes(searchTerm) ||
                teacherNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesStatus = true;
            const currentStatus = item.payment?.status;

            if (selectedStatus === 'unpaid') {
                matchesStatus = currentStatus === 'pending' || currentStatus === 'partial';
            } else if (selectedStatus === 'paid') {
                matchesStatus = currentStatus === 'paid';
            }

            return matchesSearch && matchesStatus;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortConfig.key) {
                    case 'name':
                        aValue = a.name;
                        bValue = b.name;
                        break;
                    case 'teacher':
                        aValue = a.teacher_names;
                        bValue = b.teacher_names;
                        break;
                    case 'status':
                        aValue = a.payment.status;
                        bValue = b.payment.status;
                        break;
                    case 'base_amount':
                        aValue = a.base_amount;
                        bValue = b.base_amount;
                        break;
                    case 'total_paid_amount':
                        aValue = a.payment.total_paid_amount;
                        bValue = b.payment.total_paid_amount;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, selectedStatus, sortConfig]);

    // 상단 스태츠 계산
    const stats = useMemo(() => {
        const activeData = data.filter(d => d.payment.status !== 'excluded');
        const totalTarget = activeData.reduce((sum, item) => sum + item.base_amount, 0);
        const totalCollected = data.reduce((sum, item) => sum + item.payment.total_paid_amount, 0);
        const unpaidCount = activeData.filter(d => d.payment.status === 'pending' || d.payment.status === 'partial').length;

        // 결제 수단별 집계
        const methodStats = {
            card: 0,
            cash: 0,
            bank: 0,
            teacherPay: 0
        };

        data.forEach(student => {
            student.payment.payment_details?.forEach((p: any) => {
                const amount = Number(p.amount || 0);
                if (p.method === '카드') methodStats.card += amount;
                else if (p.method === '현금') methodStats.cash += amount;
                else if (p.method === '계좌이체') methodStats.bank += amount;
                else if (p.method === '결제선생') methodStats.teacherPay += amount;
            });
        });

        return {
            totalTarget,
            totalCollected,
            unpaidCount,
            collectionRate: totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0,
            methodStats
        };
    }, [data]);

    const handleMonthChange = (step: number) => {
        const date = new Date(currentMonth);
        date.setMonth(date.getMonth() + step);
        setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`);
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-1 w-3 h-3 opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 w-3 h-3 text-cyan-400" /> : <ArrowDown className="ml-1 w-3 h-3 text-cyan-400" />;
    };

    const openPaymentModal = (student: any) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* 월 선택 및 타이틀 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_8px_#00fff7] mb-1">수납 관리</h1>
                    <p className="text-cyan-400 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {currentMonth.slice(0, 7)} 정산 현황
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-cyan-900/20 p-2 rounded-lg border border-cyan-500/20">
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="text-cyan-100 h-8 w-8">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-lg font-mono font-bold text-cyan-200 min-w-[100px] text-center">
                        {currentMonth.slice(0, 7)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="text-cyan-100 h-8 w-8">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* 상단 요약 배너 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a203f]/40 border-cyan-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <CreditCard className="w-12 h-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-cyan-300">목표 수납액</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-100">{stats.totalTarget.toLocaleString()}원</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a203f]/40 border-green-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <TrendingUp className="w-12 h-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-green-300">현 수납 실적</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{stats.totalCollected.toLocaleString()}원</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a203f]/40 border-orange-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-orange-300">미납/부분납 인원</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">{stats.unpaidCount}명</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a203f]/40 border-cyan-500/30 overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-500" style={{ width: `${stats.collectionRate}%` }}></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-cyan-300">수납률</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-100">{stats.collectionRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* 결제 수단별 상세 내역 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-cyan-900/10 border border-cyan-500/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-cyan-400">카드</span>
                    <span className="text-sm font-bold text-cyan-100">{stats.methodStats.card.toLocaleString()}원</span>
                </div>
                <div className="bg-cyan-900/10 border border-cyan-500/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-cyan-400">현금</span>
                    <span className="text-sm font-bold text-cyan-100">{stats.methodStats.cash.toLocaleString()}원</span>
                </div>
                <div className="bg-cyan-900/10 border border-cyan-500/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-cyan-400">계좌이체</span>
                    <span className="text-sm font-bold text-cyan-100">{stats.methodStats.bank.toLocaleString()}원</span>
                </div>
                <div className="bg-cyan-900/10 border border-cyan-500/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-cyan-400">결제선생</span>
                    <span className="text-sm font-bold text-cyan-100">{stats.methodStats.teacherPay.toLocaleString()}원</span>
                </div>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-1">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                    <Input
                        placeholder="학생 이름이나 전화번호 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#0a1837] border-cyan-500/20 text-cyan-100 focus:border-cyan-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex bg-cyan-900/20 p-1 rounded-md border border-cyan-500/20">
                        {[
                            { id: 'all', label: '전체' },
                            { id: 'unpaid', label: '미납/부분납' },
                            { id: 'paid', label: '완납' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedStatus(tab.id)}
                                className={`px-4 py-1 rounded text-xs font-medium transition-all ${selectedStatus === tab.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-cyan-400 hover:text-cyan-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 메인 테이블 */}
            <Card className="bg-[#0a1837]/60 border-cyan-500/30">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20 hover:bg-transparent">
                                <TableHead className="text-cyan-300 cursor-pointer hover:text-cyan-100 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">학생 정보 {renderSortIcon('name')}</div>
                                </TableHead>
                                <TableHead className="text-cyan-300 cursor-pointer hover:text-cyan-100 transition-colors" onClick={() => handleSort('teacher')}>
                                    <div className="flex items-center">강사/과목 {renderSortIcon('teacher')}</div>
                                </TableHead>
                                <TableHead className="text-cyan-300 cursor-pointer hover:text-cyan-100 transition-colors" onClick={() => handleSort('status')}>
                                    <div className="flex items-center">수납 상태 {renderSortIcon('status')}</div>
                                </TableHead>
                                <TableHead className="text-cyan-300 text-right cursor-pointer hover:text-cyan-100 transition-colors" onClick={() => handleSort('base_amount')}>
                                    <div className="flex items-center justify-end">기준 금액 {renderSortIcon('base_amount')}</div>
                                </TableHead>
                                <TableHead className="text-cyan-300 text-right cursor-pointer hover:text-cyan-100 transition-colors" onClick={() => handleSort('total_paid_amount')}>
                                    <div className="flex items-center justify-end">수납 총액 {renderSortIcon('total_paid_amount')}</div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-cyan-400">데이터를 불러오는 중...</TableCell>
                                </TableRow>
                            ) : filteredAndSortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-cyan-600">조회된 내역이 없습니다.</TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedData.map((item) => (
                                    <TableRow
                                        key={item.student_id}
                                        className="border-cyan-500/10 hover:bg-cyan-900/20 transition-colors cursor-pointer group"
                                        onClick={() => openPaymentModal(item)}
                                    >
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-cyan-100 group-hover:text-cyan-400 transition-colors">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[11px] text-cyan-400 font-medium">
                                                        {item.phone}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-cyan-500">
                                                    <Phone className="w-3 h-3" />
                                                    <span>학부모 : {item.parent_phone || "미등록"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-cyan-200 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-cyan-100">{item.teacher_names || "-"}</span>
                                                <span className="text-[10px] text-cyan-500">{item.subject || "미지정"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                                                  min-w-[70px] justify-center border-transparent
                                                  ${item.payment.status === 'pending' ? 'bg-zinc-600/20 text-zinc-400' :
                                                        item.payment.status === 'partial' ? 'bg-orange-600/20 text-orange-400' :
                                                            item.payment.status === 'paid' ? 'bg-green-600/20 text-green-400' :
                                                                'bg-red-600/10 text-red-400'}
                                                `}
                                            >
                                                {item.payment.status === 'pending' ? '미납' : item.payment.status === 'partial' ? '부분납' : item.payment.status === 'paid' ? '완납' : '제외/휴강'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-cyan-300 font-mono">{item.base_amount.toLocaleString()}원</TableCell>
                                        <TableCell className="text-right text-green-400 font-bold font-mono">
                                            {item.payment.total_paid_amount.toLocaleString()}원
                                            {item.payment.status === 'partial' && (
                                                <div className="text-[10px] text-orange-500 font-normal">
                                                    미수: {(item.base_amount - item.payment.total_paid_amount).toLocaleString()}원
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 납부 입력 모달 */}
            {selectedStudent && (
                <PaymentEntryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                    currentMonth={currentMonth}
                    currentUserId={currentUserId}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
