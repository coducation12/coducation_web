"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, CheckCircle, XCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { addStudent, updateStudent, getCurrentUser, deleteStudent } from "@/lib/actions";
import StudentModal from "@/components/common/StudentModal";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { getTeacherColorSet } from "@/lib/colors";
import { useStudentsData, Student, ClassSchedule } from "@/hooks/useStudentsData";
import { AttendanceCalendarModal } from "@/app/dashboard/teacher/components/AttendanceCalendarModal";

export const dynamic = 'force-dynamic';


export default function AdminStudentsPage() {
    const {
        students,
        teachers,
        handleAddStudent,
        handleSaveStudent,
        handleTeacherChange,
        confirmDeleteStudent,
        fetchStudents
    } = useStudentsData();

    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
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
        const icon = sortField !== field ? 
            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" /> : 
            sortDirection === 'asc' ?
            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" /> : 
            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />;
            
        return <span className="hidden sm:inline-block ml-1">{icon}</span>;
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

    // 학생 삭제 함수
    const handleDeleteStudent = (student: Student) => {
        setStudentToDelete(student);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        setIsDeleting(true);
        const success = await confirmDeleteStudent(studentToDelete.id);
        if (success) {
            setIsDeleteDialogOpen(false);
            setStudentToDelete(null);
        }
        setIsDeleting(false);
    };


    // 학생 목록 필터링 (상태 필터 + 검색어)
    const filteredStudents = students.filter((student: Student) => {
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pr-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생 관리</h1>
                </div>
                <div className="flex justify-end">
                    <StudentModal
                        mode="add"
                        onSave={async (formData) => { await handleAddStudent(formData); }}
                        teachers={teachers as any}
                        academies={Array.from(new Set(students.map((s: Student) => s.academy).filter(Boolean).concat(["코딩메이커", "광양코딩"])))}
                    />
                </div>
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <CardTitle className="text-lg text-cyan-100">학생 목록</CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className={`w-full sm:w-[130px] bg-background/40 border-cyan-400/40 h-9 text-sm ${
                                    statusFilter === '수강' ? 'text-green-400' :
                                    statusFilter === '상담' ? 'text-yellow-400' :
                                    statusFilter === '휴강' ? 'text-orange-400' :
                                    statusFilter === '종료' ? 'text-red-400' :
                                    'text-cyan-100'
                                }`}>
                                    <SelectValue placeholder="상태 필터" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    <SelectItem value="전체" className="text-cyan-100">전체</SelectItem>
                                    <SelectItem value="수강" className="text-green-400">수강</SelectItem>
                                    <SelectItem value="상담" className="text-yellow-400 font-medium">상담</SelectItem>
                                    <SelectItem value="휴강" className="text-orange-400">휴강</SelectItem>
                                    <SelectItem value="종료" className="text-red-400">종료</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                                <Input
                                    placeholder="학생 검색..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 h-9 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="text-[12px] sm:text-sm">
                            <TableHeader>
                                <TableRow className="border-cyan-500/20">
                                    <TableHead className="text-cyan-200 text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 text-center whitespace-nowrap">No</TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            학생
                                            {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                        onClick={() => handleSort('academy')}
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            소속 학원
                                            {getSortIcon('academy')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                        onClick={() => handleSort('phone')}
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            연락처
                                            {getSortIcon('phone')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                        onClick={() => handleSort('course')}
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            과목
                                            {getSortIcon('course')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                        onClick={() => handleSort('assignedTeacherName')}
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            담당강사1
                                            {getSortIcon('assignedTeacherName')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            담당강사2
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none px-1 sm:px-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            상태
                                            {getSortIcon('status')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-cyan-200 text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 whitespace-nowrap">
                                        가입일
                                    </TableHead>
                                    <TableHead className="text-cyan-200 text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 text-center whitespace-nowrap">
                                        스케줄
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedStudents.map((student, index) => (
                                    <TableRow
                                        key={student.id}
                                        className="border-cyan-500/10 hover:bg-cyan-900/10 cursor-pointer whitespace-nowrap"
                                        onClick={() => handleEditStudent(student)}
                                    >
                                        <TableCell className="text-cyan-300 font-medium py-2 sm:py-4">
                                            {(student.status === '수강' || student.status === '승인대기')
                                                ? ++activeNoCounter
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell className="font-medium text-cyan-100 py-2 sm:py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-cyan-100 hover:text-cyan-300 transition-colors cursor-pointer">
                                                    {student.name}
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-cyan-300 py-2 sm:py-4">
                                            {student.academy || '-'}
                                        </TableCell>
                                        <TableCell className="text-cyan-300 py-2 sm:py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                                                    <span className="text-cyan-100 font-medium">{student.phone}</span>
                                                </div>
                                                <div className="text-[10px] sm:text-[11px] text-cyan-500/80">
                                                    학부모: {student.parentPhone || "-"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-cyan-300 py-2 sm:py-4">
                                            {student.course}
                                        </TableCell>
                                        <TableCell className="text-cyan-300 py-2 sm:py-4">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Select
                                                    value={student.assignedTeachers?.[0]?.id || 'none'}
                                                    onValueChange={(value) => handleTeacherChange(student.id, value, 0)}
                                                >
                                                    <SelectTrigger className="w-24 sm:w-28 h-8 text-[10px] sm:text-xs bg-cyan-900/30 border-cyan-500/30 text-cyan-200">
                                                        <SelectValue placeholder="강사1">
                                                            {student.assignedTeachers?.[0] ? (
                                                                <span
                                                                    className="font-medium"
                                                                    style={{ color: getTeacherColorSet(teachers.find(t => t.id === student.assignedTeachers?.[0]?.id)?.label_color || student.assignedTeachers?.[0]?.id).style.color }}
                                                                >
                                                                    {student.assignedTeachers?.[0]?.name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">강사1</span>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            <span className="text-gray-400">미지정</span>
                                                        </SelectItem>
                                                        {teachers.map((teacher) => (
                                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                                <span
                                                                    className="font-medium"
                                                                    style={{ color: getTeacherColorSet(teacher.label_color || teacher.id).style.color }}
                                                                >
                                                                    {teacher.name}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-cyan-300 py-2 sm:py-4">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Select
                                                    value={student.assignedTeachers?.[1]?.id || 'none'}
                                                    onValueChange={(value) => handleTeacherChange(student.id, value, 1)}
                                                >
                                                    <SelectTrigger className="w-24 sm:w-28 h-8 text-[10px] sm:text-xs bg-cyan-900/30 border-cyan-500/30 text-cyan-200">
                                                        <SelectValue placeholder="강사2">
                                                            {student.assignedTeachers?.[1] ? (
                                                                <span
                                                                    className="font-medium"
                                                                    style={{ color: getTeacherColorSet(teachers.find(t => t.id === student.assignedTeachers?.[1]?.id)?.label_color || student.assignedTeachers?.[1]?.id).style.color }}
                                                                >
                                                                    {student.assignedTeachers?.[1]?.name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">강사2</span>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            <span className="text-gray-400">미지정</span>
                                                        </SelectItem>
                                                        {teachers.map((teacher) => (
                                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                                <span
                                                                    className="font-medium"
                                                                    style={{ color: getTeacherColorSet(teacher.label_color || teacher.id).style.color }}
                                                                >
                                                                    {teacher.name}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 sm:py-4">
                                            <Badge
                                                variant="outline"
                                                    className={`
                                                        text-[10px] py-0 px-1
                                                        ${(student.status === '승인대기' || student.status === '상담')
                                                            ? "border-yellow-500/50 text-yellow-400"
                                                            : student.status === '휴강'
                                                                ? "border-orange-500/50 text-orange-400"
                                                                : "border-green-500/50 text-green-400"}
                                                    `}
                                            >
                                                {student.status === '승인대기' ? (
                                                    <>
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        승인대기
                                                    </>
                                                ) : student.status === '상담' ? (
                                                    <>
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        상담
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        {student.status}
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-cyan-300 py-2 sm:py-4">
                                            {student.joinDate}
                                        </TableCell>
                                        <TableCell className="py-2 sm:py-4 text-center">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <AttendanceCalendarModal
                                                    studentId={student.id}
                                                    studentName={student.name || ''}
                                                    customTrigger={
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300">
                                                            <Calendar className="w-4 h-4" />
                                                        </Button>
                                                    }
                                                />
                                            </div>
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
                onSave={async (formData) => { await handleSaveStudent(formData); }}
                teachers={teachers as any} // Temporary cast if type doesn't perfectly match StudentModal's expectation
                academies={Array.from(new Set(students.map((s: Student) => s.academy).filter(Boolean).concat(["코딩메이커", "광양코딩"])))}
            />

            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-gray-900 border-cyan-500/30">
                    <DialogHeader>
                        <DialogTitle className="text-red-400 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            학생 삭제 확인
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                            정말로 <span className="font-semibold text-red-400">{studentToDelete?.name}</span> 학생의 계정을 삭제하시겠습니까?
                            <br />
                            <span className="text-yellow-400 text-sm mt-2 block">
                                ⚠️ 이 작업은 되돌릴 수 없으며, 학생과 학부모 계정, 모든 관련 데이터가 영구적으로 삭제됩니다.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            disabled={isDeleting}
                        >
                            취소
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleConfirmDelete()}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    삭제 중...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    삭제
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardPageWrapper>
    );
}
