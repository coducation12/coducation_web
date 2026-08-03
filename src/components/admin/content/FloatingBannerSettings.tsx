'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, ExternalLink } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { updateContent } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface FloatingBannerSettingsProps {
    initialData: {
        floating_banner_active: boolean;
        floating_banner_image?: string;
        floating_banner_link?: string;
    };
}

export default function FloatingBannerSettings({ initialData }: FloatingBannerSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(initialData.floating_banner_active);
    const [imageUrl, setImageUrl] = useState(initialData.floating_banner_image || '');
    const [linkUrl, setLinkUrl] = useState(initialData.floating_banner_link || '');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.set('floating_banner_active', active.toString());
            formData.set('floating_banner_image', imageUrl || '');
            formData.set('floating_banner_link', linkUrl || '');

            const result = await updateContent(formData);

            if (result.success) {
                toast({
                    title: "저장 완료",
                    description: "우측 상단 배너 설정이 업데이트되었습니다.",
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
                    우측 상단 배너 설정
                </CardTitle>
                <CardDescription className="text-cyan-200/60">
                    메인 화면 우측 상단에 고정으로 띄워놓을 배너를 관리합니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 transition-all hover:bg-cyan-500/10">
                    <div className="space-y-1">
                        <Label className="text-base text-cyan-50 font-bold">배너 활성화</Label>
                        <p className="text-sm text-cyan-200/60">
                            활성화하면 메인 화면의 우측 상단에 배너가 표시됩니다.
                        </p>
                    </div>
                    <Switch
                        checked={active}
                        onCheckedChange={setActive}
                        className="data-[state=checked]:bg-cyan-500"
                    />
                </div>

                <div className="space-y-4">
                    <Label className="text-cyan-100 font-bold">연결할 링크 (URL)</Label>
                    <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50 w-5 h-5" />
                        <Input
                            placeholder="https://..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="pl-10 bg-cyan-900/20 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 h-12"
                        />
                    </div>
                    <p className="text-xs text-cyan-400/60">
                        클릭 시 이동할 웹페이지 주소를 입력해주세요.
                    </p>
                </div>

                <div className="space-y-4">
                    <Label className="text-cyan-100 font-bold">배너 이미지 (선택사항)</Label>
                    <div className="max-w-[300px] w-full group relative">
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(url)}
                            disabled={loading}
                            aspectRatio="aspect-[4/5] min-h-[300px]"
                            maxWidth={600}
                            maxHeight={800}
                            className="border-cyan-500/20 bg-cyan-900/20 rounded-xl overflow-hidden shadow-inner active:scale-95 transition-all"
                        />
                        <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/10 group-hover:border-cyan-400/30 rounded-xl transition-all" />
                    </div>
                    <p className="text-xs text-cyan-400/60 flex flex-col gap-1">
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                            이미지를 업로드하지 않으면, 텍스트로 구성된 기본 디자인("원장 직강 국비지원 교육")이 자동으로 표시됩니다.
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                            권장 비율은 세로형(4:5) 사이즈입니다. (예: 400x500px)
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
