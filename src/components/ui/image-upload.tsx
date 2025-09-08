"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export default function ImageUpload({ value, onChange, label = "이미지", className = "" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string>(value || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB 이하여야 합니다.");
            return;
        }

        // 파일 형식 체크
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert("JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.");
            return;
        }

        setUploading(true);

        try {
            // Supabase Storage에 업로드
            const fileName = `teacher-profiles/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            const { data, error } = await supabase.storage
                .from('content-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            // 공개 URL 가져오기
            const { data: urlData } = supabase.storage
                .from('content-images')
                .getPublicUrl(fileName);

            if (urlData.publicUrl) {
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
        try {
            // 기존 이미지가 Supabase Storage에 저장된 것이라면 삭제
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
            // 삭제 실패해도 UI에서는 제거
        }
        
        setPreview("");
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
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
                                alt="프로필 이미지"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-cyan-400">
                            <User className="w-8 h-8 mb-2" />
                            <span className="text-xs">프로필 이미지</span>
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
                        disabled={uploading}
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
