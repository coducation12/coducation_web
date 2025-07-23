"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddTeacherModalProps {
    onAddTeacher: (teacherData: TeacherFormData) => void;
}

export interface TeacherFormData {
    teacherId: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    experience: number;
}

const subjects = [
    "React", "Python", "알고리즘", "웹 개발", "JavaScript", "TypeScript", 
    "Node.js", "데이터베이스", "머신러닝", "앱 개발", "Java", "C++"
];

const experienceYears = Array.from({ length: 20 }, (_, i) => i + 1);

export default function AddTeacherModal({ onAddTeacher }: AddTeacherModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<TeacherFormData>({
        teacherId: "",
        name: "",
        email: "",
        phone: "",
        subject: "",
        experience: 1
    });

    const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        // 필수 필드 검증
        if (!formData.teacherId || !formData.name || !formData.phone || !formData.subject) {
            alert("필수 필드를 모두 입력해주세요.");
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

        onAddTeacher(formData);
        setFormData({
            teacherId: "",
            name: "",
            email: "",
            phone: "",
            subject: "",
            experience: 1
        });
        setOpen(false);
    };

    const handleCancel = () => {
        setFormData({
            teacherId: "",
            name: "",
            email: "",
            phone: "",
            subject: "",
            experience: 1
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    강사 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl font-bold">새 강사 등록</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="teacherId" className="text-cyan-200">강사 ID *</Label>
                        <Input
                            id="teacherId"
                            value={formData.teacherId}
                            onChange={(e) => handleInputChange("teacherId", e.target.value)}
                            placeholder="강사 ID를 입력하세요"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-cyan-200">이름 *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="강사 이름을 입력하세요"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-cyan-200">연락처 *</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="예: 010-1234-5678"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
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

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-cyan-200">담당과목 *</Label>
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
                        <Label htmlFor="experience" className="text-cyan-200">경력 *</Label>
                        <Select value={formData.experience.toString()} onValueChange={(value) => handleInputChange("experience", parseInt(value))}>
                            <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                                <SelectValue placeholder="경력을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-cyan-400/40">
                                {experienceYears.map((year) => (
                                    <SelectItem
                                        key={year}
                                        value={year.toString()}
                                        className="text-cyan-100 hover:bg-cyan-900/20"
                                    >
                                        {year}년
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

// TODO: 추후 관리자 계정에서 승인 시 users 테이블에 강사 계정으로 role을 변경하는 로직을 추가할 예정
// 예시: 관리자가 승인 버튼 클릭 → users 테이블의 해당 사용자의 role을 'teacher'로 업데이트