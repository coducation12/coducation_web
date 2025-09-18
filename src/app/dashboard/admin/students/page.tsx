"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    processed_by?: string;
    rejection_reason?: string;
    teacher_name?: string;
}

export default function AdminStudentsPage() {
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
        const { data, error } = await supabase
            .from('students')
            .select(`user_id, parent_id, current_curriculum_id, enrollment_start_date, attendance_schedule, users!students_user_id_fkey ( id, name, username, phone, birth_year, academy, created_at, email, status ), parent:users!students_parent_id_fkey ( phone )`);
        
        if (error) {
            console.error('학생 목록 조회 오류:', error);
            setStudents([]);
            return;
        }
        

        
        // Student 타입에 맞게 매핑
        const mapped = (data || []).map((item: any) => ({
            id: item.user_id,
            name: item.users?.name || '-',
            email: item.users?.email || '-', // 실제 이메일만 사용
            phone: item.users?.phone || '-',
            parentPhone: item.parent?.phone || '-', // 학부모 전화번호
            birthDate: item.users?.birth_year ? String(item.users.birth_year) : '-',
            avatar: '/avatars/default.jpg',
            course: '-', // DB에 별도 컬럼 필요시 수정
            curriculum: '-', // DB에 별도 컬럼 필요시 수정
            progress: 0, // 추후 진도 연동
            attendance: 0, // 추후 출석 연동
            status: item.status || '수강', // DB의 status 컬럼 사용, 기본값은 '수강'
            joinDate: item.users?.created_at?.split('T')[0] || '-',
            lastLogin: '-',
            studentId: item.users?.username || item.user_id, // username 사용
            classSchedules: item.attendance_schedule ? convertAttendanceScheduleToClassSchedules(item.attendance_schedule) : []
        }));
        

        setStudents(mapped);
    };

    const fetchSignupRequests = async () => {
        const result = await getStudentSignupRequests(); // 관리자는 모든 요청 조회
        if (result.success) {
            setSignupRequests(result.data || []);
        } else {
            console.error('가입 요청 조회 오류:', result.error);
            toast({
                title: "오류 발생",
                description: "가입 요청을 불러오는 중 오류가 발생했습니다.",
                variant: "destructive",
            });
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
                fetchStudents(); // 학생 목록도 새로고침
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

    const openRejectDialog = (requestId: number) => {
        setSelectedRequestId(requestId);
        setIsRejectDialogOpen(true);
    };

    // attendance_schedule을 classSchedules 형식으로 변환
    const convertAttendanceScheduleToClassSchedules = (attendanceSchedule: any): ClassSchedule[] => {
        if (!attendanceSchedule || typeof attendanceSchedule !== 'object') return [];
        
        const dayMap: { [key: string]: string } = {
            '1': 'monday', '2': 'tuesday', '3': 'wednesday', '4': 'thursday', '5': 'friday', '6': 'saturday', '0': 'sunday'
        };
        
        return Object.entries(attendanceSchedule).map(([day, timeData]) => {
            // timeData가 객체인 경우 (startTime, endTime 포함)
            if (typeof timeData === 'object' && timeData !== null && (timeData as any).startTime !== undefined) {
                const timeObj = timeData as any;
                return {
                    day: dayMap[day] || day,
                    startTime: timeObj.startTime || '',
                    endTime: timeObj.endTime || ''
                };
            }
            // timeData가 문자열인 경우 (기존 형식 - 호환성 유지)
            return {
                day: dayMap[day] || day,
                startTime: timeData as string,
                endTime: ''
            };
        });
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

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    const pendingRequests = signupRequests.filter(req => req.status === 'pending');
    const processedRequests = signupRequests.filter(req => req.status !== 'pending');

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생 관리</h1>
                </div>
                <AddStudentModal onAddStudent={handleAddStudent} />
            </div>

            <Tabs defaultValue="students" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-cyan-900/20">
                    <TabsTrigger value="students" className="text-cyan-200 data-[state=active]:bg-cyan-500">
                        학생 목록
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-cyan-200 data-[state=active]:bg-cyan-500">
                        가입 요청 ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="processed" className="text-cyan-200 data-[state=active]:bg-cyan-500">
                        처리 완료 ({processedRequests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="students">
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                            <TableCell className="font-medium text-cyan-100">
                                                <button 
                                                    onClick={() => handleEditStudent(student)}
                                                    className="text-cyan-100 hover:text-cyan-300 transition-colors cursor-pointer"
                                                >
                                                    {student.name}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-cyan-300">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{student.phone}</span>
                                                </div>
                                                {student.parentPhone !== '-' && (
                                                    <div className="text-sm text-cyan-400 mt-1">
                                                        학부모: {student.parentPhone}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-cyan-300">{student.course}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-16 bg-cyan-900/30 rounded-full h-2">
                                                        <div 
                                                            className="bg-cyan-500 h-2 rounded-full" 
                                                            style={{ width: `${student.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-cyan-300 text-sm">{student.progress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-16 bg-cyan-900/30 rounded-full h-2">
                                                        <div 
                                                            className="bg-green-500 h-2 rounded-full" 
                                                            style={{ width: `${student.attendance}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-cyan-300 text-sm">{student.attendance}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={student.status === '수강' ? 'default' : 'secondary'}
                                                    className={
                                                        student.status === '수강' ? 'bg-green-600 text-white' :
                                                        student.status === '종료' ? 'bg-blue-600 text-white' :
                                                        student.status === '휴강' ? 'bg-yellow-600 text-white' :
                                                        'bg-gray-600 text-white'
                                                    }
                                                >
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-cyan-300">{student.joinDate}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending">
                    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                        <CardHeader>
                            <CardTitle className="text-cyan-100">가입 요청 대기</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-8 text-cyan-300">
                                    대기 중인 가입 요청이 없습니다.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-cyan-500/20">
                                            <TableHead className="text-cyan-200">이름</TableHead>
                                            <TableHead className="text-cyan-200">아이디</TableHead>
                                            <TableHead className="text-cyan-200">출생년도</TableHead>
                                            <TableHead className="text-cyan-200">학원</TableHead>
                                            <TableHead className="text-cyan-200">담당 교사</TableHead>
                                            <TableHead className="text-cyan-200">요청일</TableHead>
                                            <TableHead className="text-cyan-200">처리</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingRequests.map((request) => (
                                            <TableRow key={request.id} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                                <TableCell className="font-medium text-cyan-100">
                                                    {request.name}
                                                </TableCell>
                                                <TableCell className="text-cyan-300">{request.username}</TableCell>
                                                <TableCell className="text-cyan-300">
                                                    {request.birth_year || '-'}
                                                </TableCell>
                                                <TableCell className="text-cyan-300">
                                                    {request.academy === 'coding-maker' ? '코딩메이커' : '광양코딩'}
                                                </TableCell>
                                                <TableCell className="text-cyan-300">
                                                    {request.teacher_name || '-'}
                                                </TableCell>
                                                <TableCell className="text-cyan-300">
                                                    {new Date(request.requested_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApproveRequest(request.id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            승인
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => openRejectDialog(request.id)}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            거부
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processed">
                    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                        <CardHeader>
                            <CardTitle className="text-cyan-100">처리 완료된 요청</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {processedRequests.length === 0 ? (
                                <div className="text-center py-8 text-cyan-300">
                                    처리된 요청이 없습니다.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-cyan-500/20">
                                            <TableHead className="text-cyan-200">이름</TableHead>
                                            <TableHead className="text-cyan-200">아이디</TableHead>
                                            <TableHead className="text-cyan-200">상태</TableHead>
                                            <TableHead className="text-cyan-200">처리일</TableHead>
                                            <TableHead className="text-cyan-200">거부 사유</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {processedRequests.map((request) => (
                                            <TableRow key={request.id} className="border-cyan-500/10 hover:bg-cyan-900/10">
                                                <TableCell className="font-medium text-cyan-100">
                                                    {request.name}
                                                </TableCell>
                                                <TableCell className="text-cyan-300">{request.username}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        className={
                                                            request.status === 'approved' 
                                                                ? 'bg-green-600 text-white' 
                                                                : 'bg-red-600 text-white'
                                                        }
                                                    >
                                                        {request.status === 'approved' ? '승인됨' : '거부됨'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-cyan-300">
                                                    {request.processed_at ? new Date(request.processed_at).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell className="text-cyan-300">
                                                    {request.rejection_reason || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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