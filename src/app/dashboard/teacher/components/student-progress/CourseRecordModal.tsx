'use client';

import React, { useState, useEffect } from 'react';
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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { ImageIcon, Link as LinkIcon, Save, X, Globe, Lock, BookOpen } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/image-upload';
import { useToast } from "@/hooks/use-toast";

interface CourseRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    progressId: string;
    courseTitle: string;
    courses: any[]; // 전체 코스 목록 추가
    onSuccess: (progressId: string, newItem: any, share: boolean) => void;
}

export default function CourseRecordModal({ 
    isOpen, 
    onClose, 
    studentId, 
    progressId, 
    courseTitle, 
    courses, 
    onSuccess 
}: CourseRecordModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // 상태 관리
    const [currentProgressId, setCurrentProgressId] = useState(progressId);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [shareToCommunity, setShareToCommunity] = useState(true);

    // 모달이 열릴 때 초기값 설정
    useEffect(() => {
        if (isOpen) {
            setCurrentProgressId(progressId || (courses.length > 0 ? courses[0].id : ''));
        }
    }, [isOpen, progressId, courses]);

    const uploadImage = async (file: File) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'progress');
            const url = await uploadImageToStorage(formData);
            setImageUrl(url);
            toast({ title: "업로드 성공", description: "이미지가 업로드되었습니다." });
        } catch (error) {
            toast({ title: "업로드 실패", description: "이미지 업로드 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadImage(file);
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        // 클립보드 아이템 확인
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    await uploadImage(file);
                    break; // 한 번에 하나만 업로드
                }
            }
        }
    };

    const handleSave = async () => {
        if (!currentProgressId) {
            toast({ title: "기록 실패", description: "학습 과정을 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!title.trim()) {
            toast({ title: "기록 실패", description: "제목을 입력해주세요.", variant: "destructive" });
            return;
        }

        setLoading(true);
        
        // 로컬 데이터 생성 (DB 저장은 부모 모달의 '저장하기'에서 수행)
        const newItem = { 
            id: crypto.randomUUID(),
            title, 
            description, 
            imageUrl: imageUrl || undefined, 
            url: externalUrl || undefined,
            uploadedAt: new Date().toISOString(),
            isShared: shareToCommunity
        };

        // 부모에게 전달 (공유 여부도 함께 전달하여 나중에 게시글 생성에 활용)
        onSuccess(currentProgressId, newItem, shareToCommunity);
        
        toast({ title: "기록 추가됨", description: "리스트에 추가되었습니다. 최종 저장을 잊지 마세요!" });
        resetAndClose();
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
            <DialogContent onPaste={handlePaste} className="max-w-2xl bg-[#0c1425] border-cyan-500/30 text-cyan-50 shadow-2xl shadow-cyan-500/20">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-cyan-100 italic tracking-tight flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                        학습 결과물 기록
                    </DialogTitle>
                    <DialogDescription className="text-cyan-500/60 font-medium">
                        학습 과정의 새로운 결과물을 기록합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* 학습 과정 선택 (신규 추가) */}
                    <div className="space-y-2">
                        <Label className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">학습 과정 선택</Label>
                        <Select value={currentProgressId} onValueChange={setCurrentProgressId}>
                            <SelectTrigger className="bg-black/40 border-cyan-500/20 text-cyan-100 h-11 rounded-xl focus:ring-cyan-500/40">
                                <SelectValue placeholder="과정을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0c1425] border-cyan-500/30 text-cyan-50">
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id} className="focus:bg-cyan-500/10 focus:text-cyan-100">
                                        {course.title} {course.status === 'completed' && '(완료됨)'}
                                    </SelectItem>
                                ))}
                                {courses.length === 0 && (
                                    <div className="p-2 text-xs text-cyan-800 italic">추가된 학습 과정이 없습니다.</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">제목</Label>
                                <Input 
                                    placeholder="작품 또는 학습 주제" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-black/20 border-cyan-500/20 focus:border-cyan-400 h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">설명</Label>
                                <Textarea 
                                    placeholder="학습 내용 또는 작품 설명을 입력하세요." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-32 bg-black/20 border-cyan-500/20 focus:border-cyan-400 text-sm rounded-xl resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">대표 이미지 (스크린샷)</Label>
                                <div className="h-32 bg-cyan-950/30 border border-dashed border-cyan-500/20 rounded-xl flex flex-col items-center justify-center relative group overflow-hidden transition-all hover:bg-cyan-950/50 hover:border-cyan-500/40">
                                    {imageUrl ? (
                                        <>
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setImageUrl('')}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 cursor-pointer text-cyan-700 hover:text-cyan-400 transition-all">
                                            <div className="p-3 bg-cyan-500/5 rounded-full border border-cyan-500/10">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">이미지 업로드 또는 Ctrl+V</span>
                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">공유 링크 (GitHub, URL)</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
                                    <Input 
                                        placeholder="https://github.com/..." 
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                        className="pl-11 h-11 bg-black/20 border-cyan-500/20 focus:border-cyan-400 text-xs rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-500/10 p-5 rounded-2xl flex items-center justify-between group/share hover:bg-cyan-950/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl transition-all ${shareToCommunity ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-900/60 text-slate-600'}`}>
                                {shareToCommunity ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-cyan-100 italic">커뮤니티 공유</p>
                                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-tight">이 작품을 다른 학생들과 공유합니다.</p>
                            </div>
                        </div>
                        <Checkbox 
                            id="share-checkbox" 
                            checked={shareToCommunity}
                            onCheckedChange={(checked) => setShareToCommunity(checked as boolean)}
                            className="w-6 h-6 border-cyan-500/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 rounded-lg transition-all"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-10 gap-3">
                    <Button variant="ghost" onClick={resetAndClose} className="text-cyan-600 hover:bg-cyan-500/5 h-12 px-6 rounded-xl font-bold">취소</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[160px] h-12 rounded-xl gap-2 font-black shadow-[0_4px_15px_rgba(6,182,212,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        결과물 반영
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
