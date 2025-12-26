'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, GripVertical, Save } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MainCurriculum } from "@/types";
import { addMainCurriculum, updateMainCurriculum, deleteMainCurriculum, updateMainCurriculums } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/ui/image-upload";

interface CurriculumSettingsProps {
    initialCurriculums: MainCurriculum[];
}

export default function CurriculumSettings({ initialCurriculums }: CurriculumSettingsProps) {
    const router = useRouter();
    const [curriculums, setCurriculums] = useState<MainCurriculum[]>(initialCurriculums);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: '기초',
        image: '',
        display_order: 0
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            level: '기초',
            image: '',
            display_order: curriculums.length
        });
        setEditingId(null);
    };

    const handleOpenDialog = (curriculum?: MainCurriculum) => {
        if (curriculum) {
            setEditingId(curriculum.id);
            setFormData({
                title: curriculum.title,
                description: curriculum.description || '',
                category: curriculum.category || '',
                level: curriculum.level,
                image: curriculum.image || '',
                display_order: curriculum.display_order
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const data = new FormData();
            data.set('title', formData.title);
            data.set('description', formData.description);
            data.set('category', formData.category);
            data.set('level', formData.level);
            if (formData.image) data.set('image', formData.image);
            data.set('display_order', formData.display_order.toString());

            let result;
            if (editingId) {
                data.set('id', editingId);
                result = await updateMainCurriculum(data);
            } else {
                result = await addMainCurriculum(data);
            }

            if (result.success) {
                toast({
                    title: editingId ? "수정 완료" : "추가 완료",
                    description: `커리큘럼이 성공적으로 ${editingId ? '수정' : '추가'}되었습니다.`,
                });
                setIsDialogOpen(false);
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "오류",
                description: error.message || "작업 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말로 이 커리큘럼을 삭제하시겠습니까?')) return;

        try {
            setLoading(true);
            const result = await deleteMainCurriculum(id);

            if (result.success) {
                toast({ title: "삭제 완료", description: "커리큘럼이 삭제되었습니다." });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "삭제 실패",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(curriculums);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Optimistic update
        setCurriculums(items);

        // Server update
        try {
            // Create update payload with new orders
            const updates = items.map((item, index) => ({
                id: item.id,
                display_order: index
            }));

            await updateMainCurriculums(updates);
            router.refresh();
        } catch (error) {
            console.error('Reorder error:', error);
            toast({
                title: "순서 변경 실패",
                description: "순서를 저장하는 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>커리큘럼 관리</CardTitle>
                        <CardDescription>
                            메인 화면에 표시될 커리큘럼을 관리하고 순서를 변경합니다.
                        </CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 mr-2" /> 커리큘럼 추가
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="curriculums">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                {curriculums.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="flex items-center gap-4 p-4 bg-card border rounded-lg group"
                                            >
                                                <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                {item.image && (
                                                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium 
                              ${item.level === '기초' ? 'bg-green-100 text-green-700' :
                                                                item.level === '중급' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-purple-100 text-purple-700'}`}>
                                                            {item.level}
                                                        </span>
                                                        <h4 className="font-semibold truncate">{item.title}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '커리큘럼 수정' : '새 커리큘럼 추가'}</DialogTitle>
                        <DialogDescription>
                            커리큘럼 정보를 입력해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>제목</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="예: 파이썬 기초"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>카테고리</Label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="예: 프로그래밍 언어"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>설명</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="커리큘럼에 대한 간단한 설명을 입력하세요"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>난이도</Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(val: any) => setFormData(prev => ({ ...prev, level: val }))}
                                >
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
                            <div className="space-y-2">
                                <Label>이미지</Label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
