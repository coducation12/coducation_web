"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
// Select 컴포넌트 제거 - 담당과목은 직접 입력으로 변경
import ImageUpload from "@/components/ui/image-upload";
import { updateTeacher, getTeacherDetails, deleteTeacher } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    position: string;
    status: string;
    createdAt: string;
    image?: string;
    labelColor?: string;
}

interface TeacherDetails {
    bio?: string;
    certs?: string;
    career?: string;
    image?: string;
    subject?: string;
    position?: string;
    label_color?: string;
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
    position: string;
    label_color: string;
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
        subject: "",
        position: "",
        label_color: "#00fff7"
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
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
                subject: teacher.subject || "", // 빈 값으로 시작
                position: teacher.position || "",
                label_color: teacher.labelColor || "#00fff7"
            });

            // teachers 테이블에서 상세 정보 가져오기
            fetchTeacherDetails(teacher.id);
        }
    }, [teacher, isOpen]);

    const fetchTeacherDetails = async (teacherId: string) => {
        try {
            const result = await getTeacherDetails(teacherId);
            if (result.success && result.data) {
                const details = result.data as TeacherDetails;
                setTeacherDetails(details);
                setFormData(prev => ({
                    ...prev,
                    bio: details.bio || "",
                    certs: Array.isArray(details.certs) ? JSON.stringify(details.certs, null, 2) : (details.certs || ""),
                    career: Array.isArray(details.career) ? JSON.stringify(details.career, null, 2) : (details.career || ""),
                    image: details.image || "",
                    subject: details.subject || prev.subject || "",
                    position: details.position || "",
                    label_color: details.label_color || prev.label_color || "#00fff7"
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
            toast({
                title: "입력 오류",
                description: "이메일, 이름, 연락처는 필수 항목입니다.",
                variant: "destructive",
            });
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast({
                title: "입력 오류",
                description: "올바른 이메일 형식을 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        // 전화번호 형식 검증
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast({
                title: "입력 오류",
                description: "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)",
                variant: "destructive",
            });
            return;
        }

        // 비밀번호 길이 검증 (입력된 경우에만)
        if (formData.password && formData.password.length < 6) {
            toast({
                title: "입력 오류",
                description: "비밀번호는 최소 6자 이상이어야 합니다.",
                variant: "destructive",
            });
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
            submitFormData.append('position', formData.position);
            submitFormData.append('label_color', formData.label_color);

            console.log('제출할 이미지 URL:', formData.image);

            // 서버 액션 호출
            const result = await updateTeacher(submitFormData);

            if (result.success) {
                toast({
                    title: "강사 정보 수정 완료",
                    description: "강사 정보가 성공적으로 수정되었습니다.",
                });
                onClose();
                onUpdate(); // 목록 새로고침
            } else {
                toast({
                    title: "강사 정보 수정 실패",
                    description: result.error || "강사 정보 수정에 실패했습니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('강사 정보 수정 오류:', error);
            toast({
                title: "오류 발생",
                description: "강사 정보 수정 중 오류가 발생했습니다.",
                variant: "destructive",
            });
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
            subject: "",
            position: "",
            label_color: "#00fff7"
        });
        onClose();
    };

    if (!teacher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 max-h-[80vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle className="text-cyan-100 text-xl font-bold">강사 정보 수정</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 기본 정보 섹션 */}
                    <div className="space-y-4">
                        <h3 className="text-cyan-200 text-lg font-semibold border-b border-cyan-500/30 pb-2">기본 정보</h3>

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

                        <div className="space-y-2">
                            <Label htmlFor="position" className="text-cyan-200">직위 / 직책</Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={(e) => handleInputChange("position", e.target.value)}
                                placeholder="예: 선임강사, 실장, 대표"
                                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                            />
                        </div>

                    </div>

                    {/* 상세 정보 섹션 (읽기 전용 / 공용 모달 스타일 적용) */}
                    <div className="space-y-4">
                        <h3 className="text-cyan-200 text-lg font-semibold border-b border-cyan-500/30 pb-2">상세 정보</h3>

                        {/* 자기소개 */}
                        <div className="space-y-2">
                            <Label className="text-cyan-200">자기소개</Label>
                            <Card className="bg-cyan-900/10 border-cyan-500/20">
                                <CardContent className="py-4">
                                    <p className="text-cyan-100 leading-relaxed whitespace-pre-line text-sm">
                                        {formData.bio || "등록된 자기소개가 없습니다."}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 자격증 정보 */}
                        <div className="space-y-2">
                            <Label className="text-cyan-200">자격증</Label>
                            <Card className="bg-cyan-900/10 border-cyan-500/20">
                                <CardContent className="py-4">
                                    {(() => {
                                        try {
                                            const certs = typeof formData.certs === 'string' ? JSON.parse(formData.certs) : formData.certs;
                                            if (Array.isArray(certs) && certs.length > 0) {
                                                return (
                                                    <div className="grid grid-cols-[1.2fr_1fr_auto] gap-x-4 gap-y-3 items-baseline">
                                                        {certs.map((item: any, index: number) => (
                                                            <Fragment key={index}>
                                                                <span className="text-cyan-100 font-medium text-xs md:text-sm line-clamp-1 pb-1 border-b border-cyan-500/5">{item.name}</span>
                                                                <span className="text-cyan-200/80 text-[10px] md:text-xs line-clamp-1 pb-1 border-b border-cyan-500/5">{item.issuer}</span>
                                                                <span className="text-cyan-200/50 text-[10px] md:text-xs font-mono whitespace-nowrap text-right pb-1 border-b border-cyan-500/5">{item.date}</span>
                                                            </Fragment>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                        } catch (e) { }
                                        return <p className="text-cyan-200/50 text-xs">등록된 자격증이 없습니다.</p>;
                                    })()}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 경력 정보 */}
                        <div className="space-y-2">
                            <Label className="text-cyan-200">경력</Label>
                            <Card className="bg-cyan-900/10 border-cyan-500/20">
                                <CardContent className="py-4">
                                    {(() => {
                                        try {
                                            const careers = typeof formData.career === 'string' ? JSON.parse(formData.career) : formData.career;
                                            if (Array.isArray(careers) && careers.length > 0) {
                                                return (
                                                    <div className="grid grid-cols-[1.2fr_1fr_auto] gap-x-4 gap-y-3 items-baseline">
                                                        {careers.map((item: any, index: number) => (
                                                            <Fragment key={index}>
                                                                <span className="text-cyan-100 font-medium text-xs md:text-sm line-clamp-1 pb-1 border-b border-cyan-500/5">{item.company}</span>
                                                                <span className="text-cyan-200/80 text-[10px] md:text-xs line-clamp-1 pb-1 border-b border-cyan-500/5">{item.position}</span>
                                                                <span className="text-cyan-200/50 text-[10px] md:text-xs font-mono whitespace-nowrap text-right pb-1 border-b border-cyan-500/5">{item.period}</span>
                                                            </Fragment>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                        } catch (e) { }
                                        return <p className="text-cyan-200/50 text-xs">등록된 경력 사항이 없습니다.</p>;
                                    })()}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-between items-center pt-4 border-t border-cyan-500/20">
                        <Button
                            type="button"
                            onClick={async () => {
                                if (confirm('정말로 이 강사를 삭제하시겠습니까?')) {
                                    setLoading(true);
                                    try {
                                        const result = await deleteTeacher(teacher.id);
                                        if (result.success) {
                                            alert(result.message);
                                            onClose();
                                            onUpdate();
                                        } else {
                                            alert(result.error);
                                        }
                                    } catch (error) {
                                        alert('강사 삭제 중 오류가 발생했습니다.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            variant="destructive"
                            className="bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-500/30"
                        >
                            삭제
                        </Button>
                        <div className="flex gap-3">
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
                                {loading ? "처리 중..." : "정보 업데이트"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
