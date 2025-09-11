"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone } from "lucide-react";
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

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const currentUserId = getCurrentUserId();
        
        let query = supabase
            .from('students')
            .select(`user_id, parent_id, current_curriculum_id, enrollment_start_date, attendance_schedule, status, users!students_user_id_fkey ( id, name, username, phone, birth_year, academy, created_at, email ), parent:users!students_parent_id_fkey ( phone )`);
        
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

    return (
        <div className="p-6 space-y-6">
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