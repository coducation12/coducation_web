'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { User, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  academy: string;
  created_at: string;
}

interface TeacherInfo {
  bio: string;
  image: string;
  certs: string;
  career: string;
}

export default function TeacherProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academy: '',
    bio: '',
    certs: '',
    career: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // 사용자 기본 정보 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('사용자 정보 조회 실패:', userError);
        return;
      }

      // 강사 추가 정보 조회
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teacherError && teacherError.code !== 'PGRST116') {
        console.error('강사 정보 조회 실패:', teacherError);
      }

      setUserInfo(userData);
      setTeacherInfo(teacherData);
      
      // 폼 데이터 설정
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        academy: userData.academy || '',
        bio: teacherData?.bio || '',
        certs: teacherData?.certs || '',
        career: teacherData?.career || ''
      });

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // 사용자 기본 정보 업데이트
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          academy: formData.academy
        })
        .eq('id', user.id);

      if (userError) {
        console.error('사용자 정보 업데이트 실패:', userError);
        toast({
          title: "오류",
          description: "사용자 정보 업데이트에 실패했습니다.",
          variant: "destructive",
        });
        return;
      }

      // 강사 추가 정보 업데이트 (없으면 생성)
      const { error: teacherError } = await supabase
        .from('teachers')
        .upsert({
          user_id: user.id,
          bio: formData.bio,
          certs: formData.certs,
          career: formData.career
        });

      if (teacherError) {
        console.error('강사 정보 업데이트 실패:', teacherError);
        toast({
          title: "오류",
          description: "강사 정보 업데이트에 실패했습니다.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "성공",
        description: "정보가 성공적으로 업데이트되었습니다.",
      });

      // 업데이트된 정보 다시 조회
      await fetchUserInfo();

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

  if (loading) {
    return (
      <div className="p-6 space-y-6 pt-16 lg:pt-2">
        <div className="text-cyan-100">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pt-16 lg:pt-2">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/teacher">
          <Button variant="ghost" size="sm" className="text-cyan-300 hover:text-cyan-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">내 정보 수정</h1>
      </div>

      <div className="grid gap-6">
        {/* 기본 정보 */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-cyan-200">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-cyan-200">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                  placeholder="이메일을 입력하세요"
                  autoComplete="off"
                />
              </div>
              <div>
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
              <div>
                <Label htmlFor="academy" className="text-cyan-200">소속 학원</Label>
                <Input
                  id="academy"
                  value={formData.academy}
                  onChange={(e) => handleInputChange('academy', e.target.value)}
                  className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                  placeholder="소속 학원을 입력하세요"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 강사 추가 정보 */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-100">강사 추가 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio" className="text-cyan-200">자기소개</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 min-h-[100px]"
                placeholder="자기소개를 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="certs" className="text-cyan-200">자격증</Label>
              <Textarea
                id="certs"
                value={formData.certs}
                onChange={(e) => handleInputChange('certs', e.target.value)}
                className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                placeholder="보유 자격증을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="career" className="text-cyan-200">경력</Label>
              <Textarea
                id="career"
                value={formData.career}
                onChange={(e) => handleInputChange('career', e.target.value)}
                className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100"
                placeholder="경력을 입력하세요"
              />
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
