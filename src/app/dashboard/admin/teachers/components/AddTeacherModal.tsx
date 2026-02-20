"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ui/image-upload";
import { Plus } from "lucide-react";
import { addTeacher } from "@/lib/actions";

interface AddTeacherModalProps {
    onAddTeacher: () => void; // 강사 목록 새로고침용 콜백
}

export interface TeacherFormData {
    email: string;
    name: string;
    phone: string;
    password: string;
    subject: string;
    image: string;
    position: string;
    label_color: string;
}

// 담당과목은 직접 입력으로 변경

export default function AddTeacherModal({ onAddTeacher }: AddTeacherModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<TeacherFormData>({
        email: "",
        name: "",
        phone: "",
        password: "",
        subject: "",
        image: "",
        position: "",
        label_color: "#00fff7"
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: keyof TeacherFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        // 필수 필드 검증
        if (!formData.email || !formData.name || !formData.phone || !formData.password || !formData.subject) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("올바른 이메일 형식을 입력해주세요.");
            return;
        }

        // 전화번호 형식 검증
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)");
            return;
        }

        // 비밀번호 길이 검증
        if (formData.password.length < 6) {
            alert("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            // FormData 생성
            const submitFormData = new FormData();
            submitFormData.append('email', formData.email);
            submitFormData.append('name', formData.name);
            submitFormData.append('phone', formData.phone);
            submitFormData.append('password', formData.password);
            submitFormData.append('subject', formData.subject);
            submitFormData.append('image', formData.image);
            submitFormData.append('position', formData.position);
            submitFormData.append('label_color', formData.label_color);

            // 서버 액션 호출
            const result = await addTeacher(submitFormData);

            if (result.success) {
                alert("강사가 성공적으로 등록되었습니다.");
                setFormData({
                    email: "",
                    name: "",
                    phone: "",
                    password: "",
                    subject: "",
                    image: "",
                    position: "",
                    label_color: "#00fff7"
                });
                setOpen(false);
                onAddTeacher(); // 목록 새로고침
            } else {
                alert(result.error || "강사 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error('강사 등록 오류:', error);
            alert("강사 등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            email: "",
            name: "",
            phone: "",
            password: "",
            subject: "",
            image: "",
            position: "",
            label_color: "#00fff7"
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
            <DialogContent className="max-w-md bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl font-bold">새 강사 등록</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 프로필 이미지 (축소 및 가운데 정렬) */}
                    <div className="flex justify-center">
                        <div className="w-1/3">
                            <ImageUpload
                                value={formData.image}
                                onChange={(url) => handleInputChange("image", url)}
                                label="프로필 이미지"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-cyan-200">이메일 (로그인 ID) *</Label>
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
                        <Label htmlFor="password" className="text-cyan-200">비밀번호 *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            placeholder="최소 6자 이상"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position" className="text-cyan-200">직위 / 직책</Label>
                        <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => handleInputChange("position", e.target.value)}
                            placeholder="예: 원장, 수석강사, 팀장"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-cyan-200">담당 과목 *</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleInputChange("subject", e.target.value)}
                            placeholder="담당 과목을 입력하세요 (예: React, Python, 웹 개발)"
                            className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                        />
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
                            disabled={loading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "등록 중..." : "등록"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// 강사 등록이 완료되면 즉시 users 테이블에 role='teacher'로 등록되고 teachers 테이블에도 상세 정보가 추가됩니다.