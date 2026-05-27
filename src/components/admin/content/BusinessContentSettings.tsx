'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { updateContent } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useEffect, useState as useMountedState } from 'react';

interface BusinessArea {
    id: string;
    title: string;
    description: string;
    image: string;
}

interface BusinessContentSettingsProps {
    initialData: {
        business_areas: BusinessArea[];
    };
}

const defaultBusinessAreas: BusinessArea[] = [
    {
        id: 'web',
        title: '웹페이지 제작',
        description: '최신 트렌드를 반영한 반응형 웹사이트 및 최적화된 프론트엔드 개발 서비스를 제공합니다.',
        image: '/images/business/web_development.png'
    },
    {
        id: 'app',
        title: '모바일 앱 제작',
        description: 'iOS 및 Android 환경을 모두 지원하는 하이브리드/네이티브 애플리케이션을 제작합니다.',
        image: '/images/business/app_development.png'
    },
    {
        id: '3d',
        title: '3D 모델링 제작',
        description: '현실감 넘치는 그래픽 하이라이트와 정교한 미래지향적 3D 공간/제품 모델링을 설계합니다.',
        image: '/images/business/three_d_modeling.png'
    },
    {
        id: 'animation',
        title: '애니메이션 제작',
        description: '시선을 사로잡는 모션 그래픽스 및 몰입감 넘치는 역동적인 키프레임 애니메이션을 제작합니다.',
        image: '/images/business/animation_production.png'
    }
];

export default function BusinessContentSettings({ initialData }: BusinessContentSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useMountedState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Ensure initialData or default values exist
    const [formData, setFormData] = useState({
        business_areas: initialData.business_areas && initialData.business_areas.length > 0 
            ? initialData.business_areas 
            : defaultBusinessAreas
    });

    const handleAreaChange = (id: string, field: keyof BusinessArea, value: string) => {
        setFormData(prev => ({
            ...prev,
            business_areas: prev.business_areas.map(area =>
                area.id === id ? { ...area, [field]: value } : area
            )
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const data = new FormData();

            // business_areas 객체를 문자열화해서 전송
            data.set('business_areas', JSON.stringify(formData.business_areas));

            const result = await updateContent(data);

            if (result.success) {
                toast({ title: "저장 완료", description: "전문 사업 영역 콘텐츠가 성공적으로 업데이트되었습니다." });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "저장 실패",
                description: error.message || "저장 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Right Save Button via Portal */}
            {isMounted && typeof document !== 'undefined' && document.getElementById('admin-content-save-button-portal') && createPortal(
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 px-6 h-11 rounded-lg font-bold shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all hover:scale-105 active:scale-95"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> 변경사항 저장
                        </>
                    )}
                </Button>,
                document.getElementById('admin-content-save-button-portal')!
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.business_areas.map((area) => (
                    <Card key={area.id} className="bg-cyan-950/20 border-cyan-500/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <CardHeader className="border-b border-cyan-500/10">
                            <CardTitle className="text-cyan-100 flex items-center gap-2">
                                <span className="text-xs uppercase px-2 py-0.5 rounded bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 font-bold shrink-0">
                                    {area.id}
                                </span>
                                {area.title} 설정
                            </CardTitle>
                            <CardDescription>메인 페이지의 {area.title} 카드 내용 및 이미지를 관리합니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label className="text-cyan-200">영역 제목</Label>
                                <Input
                                    value={area.title}
                                    onChange={(e) => handleAreaChange(area.id, 'title', e.target.value)}
                                    placeholder="사업 영역 제목"
                                    className="bg-cyan-900/30 border-cyan-500/30 text-cyan-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-cyan-200">설명 / 소개문구</Label>
                                <Textarea
                                    value={area.description}
                                    onChange={(e) => handleAreaChange(area.id, 'description', e.target.value)}
                                    placeholder="사업 영역 설명"
                                    rows={4}
                                    className="bg-cyan-900/30 border-cyan-500/30 text-cyan-100 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <ImageUpload
                                    value={area.image}
                                    onChange={(url) => handleAreaChange(area.id, 'image', url)}
                                    label="대표 이미지 (자동 압축WebP)"
                                    aspectRatio="aspect-[4/3]"
                                    maxWidth={1200}
                                    maxHeight={900}
                                    quality={0.85}
                                />
                                <p className="text-[10px] text-cyan-500/50 mt-1">
                                    * 4:3 비율의 고품질 심플 이미지를 권장합니다. 업로드 시 자동 압축 변환됩니다.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
