'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    status: '활성' | '비활성';
    createdAt: string;
}

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, role, created_at')
                .eq('role', 'teacher');

            if (error) {
                console.error('강사 목록 조회 실패:', error);
                setTeachers([]);
                return;
            }

            const mappedTeachers = (data || []).map((teacher: any) => ({
                id: teacher.id,
                name: teacher.name || '이름 없음',
                email: teacher.email || '',
                phone: teacher.phone || '',
                subject: '컴퓨터 교육', // 기본값
                status: '활성' as const,
                createdAt: teacher.created_at
            }));

            setTeachers(mappedTeachers);
        } catch (error) {
            console.error('강사 목록 조회 중 오류:', error);
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = () => {
        // TODO: 강사 추가 모달 구현
        console.log('강사 추가');
    };

    const handleEditTeacher = (teacher: Teacher) => {
        // TODO: 강사 수정 모달 구현
        console.log('강사 수정:', teacher);
    };

    const handleDeleteTeacher = async (teacherId: string) => {
        if (!confirm('정말로 이 강사를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', teacherId);

            if (error) {
                console.error('강사 삭제 실패:', error);
                alert('강사 삭제에 실패했습니다.');
                return;
            }

            setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
            alert('강사가 삭제되었습니다.');
        } catch (error) {
            console.error('강사 삭제 중 오류:', error);
            alert('강사 삭제 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6 pt-16 lg:pt-2">
                <div className="text-cyan-100">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">강사 관리</h1>
                </div>
                <Button 
                    onClick={handleAddTeacher}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    강사 추가
                </Button>
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200">이름</TableHead>
                                <TableHead className="text-cyan-200">이메일</TableHead>
                                <TableHead className="text-cyan-200">연락처</TableHead>
                                <TableHead className="text-cyan-200 text-center">담당 과목</TableHead>
                                <TableHead className="text-cyan-200 text-center">상태</TableHead>
                                <TableHead className="text-cyan-200 text-center">등록일</TableHead>
                                <TableHead className="text-cyan-200 text-center">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-cyan-200 py-8">
                                        등록된 강사가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teachers.map((teacher) => (
                                    <TableRow key={teacher.id} className="border-cyan-500/10">
                                        <TableCell className="text-cyan-100 font-medium">
                                            {teacher.name}
                                        </TableCell>
                                        <TableCell className="text-cyan-200">
                                            {teacher.email}
                                        </TableCell>
                                        <TableCell className="text-cyan-200">
                                            {teacher.phone}
                                        </TableCell>
                                        <TableCell className="text-cyan-200 text-center">
                                            {teacher.subject}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={teacher.status === '활성'
                                                    ? 'bg-green-600/20 text-green-300 border-green-500/30'
                                                    : 'bg-red-600/20 text-red-300 border-red-500/30'}
                                            >
                                                {teacher.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-cyan-200 text-center">
                                            {new Date(teacher.createdAt).toLocaleDateString('ko-KR')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTeacher(teacher)}
                                                    className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/20"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 