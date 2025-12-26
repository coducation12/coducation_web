"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { compressImage, validateImageFile, formatFileSize } from "@/lib/image-utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    disabled?: boolean;
    bucketName?: string;
}

export default function ImageUpload({
    value,
    onChange,
    label = "이미지",
    className = "",
    disabled = false,
    bucketName = "content-images"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string>(value || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const file = event.target.files?.[0];
        if (!file) return;

        // ... validation ...
        const validation = validateImageFile(file, 10 * 1024 * 1024); // 10MB 제한
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setUploading(true);

        try {
            // ... compression and upload logic ...
            console.log(`원본 파일 크기: ${formatFileSize(file.size)}`);

            // 이미지 압축 (프로필 이미지는 작게)
            const compressedBlob = await compressImage(file, {
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.8,
                outputFormat: 'webp'
            });

            console.log(`압축 후 크기: ${formatFileSize(compressedBlob.size)} (${((compressedBlob.size / file.size) * 100).toFixed(1)}%)`);

            // 압축된 파일을 File 객체로 변환
            const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            // Supabase Storage에 압축된 이미지 업로드
            const fileName = `${Date.now()}-${compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(fileName, compressedFile, {
                    cacheControl: '31536000', // 1년 캐시
                    upsert: true
                });

            if (error) {
                throw error;
            }

            // 공개 URL 가져오기
            const { data: urlData } = supabase.storage
                .from('content-images')
                .getPublicUrl(fileName);

            if (urlData.publicUrl) {
                console.log('이미지 업로드 성공, URL:', urlData.publicUrl);
                setPreview(urlData.publicUrl);
                onChange(urlData.publicUrl);
                console.log('onChange 콜백 호출됨');
            }

            setUploading(false);
        } catch (error) {
            console.error("이미지 업로드 오류:", error);
            alert(`이미지 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (disabled) return;
        try {
            // ... remove logic ...
            if (preview && preview.includes('supabase')) {
                const url = new URL(preview);
                const filePath = url.pathname.split('/storage/v1/object/public/content-images/')[1];

                if (filePath) {
                    await supabase.storage
                        .from('content-images')
                        .remove([filePath]);
                }
            }
        } catch (error) {
            console.error("이미지 삭제 오류:", error);
        }

        setPreview("");
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <Label className="text-cyan-200">{label}</Label>

            <div className="space-y-3">
                {/* 이미지 미리보기 영역 */}
                <div className="relative w-32 h-32 mx-auto border-2 border-dashed border-cyan-400/40 rounded-lg overflow-hidden bg-background/20">
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                alt="이미지 미리보기"
                                fill
                                className="object-cover"
                            />
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-cyan-400">
                            <User className="w-8 h-8 mb-2" />
                            <span className="text-xs">이미지 선택</span>
                        </div>
                    )}
                </div>

                {/* 업로드 버튼 */}
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClick}
                        disabled={uploading || disabled}
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "업로드 중..." : preview ? "이미지 변경" : "이미지 선택"}
                    </Button>
                </div>

                {/* 숨겨진 파일 입력 */}
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* 도움말 텍스트 */}
                <p className="text-xs text-cyan-400/60 text-center">
                    JPG, PNG, GIF, WEBP (최대 5MB)
                </p>
            </div>
        </div>
    );
}
