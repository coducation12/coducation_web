'use client';

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Calendar } from "lucide-react";
import { getTuitionExportData } from "@/lib/actions/tuition";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ExportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    currentUserRole: string;
}

export function ExportExcelModal({ isOpen, onClose, currentUserId, currentUserRole }: ExportExcelModalProps) {
    const [loading, setLoading] = useState(false);
    const [startMonth, setStartMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [endMonth, setEndMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const handleDownload = async () => {
        try {
            setLoading(true);
            const res = await getTuitionExportData(`${startMonth}-01`, `${endMonth}-01`, currentUserId, currentUserRole);
            
            if (res.success && res.detailedData && res.yearlySummaries) {
                const workbook = XLSX.utils.book_new();

                // 1. 상세 내역 시트 생성
                const detailedWs = XLSX.utils.json_to_sheet(res.detailedData);
                XLSX.utils.book_append_sheet(workbook, detailedWs, "상세수납내역");

                // 상세 시트 셀 너비 및 필터 설정
                const detailedCols = [
                    { wch: 6 },  // 연도
                    { wch: 4 },  // 월
                    { wch: 12 }, // 학생명
                    { wch: 8 },  // 상태
                    { wch: 15 }, // 과목
                    { wch: 15 }, // 담당강사
                    { wch: 12 }, // 기준 수강료
                    { wch: 12 }, // 조정 수납액
                    { wch: 12 }, // 실제 수납액
                    { wch: 12 }, // 미납액
                    { wch: 10 }, // 결제상태
                    { wch: 30 }  // 비고
                ];
                detailedWs['!cols'] = detailedCols;
                if (res.detailedData.length > 0) {
                    const range = XLSX.utils.decode_range(detailedWs['!ref'] || 'A1');
                    detailedWs['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
                }

                // 2. 연도별 요약 시트들 생성
                const years = Object.keys(res.yearlySummaries).map(Number).sort((a, b) => b - a);
                years.forEach(year => {
                    const yearData = res.yearlySummaries[year];
                    if (yearData && yearData.length > 0) {
                        const yearWs = XLSX.utils.json_to_sheet(yearData);
                        XLSX.utils.book_append_sheet(workbook, yearWs, `${year}년 요약`);

                        // 요약 시트 셀 너비 및 필터 설정
                        const summaryCols = [
                            { wch: 12 }, // 학생명
                            { wch: 8 },  // 상태
                            { wch: 15 }, // 과목
                            { wch: 15 }, // 담당강사
                            ...Array(12).fill({ wch: 14 }), // 1월~12월 (날짜 표시 - 넉넉하게)
                            { wch: 30 }  // 비고
                        ];
                        yearWs['!cols'] = summaryCols;
                        
                        const range = XLSX.utils.decode_range(yearWs['!ref'] || 'A1');
                        yearWs['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
                    }
                });

                // 파일 다운로드
                const fileName = `수납관리_내역_${startMonth}_to_${endMonth}.xlsx`;
                XLSX.writeFile(workbook, fileName);
                onClose();
            } else {
                alert("데이터를 불러오는 중 오류가 발생했습니다: " + (res.error || "Unknown Error"));
            }
        } catch (error) {
            console.error("Excel download error:", error);
            alert("다운로드 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 연도 및 월 선택 옵션 생성 (최근 5년)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

    const [sYear, sMonth] = startMonth.split('-');
    const [eYear, eMonth] = endMonth.split('-');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0f172a] border-cyan-500/30 text-cyan-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-cyan-100">
                        <Download className="w-5 h-5 text-cyan-400" />
                        수납 내역 엑셀 다운로드
                    </DialogTitle>
                    <DialogDescription className="text-cyan-500/80">
                        다운로드할 기간을 선택해주세요. (월간/연간 통합 내역)
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label className="text-cyan-300 text-sm">시작 월</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Select value={sYear} onValueChange={(v) => setStartMonth(`${v}-${sMonth}`)}>
                                <SelectTrigger className="bg-cyan-900/20 border-cyan-500/20">
                                    <SelectValue placeholder="연도" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}년</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={sMonth} onValueChange={(v) => setStartMonth(`${sYear}-${v}`)}>
                                <SelectTrigger className="bg-cyan-900/20 border-cyan-500/20">
                                    <SelectValue placeholder="월" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    {months.map(m => <SelectItem key={m} value={m}>{parseInt(m)}월</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-cyan-300 text-sm">종료 월</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Select value={eYear} onValueChange={(v) => setEndMonth(`${v}-${eMonth}`)}>
                                <SelectTrigger className="bg-cyan-900/20 border-cyan-500/20">
                                    <SelectValue placeholder="연도" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}년</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={eMonth} onValueChange={(v) => setEndMonth(`${eYear}-${v}`)}>
                                <SelectTrigger className="bg-cyan-900/20 border-cyan-500/20">
                                    <SelectValue placeholder="월" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    {months.map(m => <SelectItem key={m} value={m}>{parseInt(m)}월</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-11"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                데이터 추출 중...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                엑셀 파일 다운로드
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
