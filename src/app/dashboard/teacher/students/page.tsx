"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { addStudent, updateStudent, getStudentSignupRequests, approveStudentSignupRequest, rejectStudentSignupRequest, getCurrentUser } from "@/lib/actions";
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
    progress: number;
    attendance: number;
    status: string;
    joinDate: string;
    lastLogin: string;
    studentId?: string;
    classSchedules?: ClassSchedule[];
}

interface ClassSchedule {
    day: string;
    startTime: string;
    endTime: string;
}

interface SignupRequest {
    id: number;
    username: string;
    name: string;
    birth_year?: number;
    academy: string;
    assigned_teacher_id: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    processed_at?: string;
    rejection_reason?: string;
    teacher_name?: string;
}

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchStudents();
        fetchSignupRequests();
    }, []);

    const fetchStudents = async () => {
        const currentUserId = getCurrentUserId();
        
        let query = supabase
            .from('students')
            .select(`user_id, parent_id, current_curriculum_id, enrollment_start_date, attendance_schedule, users!students_user_id_fkey ( id, name, username, phone, birth_year, academy, created_at, email, status ), parent:users!students_parent_id_fkey ( phone )`);
        
        // 강사인 경우 담당 학생만 조회
        if (currentUserId) {
            query = query.contains('assigned_teachers', [currentUserId]);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('학생 목록 조회 오류:', error);
            setStudents([]);
            return;
        }
        
        // Student 타입에 맞게 매핑
        const mapped = (data || []).map((item: any) => ({
            id: item.user_id,
            name: item.users?.name || '-',
            email: item.users?.email || '-',
            phone: item.users?.phone || '-',
            parentPhone: item.parent?.phone || '-',
            birthDate: item.users?.birth_year ? String(item.users.birth_year) : '-',
            avatar: '/default-avatar.png',
            course: '프로그래밍', // 기본값, 나중에 실제 과목 데이터로 교체
            curriculum: '기초 프로그래밍', // 기본값, 나중에 실제 커리큘럼 데이터로 교체
            progress: Math.floor(Math.random() * 100), // 기본값, 나중에 실제 진도 데이터로 교체
            attendance: Math.floor(Math.random() * 100), // 기본값, 나중에 실제 출석률 데이터로 교체
            status: item.users?.status || 'active',
            joinDate: item.users?.created_at ? new Date(item.users.created_at).toLocaleDateString() : '-',
            lastLogin: '2024-01-15', // 기본값, 나중에 실제 마지막 로그인 데이터로 교체
            studentId: item.users?.username || '-',
            classSchedules: item.attendance_schedule ? Object.entries(item.attendance_schedule).map(([day, schedule]: [string, any]) => ({
                day: day,
                startTime: schedule.startTime || '',
                endTime: schedule.endTime || ''
            })) : []
        }));
        
        setStudents(mapped);
    };

    const fetchSignupRequests = async () => {
        try {
            const currentUserId = getCurrentUserId();
            console.log('현재 사용자 ID:', currentUserId);
            
            if (!currentUserId) {
                console.log('사용자 ID를 가져올 수 없습니다.');
                return;
            }

            const result = await getStudentSignupRequests(currentUserId);
            console.log('가입 요청 조회 결과:', result);
            
            if (result.success) {
                setSignupRequests(result.data || []);
            } else {
                console.error('가입 요청 조회 실패:', result.error);
                setSignupRequests([]);
            }
        } catch (error) {
            console.error('가입 요청 조회 중 오류:', error);
            setSignupRequests([]);
        }
    };

    const handleApproveRequest = async (requestId: number) => {
        try {
            const result = await approveStudentSignupRequest(requestId);
            if (result.success) {
                toast({
                    title: "가입 승인 완료",
                    description: "학생 가입이 승인되었습니다.",
                    variant: "default",
                });
                fetchSignupRequests();
                fetchStudents();
            } else {
                toast({
                    title: "승인 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "가입 승인 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
    };

    const openRejectDialog = (requestId: number) => {
        setSelectedRequestId(requestId);
        setIsRejectDialogOpen(true);
    };

    const handleRejectRequest = async () => {
        if (!selectedRequestId) return;

        try {
            const result = await rejectStudentSignupRequest(selectedRequestId, rejectionReason);
            if (result.success) {
                toast({
                    title: "가입 거부 완료",
                    description: "학생 가입이 거부되었습니다.",
                    variant: "default",
                });
                fetchSignupRequests();
                setIsRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedRequestId(null);
            } else {
                toast({
                    title: "거부 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "가입 거부 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
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

    // 모든 학생 데이터 통합 (기존 학생 + 가입요청)
    const allStudents = [
        ...(students || []).map(student => ({
            ...student,
            type: 'existing',
            status: student.status || 'active'
        })),
        ...(signupRequests || []).map(request => ({
            id: request.id,
            name: request.name,
            email: request.username,
            phone: '',
            studentId: request.username,
            type: 'signup_request',
            status: request.status,
            requested_at: request.requested_at,
            teacher_name: request.teacher_name
        }))
    ];

    const filteredStudents = allStudents.filter(student =>
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(search.toLowerCase())
    );

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
                                <TableHead className="text-cyan-200">학생</TableHead>
                                <TableHead className="text-cyan-200">연락처</TableHead>
                                <TableHead className="text-cyan-200">과목</TableHead>
                                <TableHead className="text-cyan-200">진도</TableHead>
                                <TableHead className="text-cyan-200">출석률</TableHead>
                                <TableHead className="text-cyan-200">상태</TableHead>
                                <TableHead className="text-cyan-200">가입일</TableHead>
                                <TableHead className="text-cyan-200">액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student.id} className="border-cyan-500/10 hover:bg-cyan-900/10">
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
                                            <span className="text-cyan-400">-</span>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-cyan-900/30 rounded-full h-2">
                                                    <div 
                                                        className="bg-cyan-500 h-2 rounded-full" 
                                                        style={{ width: `${student.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-cyan-300 text-sm">{student.progress}%</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {student.type === 'signup_request' ? (
                                            <span className="text-cyan-400">-</span>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-cyan-900/30 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 h-2 rounded-full" 
                                                        style={{ width: `${student.attendance}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-cyan-300 text-sm">{student.attendance}%</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {student.type === 'signup_request' ? (
                                            <Badge variant="secondary" className="bg-yellow-600 text-white">
                                                가입요청
                                            </Badge>
                                        ) : (
                                            <Badge 
                                                variant={student.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    student.status === 'active' ? 'bg-green-600 text-white' :
                                                    student.status === '휴강' ? 'bg-yellow-600 text-white' :
                                                    'bg-red-600 text-white'
                                                }
                                            >
                                                {student.status === 'active' ? '수강' : student.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-cyan-300">
                                        {student.type === 'signup_request' ? 
                                            new Date(student.requested_at).toLocaleDateString() :
                                            student.joinDate
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {student.type === 'signup_request' ? (
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproveRequest(parseInt(student.id))}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    승인
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openRejectDialog(parseInt(student.id))}
                                                    className="border-red-500 text-red-300 hover:bg-red-900/20"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    거부
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-cyan-400">-</span>
                                        )}
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

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-cyan-900/20 border-cyan-500/30">
                    <DialogHeader>
                        <DialogTitle className="text-cyan-100">가입 요청 거부</DialogTitle>
                        <DialogDescription className="text-cyan-300">
                            가입 요청을 거부하는 사유를 입력해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="거부 사유를 입력하세요..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRejectDialogOpen(false);
                                setRejectionReason("");
                                setSelectedRequestId(null);
                            }}
                            className="border-cyan-400/40 text-cyan-300 hover:bg-cyan-900/20"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleRejectRequest}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            거부
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}