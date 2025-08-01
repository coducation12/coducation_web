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

const [curriculums, setCurriculums] = useState<any[]>([]);
useEffect(() => {
  fetchCurriculums();
}, []);

const fetchCurriculums = async () => {
  const { data, error } = await supabase
    .from('curriculums')
    .select('id, title, category, level, created_by, users (id, name), checklist, public, created_at');
  if (error) {
    setCurriculums([]);
    return;
  }
  // 담당 강사명 users.name으로 매핑
  const mapped = (data || []).map((cur: any) => ({
    ...cur,
    teacherName: cur.users?.name || '미배정',
    students: 0, // 추후 학생 수 연동
    status: '완료', // 추후 상태 연동
    courses: cur.checklist || []
  }));
  setCurriculums(mapped);
};

export default function TeacherCurriculumPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumData | null>(null);
    // curriculums는 위에서 Supabase fetch로 대체

    const handleAddCurriculum = (data: CurriculumFormData) => {
        console.log('새 커리큘럼 추가:', data);
        // 여기에 실제 추가 로직을 구현할 수 있습니다
    };

    const handleEditCurriculum = (curriculum: CurriculumData) => {
        setSelectedCurriculum(curriculum);
        setIsEditModalOpen(true);
    };

    const handleUpdateCurriculum = (updatedData: CurriculumData) => {
        console.log('커리큘럼 수정:', updatedData);
        setCurriculums(prev => 
            prev.map(curriculum => 
                curriculum.id === updatedData.id ? updatedData : curriculum
            )
        );
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

            {/* 상단 4개 카드(통계) 제거됨 */}

            {/* 이하 커리큘럼 목록 등 기존 내용 유지 */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200 text-center">과정명</TableHead>
                                <TableHead className="text-cyan-200 text-center">분류</TableHead>
                                <TableHead className="text-cyan-200 text-center">레벨</TableHead>
                                <TableHead className="text-cyan-200 text-center">담당 강사</TableHead>
                                <TableHead className="text-cyan-200 text-center">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {curriculums.map((curriculum: any) => (
                          <TableRow key={curriculum.id} className="border-cyan-500/10">
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
                                className={curriculum.status === '완료'
                                  ? 'bg-green-600/20 text-green-300 border-green-500/30'
                                  : 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'}
                              >
                                {curriculum.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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