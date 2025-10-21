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
import { addStudent, updateStudent } from "@/lib/actions";
import AddStudentModal, { StudentFormData } from "@/components/common/AddStudentModal";
import EditStudentModal from "@/components/common/EditStudentModal";
import { useToast } from "@/hooks/use-toast";

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    parentPhone: string;
    birthDate: string;
    avatar: string;
    course: string;
    curriculum: string;
    status: string;
    joinDate: string;
    lastLogin: string;
    studentId?: string;
    classSchedules?: ClassSchedule[];
    assignedTeachers?: Array<{id: string, name: string}>;
    type?: string;
    uniqueKey?: string;
    requested_at?: string;
    progress?: any;
    attendance?: any;
}

interface ClassSchedule {
    day: string;
    startTime: string;
    endTime: string;
}


export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const { toast } = useToast();

    useEffect(() => {
        fetchStudents();
    }, []);

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
        if (!sortField) return students;
        
        return [...students].sort((a, b) => {
            let aValue: any = a[sortField as keyof Student];
            let bValue: any = b[sortField as keyof Student];
            
            
            // 문자열 필드 처리
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const fetchStudents = async () => {
        // 현재 사용자 정보 가져오기 (API 엔드포인트 사용)
        try {
            const response = await fetch('/api/auth/current-user');
            const userData = await response.json();
            
            if (!userData || userData.role !== 'teacher') {
                setStudents([]);
                return;
            }
            
            const currentUserId = userData.id;
            
            // 모든 학생 데이터 조회
        const { data, error } = await supabase
            .from('students')
            .select(`
                user_id, 
                parent_id, 
                current_curriculum_id, 
                enrollment_start_date, 
                attendance_schedule,
                assigned_teachers,
                users!students_user_id_fkey ( 
                    id, 
                    name, 
                    username, 
                    phone, 
                    birth_year, 
                    academy, 
                    created_at, 
                    email, 
                    status 
                ), 
                parent:users!students_parent_id_fkey ( phone )
            `);
        
        if (error) {
            setStudents([]);
            return;
        }
        
        // Student 타입에 맞게 매핑
        let mapped = (data || []).map((item: any) => {
            // 담당강사 정보 찾기 (students 테이블의 assigned_teachers 배열에서 최대 2명)
            const assignedTeacherIds = item.assigned_teachers || [];
            const assignedTeachers = assignedTeacherIds.map((teacherId: string) => {
                // 강사 이름을 찾기 위해 임시로 생성 (실제로는 teachers 배열에서 찾아야 함)
                return { id: teacherId, name: `강사 ${teacherId.slice(-4)}` };
            });
            
            return {
                id: item.user_id,
                name: item.users?.name || '-',
                email: item.users?.email || '-',
                phone: item.users?.phone || '-',
                parentPhone: item.parent?.phone || '-',
                birthDate: item.users?.birth_year ? String(item.users.birth_year) : '-',
                avatar: '/default-avatar.png',
                course: '프로그래밍', // 기본값, 나중에 실제 과목 데이터로 교체
                curriculum: '기초 프로그래밍', // 기본값, 나중에 실제 커리큘럼 데이터로 교체
                status: item.users?.status === 'pending' ? '승인대기' : 
                        item.users?.status === 'suspended' ? '휴강' : '수강',
                joinDate: item.users?.created_at ? new Date(item.users.created_at).toLocaleDateString() : '-',
                lastLogin: '2024-01-15', // 기본값, 나중에 실제 마지막 로그인 데이터로 교체
                studentId: item.users?.username || '-',
                assignedTeachers: assignedTeachers,
                classSchedules: item.attendance_schedule ? Object.entries(item.attendance_schedule).map(([day, schedule]: [string, any]) => {
                    // 숫자를 요일로 변환 (0=일요일, 1=월요일, ..., 6=토요일)
                    const dayMap: { [key: string]: string } = {
                        '0': 'sunday',
                        '1': 'monday', 
                        '2': 'tuesday',
                        '3': 'wednesday',
                        '4': 'thursday',
                        '5': 'friday',
                        '6': 'saturday'
                    };
                    return {
                        day: dayMap[day] || day,
                        startTime: schedule.startTime || '',
                        endTime: schedule.endTime || ''
                    };
                }) : []
            };
        });
        
        // 강사인 경우 담당 학생만 필터링
        const assignedStudents = mapped.filter((student: any) => {
            const studentData = data?.find((item: any) => item.user_id === student.id);
            const assignedTeachers = studentData?.assigned_teachers || [];
            
            // UUID 비교를 위해 문자열로 변환하여 비교
            const isAssigned = assignedTeachers.some((teacherId: string) => 
                teacherId.toString() === currentUserId.toString()
            );
            
            
            return isAssigned;
        });
        
        
        setStudents(assignedStudents);
        } catch (error) {
            setStudents([]);
        }
    };




    const handleAddStudent = async (studentData: StudentFormData) => {
        try {
            // FormData로 변환하여 서버 액션 호출
            const formData = new FormData();
            formData.append('studentId', studentData.studentId);
            formData.append('name', studentData.name);
            formData.append('birthYear', studentData.birthYear);
            formData.append('password', studentData.password);
            formData.append('subject', studentData.subject);
            formData.append('phone', studentData.phone);
            formData.append('parentPhone', studentData.parentPhone);
            formData.append('email', studentData.email);
            formData.append('classSchedules', JSON.stringify(studentData.classSchedules));

            const result = await addStudent(formData);

            if (result.success) {
                toast({
                    title: "학생 추가 완료",
                    description: `${studentData.name} 학생이 성공적으로 추가되었습니다.`,
                    variant: "default",
                });
                
                // 학생 목록 새로고침
                fetchStudents();
            } else {
                toast({
                    title: "학생 추가 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "학생 추가 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
    };

    const handleEditStudent = (student: Student) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    const handleSaveStudent = async (studentData: StudentFormData) => {
        try {
            // FormData로 변환하여 서버 액션 호출
            const formData = new FormData();
            formData.append('studentId', studentData.studentId);
            formData.append('name', studentData.name);
            formData.append('birthYear', studentData.birthYear);
            formData.append('password', studentData.password);
            formData.append('subject', studentData.subject);
            formData.append('phone', studentData.phone);
            formData.append('parentPhone', studentData.parentPhone);
            formData.append('email', studentData.email);
            formData.append('status', studentData.status || 'active');
            formData.append('classSchedules', JSON.stringify(studentData.classSchedules));

            const result = await updateStudent(formData);

            if (result.success) {
                toast({
                    title: "학생 정보 수정 완료",
                    description: `${studentData.name} 학생의 정보가 성공적으로 수정되었습니다.`,
                    variant: "default",
                });
                
                // 학생 목록 새로고침
                fetchStudents();
            } else {
                toast({
                    title: "학생 정보 수정 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "학생 정보 수정 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
    };

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

    return (
        <div className="p-6 pt-20 lg:pt-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100">학생 관리</h1>
                    <p className="text-cyan-300 mt-2">담당 학생들의 정보를 관리하세요</p>
                </div>
                <AddStudentModal onAddStudent={handleAddStudent} />
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
                            {sortedStudents.map((student) => (
                                <TableRow key={student.uniqueKey} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                    <TableCell className="font-medium text-cyan-100">
                                        {student.type === 'signup_request' ? (
                                            <span className="text-cyan-100">{student.name}</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleEditStudent(student)}
                                                className="text-cyan-100 hover:text-cyan-300 transition-colors cursor-pointer"
                                            >
                                                {student.name}
                                            </button>
                                        )}
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

            <EditStudentModal
                student={selectedStudent}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                }}
                onSave={handleSaveStudent}
            />

        </div>
    );
}