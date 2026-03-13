"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
            return 1; // 휴강, 종료 등
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

    // 학생 목록 필터링
    const filteredStudents = allStudents.filter(student =>
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    // 정렬 적용
    const sortedStudents = getSortedStudents(filteredStudents);
    let activeNoCounter = 0;

    return (
        <DashboardPageWrapper>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생 관리</h1>
                    <p className="text-cyan-300 mt-2">담당 학생들의 정보를 관리하세요</p>
                </div>
                <StudentModal
                    mode="add"
                    onSave={async (formData) => { await handleAddStudent(formData); }}
                    teachers={teachers as any}
                    currentUserId={currentUserId || undefined}
                />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-cyan-100">학생 목록</CardTitle>
                        <div className="flex items-center space-x-2">
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
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        상태
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('monthlyAttendanceCount')}
                                >
                                    <div className="flex items-center gap-2 text-center justify-center">
                                        출석 캘린더
                                        {getSortIcon('monthlyAttendanceCount')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
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
                                    <TableCell className="text-cyan-300 font-medium">
                                        {(student.status === '수강' || student.status === '승인대기')
                                            ? ++activeNoCounter
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium text-cyan-100">
                                        {student.type === 'signup_request' ? (
                                            <span className="text-cyan-100">{student.name}</span>
                                        ) : (
                                            <span className="text-cyan-100 hover:text-cyan-300 transition-colors">
                                                {student.name}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.academy || '-'}
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.type === 'signup_request' ? (
                                            <span className="text-cyan-400">가입요청 중</span>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{student.phone}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.type === 'signup_request' ? '-' : student.course}
                                    </TableCell>
                                    <TableCell>
                                        {student.type === 'signup_request' ? (
                                            <Badge
                                                variant="outline"
                                                className="border-yellow-500/50 text-yellow-400"
                                            >
                                                <Clock className="w-3 h-3 mr-1" />
                                                승인대기
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className={
                                                    student.status === '승인대기'
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
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        {student.status}
                                                    </>
                                                )}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`font-bold px-3 py-1 ${
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
                                    <TableCell className="text-cyan-300">
                                        {student.type === 'signup_request' ?
                                            (student.requested_at ? new Date(student.requested_at).toLocaleDateString() : '-') :
                                            student.joinDate
                                        }
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
                onSave={async (formData: FormData) => { await handleSaveStudent(formData); }}
                teachers={teachers as any}
                currentUserId={currentUserId || undefined}
            />
        </DashboardPageWrapper>
    );
}