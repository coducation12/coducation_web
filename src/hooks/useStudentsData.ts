import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { addStudent, updateStudent, deleteStudent } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export interface Student {
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
    sub_subject?: string;
    enrollment_date?: string;
    memo?: string;
    tuition_fee?: number;
    classSchedules?: ClassSchedule[];
    assignedTeacherId?: string;
    assignedTeacherName?: string;
    assignedTeachers?: Array<{ id: string, name: string }>;
    academy: string;
    type?: string;
    requested_at?: string;
    uniqueKey?: string;
    monthlyAttendanceCount?: number;
}

export interface ClassSchedule {
    day: string;
    startTime: string;
    endTime: string;
}

export function useStudentsData() {
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<{ id: string, name: string, label_color?: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchTeachers();
            await fetchStudents();
            setIsLoading(false);
        };
        loadData();
    }, []);

    const fetchTeachers = async () => {
        try {
            const { getTeachersAndAcademies } = await import("@/lib/actions");
            const result = await getTeachersAndAcademies();
            if (result.success && result.teachers) {
                setTeachers(result.teachers);
            }
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        }
    };

    const fetchStudents = async () => {
        setIsLoading(true);

        try {
            // 서버 액션을 통해 강사 목록 조회
            let currentTeachers: any[] = [];
            try {
                const { getTeachersAndAcademies } = await import("@/lib/actions");
                const result = await getTeachersAndAcademies();
                if (result.success && result.teachers) {
                    currentTeachers = result.teachers;
                    setTeachers(currentTeachers);
                }
            } catch (error) {
                console.error("Failed to fetch teachers", error);
            }

            // API 를 통해 서버 측 쿠키 및 데이터 확인 (보안 강화)
            const response = await fetch('/api/dashboard/students');

            if (!response.ok) {
                if (response.status === 401) {
                    toast({ title: '권한 없음', description: '세션이 만료되었거나 권한이 없습니다.', variant: 'destructive' })
                }
                setStudents([]);
                setIsLoading(false);
                return;
            }

            const jsonRes = await response.json();
            const data = jsonRes.data;
            const currentUserId = jsonRes.userId;

            setUserId(currentUserId);
            setUserRole(jsonRes.userRole);

            // Student 타입에 맞게 매핑
            const mapped = (data || []).map((item: any) => {
                // 담당강사 정보 찾기 (students 테이블의 assigned_teachers 배열에서 최대 2명)
                const assignedTeacherIds = item.assigned_teachers || [];
                const assignedTeachers = assignedTeacherIds.map((teacherId: string) => {
                    const teacher = currentTeachers.find((t: any) => t.id === teacherId);
                    return teacher || { id: teacherId, name: `강사 ${teacherId.slice(-4)}` };
                });

                // 기존 호환성을 위한 첫 번째 강사 정보
                const assignedTeacherId = assignedTeacherIds.length > 0 ? assignedTeacherIds[0] : null;
                const assignedTeacherName = assignedTeachers.length > 0 ? assignedTeachers[0].name : '미지정';


                return {
                    id: item.user_id,
                    uniqueKey: item.user_id, // Add unique key
                    name: item.users?.name || '-',
                    email: item.users?.email || '-',
                    phone: item.users?.phone || '-',
                    parentPhone: item.parent?.phone || '-',
                    birthDate: item.users?.birth_year ? String(item.users.birth_year) : '-',
                    avatar: '/default-avatar.png',
                    course: item.main_subject || '프로그래밍',
                    curriculum: '기초 프로그래밍', // 기본값, 나중에 실제 커리큘럼 데이터로 교체
                    status: (item.users?.status === 'suspended' || item.users?.status === '휴강') ? '휴강' :
                            (item.users?.status === 'inactive' || item.users?.status === '종료') ? '종료' : 
                            (item.users?.status === 'consulting' || item.users?.status === '상담') ? '상담' :
                            (item.users?.status === 'pending') ? '승인대기' : '수강',
                    joinDate: item.users?.created_at ? new Date(item.users.created_at).toLocaleDateString() : '-',
                    lastLogin: '2024-01-15', // 기본값
                    studentId: item.users?.username || '-',
                    sub_subject: item.sub_subject || '',
                    enrollment_date: item.enrollment_start_date || '',
                    memo: item.memo || '',
                    tuition_fee: item.tuition_fee || 0,
                    assignedTeacherId: assignedTeacherId,
                    assignedTeacherName: assignedTeacherName,
                    assignedTeachers: assignedTeachers,
                    classSchedules: item.attendance_schedule ? Object.entries(item.attendance_schedule)
                        .filter(([day, schedule]: [string, any]) => {
                            // 강사인 경우 본인의 스케줄만 필터링 (대소문자 무관)
                            if (jsonRes.userRole?.toLowerCase() === 'teacher' && currentUserId) {
                                const teacherId = schedule.teacherId || schedule.teacher_id;
                                if (!teacherId) return false;
                                return teacherId.trim().toLowerCase() === currentUserId.trim().toLowerCase();
                            }
                            return true;
                        })
                        .map(([day, schedule]: [string, any]) => {
                            const dayMap: { [key: string]: string } = {
                                '0': 'sunday', '1': 'monday', '2': 'tuesday', '3': 'wednesday', '4': 'thursday', '5': 'friday', '6': 'saturday'
                            };
                            return {
                                day: dayMap[day] || day,
                                startTime: schedule.startTime || '',
                                endTime: schedule.endTime || '',
                                teacherId: schedule.teacherId || ''
                            };
                        }) : [],
                    academy: item.users?.academy || '코딩메이커',
                    monthlyAttendanceCount: item.monthlyAttendanceCount || 0
                };
            });

            setStudents(mapped);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast({
                title: "오류",
                description: "학생 데이터를 불러오는 데 실패했습니다.",
                variant: "destructive"
            });
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStudent = async (studentData: any) => {
        try {
            const formData = new FormData();
            formData.append('studentId', studentData.studentId);
            formData.append('password', studentData.password);
            formData.append('name', studentData.name);
            formData.append('birthYear', studentData.birthYear);
            formData.append('subject', studentData.subject);
            formData.append('sub_subject', studentData.sub_subject || '');
            formData.append('phone', studentData.phone);
            formData.append('parentPhone', studentData.parentPhone);
            formData.append('email', studentData.email);
            formData.append('enrollment_date', studentData.enrollment_date || '');
            formData.append('memo', studentData.memo || '');
            formData.append('status', studentData.status || '수강');
            formData.append('classSchedules', JSON.stringify(studentData.classSchedules));
            formData.append('academy', studentData.academy || '코딩메이커');
            // 쉼표 제거 후 숫자만 전송
            const tuitionFee = studentData.tuition_fee?.toString().replace(/,/g, '') || '0';
            formData.append('tuition_fee', tuitionFee);

            const result = await addStudent(formData);

            if (result.success) {
                toast({
                    title: "학생 등록 완료",
                    description: `${studentData.name} 학생이 성공적으로 등록되었습니다.`,
                });
                await fetchStudents();
                return true;
            } else {
                toast({
                    title: "학생 등록 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "학생 등록 중 오류가 발생했습니다.",
                variant: "destructive",
            });
            return false;
        }
    };

    const handleSaveStudent = async (studentData: any, onSuccess?: () => void) => {
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
            formData.append('sub_subject', studentData.sub_subject || '');
            formData.append('enrollment_date', studentData.enrollment_date || '');
            formData.append('memo', studentData.memo || '');
            formData.append('academy', studentData.academy || '코딩메이커');
            formData.append('classSchedules', JSON.stringify(studentData.classSchedules));
            // 쉼표 제거 후 숫자만 전송
            const tuitionFee = studentData.tuition_fee?.toString().replace(/,/g, '') || '0';
            formData.append('tuition_fee', tuitionFee);

            const result = await updateStudent(formData);

            if (result.success) {
                toast({
                    title: "학생 정보 수정 완료",
                    description: `${studentData.name} 학생의 정보가 성공적으로 수정되었습니다.`,
                    variant: "default",
                });

                // 학생 목록 새로고침
                await fetchStudents();
                if (onSuccess) onSuccess();
                return true;
            } else {
                toast({
                    title: "학생 정보 수정 실패",
                    description: result.error || "알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error) {
            toast({
                title: "오류 발생",
                description: "학생 정보 수정 중 오류가 발생했습니다.",
                variant: "destructive",
            });
            return false;
        }
    };

    const handleTeacherChange = async (studentId: string, teacherId: string, teacherIndex: number) => {
        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            // 현재 담당강사 목록 복사
            const currentTeachers = student.assignedTeachers || [];
            let newTeachers = [...currentTeachers];

            if (teacherId === 'none') {
                // 해당 인덱스의 강사 제거
                newTeachers.splice(teacherIndex, 1);
            } else {
                // 해당 인덱스에 강사 설정 (최대 2명)
                const teacher = teachers.find(t => t.id === teacherId);
                if (teacher) {
                    if (teacherIndex >= newTeachers.length) {
                        // 새로 추가
                        if (newTeachers.length < 2) {
                            newTeachers.push({ id: teacherId, name: teacher.name });
                        }
                    } else {
                        // 기존 강사 교체
                        newTeachers[teacherIndex] = { id: teacherId, name: teacher.name };
                    }
                }
            }

            // students 테이블의 assigned_teachers 배열 업데이트
            const assignedTeacherIds = newTeachers.map(t => t.id);
            const { error } = await supabase
                .from('students')
                .update({ assigned_teachers: assignedTeacherIds })
                .eq('user_id', studentId);

            if (error) {
                toast({
                    title: "오류",
                    description: "담당강사 변경에 실패했습니다.",
                    variant: "destructive",
                });
                return false;
            }

            // 로컬 상태 업데이트
            setStudents(prev => prev.map(student =>
                student.id === studentId
                    ? {
                        ...student,
                        assignedTeachers: newTeachers,
                        assignedTeacherId: newTeachers.length > 0 ? newTeachers[0].id : undefined,
                        assignedTeacherName: newTeachers.length > 0 ? newTeachers[0].name : '미지정'
                    }
                    : student
            ));

            toast({
                title: "성공",
                description: "담당강사가 변경되었습니다.",
            });
            return true;
        } catch (error) {
            toast({
                title: "오류",
                description: "담당강사 변경 중 오류가 발생했습니다.",
                variant: "destructive",
            });
            return false;
        }
    };

    const confirmDeleteStudent = async (studentToDeleteId: string) => {
        try {
            const result = await deleteStudent(studentToDeleteId);
            if (result.success) {
                toast({
                    title: "성공",
                    description: result.message || "학생이 성공적으로 삭제되었습니다.",
                });
                await fetchStudents(); // 목록 새로고침
                return true;
            } else {
                toast({
                    title: "오류",
                    description: result.error || "학생 삭제에 실패했습니다.",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error) {
            toast({
                title: "오류",
                description: "학생 삭제 중 오류가 발생했습니다.",
                variant: "destructive",
            });
            return false;
        }
    };


    return {
        students,
        teachers,
        isLoading,
        userId,
        userRole,
        fetchStudents,
        fetchTeachers,
        handleAddStudent,
        handleSaveStudent,
        handleTeacherChange,
        confirmDeleteStudent
    };
}
