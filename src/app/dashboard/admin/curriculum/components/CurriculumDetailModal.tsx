'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save, X } from 'lucide-react';

export interface CurriculumDetailData {
  id: string;
  name: string;
  category: string;
  level: '기초' | '중급' | '고급';
  teacher: string;
  status: string;
  courses?: Course[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
}

interface CurriculumDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: CurriculumDetailData | null;
  onUpdateCurriculum: (data: CurriculumDetailData) => void;
}

const categories = ['프론트엔드', '백엔드', '알고리즘', '데이터베이스', 'DevOps', '모바일'];
const levels = ['기초', '중급', '고급'];
const teachers = ['김강사', '이강사', '박강사', '정강사', '최강사', '미배정'];

export default function CurriculumDetailModal({ 
  isOpen, 
  onClose, 
  curriculum, 
  onUpdateCurriculum 
}: CurriculumDetailModalProps) {
  const [formData, setFormData] = useState<CurriculumDetailData>({
    id: '',
    name: '',
    category: '',
    level: '기초',
    teacher: '',
    status: '준비중',
    courses: [{ id: '1', title: '', description: '', duration: '', order: 1 }]
  });

  // curriculum이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    if (curriculum) {
      setFormData({
        ...curriculum,
        courses: curriculum.courses || [{ id: '1', title: '', description: '', duration: '', order: 1 }]
      });
    }
  }, [curriculum]);

  const handleAddCourse = () => {
    setFormData(prev => ({
      ...prev,
      courses: [...(prev.courses || []), { 
        id: Date.now().toString(), 
        title: '', 
        description: '', 
        duration: '', 
        order: (prev.courses?.length || 0) + 1 
      }]
    }));
  };

  const handleRemoveCourse = (index: number) => {
    if (formData.courses && formData.courses.length > 1) {
      setFormData(prev => ({
        ...prev,
        courses: prev.courses?.filter((_, i) => i !== index) || [{ id: '1', title: '', description: '', duration: '', order: 1 }]
      }));
    }
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses?.map((course, i) => 
        i === index ? { ...course, [field]: value } : course
      ) || [{ id: '1', title: '', description: '', duration: '', order: 1 }]
    }));
  };

  const handleSubmit = () => {
    const filteredCourses = formData.courses?.filter(course => course.title.trim() !== '' && course.description.trim() !== '') || [];
    
    if (!formData.name.trim() || !formData.category.trim() || !formData.teacher.trim() || filteredCourses.length === 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    onUpdateCurriculum({
      ...formData,
      courses: filteredCourses
    });
    
    onClose();
  };

  const handleCancel = () => {
    // 원본 데이터로 복원
    if (curriculum) {
      setFormData({
        ...curriculum,
        courses: curriculum.courses || [{ id: '1', title: '', description: '', duration: '', order: 1 }]
      });
    }
    onClose();
  };

  if (!curriculum) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-100 text-xl font-bold">커리큘럼 상세</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-cyan-200">과정명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="과정명을 입력하세요"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-cyan-200">분류 *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                  <SelectValue placeholder="분류 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background border-cyan-400/40">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-cyan-100 hover:bg-cyan-900/20">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level" className="text-cyan-200">레벨 *</Label>
              <Select value={formData.level} onValueChange={(value: '기초' | '중급' | '고급') => setFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-cyan-400/40">
                  {levels.map((level) => (
                    <SelectItem key={level} value={level} className="text-cyan-100 hover:bg-cyan-900/20">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher" className="text-cyan-200">담당 강사 *</Label>
              <Select value={formData.teacher} onValueChange={(value) => setFormData(prev => ({ ...prev, teacher: value }))}>
                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                  <SelectValue placeholder="강사 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background border-cyan-400/40">
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher} value={teacher} className="text-cyan-100 hover:bg-cyan-900/20">
                      {teacher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 상태 선택 */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-cyan-200">상태</Label>
            <Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-cyan-400/40">
                <SelectItem value="준비중" className="text-cyan-100 hover:bg-cyan-900/20">준비중</SelectItem>
                <SelectItem value="완료" className="text-cyan-100 hover:bg-cyan-900/20">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 과정 리스트 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-cyan-200">과정 리스트 *</Label>
              <Button
                type="button"
                onClick={handleAddCourse}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                과정 추가
              </Button>
            </div>
            
            <Card className="bg-background/20 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {formData.courses?.map((course, index) => (
                    <div key={course.id} className="p-3 border border-cyan-500/30 rounded-lg bg-cyan-900/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 bg-cyan-600/30 border border-cyan-500/50 rounded-full flex items-center justify-center">
                            <span className="text-cyan-200 text-sm font-medium">{index + 1}</span>
                          </div>
                          <span className="text-cyan-200 text-sm font-medium">과정 {index + 1}</span>
                        </div>
                        {formData.courses && formData.courses.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => handleRemoveCourse(index)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-300 hover:bg-red-800/30 h-6 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-cyan-200 text-xs">과정명</Label>
                          <Input
                            value={course.title}
                            onChange={(e) => handleCourseChange(index, "title", e.target.value)}
                            placeholder="과정명"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-cyan-200 text-xs">소요시간</Label>
                          <Input
                            value={course.duration}
                            onChange={(e) => handleCourseChange(index, "duration", e.target.value)}
                            placeholder="예: 2시간"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 mt-3">
                        <Label className="text-cyan-200 text-xs">설명</Label>
                        <Input
                          value={course.description}
                          onChange={(e) => handleCourseChange(index, "description", e.target.value)}
                          placeholder="과정 설명"
                          className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-cyan-500/20">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              <X className="w-4 h-4 mr-1" />
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 