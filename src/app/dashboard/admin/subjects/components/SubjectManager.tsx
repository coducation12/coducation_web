'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { 
    Plus, 
    Trash2, 
    Search, 
    Loader2, 
    CheckCircle2, 
    Image as ImageIcon,
    LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ui/image-upload";

const CATEGORIES = ["컴퓨터 기초", "코딩", "자격증", "드로잉", "특별과정", "기타"];

export default function SubjectManager() {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState<string | null>(null);

    // New Subject State
    const [newSubject, setNewSubject] = useState({
        title: '',
        category: CATEGORIES[0],
        image: ''
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('curriculums')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubjects(data || []);
        } catch (error: any) {
            toast({
                title: "과목 로드 실패",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!newSubject.title.trim()) {
            toast({ title: "과목명을 입력해주세요.", variant: "destructive" });
            return;
        }

        setSaving('new');
        try {
            const { data, error } = await supabase
                .from('curriculums')
                .insert([{
                    title: newSubject.title,
                    category: newSubject.category,
                    level: '기초', 
                    image: newSubject.image || null,
                    status: '진행중',
                    public: true
                }])
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setSubjects([data[0], ...subjects]);
                setNewSubject({ 
                    title: '', 
                    category: CATEGORIES[0], 
                    image: '' 
                });
                toast({ title: "과목이 추가되었습니다." });
            }
        } catch (error: any) {
            toast({ title: "추가 실패", description: error.message, variant: "destructive" });
        } finally {
            setSaving(null);
        }
    };

    const handleUpdateSubject = async (id: string, updates: any) => {
        setSaving(id);
        try {
            const { error } = await supabase
                .from('curriculums')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            setSubjects(subjects.map(s => s.id === id ? { ...s, ...updates } : s));
        } catch (error: any) {
            toast({ title: "수정 실패", description: error.message, variant: "destructive" });
        } finally {
            setSaving(null);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('정말 이 과목을 삭제하시겠습니까?')) return;

        try {
            const { error } = await supabase
                .from('curriculums')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSubjects(subjects.filter(s => s.id !== id));
            toast({ title: "삭제되었습니다." });
        } catch (error: any) {
            toast({ title: "삭제 실패", description: error.message, variant: "destructive" });
        }
    };

    const filteredSubjects = subjects.filter(s => 
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 font-sans">
            {/* Quick Add Interface - Image First */}
            <div className="bg-slate-900/40 border border-cyan-500/20 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700" />
                
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-cyan-100 flex items-center gap-2">
                         <Plus className="w-5 h-5 text-cyan-500" />
                         과목 추가
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* Left Side: Image Upload First */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <ImageUpload 
                            value={newSubject.image}
                            onChange={(url) => setNewSubject({...newSubject, image: url})}
                            label="과목 대표 이미지"
                            aspectRatio="aspect-video"
                            className="w-full"
                        />
                    </div>

                    {/* Right Side: Details */}
                    <div className="flex-1 w-full grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-cyan-600 uppercase tracking-widest ml-1">과목 대분류</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setNewSubject({...newSubject, category: cat})}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                            newSubject.category === cat 
                                                ? "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                                                : "bg-black/20 border-cyan-500/10 text-cyan-700 hover:border-cyan-500/30 hover:text-cyan-500"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-cyan-600 uppercase tracking-widest ml-1">상세 과목 명칭</label>
                            <div className="flex gap-4">
                                <Input 
                                    placeholder="예: 파이썬 입문, 한글/엑셀 기초, 블랜더 3D 등" 
                                    value={newSubject.title}
                                    onChange={e => setNewSubject({...newSubject, title: e.target.value})}
                                    className="bg-black/30 border-cyan-500/20 text-cyan-50 h-12 rounded-2xl focus:border-cyan-400 text-lg placeholder:text-cyan-900"
                                    onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                                />
                                <Button 
                                    onClick={handleAddSubject}
                                    disabled={saving === 'new'}
                                    className="h-12 px-8 bg-cyan-600 hover:bg-cyan-400 text-white font-black rounded-2xl shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {saving === 'new' ? <Loader2 className="w-5 h-5 animate-spin" /> : "과목 추가"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List & Search */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-500">
                        <h3 className="font-bold">과목 리스트</h3>
                        <Badge variant="outline" className="ml-2 border-cyan-500/20 text-cyan-800">{filteredSubjects.length}</Badge>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-800" />
                        <Input 
                            placeholder="과목 검색..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-10 bg-black/20 border-cyan-500/10 focus:border-cyan-500/40 text-cyan-100 rounded-xl"
                        />
                    </div>
                </div>

                <div className="bg-slate-900/20 border border-cyan-500/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="grid grid-cols-[120px,160px,1fr,100px] gap-4 px-8 py-4 bg-black/40 border-b border-cyan-500/10 text-[10px] font-black text-cyan-700 uppercase tracking-widest">
                        <div>대표 이미지</div>
                        <div>분류</div>
                        <div>과목명</div>
                        <div className="text-right">Action</div>
                    </div>

                    <div className="divide-y divide-cyan-500/5 max-h-[500px] overflow-y-auto scrollbar-hide">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-cyan-800">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="animate-pulse text-[10px] font-black tracking-widest uppercase">System Syncing...</p>
                            </div>
                        ) : filteredSubjects.length === 0 ? (
                            <div className="py-24 text-center px-6">
                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="p-4 bg-cyan-500/5 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-cyan-500/10">
                                        <LayoutGrid className="w-10 h-10 text-cyan-900/40" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold text-cyan-100 italic tracking-tight">등록된 과목이 없습니다</h4>
                                        <p className="text-sm text-cyan-800 leading-relaxed font-medium">상단의 추가 폼을 이용하여 새로운 과목을 등록해 주세요.</p>
                                    </div>
                                </div>
                            </div>
                        ) : filteredSubjects.map(subject => (
                            <div key={subject.id} className="grid grid-cols-[120px,160px,1fr,100px] gap-4 px-8 py-4 items-center hover:bg-cyan-500/[0.04] transition-all group border-b border-cyan-500/5 last:border-0">
                                <div className="relative aspect-video rounded-xl bg-black/40 border border-cyan-500/10 overflow-hidden cursor-pointer hover:border-cyan-400 transition-all flex items-center justify-center">
                                    {subject.image ? (
                                        <img src={subject.image} alt={subject.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-cyan-900" />
                                    )}
                                    {/* Inline Image Update Hover Effect */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <label className="cursor-pointer">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={() => {
                                                    toast({ title: "이미지 수정은 상단 추가 폼을 이용해 새로 등록해 주세요.", variant: "default" });
                                                }} 
                                            />
                                            <ImageIcon className="w-5 h-5 text-cyan-400" />
                                         </label>
                                    </div>
                                </div>
                                
                                <select 
                                    className="bg-cyan-900/10 border border-cyan-500/10 rounded-lg text-xs font-bold text-cyan-400 px-3 py-1.5 focus:ring-0 cursor-pointer w-fit"
                                    value={subject.category}
                                    onChange={e => handleUpdateSubject(subject.id, { category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                                </select>
                                
                                <Input 
                                    defaultValue={subject.title}
                                    onBlur={e => e.target.value !== subject.title && handleUpdateSubject(subject.id, { title: e.target.value })}
                                    className="bg-transparent border-transparent hover:border-cyan-500/20 focus:bg-black/40 text-[15px] font-bold text-cyan-50 h-10 rounded-xl transition-all"
                                />

                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        className="p-2 text-rose-500/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
