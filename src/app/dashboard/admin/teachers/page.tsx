'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import AddTeacherModal from "./components/AddTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal";

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    status: '활성' | '비활성';
    createdAt: string;
    image?: string;
}

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchTeachers();
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

    // 정렬된 강사 목록 생성
    const getSortedTeachers = (teachers: Teacher[]) => {
        if (!sortField) return teachers;
        
        return [...teachers].sort((a, b) => {
            let aValue: any = a[sortField as keyof Teacher];
            let bValue: any = b[sortField as keyof Teacher];
            
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

    const fetchTeachers = async () => {
        try {
            // users와 teachers 테이블 조인해서 강사 정보 가져오기
            const { data, error } = await supabase
                .from('users')
                .select(`
                    id, name, email, phone, username, created_at, profile_image_url,
                    teachers (
                        bio, certs, career, subject
                    )
                `)
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
                subject: teacher.teachers?.subject || '코딩 교육', // subject 컬럼에서 직접 가져오기
                status: '활성' as const,
                createdAt: teacher.created_at,
                image: teacher.profile_image_url || ''
            }));

            setTeachers(mappedTeachers);
        } catch (error) {
            console.error('강사 목록 조회 중 오류:', error);
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshTeachers = () => {
        fetchTeachers();
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingTeacher(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateTeacher = () => {
        fetchTeachers(); // 목록 새로고침
        handleCloseEditModal();
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
            <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
                <div className="text-cyan-100">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">강사 관리</h1>
                </div>
                <AddTeacherModal onAddTeacher={handleRefreshTeachers} />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200 text-center">프로필</TableHead>
                                <TableHead 
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        이름
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="text-cyan-200 cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('email')}
                                >
                                    <div className="flex items-center gap-2">
                                        이메일
                                        {getSortIcon('email')}
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
                                    className="text-cyan-200 text-center cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('subject')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        담당 과목
                                        {getSortIcon('subject')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="text-cyan-200 text-center cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        상태
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="text-cyan-200 text-center cursor-pointer hover:text-cyan-100 transition-colors select-none"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        등록일
                                        {getSortIcon('createdAt')}
                                    </div>
                                </TableHead>
                                <TableHead className="text-cyan-200 text-center">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {getSortedTeachers(teachers).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-cyan-200 py-8">
                                        등록된 강사가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getSortedTeachers(teachers).map((teacher) => (
                                    <TableRow key={teacher.id} className="border-cyan-500/10">
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/30">
                                                    {teacher.image ? (
                                                        <Image
                                                            src={teacher.image}
                                                            alt={`${teacher.name} 프로필`}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                // 이미지 로딩 실패 시 숨김 처리
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                    {!teacher.image && (
                                                        <div className="flex items-center justify-center h-full bg-cyan-900/20">
                                                            <User className="w-5 h-5 text-cyan-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
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

            {/* 강사 수정 모달 */}
            <EditTeacherModal
                teacher={editingTeacher}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdateTeacher}
            />
        </div>
    );
} 