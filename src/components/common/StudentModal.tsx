"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User, Users, Calendar, BookOpen, MessageSquare } from "lucide-react";

interface ClassSchedule {
    day: string;
    startTime: string;
    endTime: string;
}

interface Student {
    id: string;
    studentId?: string;
    name: string;
    birthDate: string;
    course: string;
    sub_subject?: string;
    phone: string;
    parentPhone: string;
    email: string;
    status: string;
    enrollment_date?: string;
    memo?: string;
    classSchedules?: ClassSchedule[];
}

interface StudentModalProps {
    mode: "add" | "edit";
    student?: Student | null;
    isOpen?: boolean;
    onClose?: () => void;
    onSave: (formData: any) => Promise<void>;
    triggerText?: string;
}

const subjects = [
    "블록 코딩", "프로그래밍 언어", "Ai 바이브 코딩", "자격증", "디지털 드로잉", "3D 모델링", "프로젝트"
];

const daysOfWeek = [
    { id: "monday", label: "월요일" },
    { id: "tuesday", label: "화요일" },
    { id: "wednesday", label: "수요일" },
    { id: "thursday", label: "목요일" },
    { id: "friday", label: "금요일" },
    { id: "saturday", label: "토요일" },
    { id: "sunday", label: "일요일" }
];

// 휴대폰번호 포맷팅 함수
const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length > 11) return numbers.slice(0, 11);
    if (numbers.length <= 3) return numbers;
    else if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    else return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
};

// 시간 포맷팅 함수
const formatTime = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length > 4) return numbers.slice(0, 4);
    if (numbers.length >= 2) {
        const hours = numbers.slice(0, 2);
        const minutes = numbers.slice(2, 4);
        const hourNum = parseInt(hours);
        if (hourNum > 23) return '23' + (minutes || '');
        if (numbers.length >= 4) {
            const minuteNum = parseInt(minutes);
            if (minuteNum > 59) return hours + '59';
            return `${hours}:${minutes}`;
        }
        return `${hours}${minutes}`;
    }
    return numbers;
};

export default function StudentModal({ mode, student, isOpen, onClose, onSave, triggerText }: StudentModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [formData, setFormData] = useState({
        studentId: "",
        name: "",
        birthYear: "",
        password: "",
        subject: "",
        sub_subject: "",
        phone: "",
        parentPhone: "",
        email: "",
        enrollment_date: new Date().toISOString().split('T')[0],
        status: "수강",
        memo: "",
        classSchedules: [{ day: "", startTime: "", endTime: "" }] as ClassSchedule[]
    });

    const isControlled = isOpen !== undefined;
    const dialogOpen = isControlled ? isOpen : internalOpen;
    const setDialogOpen = isControlled ? (open: boolean) => !open && onClose?.() : setInternalOpen;

    useEffect(() => {
        if (mode === "edit" && student) {
            setFormData({
                studentId: student.studentId || "",
                name: student.name,
                birthYear: student.birthDate || "",
                password: "", // 수정 시 비밀번호는 비워둠
                subject: student.course || "",
                sub_subject: student.sub_subject || "",
                phone: student.phone || "",
                parentPhone: student.parentPhone || "",
                email: student.email || "",
                enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
                status: student.status || "수강",
                memo: student.memo || "",
                classSchedules: student.classSchedules && student.classSchedules.length > 0
                    ? student.classSchedules
                    : [{ day: "", startTime: "", endTime: "" }]
            });
        } else if (mode === "add") {
            setFormData({
                studentId: "",
                name: "",
                birthYear: "",
                password: "",
                subject: "",
                sub_subject: "",
                phone: "",
                parentPhone: "",
                email: "",
                enrollment_date: new Date().toISOString().split('T')[0],
                status: "수강",
                memo: "",
                classSchedules: [{ day: "", startTime: "", endTime: "" }]
            });
        }
    }, [mode, student, dialogOpen]);

    // ID 자동 생성 로직
    useEffect(() => {
        if (mode === 'add') {
            const yearSuffix = formData.birthYear.length >= 2
                ? formData.birthYear.slice(-2)
                : "";

            if (formData.name && yearSuffix) {
                setFormData(prev => ({ ...prev, studentId: formData.name + yearSuffix }));
            }
        }
    }, [formData.name, formData.birthYear, mode]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhoneChange = (field: 'phone' | 'parentPhone', value: string) => {
        setFormData(prev => ({ ...prev, [field]: formatPhoneNumber(value) }));
    };

    const handleScheduleChange = (index: number, field: keyof ClassSchedule, value: string) => {
        setFormData(prev => {
            const newSchedules = prev.classSchedules.map((s, i) => {
                if (i !== index) return s;

                let newValue = (field === 'startTime' || field === 'endTime') ? formatTime(value) : value;
                const updatedSchedule = { ...s, [field]: newValue };

                // 시작 시간을 입력했고, 종료 시간이 비어있거나 시작 시간과 연동 중일 때 자동 계산 (1.5시간)
                if (field === 'startTime' && newValue.length === 5 && newValue.includes(':')) {
                    try {
                        const [hours, minutes] = newValue.split(':').map(Number);
                        const date = new Date();
                        date.setHours(hours, minutes + 90); // 90분 추가

                        const endHours = String(date.getHours()).padStart(2, '0');
                        const endMinutes = String(date.getMinutes()).padStart(2, '0');
                        updatedSchedule.endTime = `${endHours}:${endMinutes}`;
                    } catch (e) {
                        // 계산 실패 시 무시
                    }
                }

                return updatedSchedule;
            });
            return { ...prev, classSchedules: newSchedules };
        });
    };

    const addSchedule = () => {
        setFormData(prev => ({ ...prev, classSchedules: [...prev.classSchedules, { day: "", startTime: "", endTime: "" }] }));
    };

    const removeSchedule = (index: number) => {
        if (formData.classSchedules.length > 1) {
            setFormData(prev => ({ ...prev, classSchedules: prev.classSchedules.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // 간단한 필수 입력 검증
        if (mode === 'add' && (!formData.studentId || !formData.password)) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }
        if (!formData.name || !formData.subject) {
            alert("이름과 과목을 입력해주세요.");
            return;
        }

        await onSave(formData);
        if (!isControlled) setInternalOpen(false);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_10px_rgba(0,255,247,0.2)]">
                        <Plus className="w-4 h-4 mr-2" />
                        {triggerText || (mode === "add" ? "학생 추가" : "수정")}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto bg-[#0a1120] border-cyan-500/30 text-cyan-50 scrollbar-hide">
                <DialogHeader className="border-b border-cyan-500/20 pb-4">
                    <DialogTitle className="text-2xl font-bold text-cyan-100 flex items-center gap-2">
                        <User className="w-6 h-6 text-cyan-400" />
                        {mode === "add" ? "신규 학생 등록" : "학생 정보 수정"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* 1행: 이름, 출생년도, 등록일 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">이름</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                disabled={mode === "edit"}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400 disabled:opacity-80 disabled:cursor-not-allowed"
                                placeholder="학생 이름"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">출생년도</Label>
                            <Input
                                value={formData.birthYear}
                                onChange={(e) => handleInputChange("birthYear", e.target.value)}
                                maxLength={4}
                                disabled={mode === "edit"}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400 disabled:opacity-80 disabled:cursor-not-allowed"
                                placeholder="예: 2010"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4" /> 등록일
                            </Label>
                            <Input
                                type="date"
                                value={formData.enrollment_date}
                                onChange={(e) => handleInputChange("enrollment_date", e.target.value)}
                                disabled={mode === "edit"}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400 disabled:opacity-80 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* 2행: 아이디, 비밀번호 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-cyan-500/10 pt-4">
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">아이디 (ID)</Label>
                            <Input
                                value={formData.studentId}
                                onChange={(e) => handleInputChange("studentId", e.target.value)}
                                disabled
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400 disabled:opacity-80 disabled:cursor-not-allowed"
                                placeholder="이름+뒷자리2자리(자동생성)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">
                                {mode === "add" ? "비밀번호" : "새 비밀번호 (선택)"}
                            </Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400"
                                placeholder={mode === "add" ? "비밀번호 입력" : "변경 시에만 입력"}
                            />
                        </div>
                    </div>

                    {/* 3행: 학생 연락처, 학부모 연락처 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-cyan-500/10 pt-4">
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">
                                <User className="w-4 h-4" /> 학생 연락처
                            </Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange("phone", e.target.value)}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400"
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-pink-400" /> 학부모 연락처
                            </Label>
                            <Input
                                value={formData.parentPhone}
                                onChange={(e) => handlePhoneChange("parentPhone", e.target.value)}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400"
                                placeholder="부모님 연락처"
                            />
                        </div>
                    </div>

                    {/* 4행: 주요 과목, 세부 과목 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-cyan-500/10 pt-4">
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">
                                <BookOpen className="w-4 h-4" /> 주요 과목
                            </Label>
                            <Select value={formData.subject} onValueChange={(v) => handleInputChange("subject", v)}>
                                <SelectTrigger className="bg-cyan-950/30 border-cyan-500/30">
                                    <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cyan-300 flex items-center gap-2 text-sm">세부 과목</Label>
                            <Input
                                value={formData.sub_subject}
                                onChange={(e) => handleInputChange("sub_subject", e.target.value)}
                                className="bg-cyan-950/30 border-cyan-500/30 focus:border-cyan-400"
                                placeholder="직접 입력"
                            />
                        </div>
                    </div>

                    {/* 5행: 수업 일정 */}
                    <div className="space-y-3 border-t border-cyan-500/10 pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-cyan-100 font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-cyan-400" /> 수업 일정 (스케줄)
                            </Label>
                            <Button type="button" onClick={addSchedule} size="sm" variant="outline" className="h-7 border-cyan-500/50 text-cyan-400">
                                <Plus className="w-3 h-3 mr-1" /> 일정 추가
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {formData.classSchedules.map((schedule, index) => (
                                <div key={index} className="flex gap-3 items-center w-full">
                                    <Select value={schedule.day} onValueChange={(v) => handleScheduleChange(index, "day", v)}>
                                        <SelectTrigger className="w-[140px] flex-shrink-0 bg-cyan-950/30 border-cyan-500/30">
                                            <SelectValue placeholder="요일" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0f172a] border-cyan-500/30">
                                            {daysOfWeek.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex-1 flex gap-2 items-center">
                                        <Input
                                            placeholder="시작시간 입력 (14:00)"
                                            value={schedule.startTime}
                                            onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                                            className="bg-cyan-950/30 border-cyan-500/30 h-9 flex-1 text-center"
                                        />
                                        <span className="text-cyan-700 flex-shrink-0 font-bold">~</span>
                                        <Input
                                            placeholder="종료시간 입력 (16:00)"
                                            value={schedule.endTime}
                                            onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                                            className="bg-cyan-950/30 border-cyan-500/30 h-9 flex-1 text-center"
                                        />
                                    </div>
                                    <Button type="button" onClick={() => removeSchedule(index)} variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6행: 기타 메모 */}
                    <div className="space-y-2 border-t border-cyan-500/10 pt-4">
                        <Label className="text-cyan-300 flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4" /> 기타 메모
                        </Label>
                        <Textarea
                            value={formData.memo}
                            onChange={(e) => handleInputChange("memo", e.target.value)}
                            className="bg-cyan-950/30 border-cyan-500/30 min-h-[80px]"
                            placeholder="학생에 대한 특이사항이나 메모를 입력하세요."
                        />
                    </div>

                    {/* 하단 버튼 */}
                    <div className="flex gap-3 pt-6 justify-end border-t border-cyan-500/20">
                        <Button type="button" variant="outline" onClick={() => !isControlled && setInternalOpen(false)} className="border-cyan-700 text-cyan-300">
                            취소
                        </Button>
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[100px]">
                            {mode === "add" ? "등록 완료" : "정보 업데이트"}
                        </Button>
                    </div>
                </form>
            </DialogContent >
        </Dialog >
    );
}
