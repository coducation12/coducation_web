'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Trash2, GripVertical, Plus } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { updateContent } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// ... (Top implementation with new types)
// ... imports
interface AcademyContentSettingsProps {
    initialData: {
        academy_title: string;
        academy_subtitle: string;
        academy_slides: Array<{ id?: string; image: string; title?: string; description?: string }>;
        featured_card_1_title: string;
        featured_card_1_image_1: string;
        featured_card_1_image_2: string;
        featured_card_1_link: string;
        featured_card_2_title: string;
        featured_card_2_image_1: string;
        featured_card_2_image_2: string;
        featured_card_2_link: string;
    };
}

export default function AcademyContentSettings({ initialData }: AcademyContentSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Ensure slides have IDs and use description field
    const [formData, setFormData] = useState({
        ...initialData,
        academy_slides: initialData.academy_slides?.map((slide, index) => ({
            ...slide,
            id: slide.id || `slide - ${Date.now()} -${index} `,
            description: slide.description || (slide as any).content || ''
        })) || []
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSlideChange = (id: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            academy_slides: prev.academy_slides.map(slide =>
                slide.id === id ? { ...slide, [field]: value } : slide
            )
        }));
    };

    const addSlide = () => {
        setFormData(prev => ({
            ...prev,
            academy_slides: [...(prev.academy_slides || []), { id: Date.now().toString(), image: '', title: '', description: '' }]
        }));
    };

    // ... removeSlide, onDragEnd, handleSave (same logic)

    const removeSlide = (id: string) => {
        setFormData(prev => ({
            ...prev,
            academy_slides: prev.academy_slides.filter(slide => slide.id !== id)
        }));
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(formData.academy_slides || []);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFormData(prev => ({ ...prev, academy_slides: items }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const data = new FormData();

            // Basic info
            data.set('academy_title', formData.academy_title);
            data.set('academy_subtitle', formData.academy_subtitle);
            data.set('academy_slides', JSON.stringify(formData.academy_slides));

            // Card 1
            data.set('featured_card_1_title', formData.featured_card_1_title);
            data.set('featured_card_1_image_1', formData.featured_card_1_image_1);
            // featured_card_1_image_2 is kept for DB compatibility if needed, using image_1 or empty
            data.set('featured_card_1_image_2', formData.featured_card_1_image_2 || '');
            data.set('featured_card_1_link', formData.featured_card_1_link);

            // Card 2
            data.set('featured_card_2_title', formData.featured_card_2_title);
            data.set('featured_card_2_image_1', formData.featured_card_2_image_1);
            data.set('featured_card_2_image_2', formData.featured_card_2_image_2 || '');
            data.set('featured_card_2_link', formData.featured_card_2_link);

            const result = await updateContent(data);

            if (result.success) {
                toast({ title: "저장 완료", description: "학원 소개 컨텐츠가 업데이트되었습니다." });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: "저장 실패",
                description: "저장 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>기본 정보 설정</CardTitle>
                    <CardDescription>메인 화면 상단의 제목과 부제목을 설정합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>메인 타이틀</Label>
                        <Input
                            value={formData.academy_title}
                            onChange={(e) => handleInputChange('academy_title', e.target.value)}
                            placeholder="예: 코딩 교육의 새로운 기준"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>서브 타이틀</Label>
                        <Input
                            value={formData.academy_subtitle}
                            onChange={(e) => handleInputChange('academy_subtitle', e.target.value)}
                            placeholder="예: 체계적인 커리큘럼과 1:1 맞춤 관리"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>슬라이드 배너 설정</CardTitle>
                            <CardDescription>메인 화면 상단의 슬라이드 배너를 관리합니다.</CardDescription>
                        </div>
                        <Button onClick={addSlide} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" /> 슬라이드 추가
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="slides">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {formData.academy_slides?.map((slide, index) => (
                                        <Draggable key={slide.id} draggableId={slide.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="flex items-start space-x-4 p-4 border rounded-lg bg-card"
                                                >
                                                    <div {...provided.dragHandleProps} className="mt-2 text-muted-foreground hover:text-foreground cursor-move">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    <div className="w-[200px] space-y-2 flex-shrink-0">
                                                        <Label>배너 이미지</Label>
                                                        <ImageUpload
                                                            value={slide.image}
                                                            onChange={(url) => handleSlideChange(slide.id!, 'image', url)}
                                                            className="aspect-video"
                                                        />
                                                    </div>

                                                    <div className="flex-1 space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>배너 제목</Label>
                                                            <Input
                                                                value={slide.title || ''}
                                                                onChange={(e) => handleSlideChange(slide.id!, 'title', e.target.value)}
                                                                placeholder="배너 위에 표시될 제목"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>배너 내용</Label>
                                                            <Textarea
                                                                value={slide.description || ''}
                                                                onChange={(e) => handleSlideChange(slide.id!, 'description', e.target.value)}
                                                                placeholder="배너 위에 표시될 부가 설명"
                                                                rows={5}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => removeSlide(slide.id!)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                                            </Button>
                                                        </div>
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
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((num) => (
                    <Card key={num} className="h-full">
                        <CardHeader>
                            <CardTitle>Card {num} Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>제목</Label>
                                <Input
                                    value={(formData as any)[`featured_card_${num}_title`] || ''}
                                    onChange={(e) => handleInputChange(`featured_card_${num}_title`, e.target.value)}
                                    placeholder="카드 이미지 위에 표시될 제목"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="aspect-[4/3] w-full">
                                        <ImageUpload
                                            value={(formData as any)[`featured_card_${num}_image_1`] || ''}
                                            onChange={(url) => handleInputChange(`featured_card_${num}_image_1`, url)}
                                            label="이미지 1"
                                            className="h-full"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="aspect-[4/3] w-full">
                                        <ImageUpload
                                            value={(formData as any)[`featured_card_${num}_image_2`] || ''}
                                            onChange={(url) => handleInputChange(`featured_card_${num}_image_2`, url)}
                                            label="이미지 2"
                                            className="h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                * 메인 페이지 카드 비율(4:3)에 맞춰 표시됩니다.
                            </p>
                            <div className="space-y-2">
                                <Label>링크 URL</Label>
                                <Input
                                    value={(formData as any)[`featured_card_${num}_link`] || ''}
                                    onChange={(e) => handleInputChange(`featured_card_${num}_link`, e.target.value)}
                                    placeholder="클릭 시 이동할 주소 (예: /curriculum)"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-6 sticky bottom-6 z-10">
                <Button onClick={handleSave} disabled={loading} size="lg" className="shadow-lg">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> 변경사항 저장
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
