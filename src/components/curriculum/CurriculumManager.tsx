'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import AddCurriculumModal, { CurriculumFormData } from "@/app/dashboard/teacher/curriculum/components/AddCurriculumModal";
import EditCurriculumModal, { CurriculumData } from "@/app/dashboard/teacher/curriculum/components/EditCurriculumModal";
import { supabase } from "@/lib/supabase";

// 현재 사용자 ID를 가져오는 함수 (서버 액션 사용)
const getCurrentUserId = async (): Promise<string | null> => {
    try {
        const response = await fetch('/api/auth/current-user', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            return null;
        }
        
        const user = await response.json();
        return user?.id || null;
    } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
        return null;
    }
};

interface CurriculumManagerProps {
    userRole?: 'admin' | 'teacher';
}

export default function CurriculumManager({ userRole = 'teacher' }: CurriculumManagerProps) {
    const [curriculums, setCurriculums] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumData | null>(null);

    const fetchCurriculums = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // 강사는 본인 작성 커리큘럼만, 관리자는 모든 커리큘럼 조회
            let query = supabase
                .from('curriculums')
                .select(`
                    id, 
                    title, 
                    category, 
                    level, 
                    created_by, 
                    checklist, 
                    created_at, 
                    status,
                    image,
                    description,
                    users!curriculums_created_by_fkey(id, name, role)
                `);
            
            // 강사인 경우 본인이 작성한 커리큘럼만 필터링
            if (userRole === 'teacher') {
                const currentUserId = await getCurrentUserId();
                if (currentUserId) {
                    query = query.eq('created_by', currentUserId);
                }
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('커리큘럼 데이터 가져오기 실패:', error);
                setError('커리큘럼 데이터를 가져오는데 실패했습니다.');
                setCurriculums([]);
                return;
            }
            
            // 담당 강사명을 users 테이블에서 가져오기
            const mapped = (data || []).map((cur: any) => ({
                ...cur,
                teacherName: cur.users?.name || '미배정',
                students: 0, // 추후 학생 수 연동
                status: cur.status === 'completed' ? '완료' : 
                        cur.status === 'prepared' ? '준비중' : 
                        cur.status === 'preparing' ? '준비중' : 
                        cur.status || '완료',
                courses: cur.checklist || [],
                image: cur.image || null
            }));
            setCurriculums(mapped);
        } catch (err) {
            console.error('커리큘럼 데이터 가져오기 중 오류:', err);
            setError('커리큘럼 데이터를 가져오는데 실패했습니다.');
            setCurriculums([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurriculums();
    }, []);

    const handleAddCurriculum = async (data: CurriculumFormData) => {
        try {
            console.log('새 커리큘럼 추가:', data);
            
            // 현재 사용자 ID 가져오기
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) {
                alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
                return;
            }
            
            // FormData 생성하여 서버 액션 호출
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('category', data.category);
            formData.append('level', data.level);
            formData.append('status', '진행중');
            formData.append('courses', JSON.stringify(data.courses || []));
            formData.append('description', data.description || '');
            formData.append('image', data.image || '');
            
            // 서버 액션 호출
            const { addCurriculum } = await import('@/lib/actions');
            const result = await addCurriculum(formData);
            
            if (!result.success) {
                alert(result.error || '커리큘럼 추가에 실패했습니다.');
                return;
            }
            
            // 성공 시 모달 닫기 및 목록 새로고침
            setIsModalOpen(false);
            await fetchCurriculums();
            alert('커리큘럼이 성공적으로 추가되었습니다.');
        } catch (err) {
            console.error('커리큘럼 추가 중 오류:', err);
            alert('커리큘럼 추가에 실패했습니다.');
        }
    };

    const handleEditCurriculum = (curriculum: CurriculumData) => {
        setSelectedCurriculum(curriculum);
        setIsEditModalOpen(true);
    };

    const handleUpdateCurriculum = async (updatedData: CurriculumData) => {
        try {
            console.log('커리큘럼 수정:', updatedData);
            
            // FormData 생성하여 서버 액션 호출
            const formData = new FormData();
            formData.append('id', updatedData.id);
            formData.append('title', updatedData.title);
            formData.append('category', updatedData.category);
            formData.append('level', updatedData.level);
            formData.append('courses', JSON.stringify(updatedData.courses || []));
            formData.append('description', updatedData.description || '');
            formData.append('image', updatedData.image || '');
            formData.append('status', updatedData.status || '진행중');
            
            // 서버 액션 호출
            const { updateCurriculum } = await import('@/lib/actions');
            const result = await updateCurriculum(formData);
            
            if (!result.success) {
                alert(result.error || '커리큘럼 수정에 실패했습니다.');
                return;
            }
            
            // 성공 시 모달 닫기 및 목록 새로고침
            setIsEditModalOpen(false);
            await fetchCurriculums();
            alert('커리큘럼이 성공적으로 수정되었습니다.');
        } catch (err) {
            console.error('커리큘럼 수정 중 오류:', err);
            alert('커리큘럼 수정에 실패했습니다.');
        }
    };

    const pageTitle = userRole === 'admin' ? '커리큘럼 관리' : '커리큘럼 관리';

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">{pageTitle}</h1>
                </div>
                <Button 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    새 커리큘럼 추가
                </Button>
            </div>

            {/* 로딩 상태 표시 */}
            {isLoading && (
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardContent className="flex justify-center items-center py-8">
                        <div className="text-cyan-200">커리큘럼 데이터를 불러오는 중...</div>
                    </CardContent>
                </Card>
            )}

            {/* 에러 상태 표시 */}
            {error && (
                <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
                    <CardContent className="flex justify-center items-center py-8">
                        <div className="text-red-200">{error}</div>
                    </CardContent>
                </Card>
            )}

            {/* 커리큘럼 목록 */}
            {!isLoading && !error && (
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-cyan-500/20">
                                    <TableHead className="text-cyan-200 text-center">이미지</TableHead>
                                    <TableHead className="text-cyan-200 text-center">과정명</TableHead>
                                    <TableHead className="text-cyan-200 text-center">분류</TableHead>
                                    <TableHead className="text-cyan-200 text-center">레벨</TableHead>
                                    <TableHead className="text-cyan-200 text-center">담당 강사</TableHead>
                                    <TableHead className="text-cyan-200 text-center">상태</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {curriculums.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-cyan-200 py-8">
                                            {userRole === 'teacher' 
                                                ? '작성한 커리큘럼이 없습니다. 새 커리큘럼을 추가해보세요.'
                                                : '등록된 커리큘럼이 없습니다.'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    curriculums.map((curriculum: any) => (
                                        <TableRow key={curriculum.id} className="border-cyan-500/10">
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    {curriculum.image ? (
                                                        <div className="relative w-12 h-12 rounded border border-cyan-500/30 overflow-hidden">
                                                            <Image 
                                                                src={curriculum.image.startsWith('data:') ? curriculum.image : curriculum.image} 
                                                                alt={curriculum.title}
                                                                width={48}
                                                                height={48}
                                                                className="object-cover"
                                                                loading="lazy"
                                                                placeholder="blur"
                                                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                                onError={(e) => {
                                                                    // 에러 시 fallback 처리
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    // 부모 요소에 fallback UI 표시
                                                                    const parent = target.closest('.relative');
                                                                    if (parent) {
                                                                        parent.innerHTML = '<div class="w-12 h-12 bg-cyan-900/20 rounded border border-cyan-500/30 flex items-center justify-center"><span class="text-cyan-400 text-xs">No Image</span></div>';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-cyan-900/20 rounded border border-cyan-500/30 flex items-center justify-center">
                                                            <span className="text-cyan-400 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-cyan-100 text-center">
                                                <button
                                                    onClick={() => handleEditCurriculum(curriculum)}
                                                    className="hover:text-cyan-300 transition-colors cursor-pointer underline"
                                                >
                                                    {curriculum.title}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-cyan-200 text-center">
                                                {curriculum.category}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    className={
                                                        curriculum.level === '기초'
                                                            ? 'bg-green-500 text-white'
                                                            : curriculum.level === '중급'
                                                            ? 'bg-yellow-500 text-white'
                                                            : curriculum.level === '고급'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-cyan-600/20 text-cyan-200 border-cyan-400/40'
                                                    }
                                                >
                                                    {curriculum.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-cyan-200 text-center">
                                                {curriculum.teacherName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    className={
                                                        curriculum.status === '완료'
                                                            ? 'bg-green-600/20 text-green-300 border-green-500/30'
                                                            : curriculum.status === '준비중'
                                                            ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                                            : curriculum.status === '진행중'
                                                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                                                            : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                                                    }
                                                >
                                                    {curriculum.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* 새 커리큘럼 추가 모달 */}
            <AddCurriculumModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddCurriculum={handleAddCurriculum}
            />

            {/* 커리큘럼 수정 모달 */}
            <EditCurriculumModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                curriculum={selectedCurriculum}
                onUpdateCurriculum={handleUpdateCurriculum}
            />
        </div>
    );
}