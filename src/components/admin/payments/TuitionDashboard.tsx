'use client';

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Search,
    CreditCard,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Phone,
    Calendar as CalendarIcon,
    LayoutGrid,
    Table as TableIcon,
    Download,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Wallet,
    Banknote,
    QrCode
} from "lucide-react";
import {
    getTuitionDashboardData,
    getTuitionYearlySummary
} from "@/lib/actions/tuition";
import { PaymentEntryModal } from "./PaymentEntryModal";
import { ExportExcelModal } from "./ExportExcelModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";

interface TuitionDashboardProps {
    currentUserId: string;
    currentUserRole: string;
}

export function TuitionDashboard({ currentUserId, currentUserRole }: TuitionDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [yearlyData, setYearlyData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [canExport, setCanExport] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (viewMode === 'monthly') {
                const res = await getTuitionDashboardData(selectedMonth, currentUserId, currentUserRole);
                if (res.success) {
                    setMonthlyData(res.data || []);
                }
            } else {
                const year = parseInt(selectedMonth.split('-')[0]);
                const res = await getTuitionYearlySummary(year, currentUserId, currentUserRole);
                if (res.success) {
                    setYearlyData(res.data || []);
                }
            }
        } catch (error) {
            console.error("Fetch dashboard data error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth, viewMode, currentUserId, currentUserRole]);

    useEffect(() => {
        const checkPermission = async () => {
            if (currentUserRole === 'admin') {
                setCanExport(true);
                return;
            }

            // 일반 강사인 경우 권한 확인
            const { supabase } = await import("@/lib/supabase");
            const { data } = await supabase
                .from('users')
                .select('can_manage_all_payments')
                .eq('id', currentUserId)
                .single();
            setCanExport(data?.can_manage_all_payments || false);
        };
        checkPermission();
    }, [currentUserId, currentUserRole]);

    const handleMonthChange = (step: number) => {
        const date = new Date(selectedMonth);
        if (viewMode === 'monthly') {
            date.setMonth(date.getMonth() + step);
        } else {
            date.setFullYear(date.getFullYear() + step);
        }
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`);
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

    const filteredMonthlyData = useMemo(() => {
        let result = monthlyData.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.phone?.includes(searchTerm) ||
                (item.teacher_names || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.academy || "").toLowerCase().includes(searchTerm.toLowerCase());

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
                    case 'name': aValue = a.name; bValue = b.name; break;
                    case 'academy': aValue = a.academy || ""; bValue = b.academy || ""; break;
                    case 'teacher': aValue = a.teacher_names || ""; bValue = b.teacher_names || ""; break;
                    case 'status': aValue = a.payment.status; bValue = b.payment.status; break;
                    case 'base_amount': aValue = a.base_amount; bValue = b.base_amount; break;
                    case 'total_paid_amount': aValue = a.payment.total_paid_amount; bValue = b.payment.total_paid_amount; break;
                    case 'payment_date':
                        const aDates = a.payment.payment_details?.map((p: any) => p.date).filter(Boolean).sort();
                        const bDates = b.payment.payment_details?.map((p: any) => p.date).filter(Boolean).sort();
                        aValue = aDates?.[aDates.length - 1] || "";
                        bValue = bDates?.[bDates.length - 1] || "";
                        break;
                    default: return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [monthlyData, searchTerm, selectedStatus, sortConfig]);

    const filteredYearlyData = useMemo(() => {
        return yearlyData.filter(item => {
            const matchesSearch = 
                item.phone?.includes(searchTerm) ||
                (item.academy || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesSearch;
        });
    }, [yearlyData, searchTerm]);

    const stats = useMemo(() => {
        const activeData = monthlyData.filter(d => d.payment.status !== 'excluded');
        const totalTarget = activeData.reduce((sum, item) => sum + item.base_amount, 0);
        const totalCollected = monthlyData.reduce((sum, item) => sum + item.payment.total_paid_amount, 0);
        const unpaidCount = activeData.filter(d => d.payment.status === 'pending' || d.payment.status === 'partial').length;

        const methodStats = { card: 0, cash: 0, bank: 0, teacherPay: 0 };
        monthlyData.forEach(student => {
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
    }, [monthlyData]);

    const openPaymentModal = (student: any) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handlePaymentSaved = () => {
        fetchData();
        setIsModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        if (status === 'paid') return 'bg-green-500';
        if (status === 'partial') return 'bg-orange-500';
        return 'bg-zinc-600/30';
    };

    return (
        <div className="space-y-6">
            {/* 상단 헤더 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_8px_#00fff7]">수납 관리</h1>

                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                    {/* 날짜 선택기 */}
                    <div className="flex items-center bg-[#0a1837] border border-cyan-500/20 rounded-lg p-0.5 sm:p-1">
                        <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="text-cyan-100 h-7 w-7 sm:h-8 sm:w-8">
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <span className="text-sm sm:text-lg font-mono font-bold text-cyan-200 min-w-[80px] sm:min-w-[100px] text-center">
                            {viewMode === 'monthly' ? selectedMonth.slice(0, 7) : selectedMonth.slice(0, 4) + '년'}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="text-cyan-100 h-7 w-7 sm:h-8 sm:w-8">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </div>

                    {/* 월간/연간 탭 */}
                    <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-[160px] sm:w-[200px]">
                        <TabsList className="grid w-full grid-cols-2 bg-cyan-900/20 border border-cyan-500/20 h-9 sm:h-10 p-1">
                            <TabsTrigger value="monthly" className="text-xs sm:text-sm data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 py-1.5">
                                <TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                월간
                            </TabsTrigger>
                            <TabsTrigger value="yearly" className="text-xs sm:text-sm data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 py-1.5">
                                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                연간
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* 엑셀 추출 버튼 */}
                    {canExport && (
                        <Button
                            onClick={() => setIsExportModalOpen(true)}
                            className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-100 border border-cyan-500/30 h-8 sm:h-9 px-3"
                            size="sm"
                        >
                            <Download className="w-3.5 h-3.5 mr-2" />
                            <span className="hidden sm:inline">엑셀</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* 통계 배너 (월별 뷰 전용) */}
            {viewMode === 'monthly' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="bg-[#0a203f]/40 border-cyan-500/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10"><CreditCard className="w-8 h-8 sm:w-12 sm:h-12" /></div>
                            <CardHeader className="p-3 sm:pb-2 sm:pt-6"><CardTitle className="text-[10px] sm:text-xs font-medium text-cyan-300">목표 수납액</CardTitle></CardHeader>
                            <CardContent className="p-3 pt-0 sm:pt-0"><div className="text-base sm:text-2xl font-bold text-cyan-100">{stats.totalTarget.toLocaleString()}원</div></CardContent>
                        </Card>
                        <Card className="bg-[#0a203f]/40 border-green-500/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10"><TrendingUp className="w-8 h-8 sm:w-12 sm:h-12" /></div>
                            <CardHeader className="p-3 sm:pb-2 sm:pt-6"><CardTitle className="text-[10px] sm:text-xs font-medium text-green-300">현 수납 실적</CardTitle></CardHeader>
                            <CardContent className="p-3 pt-0 sm:pt-0"><div className="text-base sm:text-2xl font-bold text-green-400">{stats.totalCollected.toLocaleString()}원</div></CardContent>
                        </Card>
                        <Card className="bg-[#0a203f]/40 border-orange-500/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10"><AlertCircle className="w-8 h-8 sm:w-12 sm:h-12" /></div>
                            <CardHeader className="p-3 sm:pb-2 sm:pt-6"><CardTitle className="text-[10px] sm:text-xs font-medium text-orange-300">미납/부분납</CardTitle></CardHeader>
                            <CardContent className="p-3 pt-0 sm:pt-0"><div className="text-base sm:text-2xl font-bold text-orange-400">{stats.unpaidCount}명</div></CardContent>
                        </Card>
                        <Card className="bg-[#0a203f]/40 border-cyan-500/30 overflow-hidden relative">
                            <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-500" style={{ width: `${stats.collectionRate}%` }}></div>
                            <CardHeader className="p-3 sm:pb-2 sm:pt-6"><CardTitle className="text-[10px] sm:text-xs font-medium text-cyan-300">수납률</CardTitle></CardHeader>
                            <CardContent className="p-3 pt-0 sm:pt-0"><div className="text-base sm:text-2xl font-bold text-cyan-100">{stats.collectionRate.toFixed(1)}%</div></CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-cyan-950/20 border-cyan-500/10">
                            <CardContent className="p-2 sm:p-3 flex flex-col gap-1">
                                <div className="flex items-center gap-2 opacity-80">
                                    <Wallet className="w-3.5 h-3.5 text-cyan-500" />
                                    <span className="text-[10px] sm:text-[11px] text-cyan-500 font-medium">카드</span>
                                </div>
                                <div className="text-[13px] sm:text-sm font-bold text-cyan-100 break-all leading-tight">
                                    {stats.methodStats.card.toLocaleString()}원
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-cyan-950/20 border-cyan-500/10">
                            <CardContent className="p-2 sm:p-3 flex flex-col gap-1">
                                <div className="flex items-center gap-2 opacity-80">
                                    <Banknote className="w-3.5 h-3.5 text-cyan-500" />
                                    <span className="text-[10px] sm:text-[11px] text-cyan-500 font-medium">현금</span>
                                </div>
                                <div className="text-[13px] sm:text-sm font-bold text-cyan-100 break-all leading-tight">
                                    {stats.methodStats.cash.toLocaleString()}원
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-cyan-950/20 border-cyan-500/10">
                            <CardContent className="p-2 sm:p-3 flex flex-col gap-1">
                                <div className="flex items-center gap-2 opacity-80">
                                    <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
                                    <span className="text-[10px] sm:text-[11px] text-cyan-500 font-medium">계좌이체</span>
                                </div>
                                <div className="text-[13px] sm:text-sm font-bold text-cyan-100 break-all leading-tight">
                                    {stats.methodStats.bank.toLocaleString()}원
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-cyan-950/20 border-cyan-500/10">
                            <CardContent className="p-2 sm:p-3 flex flex-col gap-1">
                                <div className="flex items-center gap-2 opacity-80">
                                    <QrCode className="w-3.5 h-3.5 text-cyan-500" />
                                    <span className="text-[10px] sm:text-[11px] text-cyan-500 font-medium">결제선생</span>
                                </div>
                                <div className="text-[13px] sm:text-sm font-bold text-cyan-100 break-all leading-tight">
                                    {stats.methodStats.teacherPay.toLocaleString()}원
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* 필터 및 검색 바 */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-1">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                        <Input
                            placeholder="이름, 학원, 과목 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#0a1837] border-cyan-500/20 text-cyan-100 focus:border-cyan-400 h-9 text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto self-end">
                    {viewMode === 'monthly' && (
                        <div className="flex bg-cyan-900/20 p-1 rounded-md border border-cyan-500/20">
                            {[
                                { id: 'all', label: '전체' },
                                { id: 'unpaid', label: '미납/부분납' },
                                { id: 'paid', label: '완납' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedStatus(tab.id)}
                                    className={`px-4 py-1 rounded text-xs font-medium transition-all ${selectedStatus === tab.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-cyan-400 hover:text-cyan-200'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 테이블 카드 */}
            <Card className="bg-[#0a1837]/60 border-cyan-500/30 overflow-hidden">
                <CardContent className="p-0">
                    {viewMode === 'monthly' ? (
                        <div className="overflow-x-auto">
                            <Table className="text-[12px] sm:text-sm">
                                <TableHeader>
                                    <TableRow className="border-cyan-500/20 hover:bg-transparent">
                                        <TableHead className="text-cyan-300 cursor-pointer min-w-[90px]" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">학생 {renderSortIcon('name')}</div>
                                        </TableHead>
                                        <TableHead className="text-cyan-300 cursor-pointer min-w-[100px] hidden lg:table-cell" onClick={() => handleSort('academy')}>
                                            <div className="flex items-center gap-1">학원 {renderSortIcon('academy')}</div>
                                        </TableHead>
                                        <TableHead className="text-cyan-300 cursor-pointer min-w-[100px]" onClick={() => handleSort('teacher')}>
                                            <div className="flex items-center gap-1">강사/과목 {renderSortIcon('teacher')}</div>
                                        </TableHead>
                                        <TableHead className="text-cyan-300 text-right cursor-pointer min-w-[80px] hidden sm:table-cell" onClick={() => handleSort('base_amount')}>
                                            <div className="flex items-center justify-end gap-1">학원비 {renderSortIcon('base_amount')}</div>
                                        </TableHead>
                                        <TableHead className="text-cyan-300 text-right cursor-pointer min-w-[90px]" onClick={() => handleSort('total_paid_amount')}>
                                            <div className="flex items-center justify-end gap-1">수납액 {renderSortIcon('total_paid_amount')}</div>
                                        </TableHead>
                                        <TableHead className="text-cyan-300 text-right min-w-[80px] hidden sm:table-cell">수납일</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-cyan-400">Loading...</TableCell></TableRow>
                                    ) : filteredMonthlyData.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-cyan-600">내역 없음</TableCell></TableRow>
                                    ) : (
                                        filteredMonthlyData.map((item) => (
                                            <TableRow
                                                key={item.student_id}
                                                className={`border-cyan-500/10 cursor-pointer group hover:bg-white/5 transition-all ${item.payment.status === 'paid' ? 'bg-green-500/15' : item.payment.status === 'partial' ? 'bg-orange-500/15' : ''}`}
                                                onClick={() => openPaymentModal(item)}
                                            >
                                                <TableCell className="py-2 sm:py-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-cyan-100">{item.name}</span>
                                                            <span className="text-[10px] text-cyan-600 font-normal">{item.phone}</span>
                                                        </div>
                                                        <div className="text-[10px] text-cyan-500">학부모: {item.parent_phone || "-"}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2 sm:py-3 text-cyan-400 hidden lg:table-cell">
                                                    <div className="flex items-center gap-1.5 capitalize">
                                                        <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-medium">{item.academy || "-"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2 sm:py-3 text-cyan-200">
                                                    <div className="font-medium truncate max-w-[80px] sm:max-w-none">{item.teacher_names || "-"}</div>
                                                    <div className="text-[10px] text-cyan-500 truncate max-w-[80px] sm:max-w-[100px]">{item.subject}</div>
                                                </TableCell>
                                                <TableCell className="text-right py-2 sm:py-3 text-cyan-300 font-mono hidden sm:table-cell">{item.base_amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right py-2 sm:py-3 text-green-400 font-bold font-mono">
                                                    {item.payment.total_paid_amount.toLocaleString()}
                                                    {item.payment.status === 'partial' && <div className="text-[9px] text-orange-500 leading-none mt-1">미수: {(item.base_amount - item.payment.total_paid_amount).toLocaleString()}</div>}
                                                </TableCell>
                                                <TableCell className="text-right py-2 sm:py-3 text-cyan-400 font-mono text-[11px] sm:text-[13px] hidden sm:table-cell">
                                                    {(() => {
                                                        const dates = item.payment.payment_details?.map((p: any) => p.date).filter(Boolean).sort();
                                                        return dates?.[dates.length - 1]?.slice(2) || "-";
                                                    })()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="min-w-[600px] sm:min-w-[960px] w-full table-fixed">
                                <TableHeader>
                                    <TableRow className="border-cyan-500/20 hover:bg-transparent text-sm">
                                        <TableHead className="text-cyan-300 sticky left-0 bg-[#0a1837] z-20 w-[60px] sm:w-[220px] border-r border-cyan-500/20 px-1 sm:px-4 text-[11px] sm:text-sm">학생 정보/학원</TableHead>
                                        {[...Array(12)].map((_, i) => <TableHead key={i} className="text-cyan-300 text-center px-0 min-w-[24px] sm:min-w-[50px] text-[10px] sm:text-sm">{i + 1}월</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={14} className="text-center py-20 text-cyan-400">Loading...</TableCell></TableRow>
                                    ) : filteredYearlyData.length === 0 ? (
                                        <TableRow><TableCell colSpan={14} className="text-center py-20 text-cyan-600">내역 없음</TableCell></TableRow>
                                    ) : (
                                        filteredYearlyData.map((item) => (
                                            <TableRow key={item.student_id} className={`border-cyan-500/10 text-[10px] sm:text-[11px] ${item.isInactive ? 'opacity-60 bg-zinc-900/20' : 'hover:bg-cyan-900/5'}`}>
                                                <TableCell className="sticky left-0 bg-[#0a1837] z-10 border-r border-cyan-500/10 py-1 w-[60px] sm:w-[220px] px-1 sm:px-4">
                                                    <div className="font-bold flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 flex-wrap text-[11px] sm:text-sm">
                                                        <span className={`${item.isInactive ? 'text-zinc-500' : 'text-cyan-100'} truncate max-w-[75px] sm:max-w-none`}>{item.name}</span>
                                                        <span className="text-[10px] text-cyan-600 font-normal hidden sm:inline-block">{item.phone}</span>
                                                        {item.isInactive && <span className="text-[7px] sm:text-[8px] bg-zinc-800 text-zinc-500 px-0.5 sm:px-1 rounded border border-zinc-700 w-fit">종료</span>}
                                                    </div>
                                                    <div className="text-[9px] sm:text-[10px] text-cyan-500 mt-0.5">
                                                        <span className="text-cyan-400 font-medium">[{item.academy || "학원 미지정"}]</span>
                                                        <span className="ml-1 hidden sm:inline">학부모: {item.parent_phone || "-"}</span>
                                                    </div>
                                                    {/* item.memo && <div className="text-[8px] sm:text-[9px] text-cyan-400/60 truncate max-w-[75px] sm:max-w-[150px] mt-0.5">{item.memo}</div> */}
                                                </TableCell>
                                                {[...Array(12)].map((_, i) => {
                                                    const monthKey = String(i + 1).padStart(2, '0');
                                                    const payment = item.monthly_payments[monthKey];
                                                    const status = payment?.status || 'pending';

                                                    // 결제일 추출 (MM/DD)
                                                    let displayDate = "-";
                                                    if (payment?.payment_details?.length > 0) {
                                                        const dates = payment.payment_details.map((p: any) => p.date).filter(Boolean).sort();
                                                        if (dates.length > 0) {
                                                            const d = dates[dates.length - 1]; // 마지막 결제일
                                                            displayDate = d.slice(5, 10).replace('-', '/'); // "YYYY-MM-DD" -> "MM/DD"
                                                        }
                                                    }

                                                    return (
                                                        <TableCell key={i} className="px-0 sm:px-0.5 text-center">
                                                            <div
                                                                className={`w-full py-0.5 rounded cursor-pointer hover:brightness-125 transition-all text-[10px] sm:text-[13px] font-mono font-bold ${getStatusColor(status)} ${status === 'pending' ? 'text-transparent' : 'text-white/90 shadow-sm'}`}
                                                                onClick={() => openPaymentModal({
                                                                    ...item,
                                                                    payment: payment ? { ...payment, memo: item.memo } : {
                                                                        status: 'pending',
                                                                        total_paid_amount: 0,
                                                                        payment_details: [],
                                                                        memo: item.memo
                                                                    },
                                                                    selectedMonth: `${selectedMonth.split('-')[0]}-${monthKey}-01`
                                                                })}
                                                            >
                                                                {displayDate}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedStudent && (
                <PaymentEntryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                    currentMonth={selectedStudent.selectedMonth || selectedMonth}
                    currentUserId={currentUserId}
                    onSuccess={handlePaymentSaved}
                />
            )}

            <ExportExcelModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
