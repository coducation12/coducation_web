'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { updateContent } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

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

    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.set('section', 'promo_modal'); // Identifier for the server action
            formData.set('promo_active', active.toString());
            formData.set('promo_image', imageUrl || '');

            // We reuse the generic updateContent action
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
        <Card>
            <CardHeader>
                <CardTitle>프로모션 모달 설정</CardTitle>
                <CardDescription>
                    메인 페이지 접속 시 표시되는 팝업 광고/공지를 설정합니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label className="text-base">모달 활성화</Label>
                        <p className="text-sm text-muted-foreground">
                            활성화하면 사이트 방문자에게 팝업이 표시됩니다. (오늘 하루 보지 않기 기능 포함)
                        </p>
                    </div>
                    <Switch
                        checked={active}
                        onCheckedChange={setActive}
                    />
                </div>

                <div className="space-y-2">
                    <Label>팝업 이미지</Label>
                    <div className="max-w-[500px] w-full">
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(url)}
                            disabled={loading}
                            aspectRatio="aspect-auto min-h-[200px]"
                            maxWidth={1200}
                            maxHeight={1500}
                            quality={0.9}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        권장 사이즈: 600x600px 이상 도는 원하는 비율의 고화질 이미지
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!loading && <Save className="mr-2 h-4 w-4" />}
                        설정 저장
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
