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
    aspectRatio?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

export default function ImageUpload({
    value,
    onChange,
    label = "이미지",
    className = "",
    disabled = false,
    bucketName = "content-images",
    aspectRatio = "aspect-square",
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string>(value || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const file = event.target.files?.[0];
        if (!file) return;

        // validation
        const validation = validateImageFile(file, 10 * 1024 * 1024); // 10MB 제한
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setUploading(true);

        try {
            console.log(`원본 파일 크기: ${formatFileSize(file.size)}`);

            // 이미지 압축 옵션 적용
            const compressedBlob = await compressImage(file, {
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                quality: quality,
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
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && <Label className="text-cyan-200 truncate">{label}</Label>}

            <div className="relative group border-2 border-dashed border-cyan-500/20 rounded-xl overflow-hidden bg-background/40 transition-all hover:border-cyan-500/50">
                {/* 이미지 미리보기 영역 */}
                <div className={`relative ${aspectRatio} w-full flex items-center justify-center`}>
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                alt="이미지 미리보기"
                                fill
                                className="object-cover"
                            />
                            {!disabled && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleClick}
                                        className="h-8 text-xs"
                                    >
                                        <Upload className="w-3 h-3 mr-1" />
                                        수정
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleRemove}
                                        className="h-8 text-xs"
                                    >
                                        <X className="w-3 h-3 mr-1" />
                                        삭제
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-8"
                            onClick={handleClick}
                        >
                            <Upload className="w-8 h-8 mb-2 text-cyan-500/40" />
                            <span className="text-sm text-cyan-500/60 font-medium">이미지 선택</span>
                            <p className="text-[10px] text-cyan-500/40 mt-1">
                                JPG, PNG, WEBP (Max 5MB)
                            </p>
                        </div>
                    )}
                </div>

                {/* 업로드 중 오버레이 */}
                {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                            <span className="text-xs text-cyan-400 font-medium">업로드 중...</span>
                        </div>
                    </div>
                )}

                {/* 숨겨진 파일 입력 */}
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
}
