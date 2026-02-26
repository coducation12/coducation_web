'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { updateContent } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface PromoModalSettingsProps {
    initialData: {
        promo_active: boolean;
        promo_image?: string;
    };
}

export default function PromoModalSettings({ initialData }: PromoModalSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(initialData.promo_active);
    const [imageUrl, setImageUrl] = useState(initialData.promo_image || '');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.set('section', 'promo_modal');
            formData.set('promo_active', active.toString());
            formData.set('promo_image', imageUrl || '');

            const result = await updateContent(formData);

            if (result.success) {
                toast({
                    title: "저장 완료",
                    description: "프로모션 모달 설정이 업데이트되었습니다.",
                });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "저장 실패",
                description: "설정을 저장하는 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-cyan-900/40 bg-gradient-to-br from-[#0a1837]/60 to-[#0a1a2f]/60 backdrop-blur-md">
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

            <CardHeader className="border-b border-cyan-500/10">
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Save className="w-5 h-5 text-cyan-400" />
                    프로모션 모달 설정
                </CardTitle>
                <CardDescription className="text-cyan-200/60">
                    메인 페이지 접속 시 표시되는 팝업 광고/공지를 설정합니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 transition-all hover:bg-cyan-500/10">
                    <div className="space-y-1">
                        <Label className="text-base text-cyan-50 font-bold">모달 활성화</Label>
                        <p className="text-sm text-cyan-200/60">
                            활성화하면 사이트 방문자에게 팝업이 표시됩니다.
                        </p>
                    </div>
                    <Switch
                        checked={active}
                        onCheckedChange={setActive}
                        className="data-[state=checked]:bg-cyan-500"
                    />
                </div>

                <div className="space-y-4">
                    <Label className="text-cyan-100 font-bold">팝업 이미지</Label>
                    <div className="max-w-[400px] w-full group relative">
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(url)}
                            disabled={loading}
                            aspectRatio="aspect-auto min-h-[200px]"
                            maxWidth={1200}
                            maxHeight={1500}
                            className="border-cyan-500/20 bg-cyan-900/20 rounded-xl overflow-hidden shadow-inner active:scale-95 transition-all"
                        />
                        <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/10 group-hover:border-cyan-400/30 rounded-xl transition-all" />
                    </div>
                    <p className="text-xs text-cyan-400/60 flex items-center gap-1">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                        권장 사이즈: 600x600px 이상 도는 원하는 비율의 고화질 이미지
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
