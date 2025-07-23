"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddTeacherModal, { TeacherFormData } from "./components/AddTeacherModal";

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    experience: number;
    status: string;
    joinDate: string;
    lastLogin: string;
    teacherId?: string;
    students?: string[];
}

const initialTeachers: Teacher[] = [
    {
        id: 'teacher-1',
        teacherId: 'TCH001',
        name: '김강사',
        email: 'kim.teacher@example.com',
        phone: '010-1234-5678',
        subject: 'React',
        experience: 5,
        status: '활성',
        joinDate: '2023-01-15',
        lastLogin: '2024-03-20',
        students: ['김민준', '박도윤']
    },
    {
        id: 'teacher-2',
        teacherId: 'TCH002',
        name: '이강사',
        email: 'lee.teacher@example.com',
        phone: '010-2345-6789',
        subject: 'Python',
        experience: 3,
        status: '활성',
        joinDate: '2023-03-01',
        lastLogin: '2024-03-21',
        students: ['이서아', '정현우']
    },
    {
        id: 'teacher-3',
        teacherId: 'TCH003',
        name: '박강사',
        email: 'park.teacher@example.com',
        phone: '010-3456-7890',
        subject: '알고리즘',
        experience: 7,
        status: '활성',
        joinDate: '2022-11-10',
        lastLogin: '2024-03-19',
        students: ['최지우']
    },
    {
        id: 'teacher-4',
        teacherId: 'TCH004',
        name: '정강사',
        email: 'jung.teacher@example.com',
        phone: '010-4567-8901',
        subject: '웹 개발',
        experience: 4,
        status: '휴면',
        joinDate: '2023-06-20',
        lastLogin: '2024-02-15',
        students: ['정현우']
    },
    {
        id: 'teacher-5',
        teacherId: 'TCH005',
        name: '최강사',
        email: 'choi.teacher@example.com',
        phone: '010-5678-9012',
        subject: 'JavaScript',
        experience: 2,
        status: '활성',
        joinDate: '2024-01-05',
        lastLogin: '2024-03-21',
        students: []
    }
];

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [search, setSearch] = useState("");

    const handleAddTeacher = (teacherData: TeacherFormData) => {
        const newTeacher: Teacher = {
            id: `teacher-${Date.now()}`,
            teacherId: teacherData.teacherId,
            name: teacherData.name,
            email: teacherData.email || '-',
            phone: teacherData.phone,
            subject: teacherData.subject,
            experience: teacherData.experience,
            status: '활성',
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: '-',
            students: []
        };

        setTeachers(prev => [newTeacher, ...prev]);
    };

    // 검색 필터링
    const filteredTeachers = teachers.filter(teacher => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return (
            teacher.name.toLowerCase().includes(keyword) ||
            teacher.phone.toLowerCase().includes(keyword) ||
            teacher.email.toLowerCase().includes(keyword) ||
            teacher.subject.toLowerCase().includes(keyword)
        );
    });

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">강사관리</h1>
                </div>
                <AddTeacherModal onAddTeacher={handleAddTeacher} />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center justify-between gap-2 w-full">
                        <CardTitle className="text-cyan-100">강사 목록</CardTitle>
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="이름, 연락처, 과목 등 검색"
                            className="max-w-xs bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200 min-w-[90px] w-[133px] text-center">강사</TableHead>
                                <TableHead className="text-cyan-200 w-[80px] text-center hidden lg:table-cell">연락처</TableHead>
                                <TableHead className="text-cyan-200 min-w-[120px] w-[160px] text-center">담당과목</TableHead>
                                <TableHead className="text-cyan-200 w-[297px] text-center hidden lg:table-cell">경력</TableHead>
                                <TableHead className="text-cyan-200 min-w-[80px] w-[80px] text-center">담당학생</TableHead>
                                <TableHead className="text-cyan-200 min-w-[90px] w-[80px] text-center">상태</TableHead>
                                <TableHead className="text-cyan-200 min-w-[120px] w-[120px] text-center">최근 로그인</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeachers.map((teacher) => (
                                <TableRow key={teacher.id} className="border-cyan-500/10">
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-cyan-100">{teacher.name}</div>
                                            <div className="text-xs text-cyan-300 hidden sm:block">{teacher.joinDate}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-cyan-200">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {teacher.email}
                                            </div>
                                            <div className="flex items-center text-sm text-cyan-200">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {teacher.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-center">
                                        {teacher.subject}
                                    </TableCell>
                                    <TableCell className="text-cyan-200 hidden lg:table-cell text-center">
                                        {teacher.experience}년
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            className={teacher.students && teacher.students.length > 5
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : teacher.students && teacher.students.length > 0
                                                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                                : 'bg-red-600/20 text-red-300 border-red-500/30'
                                            }
                                        >
                                            {teacher.students ? teacher.students.length : 0}명
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            className={teacher.status === '활성' 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                            }
                                        >
                                            {teacher.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-sm text-center">
                                        {teacher.lastLogin}
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