'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CurriculumDetailModal, { CurriculumDetailData } from "./components/CurriculumDetailModal";
import { supabase } from "@/lib/supabase";

interface Curriculum {
    id: string;
    name: string;
    category: string;
    level: string;
    teacher: string;
    courses: Course[];
    status: '준비중' | '완료';
    createdAt: string;
    updatedAt: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    order: number;
}

const [curriculums, setCurriculums] = useState<any[]>([]);
useEffect(() => {
  fetchCurriculums();
}, []);

const fetchCurriculums = async () => {
  const { data, error } = await supabase
    .from('curriculums')
    .select('id, title, name, category, level, created_by, users (id, name), checklist, public, created_at');
  if (error) {
    setCurriculums([]);
    return;
  }
  // 담당 강사명 users.name으로 매핑
  const mapped = (data || []).map((cur: any) => ({
    ...cur,
    teacher: cur.users?.name || '미배정',
    courses: cur.checklist || [],
    status: '완료', // 추후 상태 연동
    createdAt: cur.created_at,
    updatedAt: cur.created_at
  }));
  setCurriculums(mapped);
};

export default function AdminCurriculumPage() {
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumDetailData | null>(null);

    const handleEditCurriculum = (curriculum: Curriculum) => {
        const detailData: CurriculumDetailData = {
            id: curriculum.id,
            name: curriculum.name,
            category: curriculum.category,
            level: curriculum.level as '기초' | '중급' | '고급',
            teacher: curriculum.teacher,
            status: curriculum.status,
            courses: curriculum.courses
        };
        setSelectedCurriculum(detailData);
        setIsDetailModalOpen(true);
    };

    const handleUpdateCurriculum = (updatedData: CurriculumDetailData) => {
        const updatedCurriculum: Curriculum = {
            id: updatedData.id,
            name: updatedData.name,
            category: updatedData.category,
            level: updatedData.level,
            teacher: updatedData.teacher,
            courses: updatedData.courses || [],
            status: updatedData.status as '준비중' | '완료',
            createdAt: curriculums.find(c => c.id === updatedData.id)?.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        setCurriculums(prev => 
            prev.map(curriculum => 
                curriculum.id === updatedData.id ? updatedCurriculum : curriculum
            )
        );
    };

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커리큘럼 관리</h1>
                </div>
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200">과정명</TableHead>
                                <TableHead className="text-cyan-200 text-center">분류</TableHead>
                                <TableHead className="text-cyan-200 text-center">레벨</TableHead>
                                <TableHead className="text-cyan-200 text-center">담당 강사</TableHead>
                                <TableHead className="text-cyan-200 text-center">과정 수</TableHead>
                                <TableHead className="text-cyan-200 text-center">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {curriculums.map((curriculum: any) => (
                          <TableRow key={curriculum.id} className="border-cyan-500/10">
                            <TableCell>
                              <button
                                onClick={() => handleEditCurriculum(curriculum)}
                                className="font-medium text-cyan-100 hover:text-cyan-300 transition-colors cursor-pointer underline"
                              >
                                {curriculum.title || curriculum.name}
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
                              {curriculum.teacher}
                            </TableCell>
                            <TableCell className="text-cyan-200 text-center">
                              {curriculum.courses.length}개
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

            {/* 커리큘럼 상세 모달 */}
            <CurriculumDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                curriculum={selectedCurriculum}
                onUpdateCurriculum={handleUpdateCurriculum}
            />
        </div>
    );
} 