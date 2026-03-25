'use client';

import React, { useState, useEffect } from 'react';
import { getCurriculums } from '@/lib/actions';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CourseAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (course: any) => void;
}

export default function CourseAddModal({ isOpen, onClose, onAdd }: CourseAddModalProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        setLoading(true);
        const result = await getCurriculums();
        if (result.success) {
            setCourses(result.data || []);
        }
        setLoading(false);
    };

    const filteredCourses = courses.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) || 
        c.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-[#0c1425] border-cyan-500/30 text-cyan-50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-cyan-100">학습 과정 추가</DialogTitle>
                    <DialogDescription className="text-cyan-500/60">
                        학생에게 할당할 마스터 커리큘럼 과정을 선택하세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
                    <Input 
                        placeholder="과정명 또는 카테고리 검색..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-black/20 border-cyan-500/20 focus:border-cyan-400"
                    />
                </div>

                <ScrollArea className="h-[300px] mt-4 pr-4">
                    <div className="grid grid-cols-1 gap-3">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <p className="text-center py-10 text-cyan-700 italic">검색 결과가 없습니다.</p>
                        ) : (
                            filteredCourses.map(course => (
                                <div 
                                    key={course.id} 
                                    className="flex items-center justify-between p-3 bg-cyan-900/10 border border-cyan-500/10 rounded-lg group hover:border-cyan-400/50 transition-all cursor-pointer"
                                    onClick={() => onAdd(course)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-cyan-950 rounded flex items-center justify-center border border-cyan-500/20 overflow-hidden">
                                            {course.image ? (
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <BookOpen className="w-5 h-5 text-cyan-700" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-cyan-100">{course.title}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-cyan-600 bg-cyan-900/40 px-1.5 py-0.5 rounded leading-none uppercase tracking-wider">{course.category || '일반'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-cyan-400 group-hover:bg-cyan-500/10">
                                        <Plus className="w-4 h-4 mr-1" /> 선택
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={onClose} className="text-cyan-500">취소</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
