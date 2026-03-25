'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon, Link as LinkIcon, Save, X, Globe, Lock } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/image-upload';
import { createPortfolioEntry } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";

interface CourseRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    progressId: string;
    courseTitle: string;
    onSuccess: (newItem: any) => void;
}

export default function CourseRecordModal({ isOpen, onClose, studentId, progressId, courseTitle, onSuccess }: CourseRecordModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [shareToCommunity, setShareToCommunity] = useState(true);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'progress');
            const url = await uploadImageToStorage(formData);
            setImageUrl(url);
            toast({ title: "업로드 성공", description: "이미지가 업로드되었습니다." });
        } catch (error) {
            toast({ title: "업로드 실패", description: "이미지 업로드 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast({ title: "기록 실패", description: "제목을 입력해주세요.", variant: "destructive" });
            return;
        }

        setLoading(true);
        const entryData = { 
            title, 
            description, 
            imageUrl: imageUrl || undefined, 
            url: externalUrl || undefined 
        };

        const result = await createPortfolioEntry(studentId, progressId, entryData, shareToCommunity);
        
        if (result.success) {
            toast({ title: "기록 완료", description: "학습 결과물이 등록되었습니다." });
            onSuccess(result.newItem);
            resetAndClose();
        } else {
            toast({ title: "기록 실패", description: result.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const resetAndClose = () => {
        setTitle('');
        setDescription('');
        setImageUrl('');
        setExternalUrl('');
        setShareToCommunity(true);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetAndClose}>
            <DialogContent className="max-w-2xl bg-[#0c1425] border-cyan-500/30 text-cyan-50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-cyan-100 italic">Record Course Progress</DialogTitle>
                    <DialogDescription className="text-cyan-500/60">
                        {courseTitle} 과정의 새로운 결과물을 기록합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">제목</Label>
                                <Input 
                                    placeholder="작품 또는 학습 주제" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-black/20 border-cyan-500/20 focus:border-cyan-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">설명</Label>
                                <Textarea 
                                    placeholder="학습 내용 또는 작품 설명을 입력하세요." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-24 bg-black/20 border-cyan-500/20 focus:border-cyan-400 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">대표 이미지</Label>
                                <div className="h-28 bg-cyan-950/30 border border-dashed border-cyan-500/20 rounded-lg flex flex-col items-center justify-center relative group overflow-hidden">
                                    {imageUrl ? (
                                        <>
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setImageUrl('')}
                                                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center gap-1 cursor-pointer hover:text-cyan-400 transition-colors">
                                            <ImageIcon className="w-8 h-8 text-cyan-800" />
                                            <span className="text-[10px] font-medium">이미지 업로드</span>
                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">외부 링크 (GitHub, URL 등)</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-600" />
                                    <Input 
                                        placeholder="https://..." 
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                        className="pl-9 h-9 bg-black/20 border-cyan-500/20 focus:border-cyan-400 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-500/10 p-4 rounded-xl flex items-center justify-between group/share">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${shareToCommunity ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/10 text-cyan-600'}`}>
                                {shareToCommunity ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-cyan-100">커뮤니티 자동 공유</p>
                                <p className="text-[10px] text-cyan-500/60 uppercase">Share this achievement with other students</p>
                            </div>
                        </div>
                        <Checkbox 
                            id="share-checkbox" 
                            checked={shareToCommunity}
                            onCheckedChange={(checked) => setShareToCommunity(checked as boolean)}
                            className="border-cyan-500/40 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-8 gap-2">
                    <Button variant="ghost" onClick={resetAndClose} className="text-cyan-500 hover:bg-cyan-500/10">취소</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[120px] gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        기록 완료
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
