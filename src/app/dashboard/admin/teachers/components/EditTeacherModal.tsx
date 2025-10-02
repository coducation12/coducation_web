"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Select 컴포넌트 제거 - 담당과목은 직접 입력으로 변경
import ImageUpload from "@/components/ui/image-upload";
import { updateTeacher, getTeacherDetails } from "@/lib/actions";

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    status: string;
    createdAt: string;
}

interface TeacherDetails {
    bio?: string;
    certs?: string;
    career?: string;
    image?: string;
    subject?: string;
}

interface EditTeacherModalProps {
    teacher: Teacher | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export interface EditTeacherFormData {
    email: string;
    name: string;
    phone: string;
    password: string;
    bio: string;
    certs: string;
    career: string;
    image: string;
    subject: string;
}

// 담당과목은 직접 입력으로 변경되어 옵션 배열 불필요

export default function EditTeacherModal({ teacher, isOpen, onClose, onUpdate }: EditTeacherModalProps) {
    const [formData, setFormData] = useState<EditTeacherFormData>({
        email: "",
        name: "",
        phone: "",
        password: "",
        bio: "",
        certs: "",
        career: "",
        image: "",
        subject: ""
    });
    const [loading, setLoading] = useState(false);
    const [teacherDetails, setTeacherDetails] = useState<TeacherDetails>({});

    // 강사 정보가 변경되면 폼 데이터 초기화
    useEffect(() => {
        if (teacher && isOpen) {
            setFormData({
                email: teacher.email || "",
                name: teacher.name || "",
                phone: teacher.phone || "",
                password: "", // 비밀번호는 빈 상태로 시작 (변경할 때만 입력)
                bio: "",
                certs: "",
                career: "",
                image: "",
                subject: teacher.subject || "" // 빈 값으로 시작
            });
            
            // teachers 테이블에서 상세 정보 가져오기
            fetchTeacherDetails(teacher.id);
        }
    }, [teacher, isOpen]);

    const fetchTeacherDetails = async (teacherId: string) => {
        try {
            const result = await getTeacherDetails(teacherId);
            if (result.success && result.data) {
                const details = result.data;
                setTeacherDetails(details);
                setFormData(prev => ({
                    ...prev,
                    bio: details.bio || "",
                    certs: details.certs || "",
                    career: details.career || "",
                    image: details.image || "",
                    subject: details.subject || prev.subject || ""
                }));
            }
        } catch (error) {
            console.error('강사 상세 정보 조회 실패:', error);
        }
    };

    const handleInputChange = (field: keyof EditTeacherFormData, value: string) => {
        console.log('handleInputChange 호출:', { field, value });
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!teacher) return;

        // 필수 필드 검증
        if (!formData.email || !formData.name || !formData.phone) {
            alert("이메일, 이름, 연락처는 필수 항목입니다.");
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

        // 비밀번호 길이 검증 (입력된 경우에만)
        if (formData.password && formData.password.length < 6) {
            alert("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            console.log('제출할 formData:', formData);
            
            // FormData 생성
            const submitFormData = new FormData();
            submitFormData.append('teacherId', teacher.id);
            submitFormData.append('email', formData.email);
            submitFormData.append('name', formData.name);
            submitFormData.append('phone', formData.phone);
            if (formData.password) {
                submitFormData.append('password', formData.password);
            }
            submitFormData.append('bio', formData.bio);
            submitFormData.append('certs', formData.certs);
            submitFormData.append('career', formData.career);
            submitFormData.append('image', formData.image);
            submitFormData.append('subject', formData.subject);
            
            console.log('제출할 이미지 URL:', formData.image);

            // 서버 액션 호출
            const result = await updateTeacher(submitFormData);

            if (result.success) {
                alert("강사 정보가 성공적으로 수정되었습니다.");
                onClose();
                onUpdate(); // 목록 새로고침
            } else {
                alert(result.error || "강사 정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error('강사 정보 수정 오류:', error);
            alert("강사 정보 수정 중 오류가 발생했습니다.");
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
            bio: "",
            certs: "",
            career: "",
            image: "",
            subject: ""
        });
        onClose();
    };

    if (!teacher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl font-bold">강사 정보 수정</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* 기본 정보 섹션 */}
                    <div className="space-y-4">
                        <h3 className="text-cyan-200 text-lg font-semibold border-b border-cyan-500/30 pb-2">기본 정보</h3>
                        
                        {/* 프로필 이미지 */}
                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => handleInputChange("image", url)}
                            label="프로필 이미지"
                        />
                        
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
                            <Label htmlFor="password" className="text-cyan-200">비밀번호 <span className="text-cyan-400 text-xs">(변경할 경우에만 입력)</span></Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                placeholder="새 비밀번호 (최소 6자)"
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
                    </div>

                    {/* 상세 정보 섹션 */}
                    <div className="space-y-4">
                        <h3 className="text-cyan-200 text-lg font-semibold border-b border-cyan-500/30 pb-2">상세 정보</h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-cyan-200">소개</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                placeholder="강사 소개를 입력하세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certs" className="text-cyan-200">자격증/인증</Label>
                            <Textarea
                                id="certs"
                                value={formData.certs}
                                onChange={(e) => handleInputChange("certs", e.target.value)}
                                placeholder="보유 자격증이나 인증을 입력하세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 min-h-[60px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="career" className="text-cyan-200">경력사항</Label>
                            <Textarea
                                id="career"
                                value={formData.career}
                                onChange={(e) => handleInputChange("career", e.target.value)}
                                placeholder="경력사항을 입력하세요"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 min-h-[80px]"
                            />
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
                            disabled={loading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "수정 중..." : "수정"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
