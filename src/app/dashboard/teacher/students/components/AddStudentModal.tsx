"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface AddStudentModalProps {
    onAddStudent: (studentData: StudentFormData) => void;
}

export interface StudentFormData {
    studentId: string;
    name: string;
    birthDate: string;
    subject: string;
    phone: string;
    parentPhone: string;
    email: string;
    classSchedules: ClassSchedule[];
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

export default function AddStudentModal({ onAddStudent }: AddStudentModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<StudentFormData>({
        studentId: "",
        name: "",
        birthDate: "",
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

    const handleScheduleChange = (index: number, field: keyof ClassSchedule, value: string) => {
        setFormData(prev => ({
            ...prev,
            classSchedules: prev.classSchedules.map((schedule, i) => 
                i === index ? { ...schedule, [field]: value } : schedule
            )
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 필수 필드 검증
        if (!formData.studentId || !formData.name || !formData.birthDate || !formData.subject || 
            !formData.phone) {
            alert("필수 필드를 모두 입력해주세요.");
            return;
        }

        // 생년월일 형식 검증
        const dateRegex = /^\d{6}$/;
        if (!dateRegex.test(formData.birthDate)) {
            alert('생년월일을 6자리(yyMMdd)로 입력해주세요.');
            return;
        }

        // 수업 일정 검증
        const validSchedules = formData.classSchedules.filter(schedule => schedule.day && schedule.startTime && schedule.endTime);
        if (validSchedules.length === 0) {
            alert("최소 하나의 수업 일정을 입력해주세요.");
            return;
        }

        // 이메일 형식 검증 (입력된 경우에만)
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert("올바른 이메일 형식을 입력해주세요.");
                return;
            }
        }

        // 전화번호 형식 검증
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)");
            return;
        }
        if (formData.parentPhone && !phoneRegex.test(formData.parentPhone)) {
            alert("올바른 학부모 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
            return;
        }

        // 유효한 수업 일정만 포함하여 제출
        const submitData = {
            ...formData,
            classSchedules: validSchedules
        };

        onAddStudent(submitData);
        setFormData({
            studentId: "",
            name: "",
            birthDate: "",
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
            birthDate: "",
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
                    학생 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-cyan-400/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl">새 학생 등록</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="studentId" className="text-cyan-200">학생 ID *</Label>
                        <Input
                            id="studentId"
                            value={formData.studentId}
                            onChange={(e) => handleInputChange("studentId", e.target.value)}
                            placeholder="학생 ID를 입력하세요"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
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
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="birthDate" className="text-cyan-200">생년월일 *</Label>
                            <Input
                                id="birthDate"
                                type="text"
                                value={formData.birthDate}
                                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                placeholder="예: 100315"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-cyan-200">과목 *</Label>
                        <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                            <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                                <SelectValue placeholder="과목을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-cyan-400/30">
                                {subjects.map((subject) => (
                                    <SelectItem
                                        key={subject}
                                        value={subject}
                                        className="text-cyan-100 hover:bg-cyan-400/10 data-[state=checked]:bg-cyan-600 data-[state=checked]:text-white"
                                    >
                                        {subject}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 w-full min-w-0">
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="phone" className="text-cyan-200">학생 연락처 *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="010-1234-5678"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Label htmlFor="parentPhone" className="text-cyan-200">학부모 연락처 <span className="text-cyan-400 text-xs">(선택)</span></Label>
                            <Input
                                id="parentPhone"
                                value={formData.parentPhone}
                                onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                                placeholder="010-1234-5678"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
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
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-cyan-200">수업 일정 *</Label>
                            <Button
                                type="button"
                                onClick={addSchedule}
                                size="sm"
                                className="bg-cyan-600 hover:bg-cyan-700 text-white h-8 px-2"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            {formData.classSchedules.map((schedule, index) => (
                                <div key={index} className="flex items-center gap-2 w-full min-w-0">
                                    <Select 
                                        value={schedule.day} 
                                        onValueChange={(value) => handleScheduleChange(index, "day", value)}
                                    >
                                        <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80 flex-1 min-w-0">
                                            <SelectValue placeholder="요일 선택" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-cyan-400/30">
                                            {daysOfWeek.map((day) => (
                                                <SelectItem
                                                    key={day.id}
                                                    value={day.id}
                                                    className="text-cyan-100 hover:bg-cyan-400/10 data-[state=checked]:bg-cyan-600 data-[state=checked]:text-white"
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
                                        placeholder="시작 예: 14:30"
                                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 flex-1 min-w-0"
                                    />
                                    <Input
                                        type="text"
                                        value={schedule.endTime}
                                        onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                                        placeholder="종료 예: 16:00"
                                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 flex-1 min-w-0"
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

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            등록
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 