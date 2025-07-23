'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save, X } from 'lucide-react';

export interface CurriculumData {
  id: string;
  title: string;
  category: string;
  level: '기초' | '중급' | '고급';
  students: number;
  status: string;
  courses?: string[];
}

interface EditCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: CurriculumData | null;
  onUpdateCurriculum: (data: CurriculumData) => void;
}

export default function EditCurriculumModal({ 
  isOpen, 
  onClose, 
  curriculum, 
  onUpdateCurriculum 
}: EditCurriculumModalProps) {
  const [formData, setFormData] = useState<CurriculumData>({
    id: '',
    title: '',
    category: '',
    level: '기초',
    students: 0,
    status: '준비중',
    courses: ['']
  });

  // curriculum이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    if (curriculum) {
      setFormData({
        ...curriculum,
        courses: curriculum.courses || ['']
      });
    }
  }, [curriculum]);

  const handleAddCourse = () => {
    setFormData(prev => ({
      ...prev,
      courses: [...(prev.courses || []), '']
    }));
  };

  const handleRemoveCourse = (index: number) => {
    if (formData.courses && formData.courses.length > 1) {
      setFormData(prev => ({
        ...prev,
        courses: prev.courses?.filter((_, i) => i !== index) || ['']
      }));
    }
  };

  const handleCourseChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses?.map((course, i) => i === index ? value : course) || ['']
    }));
  };

  const handleSubmit = () => {
    const filteredCourses = formData.courses?.filter(course => course.trim() !== '') || [];
    
    if (!formData.title.trim() || !formData.category.trim() || filteredCourses.length === 0) {
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
        courses: curriculum.courses || ['']
      });
    }
    onClose();
  };

  if (!curriculum) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-100 text-xl font-bold">커리큘럼 수정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-cyan-200">과정명 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="과정명을 입력하세요"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-cyan-200">분류 *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="분류를 입력하세요 (예: 프론트엔드, 백엔드, AI)"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
              />
            </div>
          </div>

          {/* 레벨 선택 */}
          <div className="space-y-2">
            <Label htmlFor="level" className="text-cyan-200">레벨 *</Label>
            <Select value={formData.level} onValueChange={(value: '기초' | '중급' | '고급') => setFormData(prev => ({ ...prev, level: value }))}>
              <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-cyan-400/40">
                <SelectItem value="기초" className="text-cyan-100 hover:bg-cyan-900/20">기초</SelectItem>
                <SelectItem value="중급" className="text-cyan-100 hover:bg-cyan-900/20">중급</SelectItem>
                <SelectItem value="고급" className="text-cyan-100 hover:bg-cyan-900/20">고급</SelectItem>
              </SelectContent>
            </Select>
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
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-cyan-600/30 border border-cyan-500/50 rounded-full flex items-center justify-center">
                        <span className="text-cyan-200 text-sm font-medium">{index + 1}</span>
                      </div>
                      <Input
                        value={course}
                        onChange={(e) => handleCourseChange(index, e.target.value)}
                        placeholder={`${index + 1}번째 과정을 입력하세요`}
                        className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                      />
                      {formData.courses && formData.courses.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveCourse(index)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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