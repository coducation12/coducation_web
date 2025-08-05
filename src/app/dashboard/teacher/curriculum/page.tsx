'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import AddCurriculumModal, { CurriculumFormData } from "./components/AddCurriculumModal";
import EditCurriculumModal, { CurriculumData } from "./components/EditCurriculumModal";
import { supabase } from "@/lib/supabase";

// 현재 사용자 ID를 가져오는 함수
const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // 쿠키에서 user_id 가져오기
    const cookies = document.cookie.split(';');
    const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('user_id='));
    
    if (userIdCookie) {
        return userIdCookie.split('=')[1];
    }
    
    return null;
};

export default function TeacherCurriculumPage() {
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
            
            const { data, error } = await supabase
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
            const currentUserId = getCurrentUserId();
            if (!currentUserId) {
                alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
                return;
            }
            
            // Supabase에 새 커리큘럼 추가
            const { error } = await supabase
                .from('curriculums')
                .insert([{
                    title: data.title,
                    category: data.category,
                    level: data.level,
                    description: data.description,
                    checklist: data.courses || [],
                    status: '진행중', // 기본 상태 설정
                    image: data.image || null, // 이미지 필드 추가
                    created_by: currentUserId
                }]);
            
            if (error) {
                console.error('커리큘럼 추가 실패:', error);
                alert('커리큘럼 추가에 실패했습니다.');
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
            
            // Supabase에 업데이트 저장
            const { error } = await supabase
                .from('curriculums')
                .update({
                    title: updatedData.title,
                    category: updatedData.category,
                    level: updatedData.level,
                    description: updatedData.description,
                    checklist: updatedData.courses || [],
                    status: updatedData.status,
                    image: updatedData.image
                })
                .eq('id', updatedData.id);
            
            if (error) {
                console.error('커리큘럼 수정 실패:', error);
                alert('커리큘럼 수정에 실패했습니다.');
                return;
            }
            
            // 로컬 상태 업데이트
            setCurriculums(prev => 
                prev.map(curriculum => 
                    curriculum.id === updatedData.id ? updatedData : curriculum
                )
            );
            
            alert('커리큘럼이 성공적으로 수정되었습니다.');
        } catch (err) {
            console.error('커리큘럼 수정 중 오류:', err);
            alert('커리큘럼 수정에 실패했습니다.');
        }
    };

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커리큘럼 관리</h1>
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
                                            등록된 커리큘럼이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    curriculums.map((curriculum: any) => (
                                        <TableRow key={curriculum.id} className="border-cyan-500/10">
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    {curriculum.image ? (
                                                        <img 
                                                            src={curriculum.image.startsWith('data:') ? curriculum.image : curriculum.image} 
                                                            alt={curriculum.title}
                                                            className="w-12 h-12 object-cover rounded border border-cyan-500/30"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
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