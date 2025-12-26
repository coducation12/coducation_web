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

const LEVELS = ['기초', '중급', '고급'] as const;

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
        level: '기초' as '기초' | '중급' | '고급',
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

    const handleOpenDialog = (curriculum?: MainCurriculum, defaultLevel?: '기초' | '중급' | '고급') => {
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
            if (defaultLevel) {
                setFormData(prev => ({ ...prev, level: defaultLevel }));
            }
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
        const { source, destination } = result;
        if (!destination) return;

        // 같은 리스트, 같은 위치면 무시
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceLevel = source.droppableId;
        const destLevel = destination.droppableId;

        let newCurriculums = [...curriculums];

        // 1. 같은 레벨 내 이동
        if (sourceLevel === destLevel) {
            const levelItems = newCurriculums
                .filter(c => c.level === sourceLevel)
                .sort((a, b) => a.display_order - b.display_order);

            const [movedItem] = levelItems.splice(source.index, 1);
            levelItems.splice(destination.index, 0, movedItem);

            // 전체 리스트 재구성: 해당 레벨의 순서만 재정렬하고 나머지는 유지
            // (주의: 단순 map으로는 display_order가 겹칠 수 있으니, 매핑 로직을 신중해야 함)
            // 가장 확실한 방법: 모든 아이템을 다시 정렬된 상태로 map을 돌리는 것.

            newCurriculums = newCurriculums.map(c => {
                if (c.level !== sourceLevel) return c;
                const newIndex = levelItems.findIndex(item => item.id === c.id);
                return { ...c, display_order: newIndex };
            });

        }
        // 2. 다른 레벨로 이동 (레벨 변경)
        else {
            const itemToMove = newCurriculums.find(c => c.id === result.draggableId);
            if (!itemToMove) return;

            const updatedItem = { ...itemToMove, level: destLevel };

            const destLevelItems = newCurriculums
                .filter(c => c.level === destLevel && c.id !== itemToMove.id)
                .sort((a, b) => a.display_order - b.display_order);

            destLevelItems.splice(destination.index, 0, updatedItem);

            // 소스 레벨 아이템들 (빠진 후 재정렬)
            const sourceLevelItems = newCurriculums
                .filter(c => c.level === sourceLevel && c.id !== itemToMove.id)
                .sort((a, b) => a.display_order - b.display_order);

            // 전체 리스트 재구성
            newCurriculums = newCurriculums.map(c => {
                // 이동한 아이템 -> 목적지 레벨에서의 인덱스
                if (c.id === itemToMove.id) {
                    const idx = destLevelItems.findIndex(item => item.id === updatedItem.id); // 사실상 updatedItem과 같음
                    // destLevelItems에는 updatedItem 객체 자체가 들어있음.
                    // 하지만 map 돌때 c는 원본 객체임.
                    return { ...c, level: destLevel, display_order: idx };
                }

                // 목적지 레벨의 기존 아이템들
                if (c.level === destLevel) {
                    const idx = destLevelItems.findIndex(item => item.id === c.id);
                    if (idx > -1) return { ...c, display_order: idx };
                }

                // 소스 레벨의 기존 아이템들 (하나 빠짐 -> 순서 당겨짐)
                if (c.level === sourceLevel) {
                    const idx = sourceLevelItems.findIndex(item => item.id === c.id);
                    if (idx > -1) return { ...c, display_order: idx };
                }

                return c;
            });
        }

        setCurriculums(newCurriculums);

        try {
            // 변경된 아이템들만 서버로 전송
            const updates = newCurriculums.map(c => ({
                id: c.id,
                level: c.level,
                display_order: c.display_order
            }));
            await updateMainCurriculums(updates);
            router.refresh();
        } catch (error) {
            console.error('Update error:', error);
            toast({ title: "업데이트 실패", description: "변경사항 저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">커리큘럼 관리</h2>
                    <p className="text-muted-foreground">메인 화면의 커리큘럼을 레벨별로 관리합니다.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" /> 커리큘럼 추가
                </Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {LEVELS.map(level => (
                        <Card key={level} className="flex flex-col h-full bg-slate-50/50 border-2">
                            <CardHeader className="pb-3 bg-white border-b rounded-t-lg">
                                <CardTitle className={`text-lg flex items-center gap-2
                                    ${level === '기초' ? 'text-green-700' :
                                        level === '중급' ? 'text-blue-700' :
                                            'text-purple-700'}`}>
                                    {level} 과정
                                    <span className="text-sm font-normal text-muted-foreground ml-auto bg-slate-100 px-2 py-1 rounded-full border">
                                        {curriculums.filter(c => c.level === level).length}개
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-3">
                                <Droppable droppableId={level}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-3 min-h-[150px]"
                                        >
                                            {curriculums
                                                .filter(c => c.level === level)
                                                .sort((a, b) => a.display_order - b.display_order)
                                                .map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="bg-white p-3 rounded-lg border shadow-sm group hover:border-cyan-400 hover:shadow-md transition-all"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div {...provided.dragHandleProps} className="mt-1 text-gray-400 hover:text-gray-600 cursor-move">
                                                                        <GripVertical className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-medium text-sm truncate mb-1">{item.title}</h4>
                                                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-end mt-2 pt-2 border-t gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-100" onClick={() => handleOpenDialog(item)}>
                                                                        <Pencil className="w-3 h-3 text-slate-500" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-50 text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}

                                            {/* 빈 상태일 빈 공간 클릭으로 추가 유도 */}
                                            {curriculums.filter(c => c.level === level).length === 0 && (
                                                <div
                                                    className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-white hover:border-gray-400 transition-all bg-white/50"
                                                    onClick={() => handleOpenDialog(undefined, level)}
                                                >
                                                    여기에 추가하기
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DragDropContext>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-white">
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
        </div>
    );
}
