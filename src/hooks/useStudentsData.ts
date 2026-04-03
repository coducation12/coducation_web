import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { addStudent, updateStudent, deleteStudent, getTeachersAndAcademies } from "@/lib/actions";
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
    uniqueKey?: string;
    monthlyAttendanceCount?: number;
    category?: string;
    sub_subject?: string;
    enrollment_date?: string;
    memo?: string;
    tuition_fee?: number;
    classSchedules?: ClassSchedule[];
    assignedTeacherId?: string;
    assignedTeacherName?: string;
    assignedTeachers?: Array<{ id: string, name: string }>;
    academy: string;
    is_special_education?: boolean;
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
            try {
                // 병렬 실행: 강사 정보와 학생 정보를 동시에 요청
                await Promise.all([
                    fetchTeachers(),
                    fetchStudents()
                ]);
            } catch (error) {
                console.error("Data loading error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchTeachers = async () => {
        try {
            const result = await getTeachersAndAcademies();
            if (result.success && result.teachers) {
                setTeachers(result.teachers);
                return result.teachers;
            }
            return [];
        } catch (error) {
            console.error("Failed to fetch teachers", error);
            return [];
        }
    };

    const fetchStudents = async () => {
        try {
            // API 를 통해 서버 측 쿠키 및 데이터 확인 (보안 강화)
            const response = await fetch('/api/dashboard/students');

            if (!response.ok) {
                if (response.status === 401) {
                    toast({ title: '권한 없음', description: '세션이 만료되었거나 권한이 없습니다.', variant: 'destructive' })
                }
                setStudents([]);
                return;
            }

            const jsonRes = await response.json();
            const data = jsonRes.data;
            const currentUserId = jsonRes.userId;

            setUserId(currentUserId);
            setUserRole(jsonRes.userRole);

            // 강사 정보는 이미 fetchTeachers에서 전역 상태(teachers)에 저장됨
            // 하지만 즉시 매핑을 위해 최신 값을 가져오거나 현재 상태 사용
            const currentTeachers = teachers.length > 0 ? teachers : await fetchTeachers();

            // Student 타입에 맞게 매핑
            const mapped = (data || []).map((item: any) => {
                const assignedTeacherIds = item.assigned_teachers || [];
                const assignedTeachers = assignedTeacherIds.map((teacherId: string) => {
                    const teacher = currentTeachers.find((t: any) => t.id === teacherId);
                    return teacher || { id: teacherId, name: `강사 ${teacherId.slice(-4)}` };
                });

                const assignedTeacherId = assignedTeacherIds.length > 0 ? assignedTeacherIds[0] : null;
                const assignedTeacherName = assignedTeachers.length > 0 ? assignedTeachers[0].name : '미지정';

                return {
                    id: item.user_id,
                    uniqueKey: item.user_id,
                    name: item.users?.name || '-',
                    email: item.users?.email || '-',
                    phone: item.users?.phone || '-',
                    parentPhone: item.parent?.phone || '-',
                    birthDate: item.users?.birth_year ? String(item.users.birth_year) : '-',
                    avatar: '/default-avatar.png',
                    course: (() => {
                        const progress = item.learning_progress || [];
                        const ongoing = progress.filter((p: any) => p.status !== 'completed');
                        if (ongoing.length > 0) return ongoing[ongoing.length - 1].title;
                        return item.main_subject || '미지정';
                    })(),
                    category: (() => {
                        const progress = item.learning_progress || [];
                        const ongoing = progress.filter((p: any) => p.status !== 'completed');
                        if (ongoing.length > 0) return ongoing[ongoing.length - 1].category || '';
                        return '';
                    })(),
                    sub_subject: (() => {
                        const progress = item.learning_progress || [];
                        const ongoing = progress.filter((p: any) => p.status !== 'completed');
                        if (ongoing.length > 0) return ongoing[ongoing.length - 1].title;
                        return item.sub_subject || '';
                    })(),
                    status: (item.users?.status === 'suspended' || item.users?.status === '휴강') ? '휴강' :
                            (item.users?.status === 'inactive' || item.users?.status === '종료') ? '종료' : 
                            (item.users?.status === 'consulting' || item.users?.status === '상담') ? '상담' :
                            (item.users?.status === 'pending') ? '승인대기' : '수강',
                    joinDate: item.users?.created_at ? new Date(item.users.created_at).toLocaleDateString() : '-',
                    lastLogin: '2024-01-15',
                    studentId: item.users?.username || '-',
                    enrollment_date: item.enrollment_start_date || '',
                    memo: item.memo || '',
                    tuition_fee: item.tuition_fee || 0,
                    assignedTeacherId: assignedTeacherId,
                    assignedTeacherName: assignedTeacherName,
                    assignedTeachers: assignedTeachers,
                    classSchedules: item.attendance_schedule ? Object.entries(item.attendance_schedule)
                        .filter(([day, schedule]: [string, any]) => {
                            if (jsonRes.userRole?.toLowerCase() === 'teacher' && currentUserId) {
                                const teacherId = schedule.teacherId || schedule.teacher_id;
                                return teacherId?.trim().toLowerCase() === currentUserId.trim().toLowerCase();
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
                    monthlyAttendanceCount: item.monthlyAttendanceCount || 0,
                    is_special_education: item.is_special_education || false
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
            formData.append('is_special_education', studentData.is_special_education ? 'true' : 'false');

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
            formData.append('is_special_education', studentData.is_special_education ? 'true' : 'false');

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
