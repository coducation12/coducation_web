"use client"
import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/image-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Camera, Lock, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { StudentCard, StudentHeading, StudentSectionTitle, studentButtonStyles, studentInputStyles } from '@/app/dashboard/student/components/StudentThemeProvider'
import { cn } from '@/lib/utils'

interface ParentProfileClientProps {
  user: {
    id: string;
    name: string;
    role: string;
    email?: string;
    profile_image_url?: string;
    phone?: string;
    academy?: string;
  };
}

export function ParentProfileClient({ user }: ParentProfileClientProps) {
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string>('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (user?.profile_image_url) {
      setProfileImage(user.profile_image_url)
    } else {
      const savedImage = localStorage.getItem('profile_image')
      setProfileImage(savedImage || '')
    }
  }, [user])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "오류",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "오류",
        description: "파일 크기는 5MB를 초과할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const compressedBlob = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        outputFormat: 'webp'
      })

      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
        lastModified: Date.now(),
      })

      const cleanFileName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `profile-images/${user?.id}-${Date.now()}-${cleanFileName}`

      const { data, error } = await supabase.storage
        .from('content-images')
        .upload(fileName, compressedFile, {
          cacheControl: '31536000',
          upsert: true
        })

      if (error) {
        throw new Error(error.message)
      }

      const { data: urlData } = supabase.storage
        .from('content-images')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: urlData.publicUrl })
        .eq('id', user?.id)

      if (updateError) {
        throw new Error(`프로필 이미지 저장 실패: ${updateError.message}`)
      }

      setProfileImage(urlData.publicUrl)
      localStorage.setItem('profile_image', urlData.publicUrl)
      window.dispatchEvent(new CustomEvent('profileImageUpdated'))

      toast({
        title: "성공",
        description: "프로필 이미지가 업데이트되었습니다.",
      })
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      toast({
        title: "오류",
        description: `이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!user?.id) {
      setPasswordError('로그인이 필요합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('새 비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setPasswordLoading(true)

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single()

      if (fetchError || !userData) {
        setPasswordError('사용자 정보를 불러올 수 없습니다.')
        return
      }

      const bcrypt = await import('bcryptjs')
      const match = await bcrypt.compare(currentPassword, userData.password)

      if (!match) {
        setPasswordError('현재 비밀번호가 올바르지 않습니다.')
        return
      }

      const hashed = await bcrypt.hash(newPassword, 10)
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashed })
        .eq('id', user.id)

      if (updateError) {
        setPasswordError('비밀번호 변경에 실패했습니다.')
        return
      }

      setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setPasswordError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 px-4 py-4 lg:px-12 lg:py-10 box-border overflow-y-auto no-scrollbar pt-16 lg:pt-2">
      <div className="max-w-4xl mx-auto space-y-8">
        <StudentHeading size="h1" className="mb-8">내 정보</StudentHeading>

        {/* 프로필 이미지 섹션 */}
        <StudentCard className="p-0 overflow-hidden">
          <div className="bg-cyan-950/30 p-4 border-b border-cyan-400/20">
            <StudentSectionTitle icon={<User className="w-5 h-5" />}>
              프로필 이미지
            </StudentSectionTitle>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-2 border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <AvatarImage src={profileImage} alt="프로필 이미지" />
                <AvatarFallback className="bg-cyan-900/50 text-cyan-100 text-2xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <Label htmlFor="profile-image" className="cursor-pointer block">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                    studentButtonStyles.secondary
                  )}>
                    <Camera className="w-4 h-4" />
                    {uploading ? '업로드 중...' : '이미지 변경'}
                  </div>
                </Label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="text-sm text-cyan-400/80">
                  JPG, PNG, WEBP 형식, 최대 5MB
                </p>
              </div>
            </div>
          </div>
        </StudentCard>

        {/* 기본 정보 섹션 */}
        <StudentCard className="p-0 overflow-hidden">
          <div className="bg-cyan-950/30 p-4 border-b border-cyan-400/20">
            <StudentSectionTitle>기본 정보</StudentSectionTitle>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-cyan-400 ml-1">이름</Label>
                <Input
                  value={user.name || ''}
                  disabled
                  className={cn(studentInputStyles, "opacity-80")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 ml-1">역할</Label>
                <Input
                  value={user.role === 'parent' ? '학부모' : user.role}
                  disabled
                  className={cn(studentInputStyles, "opacity-80")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 ml-1">이메일</Label>
                <Input
                  value={user.email || ''}
                  disabled
                  className={cn(studentInputStyles, "opacity-80")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 ml-1">연락처</Label>
                <Input
                  value={user.phone || '-'}
                  disabled
                  className={cn(studentInputStyles, "opacity-80")}
                />
              </div>
            </div>
          </div>
        </StudentCard>

        {/* 비밀번호 변경 섹션 */}
        <StudentCard className="p-0 overflow-hidden mb-12">
          <div className="bg-cyan-950/30 p-4 border-b border-cyan-400/20">
            <StudentSectionTitle icon={<Lock className="w-5 h-5" />}>
              비밀번호 변경
            </StudentSectionTitle>
          </div>
          <div className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-cyan-400 ml-1">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className={studentInputStyles}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-cyan-400 ml-1">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className={studentInputStyles}
                  placeholder="새 비밀번호 (6자 이상)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-cyan-400 ml-1">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className={studentInputStyles}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              {passwordError && (
                <div className="text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  {passwordSuccess}
                </div>
              )}

              <Button
                type="submit"
                disabled={passwordLoading}
                className={cn(
                  "w-full sm:w-auto mt-2 px-8 py-2 font-bold transition-all duration-200",
                  studentButtonStyles.primary
                )}
              >
                <Save className="w-4 h-4 mr-2" />
                {passwordLoading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </form>
          </div>
        </StudentCard>
      </div>
    </div>
  )
}
