'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import AddTeacherModal from "./components/AddTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal";
import { deleteTeacher, updateTeacherLabelColor, toggleTeacherTuitionPermission } from "@/lib/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";

export const dynamic = 'force-dynamic';

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    position: string;
    status: '활성' | '비활성';
    createdAt: string;
    image?: string;
    labelColor?: string;
    canManageAllPayments: boolean;
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
            return <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />;
        }
        return sortDirection === 'asc' ?
            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" /> :
            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />;
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
                    can_manage_all_payments,
                    teachers (
                        bio, certs, career, subject, position, label_color
                    )
                `)
                .eq('role', 'teacher');

            if (error) {
                console.error('Error fetching teachers:', error);
                setTeachers([]);
                return;
            }

            const mappedTeachers = (data || []).map((teacher: any) => {
                const t = Array.isArray(teacher.teachers) ? teacher.teachers[0] : teacher.teachers;

                return {
                    id: teacher.id,
                    name: teacher.name || '이름 없음',
                    email: teacher.email || '',
                    phone: teacher.phone || '',
                    subject: t?.subject || '코딩 교육',
                    position: t?.position || '강사',
                    status: '활성' as const,
                    createdAt: teacher.created_at,
                    image: teacher.profile_image_url || '',
                    labelColor: t?.label_color || '#00fff7',
                    canManageAllPayments: teacher.can_manage_all_payments || false
                };
            });

            setTeachers(mappedTeachers);
        } catch (error) {
            console.error('Exception fetching teachers:', error);
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
            const result = await deleteTeacher(teacherId);
            if (result.success) {
                setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
                alert(result.message);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('강사 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleColorChange = async (teacherId: string, color: string) => {
        try {
            const result = await updateTeacherLabelColor(teacherId, color);
            if (result.success) {
                setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, labelColor: color } : t));
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('색상 업데이트 중 오류가 발생했습니다.');
        }
    };
    const handleTuitionPermissionToggle = async (teacherId: string, checked: boolean) => {
        try {
            const result = await toggleTeacherTuitionPermission(teacherId, checked);
            if (result.success) {
                setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, canManageAllPayments: checked } : t));
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('권한 변경 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <DashboardPageWrapper>
                <div className="text-cyan-100 text-center py-20">강사 정보를 불러오는 중...</div>
            </DashboardPageWrapper>
        );
    }

    return (
        <DashboardPageWrapper>
            <div className="flex items-center justify-between mb-6 pr-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">강사 관리</h1>
                </div>
                <AddTeacherModal onAddTeacher={handleRefreshTeachers} />
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="text-[12px] sm:text-sm">
                            <TableHeader>
                                <TableRow className="border-cyan-500/20 hover:bg-transparent">
                                    <TableHead className="text-cyan-200 text-center w-[60px] sm:w-[80px] whitespace-nowrap">프로필</TableHead>
                                    <TableHead className="text-cyan-200 w-[100px] whitespace-nowrap">
                                        <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('name')}>
                                            이름 <span className="hidden sm:inline-block">{getSortIcon('name')}</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-cyan-200 text-center w-[60px] sm:w-[80px] whitespace-nowrap">라벨</TableHead>
                                    <TableHead className="text-cyan-200 whitespace-nowrap">
                                        <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('email')}>
                                            이메일 <span className="hidden sm:inline-block">{getSortIcon('email')}</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-cyan-200 whitespace-nowrap">
                                        <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('phone')}>
                                            연락처 <span className="hidden sm:inline-block">{getSortIcon('phone')}</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-cyan-200 text-center whitespace-nowrap">
                                        <div className="flex items-center gap-1 justify-center cursor-pointer select-none" onClick={() => handleSort('position')}>
                                            직위 <span className="hidden sm:inline-block">{getSortIcon('position')}</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-cyan-200 text-center whitespace-nowrap">담당 과목</TableHead>
                                    <TableHead className="text-cyan-200 text-center whitespace-nowrap">수납 관리자</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getSortedTeachers(teachers).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-cyan-200 py-12">
                                            등록된 강사가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    getSortedTeachers(teachers).map((teacher) => (
                                        <TableRow
                                            key={teacher.id}
                                            className="border-cyan-500/10 cursor-pointer hover:bg-cyan-500/5 transition-colors group whitespace-nowrap"
                                            onClick={() => handleEditTeacher(teacher)}
                                        >
                                            <TableCell className="py-2 sm:py-4">
                                                <div className="flex justify-center">
                                                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-cyan-400/30">
                                                        {teacher.image ? (
                                                            <Image
                                                                src={teacher.image}
                                                                alt={teacher.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full bg-cyan-900/20">
                                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-cyan-100">
                                                {teacher.name}
                                            </TableCell>
                                            <TableCell className="py-2 sm:py-4">
                                                <div className="flex justify-center items-center">
                                                    <input
                                                        type="color"
                                                        value={teacher.labelColor || '#00fff7'}
                                                        onChange={(e) => handleColorChange(teacher.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-none cursor-pointer bg-transparent overflow-hidden"
                                                        style={{ padding: 0 }}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-cyan-200/80 max-w-[150px] truncate sm:max-w-none">
                                                {teacher.email}
                                            </TableCell>
                                            <TableCell className="text-cyan-200/80">
                                                {teacher.phone}
                                            </TableCell>
                                            <TableCell className="text-center text-cyan-200/80">
                                                {teacher.position}
                                            </TableCell>
                                            <TableCell className="text-center text-cyan-200/80">
                                                {teacher.subject}
                                            </TableCell>
                                            <TableCell className="py-2 sm:py-4">
                                                <div className="flex justify-center items-center">
                                                    <Checkbox
                                                        checked={teacher.canManageAllPayments}
                                                        onCheckedChange={(checked) => handleTuitionPermissionToggle(teacher.id, !!checked)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-4 w-4 sm:h-5 sm:w-5 border-cyan-500/50 data-[state=checked]:bg-cyan-600 data-[state=checked]:text-white"
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <EditTeacherModal
                teacher={editingTeacher}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdateTeacher}
            />
        </DashboardPageWrapper>
    );
}