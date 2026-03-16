"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, CheckCircle, XCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { addStudent, updateStudent, getCurrentUser, deleteStudent } from "@/lib/actions";
import StudentModal from "@/components/common/StudentModal";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { getTeacherColorSet } from "@/lib/colors";
import { useStudentsData, Student, ClassSchedule } from "@/hooks/useStudentsData";

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생 관리</h1>
                </div>
                <StudentModal
                    mode="add"
                    onSave={async (formData) => { await handleAddStudent(formData); }}
                    teachers={teachers as any}
                    academies={Array.from(new Set(students.map((s: Student) => s.academy).filter(Boolean).concat(["코딩메이커", "광양코딩"])))}
                />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-cyan-100">학생 목록</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className={`w-[120px] bg-background/40 border-cyan-400/40 ${
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
                            <Input
                                placeholder="학생 검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200">No</TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        학생
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('academy')}
                                >
                                    <div className="flex items-center gap-2">
                                        소속 학원
                                        {getSortIcon('academy')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('phone')}
                                >
                                    <div className="flex items-center gap-2">
                                        연락처
                                        {getSortIcon('phone')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('course')}
                                >
                                    <div className="flex items-center gap-2">
                                        과목
                                        {getSortIcon('course')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('assignedTeacherName')}
                                >
                                    <div className="flex items-center gap-2">
                                        담당강사1
                                        {getSortIcon('assignedTeacherName')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-2">
                                        담당강사2
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        상태
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                <TableHead className="text-cyan-200">
                                    가입일
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStudents.map((student, index) => (
                                <TableRow
                                    key={student.id}
                                    className="border-cyan-500/10 hover:bg-cyan-900/10 cursor-pointer"
                                    onClick={() => handleEditStudent(student)}
                                >
                                    <TableCell className="text-cyan-300 font-medium">
                                        {(student.status === '수강' || student.status === '승인대기')
                                            ? ++activeNoCounter
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium text-cyan-100">
                                        <button className="text-cyan-100 hover:text-cyan-300 transition-colors cursor-pointer">
                                            {student.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.academy || '-'}
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{student.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.course}
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={student.assignedTeachers?.[0]?.id || 'none'}
                                                onValueChange={(value) => handleTeacherChange(student.id, value, 0)}
                                            >
                                                <SelectTrigger className="w-28 h-8 text-xs bg-cyan-900/30 border-cyan-500/30 text-cyan-200">
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
                                    <TableCell className="text-cyan-300">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={student.assignedTeachers?.[1]?.id || 'none'}
                                                onValueChange={(value) => handleTeacherChange(student.id, value, 1)}
                                            >
                                                <SelectTrigger className="w-28 h-8 text-xs bg-cyan-900/30 border-cyan-500/30 text-cyan-200">
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
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                                className={
                                                    (student.status === '승인대기' || student.status === '상담')
                                                        ? "border-yellow-500/50 text-yellow-400"
                                                        : student.status === '휴강'
                                                            ? "border-orange-500/50 text-orange-400"
                                                            : "border-green-500/50 text-green-400"
                                                }
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
                                    <TableCell className="text-cyan-300">
                                        {student.joinDate}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
