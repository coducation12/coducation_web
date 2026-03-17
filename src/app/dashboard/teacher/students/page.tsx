"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Phone, CheckCircle, XCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import StudentModal from "@/components/common/StudentModal";
import { AttendanceCalendarModal } from "../components/AttendanceCalendarModal";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { useStudentsData, Student, ClassSchedule } from "@/hooks/useStudentsData";

export const dynamic = 'force-dynamic';

export default function TeacherStudentsPage() {
    const {
        students,
        teachers,
        userId: currentUserId,
        userRole,
        handleAddStudent,
        handleSaveStudent,
        handleTeacherChange,
        fetchStudents
    } = useStudentsData();

    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("전체");
    const [sortField, setSortField] = useState<string | null>("name");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const { toast } = useToast();



    // 정렬 함수
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // 정렬 아이콘 렌더링 함수
    const getSortIcon = (field: string) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4" />;
        }
        return sortDirection === 'asc' ?
            <ArrowUp className="w-4 h-4" /> :
            <ArrowDown className="w-4 h-4" />;
    };

    // 정렬된 학생 목록 생성
    const getSortedStudents = (students: Student[]) => {
        // 1. 상태별 가중치 부여 (수강/승인대기 우선)
        const getStatusWeight = (status: string) => {
            if (status === '수강' || status === '승인대기') return 0;
            if (status === '상담') return 1;
            return 2; // 휴강, 종료 등
        };

        return [...students].sort((a, b) => {
            const weightA = getStatusWeight(a.status);
            const weightB = getStatusWeight(b.status);

            if (weightA !== weightB) return weightA - weightB;

            // 2. 같은 그룹 내에서 선택한 필드로 정렬
            if (!sortField) return 0;

            let aValue: any = a[sortField as keyof Student];
            let bValue: any = b[sortField as keyof Student];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleEditStudent = (student: Student) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    // 본인이 담당강사로 지정된 학생 필터링
    const myStudents = students.filter(student =>
        student.assignedTeachers?.some((t: any) => t.id === currentUserId)
    );
    // 모든 학생 데이터 (기존 학생만)
    const allStudents = (students || []).map(student => ({
        ...student,
        type: 'existing',
        status: student.status || 'active',
        uniqueKey: `existing-${student.id}` // 고유 키 생성
    }));

    // 학생 목록 필터링 (상태 필터 + 검색어)
    const filteredStudents = allStudents.filter(student => {
        const matchesStatus = statusFilter === "전체" || student.status === statusFilter;
        const matchesSearch = 
            student.name?.toLowerCase().includes(search.toLowerCase()) ||
            student.email?.toLowerCase().includes(search.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(search.toLowerCase());
        
        return matchesStatus && matchesSearch;
    });

    // 정렬 적용
    const sortedStudents = getSortedStudents(filteredStudents);
    let activeNoCounter = 0;

    return (
        <DashboardPageWrapper>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생 관리</h1>
                <StudentModal
                    mode="add"
                    onSave={async (formData) => { await handleAddStudent(formData); }}
                    teachers={teachers as any}
                    currentUserId={currentUserId || undefined}
                />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-cyan-100 text-lg sm:text-xl">학생 목록</CardTitle>
                        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className={`flex-1 md:w-[120px] bg-background/40 border-cyan-400/40 text-[13px] h-9 ${
                                    statusFilter === '수강' ? 'text-green-400' :
                                    statusFilter === '상담' ? 'text-yellow-400' :
                                    statusFilter === '휴강' ? 'text-orange-400' :
                                    statusFilter === '종료' ? 'text-red-400' :
                                    'text-cyan-100'
                                }`}>
                                    <SelectValue placeholder="상태" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    <SelectItem value="전체" className="text-cyan-100">전체</SelectItem>
                                    <SelectItem value="수강" className="text-green-400">수강</SelectItem>
                                    <SelectItem value="상담" className="text-yellow-400 font-medium">상담</SelectItem>
                                    <SelectItem value="휴강" className="text-orange-400">휴강</SelectItem>
                                    <SelectItem value="종료" className="text-red-400">종료</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="학생 검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-[2] md:w-64 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 text-[13px] h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                    <div className="overflow-x-auto">
                        <Table className="text-[13px] sm:text-sm">
                            <TableHeader>
                                <TableRow className="border-cyan-500/20">
                                    <TableHead className="text-cyan-200 px-2 w-10 sm:w-16 text-center">No</TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className="md:hidden">성명</span>
                                            <span className="hidden md:inline">학생명</span>
                                            {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2 hidden lg:table-cell"
                                        onClick={() => handleSort('academy')}
                                    >
                                        <div className="flex items-center gap-1">
                                            소속 학원
                                            {getSortIcon('academy')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2"
                                        onClick={() => handleSort('phone')}
                                    >
                                        <div className="flex items-center gap-1">
                                            연락처
                                            {getSortIcon('phone')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2 hidden sm:table-cell"
                                        onClick={() => handleSort('course')}
                                    >
                                        <div className="flex items-center gap-1">
                                            과목
                                            {getSortIcon('course')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2 text-center"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            상태
                                            {getSortIcon('status')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2 text-center"
                                        onClick={() => handleSort('monthlyAttendanceCount')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            출석
                                            {getSortIcon('monthlyAttendanceCount')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-2 hidden xl:table-cell"
                                        onClick={() => handleSort('joinDate')}
                                    >
                                        <div className="flex items-center gap-2">
                                            가입일
                                            {getSortIcon('joinDate')}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {sortedStudents.map((student, index) => (
                                <TableRow
                                    key={student.uniqueKey}
                                    className="border-cyan-500/10 hover:bg-cyan-900/10 cursor-pointer"
                                    onClick={() => {
                                        if (student.type !== 'signup_request') {
                                            handleEditStudent(student);
                                        }
                                    }}
                                >
                                    <TableCell className="text-cyan-300 font-medium px-2 text-center">
                                        {(student.status === '수강' || student.status === '승인대기')
                                            ? ++activeNoCounter
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium text-cyan-100 px-2 min-w-[50px] truncate">
                                        {student.name}
                                    </TableCell>
                                    <TableCell className="text-cyan-300 px-2 hidden lg:table-cell">
                                        {student.academy || '-'}
                                    </TableCell>
                                    <TableCell className="text-cyan-300 px-2 whitespace-nowrap">
                                        {student.type === 'signup_request' ? (
                                            <span className="text-cyan-400 text-xs sm:text-[13px]">가입요청</span>
                                        ) : (
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 opacity-50" />
                                                <span className="text-xs sm:text-[13px]">{student.phone}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-cyan-300 px-2 hidden sm:table-cell">
                                        {student.type === 'signup_request' ? '-' : student.course}
                                    </TableCell>
                                    <TableCell className="px-2 text-center">
                                        <Badge
                                            variant="outline"
                                            className={`px-1 sm:px-2 py-0 h-5 sm:h-6 text-[10px] sm:text-xs whitespace-nowrap ${
                                                (student.type === 'signup_request' || student.status === '승인대기' || student.status === '상담')
                                                    ? "border-yellow-500/50 text-yellow-400"
                                                    : student.status === '휴강'
                                                        ? "border-orange-500/50 text-orange-400"
                                                        : "border-green-500/50 text-green-400"
                                            }`}
                                        >
                                            {student.type === 'signup_request' || student.status === '승인대기' ? '대기' : student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center px-2" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`hidden sm:flex font-bold px-1 sm:px-2 py-0 h-5 sm:h-6 text-[10px] sm:text-xs ${
                                                    (student.monthlyAttendanceCount || 0) >= 8 
                                                    ? "border-green-500/50 text-green-400 bg-green-900/20" 
                                                    : "border-cyan-500/50 text-cyan-300 bg-cyan-900/20"
                                                }`}
                                            >
                                                {student.monthlyAttendanceCount || 0}일
                                            </Badge>
                                            <AttendanceCalendarModal
                                                studentId={student.id}
                                                studentName={student.name}
                                                teacherId={currentUserId}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-cyan-300 px-2 hidden xl:table-cell">
                                        {student.type === 'signup_request' ?
                                            (student.requested_at ? new Date(student.requested_at).toLocaleDateString() : '-') :
                                            student.joinDate
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <StudentModal
                mode="edit"
                student={selectedStudent}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                }}
                onSave={async (formData: FormData) => { await handleSaveStudent(formData); }}
                teachers={teachers as any}
                currentUserId={currentUserId || undefined}
            />
        </DashboardPageWrapper>
    );
}