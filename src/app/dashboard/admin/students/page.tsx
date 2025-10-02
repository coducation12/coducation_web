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
    assignedTeacherId?: string;
    assignedTeacherName?: string;
}

interface ClassSchedule {
    day: string;
    startTime: string;
    endTime: string;
}


export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [teachers, setTeachers] = useState<{id: string, name: string}[]>([]);
    const [sortField, setSortField] = useState<string | null>(null);
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

    // 담당강사별 색상 매핑 함수
    const getTeacherColor = (teacherName: string) => {
        if (teacherName === '미지정') return 'text-gray-400';
        
        const colors = [
            'text-blue-300',    // 파란색
            'text-green-300',   // 초록색
            'text-yellow-300',  // 노란색
            'text-purple-300',  // 보라색
            'text-pink-300',    // 분홍색
            'text-orange-300',  // 주황색
            'text-cyan-300',    // 청록색
            'text-red-300',     // 빨간색
        ];
        
        // 강사 이름의 해시값을 사용해서 일관된 색상 할당
        let hash = 0;
        for (let i = 0; i < teacherName.length; i++) {
            hash = ((hash << 5) - hash + teacherName.charCodeAt(i)) & 0xffffffff;
        }
        return colors[Math.abs(hash) % colors.length];
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchTeachers();
            await fetchStudents();
        };
        loadData();
    }, []);

    const fetchTeachers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name')
                .eq('role', 'teacher')
                .eq('status', 'active');

            if (error) {
                console.error('강사 목록 조회 오류:', error);
                return;
            }

            setTeachers(data || []);
            console.log('로드된 강사 목록:', data);
        } catch (error) {
            console.error('강사 목록 조회 중 오류:', error);
        }
    };

    const fetchStudents = async () => {
        // 먼저 강사 목록을 다시 조회
        const { data: teachersData, error: teachersError } = await supabase
            .from('users')
            .select('id, name')
            .eq('role', 'teacher')
            .eq('status', 'active');

        if (teachersError) {
            console.error('강사 목록 조회 오류:', teachersError);
        }

        const currentTeachers = teachersData || [];
        console.log('fetchStudents에서 조회한 강사 목록:', currentTeachers);

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
                    status,
                    assigned_teacher_id
                ), 
                parent:users!students_parent_id_fkey ( phone )
            `)
            // 모든 상태의 학생 포함 (active, pending)
        
        if (error) {
            console.error('학생 목록 조회 오류:', error);
            setStudents([]);
            return;
        }
        
        // Student 타입에 맞게 매핑
        const mapped = (data || []).map((item: any) => {
            // 담당강사 정보 찾기 (students 테이블의 assigned_teachers 배열에서 첫 번째 강사)
            const assignedTeacherId = item.assigned_teachers && item.assigned_teachers.length > 0 ? item.assigned_teachers[0] : null;
            
            // currentTeachers 배열에서 찾기 시도
            let assignedTeacher = currentTeachers.find(teacher => teacher.id === assignedTeacherId);
            
            // currentTeachers 배열에서 찾지 못한 경우, 임시로 assignedTeacherId를 사용해서 이름 생성
            if (!assignedTeacher && assignedTeacherId) {
                assignedTeacher = { id: assignedTeacherId, name: `강사 ${assignedTeacherId.slice(-4)}` };
            }
            
            console.log('학생:', item.users?.name, 'assigned_teachers:', item.assigned_teachers, 'assignedTeacherId:', assignedTeacherId, 'assignedTeacher:', assignedTeacher);
            
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
                assignedTeacherId: assignedTeacherId,
                assignedTeacherName: assignedTeacher?.name || '미지정',
                classSchedules: item.attendance_schedule ? Object.entries(item.attendance_schedule).map(([day, schedule]: [string, any]) => ({
                    day: day,
                    startTime: schedule.startTime || '',
                    endTime: schedule.endTime || ''
                })) : []
            };
        });
        
        setStudents(mapped);
    };



    // 쿠키에서 사용자 ID 가져오기
    const getCurrentUserId = (): string | null => {
        if (typeof document === 'undefined') return null;
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find(cookie => cookie.trim().startsWith('user_id='));
        return userCookie ? userCookie.split('=')[1] : null;
    };

    const handleAddStudent = async (studentData: StudentFormData) => {
        try {
            // FormData로 변환하여 서버 액션 호출
            const formData = new FormData();
            formData.append('studentId', studentData.studentId);
            formData.append('password', studentData.password);
            formData.append('name', studentData.name);
            formData.append('birthYear', studentData.birthYear);
            formData.append('subject', studentData.subject);
            formData.append('phone', studentData.phone);
            formData.append('parentPhone', studentData.parentPhone);
            formData.append('email', studentData.email);
            formData.append('classSchedules', JSON.stringify(studentData.classSchedules));

            const result = await addStudent(formData);

            if (result.success) {
                toast({
                    title: "학생 등록 완료",
                    description: `${studentData.name} 학생이 성공적으로 등록되었습니다.`,
                    variant: "default",
                });
                
                // 학생 목록 새로고침
                fetchStudents();
            } else {
                toast({
                    title: "학생 등록 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "학생 등록 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
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

    const confirmDeleteStudent = async () => {
        if (!studentToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteStudent(studentToDelete.id);
            if (result.success) {
                toast({
                    title: "성공",
                    description: result.message || "학생이 성공적으로 삭제되었습니다.",
                });
                fetchStudents(); // 목록 새로고침
            } else {
                toast({
                    title: "오류",
                    description: result.error || "학생 삭제에 실패했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("학생 삭제 중 오류:", error);
            toast({
                title: "오류",
                description: "학생 삭제 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setStudentToDelete(null);
        }
    };

    const handleTeacherChange = async (studentId: string, teacherId: string) => {
        try {
            // students 테이블의 assigned_teachers 배열 업데이트
            const assignedTeachers = teacherId === 'none' ? [] : [teacherId];
            const { error } = await supabase
                .from('students')
                .update({ assigned_teachers: assignedTeachers })
                .eq('user_id', studentId);

            if (error) {
                console.error('담당강사 변경 오류:', error);
                toast({
                    title: "오류",
                    description: "담당강사 변경에 실패했습니다.",
                    variant: "destructive",
                });
                return;
            }

            // 로컬 상태 업데이트
            setStudents(prev => prev.map(student => 
                student.id === studentId 
                    ? { 
                        ...student, 
                        assignedTeacherId: teacherId === 'none' ? undefined : teacherId,
                        assignedTeacherName: teacherId === 'none' ? '미지정' : teachers.find(t => t.id === teacherId)?.name || '미지정'
                    }
                    : student
            ));

            toast({
                title: "성공",
                description: "담당강사가 변경되었습니다.",
            });
        } catch (error) {
            console.error('담당강사 변경 중 오류:', error);
            toast({
                title: "오류",
                description: "담당강사 변경 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
    };

    const handleSaveStudent = async (studentData: any) => {
        try {
            const formData = new FormData();
            formData.append('studentId', studentData.studentId);
            formData.append('name', studentData.name);
            formData.append('birthYear', studentData.birthYear);
            formData.append('password', studentData.password);
            formData.append('subject', studentData.subject);
            formData.append('phone', studentData.phone);
            formData.append('parentPhone', studentData.parentPhone);
            formData.append('email', studentData.email);
            formData.append('status', studentData.status);
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

    // 학생 목록 필터링
    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    // 정렬 적용
    const sortedStudents = getSortedStudents(filteredStudents);

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생 관리</h1>
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
                                    onClick={() => handleSort('assignedTeacherName')}
                                >
                                    <div className="flex items-center gap-2">
                                        담당강사
                                        {getSortIcon('assignedTeacherName')}
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
                                <TableHead className="text-cyan-200 text-center">
                                    액션
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStudents.map((student) => (
                                <TableRow 
                                    key={student.id} 
                                    className="border-cyan-500/10 hover:bg-cyan-900/10 cursor-pointer"
                                    onClick={() => handleEditStudent(student)}
                                >
                                    <TableCell className="font-medium text-cyan-100">
                                        <button className="text-cyan-100 hover:text-cyan-300 transition-colors cursor-pointer">
                                            {student.name}
                                        </button>
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
                                        <div className="flex items-center space-x-2">
                                            <Select 
                                                value={student.assignedTeacherId || 'none'} 
                                                onValueChange={(value) => handleTeacherChange(student.id, value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <SelectTrigger className="w-32 h-8 text-xs bg-cyan-900/30 border-cyan-500/30 text-cyan-200">
                                                    <SelectValue placeholder="강사 선택">
                                                        <span className={`${getTeacherColor(student.assignedTeacherName)} font-medium`}>
                                                            {student.assignedTeacherName}
                                                        </span>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        <span className="text-gray-400">미지정</span>
                                                    </SelectItem>
                                                    {teachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>
                                                            <span className={`${getTeacherColor(teacher.name)} font-medium`}>{teacher.name}</span>
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
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.joinDate}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStudent(student);
                                            }}
                                            className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
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
                            onClick={confirmDeleteStudent}
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

        </div>
    );
} 