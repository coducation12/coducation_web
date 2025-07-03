'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import type { Curriculum } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createCurriculum, updateCurriculum, deleteCurriculum, uploadCurriculumImage } from '@/lib/curriculum-actions';
import { useToast } from '@/hooks/use-toast';

interface CurriculumManagerProps {
  curriculums: Curriculum[];
  teacherId: string;
  onRefresh: () => void;
}

export function CurriculumManager({ curriculums, teacherId, onRefresh }: CurriculumManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '기초' as '기초' | '중급' | '고급',
    public: true,
    image: ''
  });

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const result = await createCurriculum({
        ...formData,
        created_by: teacherId
      });

      if (result.success) {
        toast({
          title: "성공",
          description: "커리큘럼이 생성되었습니다.",
        });
        setIsCreateOpen(false);
        resetForm();
        onRefresh();
      } else {
        toast({
          title: "오류",
          description: result.error || "커리큘럼 생성에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "커리큘럼 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCurriculum) return;
    
    setIsLoading(true);
    try {
      const result = await updateCurriculum(editingCurriculum.id, formData);

      if (result.success) {
        toast({
          title: "성공",
          description: "커리큘럼이 수정되었습니다.",
        });
        setIsEditOpen(false);
        setEditingCurriculum(null);
        resetForm();
        onRefresh();
      } else {
        toast({
          title: "오류",
          description: result.error || "커리큘럼 수정에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "커리큘럼 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (curriculumId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteCurriculum(curriculumId);

      if (result.success) {
        toast({
          title: "성공",
          description: "커리큘럼이 삭제되었습니다.",
        });
        onRefresh();
      } else {
        toast({
          title: "오류",
          description: result.error || "커리큘럼 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "커리큘럼 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadCurriculumImage(file);
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, image: result.url! }));
        toast({
          title: "성공",
          description: "이미지가 업로드되었습니다.",
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "이미지 업로드에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '기초',
      public: true,
      image: ''
    });
  };

  const openEditDialog = (curriculum: Curriculum) => {
    setEditingCurriculum(curriculum);
    setFormData({
      title: curriculum.title,
      description: curriculum.description,
      level: curriculum.level,
      public: curriculum.public,
      image: curriculum.image ?? ''
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">커리큘럼 관리</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              새 커리큘럼
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 커리큘럼 생성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">과정명</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="과정명을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="description">과정 설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="과정에 대한 상세한 설명을 입력하세요"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="level">레벨</Label>
                <Select value={formData.level} onValueChange={(value: '기초' | '중급' | '고급') => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="기초">기초</SelectItem>
                    <SelectItem value="중급">중급</SelectItem>
                    <SelectItem value="고급">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">이미지 업로드</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={formData.public}
                  onChange={(e) => setFormData(prev => ({ ...prev, public: e.target.checked }))}
                />
                <Label htmlFor="public">공개</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? '생성 중...' : '생성'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {curriculums.map((curriculum) => (
          <div key={curriculum.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">{curriculum.title}</h3>
              <p className="text-sm text-muted-foreground">{curriculum.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {curriculum.level}
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {curriculum.public ? '공개' : '비공개'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditDialog(curriculum)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>커리큘럼 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      "{curriculum.title}" 커리큘럼을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(curriculum.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? '삭제 중...' : '삭제'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>커리큘럼 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">과정명</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="과정명을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">과정 설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="과정에 대한 상세한 설명을 입력하세요"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-level">레벨</Label>
              <Select value={formData.level} onValueChange={(value: '기초' | '중급' | '고급') => setFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="기초">기초</SelectItem>
                  <SelectItem value="중급">중급</SelectItem>
                  <SelectItem value="고급">고급</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-image">이미지 업로드</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-public"
                checked={formData.public}
                onChange={(e) => setFormData(prev => ({ ...prev, public: e.target.checked }))}
              />
              <Label htmlFor="edit-public">공개</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? '수정 중...' : '수정'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 