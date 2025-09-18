"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    parentPhone: string;
    birthDate: string;
    avatar: string;
    course: string;
    curriculum: string;
    progress: number;
    attendance: number;
    status: string;
    joinDate: string;
    lastLogin: string;
    studentId?: string;
    classSchedules?: ClassSchedule[];
}

interface ClassSchedule {
    day: string;
    startTime: string;
    endTime: string;
}

const subjects = [
    "React", "Python", "알고리즘", "웹 개발", "JavaScript", "TypeScript", 
    "Node.js", "데이터베이스", "머신러닝", "앱 개발"
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
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');
    
    // 11자리 제한
    if (numbers.length > 11) {
        return numbers.slice(0, 11);
    }
    
    // 하이픈 추가 (3-4-4 형식)
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
};

// 시간 포맷팅 함수
const formatTime = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');
    
    // 4자리 제한
    if (numbers.length > 4) {
        return numbers.slice(0, 4);
    }
    
    // HH:MM 형식으로 변환
    if (numbers.length >= 2) {
        const hours = numbers.slice(0, 2);
        const minutes = numbers.slice(2, 4);
        
        // 시간 유효성 검사 (00-23)
        const hourNum = parseInt(hours);
        if (hourNum > 23) {
            return '23' + (minutes || '');
        }
        
        if (numbers.length >= 4) {
            // 분 유효성 검사 (00-59)
            const minuteNum = parseInt(minutes);
            if (minuteNum > 59) {
                return hours + '59';
            }
            return `${hours}:${minutes}`;
        }
        
        return `${hours}${minutes}`;
    }
    
    return numbers;
};

interface EditStudentModalProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (studentData: any) => Promise<void>;
}

export default function EditStudentModal({ student, isOpen, onClose, onSave }: EditStudentModalProps) {
    const [formData, setFormData] = useState({
        studentId: "",
        name: "",
        birthYear: "",
        password: "",
        subject: "",
        phone: "",
        parentPhone: "",
        email: "",
        status: "",
        classSchedules: [] as ClassSchedule[]
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                studentId: student.studentId || "",
                name: student.name,
                birthYear: student.birthDate,
                password: "",
                subject: student.course,
                phone: student.phone,
                parentPhone: student.parentPhone,
                email: student.email,
                status: student.status === 'active' ? '수강' : 
                         student.status === 'pending' ? '가입 대기' : 
                         student.status || "수강",
                classSchedules: student.classSchedules || []
            });
        }
    }, [student]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhoneChange = (field: 'phone' | 'parentPhone', value: string) => {
        const formattedValue = formatPhoneNumber(value);
        setFormData(prev => ({
            ...prev,
            [field]: formattedValue
        }));
    };

    const handleScheduleChange = (index: number, field: keyof ClassSchedule, value: string) => {
        setFormData(prev => ({
            ...prev,
            classSchedules: prev.classSchedules.map((schedule, i) => {
                if (i === index) {
                    // 시간 필드인 경우 자동 포맷팅 적용
                    if (field === 'startTime' || field === 'endTime') {
                        return { ...schedule, [field]: formatTime(value) };
                    }
                    return { ...schedule, [field]: value };
                }
                return schedule;
            })
        }));
    };

    const addSchedule = () => {
        setFormData(prev => ({
            ...prev,
            classSchedules: [...prev.classSchedules, { day: "", startTime: "", endTime: "" }]
        }));
    };

    const removeSchedule = (index: number) => {
        if (formData.classSchedules.length > 1) {
            setFormData(prev => ({
                ...prev,
                classSchedules: prev.classSchedules.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // 수업 일정 검증
            const validSchedules = formData.classSchedules.filter(schedule => {
                if (!schedule.day || !schedule.startTime || !schedule.endTime) {
                    alert("모든 수업 일정에 요일, 시작시간, 종료시간을 입력해주세요.");
                    return false;
                }
                return true;
            });
            
            if (validSchedules.length === 0) {
                alert("최소 하나의 유효한 수업 일정을 입력해주세요.");
                setIsLoading(false);
                return;
            }
            
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('학생 정보 수정 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl font-bold">학생 정보 수정</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    <div className="flex gap-2 w-full min-w-0">
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="studentId" className="text-cyan-200">학생 ID</Label>
                            <Input
                                id="studentId"
                                value={formData.studentId}
                                onChange={(e) => handleInputChange('studentId', e.target.value)}
                                placeholder="학생 ID"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                autoComplete="off"
                                disabled
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="password" className="text-cyan-200">새 비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="변경하지 않으려면 비워두세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full min-w-0">
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="name" className="text-cyan-200">이름</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="학생 이름"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="birthYear" className="text-cyan-200">출생년도</Label>
                            <Input
                                id="birthYear"
                                type="text"
                                value={formData.birthYear}
                                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                                placeholder="예: 2010"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                maxLength={4}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full min-w-0">
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="subject" className="text-cyan-200">과목</Label>
                            <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                                    <SelectValue placeholder="과목을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-cyan-400/40">
                                    {subjects.map((subject) => (
                                        <SelectItem
                                            key={subject}
                                            value={subject}
                                            className="text-cyan-100 hover:bg-cyan-900/20"
                                        >
                                            {subject}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="status" className="text-cyan-200">수강 상태</Label>
                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                                    <SelectValue placeholder="상태를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-cyan-400/40">
                                    <SelectItem
                                        value="수강"
                                        className="text-cyan-100 hover:bg-cyan-900/20"
                                    >
                                        수강
                                    </SelectItem>
                                    <SelectItem
                                        value="휴강"
                                        className="text-cyan-100 hover:bg-cyan-900/20"
                                    >
                                        휴강
                                    </SelectItem>
                                    <SelectItem
                                        value="종료"
                                        className="text-cyan-100 hover:bg-cyan-900/20"
                                    >
                                        종료
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-cyan-200">연락처</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange('phone', e.target.value)}
                                placeholder="학생 연락처 (숫자만 입력)"
                                className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                maxLength={13}
                                autoComplete="off"
                            />
                            <span className="text-cyan-400 text-lg">/</span>
                            <Input
                                id="parentPhone"
                                value={formData.parentPhone}
                                onChange={(e) => handlePhoneChange('parentPhone', e.target.value)}
                                placeholder="학부모 연락처 (선택)"
                                className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                maxLength={13}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-cyan-200">이메일 <span className="text-cyan-400 text-xs">(선택)</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="example@email.com"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                            autoComplete="off"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-cyan-200">수업 일정</Label>
                            <Button
                                type="button"
                                onClick={addSchedule}
                                size="sm"
                                className="bg-cyan-600 hover:bg-cyan-700 text-white h-8 px-2"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {formData.classSchedules.map((schedule, index) => (
                                <div key={index} className="flex items-center gap-2 w-full min-w-0">
                                    <Select 
                                        value={schedule.day} 
                                        onValueChange={(value) => handleScheduleChange(index, "day", value)}
                                    >
                                        <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80 flex-1 min-w-0">
                                            <SelectValue placeholder="요일 선택" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-cyan-400/40">
                                            {daysOfWeek.map((day) => (
                                                <SelectItem
                                                    key={day.id}
                                                    value={day.id}
                                                    className="text-cyan-100 hover:bg-cyan-900/20"
                                                >
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="text"
                                        value={schedule.startTime}
                                        onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                                        placeholder="시작시간"
                                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 flex-1 min-w-0"
                                        maxLength={5}
                                        autoComplete="off"
                                    />
                                    <Input
                                        type="text"
                                        value={schedule.endTime}
                                        onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                                        placeholder="종료시간"
                                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 flex-1 min-w-0"
                                        maxLength={5}
                                        autoComplete="off"
                                    />
                                    {formData.classSchedules.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeSchedule(index)}
                                            size="icon"
                                            variant="outline"
                                            className="border-red-500/30 text-red-300 hover:bg-red-800/30 w-8 h-8 flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-cyan-500/20">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                        >
                            취소
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            {isLoading ? "저장 중..." : "저장"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 