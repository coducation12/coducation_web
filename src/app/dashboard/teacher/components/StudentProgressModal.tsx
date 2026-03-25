'use client';

import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Plus, 
    Trash2, 
    BookOpen,
    Save,
    ChevronRight,
    Trophy,
    Keyboard,
    Star,
    Library
} from 'lucide-react';
import { getStudentProgress, updateStudentProgress } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import CourseAddModal from './student-progress/CourseAddModal';
import CourseRecordModal from './student-progress/CourseRecordModal';
import ProgressSlider from './student-progress/ProgressSlider';
import { cn } from '@/lib/utils';
import { CERTIFICATE_GROUPS } from '@/lib/student-constants';

interface StudentProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

export default function StudentProgressModal({ isOpen, onClose, studentId, studentName }: StudentProgressModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // DB 데이터
    const [progress, setProgress] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any>({ attained: [], targets: [], awardsSummary: '' });
    const [typing, setTyping] = useState<any>({ ko: { maxSpeed: 0 }, en: { maxSpeed: 0 } });
    const [totalXp, setTotalXp] = useState(0);

    // 모달 관리 상태
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [isRecordResultOpen, setIsRecordResultOpen] = useState(false);
    const [selectedProgressId, setSelectedProgressId] = useState<string | null>(null);
    const [selectedCourseTitle, setSelectedCourseTitle] = useState('');


    useEffect(() => {
        if (isOpen && studentId) {
            loadData();
        }
    }, [isOpen, studentId]);

    const loadData = async () => {
        setLoading(true);
        const result = await getStudentProgress(studentId);
        if (result.success && result.data) {
            setProgress(result.data.learning_progress || []);
            const records = result.data.achievement_records || { attained: [], awards: [] };
            setAchievements({
                attained: records.attained || [],
                awards: records.awards || []
            });
            setTyping(result.data.typing_stats || { ko: { maxSpeed: 0 }, en: { maxSpeed: 0 } });
            setTotalXp(result.data.total_xp || 0);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const data = {
            learning_progress: progress,
            achievement_records: achievements,
            typing_stats: typing,
            total_xp: totalXp
        };
        const result = await updateStudentProgress(studentId, data);
        if (result.success) {
            toast({ title: "저장 완료", description: "모든 정보가 저장되었습니다." });
            onClose();
        } else {
            toast({ title: "저장 실패", description: result.error, variant: "destructive" });
        }
        setSaving(false);
    };

    const addCourse = (course: any) => {
        const newProgress = {
            id: crypto.randomUUID(),
            curriculum_id: course.id,
            title: course.title,
            imageUrl: course.image || '',
            percentage: 0,
            status: 'ongoing',
            results: []
        };
        setProgress([...progress, newProgress]);
        setIsAddCourseOpen(false);
    };

    const updatePercentage = (id: string, val: number) => {
        setProgress(prev => prev.map(p => {
            if (p.id === id) {
                // 이미 완료된 항목을 수정하는 경우
                if (p.status === 'completed') {
                    if (val < 100) {
                        return { ...p, percentage: val, status: 'ongoing' };
                    }
                    return { ...p, percentage: val };
                }

                // 진행 중인 항목이 100%가 되는 경우 (알림창 없이 즉시 이동)
                if (val === 100) {
                    return { ...p, percentage: 100, status: 'completed' };
                }

                return { ...p, percentage: val, status: 'ongoing' };
            }
            return p;
        }));
    };

    const deleteResult = (progressId: string, resultId: string) => {
        if (!confirm('현 결과 기록을 삭제하시겠습니까?')) return;
        setProgress(prev => prev.map(p => {
            if (p.id === progressId) {
                return { ...p, results: (p.results || []).filter((r: any) => r.id !== resultId) };
            }
            return p;
        }));
        toast({ title: "기록 삭제 완료" });
    };

    const ongoingCourses = (progress || []).filter(p => p.status !== 'completed');
    const completedCourses = (progress || []).filter(p => p.status === 'completed');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] bg-[#1e293b] border-cyan-500/20 text-white p-0 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/10">
                
                {/* Header: Title & Total XP */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/20 py-2 sm:py-3 px-6 sm:px-10 h-16 sm:h-20">
                    <div className="flex items-center gap-4">
                        <DialogTitle className="text-xl font-black text-cyan-100 italic tracking-tight">{studentName} <span className="text-cyan-600 font-normal not-italic">Progress</span></DialogTitle>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-cyan-600 font-black uppercase tracking-[0.2em] leading-none mb-1">Experience</span>
                            <span className="text-2xl font-black text-cyan-100 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] leading-none">
                                {totalXp.toLocaleString()} <span className="text-xs text-cyan-600">XP</span>
                            </span>
                        </div>
                        <Button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2 h-11 px-8 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-xl"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                            저장하기
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 sm:px-6 py-4 scrollbar-hide">
                    <div className="space-y-6">
                        {/* Section 1: Learning Progress (Ongoing & Completed) */}
                        <div className="bg-slate-800/40 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Ongoing Column */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1 h-9">
                                        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> 학습 진행중
                                        </h3>
                                        <Button 
                                            onClick={() => setIsAddCourseOpen(true)} 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1 h-7 rounded-lg text-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5" />과정 추가
                                        </Button>
                                    </div>
                                    <div className="space-y-2 h-[220px] overflow-y-auto scrollbar-hide pr-1">
                                        {ongoingCourses.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center border border-dashed border-cyan-500/10 rounded-2xl bg-cyan-950/10">
                                                <p className="text-cyan-700 italic text-xs">진행 중인 학습이 없습니다.</p>
                                            </div>
                                        ) : ongoingCourses.map(item => (
                                            <CourseCard 
                                                key={item.id} 
                                                item={item} 
                                                onPercentageChange={updatePercentage}
                                                onDelete={(id) => {
                                                    if (confirm('해당 학습 과정을 삭제하시겠습니까? 관련 결과물 기록도 모두 삭제됩니다.')) {
                                                        setProgress(prev => prev.filter(p => p.id !== id));
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Completed Column */}
                                <div className="space-y-3">
                                    <div className="flex items-center px-1 h-9">
                                        <h3 className="text-xs font-black text-green-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Trophy className="w-4 h-4" /> 학습 완료
                                        </h3>
                                    </div>
                                    <div className="space-y-1.5 h-[220px] overflow-y-auto scrollbar-hide pr-1">
                                        {completedCourses.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center border border-dashed border-green-500/10 rounded-2xl bg-green-950/5">
                                                <p className="text-green-900/40 italic text-xs">완료된 학습이 없습니다.</p>
                                            </div>
                                        ) : completedCourses.map(item => (
                                            <CourseCard 
                                                key={item.id} 
                                                item={item} 
                                                variant="completed"
                                                onPercentageChange={updatePercentage}
                                                onDelete={(id) => {
                                                    if (confirm('해당 학습 과정을 삭제하시겠습니까? 관련 결과물 기록도 모두 삭제됩니다.')) {
                                                        setProgress(prev => prev.filter(p => p.id !== id));
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Bottom Grid (Certs/Awards & Results) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-1 items-stretch">
                            {/* Certificates & Awards Box */}
                            <div className="bg-slate-800/40 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 h-[480px] overflow-hidden shadow-xl">
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex justify-between items-center px-1 mb-3">
                                        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Star className="w-4 h-4" /> 자격증 기록
                                        </h3>
                                        <Button 
                                            onClick={() => setAchievements({...achievements, attained: [...(achievements?.attained || []), { id: crypto.randomUUID(), organization: CERTIFICATE_GROUPS[0].organization, title: CERTIFICATE_GROUPS[0].certificates[0], date: '' }]})}
                                            variant="ghost" size="icon" className="h-7 w-7 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-px max-h-[200px] overflow-y-auto scrollbar-hide pr-1">
                                        {(achievements?.attained || []).map((att: any) => {
                                            const group = CERTIFICATE_GROUPS.find(g => g.organization === att.organization) || CERTIFICATE_GROUPS[0];
                                            return (
                                                <div key={att.id} className="flex items-center gap-2 py-1 px-1 border-b border-cyan-500/5 hover:bg-cyan-500/10 transition-all group">
                                                    <select 
                                                        className="bg-transparent border border-cyan-500/10 rounded px-2 h-7 text-[11px] font-bold text-cyan-400 focus:ring-1 focus:ring-cyan-500 cursor-pointer w-36 flex-shrink-0 min-w-0"
                                                        value={att.organization || group.organization}
                                                        onChange={e => {
                                                            const newOrg = e.target.value;
                                                            const newGroup = CERTIFICATE_GROUPS.find(g => g.organization === newOrg);
                                                            setAchievements({
                                                                ...achievements,
                                                                attained: achievements.attained.map((a: any) => a.id === att.id ? {
                                                                    ...a,
                                                                    organization: newOrg,
                                                                    title: newGroup?.certificates[0] || ''
                                                                } : a)
                                                            });
                                                        }}
                                                    >
                                                        {CERTIFICATE_GROUPS.map(g => (
                                                            <option key={g.organization} value={g.organization} className="bg-[#1a2333]">{g.organization}</option>
                                                        ))}
                                                    </select>
                                                    <select 
                                                        className="bg-transparent border border-cyan-500/10 rounded px-2 h-7 text-xs font-bold text-cyan-100 focus:ring-1 focus:ring-cyan-500 cursor-pointer flex-1 min-w-0"
                                                        value={att.title}
                                                        onChange={e => setAchievements({
                                                            ...achievements,
                                                            attained: achievements.attained.map((a: any) => a.id === att.id ? {...a, title: e.target.value} : a)
                                                        })}
                                                    >
                                                        {group.certificates.map(cert => (
                                                            <option key={cert} value={cert} className="bg-[#1a2333]">{cert}</option>
                                                        ))}
                                                    </select>
                                                    <Input 
                                                        placeholder="취득일"
                                                        value={att.date}
                                                        onChange={e => setAchievements({...achievements, attained: achievements.attained.map((a: any) => a.id === att.id ? {...a, date: e.target.value} : a)})}
                                                        className="h-7 bg-transparent border-cyan-500/10 text-[11px] text-cyan-300 w-28 focus-visible:ring-cyan-500 text-right pr-2 flex-shrink-0" 
                                                    />
                                                    <button 
                                                        onClick={() => setAchievements({...achievements, attained: achievements.attained.filter((a: any) => a.id !== att.id)})}
                                                        className="h-7 w-8 flex items-center justify-center text-rose-500/50 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-cyan-500/10">
                                    <div className="flex justify-between items-center px-1 mb-3">
                                        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Trophy className="w-4 h-4" /> 수상 내역
                                        </h3>
                                        <Button 
                                            onClick={() => setAchievements({...achievements, awards: [...(achievements?.awards || []), { id: crypto.randomUUID(), title: '', organization: '', date: '' }]})}
                                            variant="ghost" size="icon" className="h-7 w-7 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-px max-h-[140px] overflow-y-auto scrollbar-hide pr-1">
                                        {(achievements?.awards || []).map((awd: any) => (
                                            <div key={awd.id} className="flex items-center gap-2 py-1 px-1 border-b border-cyan-500/5 hover:bg-cyan-500/10 transition-all group">
                                                <Input 
                                                    placeholder="수상 내역"
                                                    value={awd.title}
                                                    onChange={e => setAchievements({...achievements, awards: achievements.awards.map((a: any) => a.id === awd.id ? {...a, title: e.target.value} : a)})}
                                                    className="h-7 bg-transparent border-cyan-500/10 text-xs font-bold text-cyan-100 flex-1 min-w-0 focus-visible:ring-cyan-500" 
                                                />
                                                <Input 
                                                    placeholder="주관 기관"
                                                    value={awd.organization}
                                                    onChange={e => setAchievements({...achievements, awards: achievements.awards.map((a: any) => a.id === awd.id ? {...a, organization: e.target.value} : a)})}
                                                    className="h-7 bg-transparent border-cyan-500/10 text-[11px] text-cyan-400 w-36 focus-visible:ring-cyan-500 flex-shrink-0 min-w-0" 
                                                />
                                                <Input 
                                                    placeholder="취득일"
                                                    value={awd.date}
                                                    onChange={e => setAchievements({...achievements, awards: achievements.awards.map((a: any) => a.id === awd.id ? {...a, date: e.target.value} : a)})}
                                                    className="h-7 bg-transparent border-cyan-500/10 text-[11px] text-cyan-300 w-28 focus-visible:ring-cyan-500 text-right pr-2 flex-shrink-0" 
                                                />
                                                <button 
                                                    onClick={() => setAchievements({...achievements, awards: achievements.awards.filter((a: any) => a.id !== awd.id)})}
                                                    className="h-7 w-8 flex items-center justify-center text-rose-500/50 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded flex-shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            {/* Portfolio Results Box */}
                            <div className="bg-slate-800/40 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 flex flex-col h-[480px] shadow-xl">
                                <div className="flex justify-between items-center mb-6 px-1">
                                    <h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Library className="w-4 h-4" /> 학습 결과물
                                    </h3>
                                    <Button
                                        onClick={() => {
                                            if (progress.length === 0) {
                                                toast({ title: "과정 없음", description: "먼저 학습 과정을 추가해주세요.", variant: "destructive" });
                                                return;
                                            }
                                            setSelectedProgressId(progress[0].id);
                                            setSelectedCourseTitle(progress[0].title);
                                            setIsRecordResultOpen(true);
                                        }}
                                        className="bg-cyan-600/10 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600 hover:text-white transition-all h-9 px-4 font-bold rounded-xl"
                                    >
                                        기록하기
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 space-y-2.5">
                                    {(progress || []).flatMap(p => (p.results || []).map((res: any) => ({ ...res, progressId: p.id, courseTitle: p.title }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((res: any) => (
                                        <div key={res.id} className="bg-cyan-950/10 border border-cyan-500/10 p-2.5 rounded-xl flex gap-3 hover:border-cyan-500/30 transition-all group relative min-h-[64px]">
                                            <div className="w-12 h-12 bg-black rounded-lg border border-cyan-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {res.imageUrl ? <img src={res.imageUrl} className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 text-cyan-900" />}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-center mb-1 pr-14">
                                                    <p className="font-bold text-[13px] text-cyan-100 truncate flex-1">
                                                        <span className="text-[10px] text-cyan-600 font-normal mr-1.5">[{res.courseTitle}]</span>
                                                        {res.title}
                                                    </p>
                                                    <span className="text-[9px] text-cyan-800 font-medium whitespace-nowrap ml-2">{res.date}</span>
                                                </div>
                                                <p className="text-[11px] text-cyan-500/60 line-clamp-1">{res.description}</p>
                                            </div>
                                            
                                            {/* Delete Button */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteResult(res.progressId, res.id);
                                                }}
                                                className="absolute top-2 right-2 p-1 text-cyan-950 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {progress.flatMap(p => p.results || []).length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-30 italic text-sm">
                                            기록된 결과물이 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Sub-modals */}
                <CourseAddModal 
                    isOpen={isAddCourseOpen} 
                    onClose={() => setIsAddCourseOpen(false)} 
                    onAdd={addCourse}
                />
                
                {selectedProgressId && (
                    <CourseRecordModal 
                        isOpen={isRecordResultOpen}
                        onClose={() => setIsRecordResultOpen(false)}
                        studentId={studentId}
                        progressId={selectedProgressId}
                        courseTitle={selectedCourseTitle}
                        onSuccess={(newItem) => {
                            setProgress(prev => prev.map(p => p.id === selectedProgressId ? { ...p, results: [newItem, ...(p.results || [])] } : p));
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function CourseCard({ 
    item, 
    onPercentageChange, 
    onDelete,
    variant = 'ongoing'
}: { 
    item: any, 
    onPercentageChange: (id: string, val: number) => void, 
    onDelete: (id: string) => void,
    variant?: 'ongoing' | 'completed'
}) {
    const isCompleted = variant === 'completed';

    return (
        <div className={cn(
            "group relative bg-[#121c2e]/60 border border-cyan-500/20 rounded-xl flex gap-3 items-center transition-all hover:bg-[#121c2e] hover:border-cyan-500/40",
            isCompleted ? "p-1.5 min-h-[48px]" : "p-2 sm:p-2.5"
        )}>
            <div className={cn(
                "bg-black rounded-lg border border-cyan-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner",
                isCompleted ? "w-9 h-9" : "w-14 h-14 sm:w-16 sm:h-16"
            )}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <BookOpen className={cn("text-cyan-900", isCompleted ? "w-4 h-4" : "w-6 h-6")} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className={cn(
                        "font-bold text-cyan-100 leading-tight truncate pr-6",
                        isCompleted ? "text-[11px]" : "text-[13px]"
                    )}>{item.title}</h4>
                    <button 
                        onClick={() => onDelete(item.id)}
                        className="absolute top-2 right-2 p-0.5 text-cyan-950 hover:text-red-500 transition-colors rounded group-hover:text-cyan-800"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
                {!isCompleted && (
                    <div className="mt-1.5">
                         <ProgressSlider value={item.percentage} onChange={(val) => onPercentageChange(item.id, val)} />
                    </div>
                )}
            </div>
        </div>
    );
}
