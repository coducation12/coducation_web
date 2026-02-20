'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { User, Save, Lock, Plus, X } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { updateMyTeacherProfile } from "@/lib/actions";

interface Certificate {
  name: string;
  issuer: string;
  date: string;
}

interface Career {
  company: string;
  position: string;
  period: string;
}

interface TeacherProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    profile_image_url?: string;
    phone?: string;
    academy?: string;
    birth_year?: number;
    role: string;
  };
}

export default function TeacherProfileClient({ user }: TeacherProfileClientProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    academy: user.academy || '',
    position: '',
    bio: '',
    profile_image_url: user.profile_image_url || ''
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchTeacherInfo();
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teacherError && teacherError.code !== 'PGRST116') {
        console.error('강사 정보 조회 실패:', teacherError);
      }

      if (teacherData) {
        setFormData(prev => ({
          ...prev,
          position: teacherData.position || '',
          bio: teacherData.bio || ''
        }));

        // JSON 데이터 파싱
        setCertificates(Array.isArray(teacherData.certs) ? teacherData.certs : []);
        setCareers(Array.isArray(teacherData.career) ? teacherData.career : []);
      }

    } catch (error) {
      console.error('사용자 정보 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 자격증 관리
  const addCertificate = () => {
    setCertificates([...certificates, { name: '', issuer: '', date: '' }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...certificates];
    updated[index][field] = value;
    setCertificates(updated);
  };

  // 경력 관리
  const addCareer = () => {
    setCareers([...careers, { company: '', position: '', period: '' }]);
  };

  const removeCareer = (index: number) => {
    setCareers(careers.filter((_, i) => i !== index));
  };

  const updateCareer = (index: number, field: keyof Career, value: string) => {
    const updated = [...careers];
    updated[index][field] = value;
    setCareers(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateMyTeacherProfile(user.id, {
        phone: formData.phone,
        academy: formData.academy,
        position: formData.position,
        profile_image_url: formData.profile_image_url,
        bio: formData.bio,
        certs: certificates,
        career: careers
      });

      if (!result.success) {
        toast({
          title: "오류",
          description: result.error || "정보 업데이트에 실패했습니다.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "성공",
        description: "정보가 성공적으로 업데이트되었습니다.",
      });

      await fetchTeacherInfo();

    } catch (error) {
      console.error('정보 업데이트 중 오류:', error);
      toast({
        title: "오류",
        description: "정보 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "오류",
        description: "모든 비밀번호 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('비밀번호 변경 실패:', error);
        toast({
          title: "오류",
          description: `비밀번호 변경에 실패했습니다: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });

      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('비밀번호 변경 중 오류:', error);
      toast({
        title: "오류",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
        <div className="text-cyan-100">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">내 정보 수정</h1>

      <div className="grid gap-6">
        {/* 기본 정보 + 비밀번호 변경 통합 카드 */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 이미지 + 기본 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
              {/* 프로필 이미지 */}
              <div className="flex flex-col items-center">
                <ImageUpload
                  value={formData.profile_image_url}
                  onChange={(url) => handleInputChange('profile_image_url', url)}
                  className="w-40 h-40 aspect-square"
                />
              </div>

              {/* 기본 정보 필드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-cyan-200">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    disabled
                    className="bg-cyan-900/10 border-cyan-500/20 text-cyan-300 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyan-200">이메일 (아이디)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-cyan-900/10 border-cyan-500/20 text-cyan-300 cursor-not-allowed"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-cyan-200">연락처</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                    placeholder="연락처를 입력하세요"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-cyan-200">직위 / 직책</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                    placeholder="예: 선임강사, 실장, 대표"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academy" className="text-cyan-200">소속 학원</Label>
                  <Select
                    value={formData.academy}
                    onValueChange={(value) => handleInputChange('academy', value)}
                  >
                    <SelectTrigger className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100">
                      <SelectValue placeholder="소속 학원을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding-maker">코딩메이커학원</SelectItem>
                      <SelectItem value="gwangyang-coding">광양코딩학원</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 비밀번호 변경 섹션 */}
            <div className="border-t border-cyan-500/20 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-cyan-200" />
                <h3 className="text-lg font-semibold text-cyan-100">비밀번호 변경</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-cyan-200">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                    placeholder="새 비밀번호 (최소 6자)"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-cyan-200">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                    placeholder="새 비밀번호 확인"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                {changingPassword ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 강사 추가 정보 카드 */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-100">강사 추가 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 자기소개 */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-cyan-200">자기소개</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 min-h-[100px]"
                placeholder="자기소개를 입력하세요"
              />
            </div>

            {/* 자격증 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-cyan-200">자격증</Label>
                <Button
                  type="button"
                  onClick={addCertificate}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              </div>
              {certificates.length === 0 ? (
                <p className="text-cyan-300/50 text-sm">+ 버튼을 눌러 자격증을 추가하세요</p>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert, index) => (
                    <div key={index} className="space-y-3 p-4 bg-cyan-900/10 rounded-lg border border-cyan-500/20">
                      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs text-cyan-300">자격증명</Label>
                          <Input
                            value={cert.name}
                            onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                            className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 h-9"
                            placeholder="예: 정보처리기사"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-cyan-300">발급기관</Label>
                          <Input
                            value={cert.issuer}
                            onChange={(e) => updateCertificate(index, 'issuer', e.target.value)}
                            className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 h-9"
                            placeholder="예: 한국산업인력공단"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-cyan-300">취득일</Label>
                          <Input
                            value={cert.date}
                            onChange={(e) => updateCertificate(index, 'date', e.target.value)}
                            className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 h-9"
                            placeholder="예: 2020-05"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          size="sm"
                          variant="destructive"
                          className="h-9"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 경력 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-cyan-200">경력</Label>
                <Button
                  type="button"
                  onClick={addCareer}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              </div>
              {careers.length === 0 ? (
                <p className="text-cyan-300/50 text-sm">+ 버튼을 눌러 경력을 추가하세요</p>
              ) : (
                <div className="space-y-3">
                  {careers.map((career, index) => (
                    <div key={index} className="space-y-3 p-4 bg-cyan-900/10 rounded-lg border border-cyan-500/20">
                      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs text-cyan-300">회사/기관명</Label>
                          <Input
                            value={career.company}
                            onChange={(e) => updateCareer(index, 'company', e.target.value)}
                            className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 h-9"
                            placeholder="예: ABC 코딩학원"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-cyan-300">직책</Label>
                          <Input
                            value={career.position}
                            onChange={(e) => updateCareer(index, 'position', e.target.value)}
                            className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 h-9"
                            placeholder="예: 강사"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-cyan-300">기간</Label>
                          <Input
                            value={career.period}
                            onChange={(e) => updateCareer(index, 'period', e.target.value)}
                            className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 h-9"
                            placeholder="예: 2019.03 - 2022.12"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeCareer(index)}
                          size="sm"
                          variant="destructive"
                          className="h-9"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
