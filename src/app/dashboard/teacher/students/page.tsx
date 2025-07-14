"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone } from "lucide-react";
import AddStudentModal, { StudentFormData } from "./components/AddStudentModal";

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
    time: string;
}

const initialStudents: Student[] = [
    {
        id: 'student-1',
        studentId: 'STU001',
        name: '김민준',
        email: 'minjun@example.com',
        phone: '010-1234-5678',
        parentPhone: '010-1111-2222',
        birthDate: '2010-03-15',
        avatar: '/avatars/student1.jpg',
        course: 'React',
        curriculum: '기초 과정',
        progress: 25,
        attendance: 12,
        status: '활성',
        joinDate: '2024-01-15',
        lastLogin: '2024-03-20',
        classSchedules: [
            { day: 'monday', time: '14:30-16:00' },
            { day: 'wednesday', time: '14:30-16:00' }
        ]
    },
    {
        id: 'student-2',
        studentId: 'STU002',
        name: '이서아',
        email: 'seoa@example.com',
        phone: '010-2345-6789',
        parentPhone: '010-2222-3333',
        birthDate: '2009-07-22',
        avatar: '/avatars/student2.jpg',
        course: 'Python',
        curriculum: '중급 과정',
        progress: 75,
        attendance: 18,
        status: '활성',
        joinDate: '2024-02-01',
        lastLogin: '2024-03-21',
        classSchedules: [
            { day: 'tuesday', time: '16:00-17:30' },
            { day: 'thursday', time: '16:00-17:30' }
        ]
    },
    {
        id: 'student-3',
        studentId: 'STU003',
        name: '박도윤',
        email: 'doyoon@example.com',
        phone: '010-3456-7890',
        parentPhone: '010-3333-4444',
        birthDate: '2011-11-08',
        avatar: '/avatars/student3.jpg',
        course: 'React',
        curriculum: '기초 과정',
        progress: 50,
        attendance: 15,
        status: '활성',
        joinDate: '2024-01-20',
        lastLogin: '2024-03-19',
        classSchedules: [
            { day: 'monday', time: '19:00-20:30' },
            { day: 'friday', time: '19:00-20:30' }
        ]
    },
    {
        id: 'student-4',
        studentId: 'STU004',
        name: '최지우',
        email: 'jiwoo@example.com',
        phone: '010-4567-8901',
        parentPhone: '010-4444-5555',
        birthDate: '2010-05-12',
        avatar: '/avatars/student4.jpg',
        course: '알고리즘',
        curriculum: '기초 과정',
        progress: 10,
        attendance: 8,
        status: '휴면',
        joinDate: '2024-02-10',
        lastLogin: '2024-03-10',
        classSchedules: [
            { day: 'saturday', time: '10:30-12:00' }
        ]
    },
    {
        id: 'student-5',
        studentId: 'STU005',
        name: '정현우',
        email: 'hyunwoo@example.com',
        phone: '010-5678-9012',
        parentPhone: '010-5555-6666',
        birthDate: '2008-12-03',
        avatar: '/avatars/student5.jpg',
        course: '웹 개발',
        curriculum: '심화 과정',
        progress: 90,
        attendance: 22,
        status: '활성',
        joinDate: '2023-12-01',
        lastLogin: '2024-03-21',
        classSchedules: [
            { day: 'monday', time: '17:30-19:00' },
            { day: 'wednesday', time: '17:30-19:00' },
            { day: 'friday', time: '17:30-19:00' }
        ]
    }
];

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>(initialStudents);

    const handleAddStudent = (studentData: StudentFormData) => {
        const newStudent: Student = {
            id: `student-${Date.now()}`,
            studentId: studentData.studentId,
            name: studentData.name,
            email: studentData.email || '-',
            phone: studentData.phone,
            parentPhone: studentData.parentPhone || '-',
            birthDate: studentData.birthDate,
            avatar: '/avatars/default.jpg',
            course: studentData.subject,
            curriculum: '신규 과정',
            progress: 0,
            attendance: 0,
            status: '활성',
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: '-',
            classSchedules: studentData.classSchedules
        };

        setStudents(prev => [newStudent, ...prev]);
    };

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생관리</h1>
                </div>
                <AddStudentModal onAddStudent={handleAddStudent} />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <CardTitle className="text-cyan-100">학생 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200 min-w-[90px] w-[133px] text-center">학생</TableHead>
                                <TableHead className="text-cyan-200 w-[80px] text-center hidden lg:table-cell">연락처</TableHead>
                                <TableHead className="text-cyan-200 min-w-[120px] w-[160px] text-center">과목</TableHead>
                                <TableHead className="text-cyan-200 w-[297px] text-center hidden lg:table-cell">수업 과정</TableHead>
                                <TableHead className="text-cyan-200 min-w-[80px] w-[80px] text-center">진행률</TableHead>
                                <TableHead className="text-cyan-200 min-w-[90px] w-[80px] text-center">출석 일수</TableHead>
                                <TableHead className="text-cyan-200 min-w-[120px] w-[120px] text-center">최근 로그인</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id} className="border-cyan-500/10">
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-cyan-100">{student.name}</div>
                                            <div className="text-xs text-cyan-300 hidden sm:block">{student.joinDate}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-cyan-200">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {student.email}
                                            </div>
                                            <div className="flex items-center text-sm text-cyan-200">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {student.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-center">
                                        {student.course}
                                    </TableCell>
                                    <TableCell className="text-cyan-200 hidden lg:table-cell">
                                        {student.curriculum}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            className={student.progress > 70 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : student.progress > 40
                                                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                                : 'bg-red-600/20 text-red-300 border-red-500/30'
                                            }
                                        >
                                            {student.progress}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            className={student.attendance > 20 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : student.attendance > 10
                                                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                                : 'bg-red-600/20 text-red-300 border-red-500/30'
                                            }
                                        >
                                            {student.attendance}일
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-sm text-center">
                                        {student.lastLogin}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 