'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Mail, Phone, Building } from 'lucide-react';
import { getCurrentUserClient } from '@/lib/client-auth';
import { updateAdminProfile } from '@/lib/actions';

export const dynamic = 'force-dynamic';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  academy: string;
  profile_image_url?: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUserClient();
      if (user) {
        setProfile(user);
        setFormData({
          name: user.name || '',
          email: user.email || user.username || '', // email이 null이면 username 사용
          phone: user.phone || '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      setMessage({ type: 'error', text: '프로필 정보를 불러오는데 실패했습니다.' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // 비밀번호 변경 시 검증
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' });
        return;
      }

      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: '새 비밀번호는 최소 6자 이상이어야 합니다.' });
        return;
      }
    }

    try {
      setUpdating(true);
      setMessage(null);

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('adminId', profile.id);
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('phone', formData.phone);

      if (formData.newPassword) {
        formDataToSubmit.append('newPassword', formData.newPassword);
      }

      const result = await updateAdminProfile(formDataToSubmit);

      if (result.success) {
        setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
        // 비밀번호 필드 초기화
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
        // 프로필 정보 새로고침
        await loadProfile();
      } else {
        setMessage({ type: 'error', text: result.error || '프로필 업데이트에 실패했습니다.' });
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      setMessage({ type: 'error', text: '프로필 업데이트 중 오류가 발생했습니다.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 pt-16 lg:pt-2">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200">프로필 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-400">프로필 정보를 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">
          관리자 정보 변경
        </h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-100 text-xl font-bold text-center">
              프로필 정보 수정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 메시지 표시 */}
              {message && (
                <Alert className={message.type === 'success' ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'}>
                  <AlertDescription className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* 기본 정보 섹션 */}
              <div className="space-y-4">
                <h3 className="text-cyan-200 text-lg font-semibold border-b border-cyan-500/30 pb-2 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  기본 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cyan-200">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-cyan-200">이메일 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-cyan-200">연락처 *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="예: 010-1234-5678"
                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cyan-200">소속 학원</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
                      <Input
                        value={profile.academy || '코딩메이커'}
                        disabled
                        className="bg-background/20 border-cyan-400/20 text-cyan-300 pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 비밀번호 변경 섹션 */}
              <div className="space-y-4">
                <h3 className="text-cyan-200 text-lg font-semibold border-b border-cyan-500/30 pb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  비밀번호 변경
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-cyan-200">새 비밀번호</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="새 비밀번호를 입력하세요"
                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-cyan-200">비밀번호 확인</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-cyan-300/70">
                    비밀번호를 변경하지 않으려면 비밀번호 필드를 비워두세요.
                  </p>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: profile.name || '',
                      email: profile.email || '',
                      phone: profile.phone || '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setMessage(null);
                  }}
                  className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-900/20"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {updating ? '업데이트 중...' : '정보 수정'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
