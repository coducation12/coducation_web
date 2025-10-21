"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface AddStudentModalProps {
    onAddStudent: (studentData: StudentFormData) => void;
    triggerText?: string;
}

export interface StudentFormData {
    studentId: string;
    name: string;
    birthYear: string;
    password: string;
    subject: string;
    phone: string;
    parentPhone: string;
    email: string;
    classSchedules: ClassSchedule[];
    status?: string;
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

// 휴대폰번호 유효성 검사 함수
const validatePhoneNumber = (phone: string): boolean => {
    const numbers = phone.replace(/[^0-9]/g, '');
    return numbers.length === 11 && numbers.startsWith('010');
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

// 시간 유효성 검사 함수
const validateTime = (time: string): boolean => {
    const numbers = time.replace(/[^0-9]/g, '');
    if (numbers.length !== 4) return false;
    
    const hours = parseInt(numbers.slice(0, 2));
    const minutes = parseInt(numbers.slice(2, 4));
    
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

export default function AddStudentModal({ onAddStudent, triggerText = "학생 추가" }: AddStudentModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<StudentFormData>({
        studentId: "",
        name: "",
        birthYear: "",
        password: "",
        subject: "",
        phone: "",
        parentPhone: "",
        email: "",
        classSchedules: [
            { day: "", startTime: "", endTime: "" },
            { day: "", startTime: "", endTime: "" }
        ]
    });

    const handleInputChange = (field: keyof StudentFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 휴대폰번호 입력 처리
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

    const handleSubmit = () => {
        // 필수 필드 검증
        if (!formData.studentId || !formData.name || !formData.birthYear || !formData.password || 
            !formData.subject || !formData.phone) {
            alert("필수 필드를 모두 입력해주세요.");
            return;
        }

        // 생년 형식 검증
        const yearRegex = /^\d{4}$/;
        if (!yearRegex.test(formData.birthYear)) {
            alert('출생년도를 4자리(yyyy)로 입력해주세요.');
            return;
        }

        // 생년 유효성 검증 (1900년 ~ 현재년도)
        const currentYear = new Date().getFullYear();
        const birthYear = parseInt(formData.birthYear);
        if (birthYear < 1900 || birthYear > currentYear) {
            alert('올바른 출생년도를 입력해주세요.');
            return;
        }

        // 수업 일정은 선택사항으로 변경 (검증 제거)

        // 이메일 형식 검증 (입력된 경우에만)
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert("올바른 이메일 형식을 입력해주세요.");
                return;
            }
        }

        // 전화번호 형식 검증
        if (!validatePhoneNumber(formData.phone)) {
            alert("올바른 휴대폰번호를 입력해주세요. (010으로 시작하는 11자리)");
            return;
        }
        if (formData.parentPhone && !validatePhoneNumber(formData.parentPhone)) {
            alert("올바른 학부모 휴대폰번호를 입력해주세요. (010으로 시작하는 11자리)");
            return;
        }

        // 수업 일정은 선택사항으로 제출
        const submitData = {
            ...formData,
            classSchedules: formData.classSchedules
        };

        onAddStudent(submitData);
        setFormData({
            studentId: "",
            name: "",
            birthYear: "",
            password: "",
            subject: "",
            phone: "",
            parentPhone: "",
            email: "",
            classSchedules: [
                { day: "", startTime: "", endTime: "" },
                { day: "", startTime: "", endTime: "" }
            ]
        });
        setOpen(false);
    };

    const handleCancel = () => {
        setFormData({
            studentId: "",
            name: "",
            birthYear: "",
            password: "",
            subject: "",
            phone: "",
            parentPhone: "",
            email: "",
            classSchedules: [
                { day: "", startTime: "", endTime: "" },
                { day: "", startTime: "", endTime: "" }
            ]
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl font-bold">새 학생 등록</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    <div className="flex gap-2 w-full min-w-0">
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="studentId" className="text-cyan-200">학생 ID *</Label>
                            <Input
                                id="studentId"
                                value={formData.studentId}
                                onChange={(e) => handleInputChange("studentId", e.target.value)}
                                placeholder="학생 ID를 입력하세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="password" className="text-cyan-200">비밀번호 *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full min-w-0">
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="name" className="text-cyan-200">이름 *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="학생 이름을 입력하세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="birthYear" className="text-cyan-200">출생년도 *</Label>
                            <Input
                                id="birthYear"
                                type="text"
                                value={formData.birthYear}
                                onChange={(e) => handleInputChange("birthYear", e.target.value)}
                                placeholder="예: 2010"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                maxLength={4}
                                autoComplete="off"
                            />
                        </div>
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-cyan-200">과목 *</Label>
                        <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
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

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-cyan-200">연락처 *</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange("phone", e.target.value)}
                                placeholder="학생 연락처 (숫자만 입력)"
                                className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                maxLength={13}
                                autoComplete="off"
                            />
                            <span className="text-cyan-400 text-lg">/</span>
                            <Input
                                id="parentPhone"
                                value={formData.parentPhone}
                                onChange={(e) => handlePhoneChange("parentPhone", e.target.value)}
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
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="example@email.com"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                            autoComplete="off"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-cyan-200">수업 일정</Label>
                                <p className="text-xs text-cyan-300/70">선택사항입니다</p>
                            </div>
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
                            onClick={handleCancel}
                            variant="outline"
                            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                        >
                            취소
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            등록
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 