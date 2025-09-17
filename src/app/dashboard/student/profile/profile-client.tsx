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

interface StudentProfileClientProps {
  user: {
    id: string;
    name: string;
    role: string;
    email?: string;
    grade?: string;
    phone?: string;
    academy?: string;
    birth_year?: number;
  };
}

export function StudentProfileClient({ user }: StudentProfileClientProps) {
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string>('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    // DB에서 프로필 이미지 불러오기 (우선순위), 로컬 스토리지는 fallback
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

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      toast({
        title: "오류",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      toast({
        title: "오류",
        description: "파일 크기는 5MB를 초과할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // 이미지 압축
      const compressedBlob = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        outputFormat: 'webp'
      })

      // 압축된 파일을 File 객체로 변환
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
        lastModified: Date.now(),
      })

      // 파일명 정리
      const cleanFileName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `profile-images/${user?.id}-${Date.now()}-${cleanFileName}`

      // Supabase Storage에 업로드 (기존 content-images 버킷 사용)
      const { data, error } = await supabase.storage
        .from('content-images')
        .upload(fileName, compressedFile, {
          cacheControl: '31536000',
          upsert: true
        })

      if (error) {
        throw new Error(error.message)
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('content-images')
        .getPublicUrl(fileName)

      // users 테이블에 프로필 이미지 URL 저장
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: urlData.publicUrl })
        .eq('id', user?.id)

      if (updateError) {
        throw new Error(`프로필 이미지 저장 실패: ${updateError.message}`)
      }

      // 프로필 이미지 상태 업데이트
      setProfileImage(urlData.publicUrl)
      
      // 로컬 스토리지에 저장 (임시)
      localStorage.setItem('profile_image', urlData.publicUrl)
      
      // 커스텀 이벤트 발생으로 사이드바 업데이트
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
      // 현재 비밀번호 확인
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single()

      if (fetchError || !userData) {
        setPasswordError('사용자 정보를 불러올 수 없습니다.')
        return
      }

      // bcrypt를 사용한 비밀번호 확인 (클라이언트에서는 bcryptjs 사용)
      const bcrypt = await import('bcryptjs')
      const match = await bcrypt.compare(currentPassword, userData.password)
      
      if (!match) {
        setPasswordError('현재 비밀번호가 올바르지 않습니다.')
        return
      }

      // 새 비밀번호 해시 후 업데이트
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
    <div className="student-dashboard-content w-full h-full flex-1 min-h-0 px-4 py-4 lg:px-12 lg:py-10 box-border pt-16 lg:pt-2">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-cyan-100 mb-8">내 정보</h1>
        
        {/* 프로필 이미지 섹션 */}
        <Card className="bg-cyan-950/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              프로필 이미지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-2 border-cyan-400/30">
                <AvatarImage src={profileImage} alt="프로필 이미지" />
                <AvatarFallback className="bg-cyan-900/50 text-cyan-100 text-2xl">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile-image" className="text-cyan-100 cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-800/50 hover:bg-cyan-700/50 rounded-lg transition-colors">
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
                <p className="text-sm text-cyan-300">
                  JPG, PNG, WEBP 형식, 최대 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기본 정보 섹션 */}
        <Card className="bg-cyan-950/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-100">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-cyan-300">이름</Label>
                <Input 
                  value={user.name || ''} 
                  disabled 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
              <div>
                <Label className="text-cyan-300">역할</Label>
                <Input 
                  value={user.role || ''} 
                  disabled 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
              <div>
                <Label className="text-cyan-300">이메일</Label>
                <Input 
                  value={user.email || ''} 
                  disabled 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
              <div>
                <Label className="text-cyan-300">학년</Label>
                <Input 
                  value={user.grade || ''} 
                  disabled 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 섹션 */}
        <Card className="bg-cyan-950/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              비밀번호 변경
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-cyan-300">현재 비밀번호</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  required 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-cyan-300">새 비밀번호</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-cyan-300">새 비밀번호 확인</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  className="bg-cyan-900/30 border-cyan-400/20 text-cyan-100"
                />
              </div>
              
              {passwordError && (
                <div className="text-red-400 text-sm">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="text-cyan-400 text-sm">{passwordSuccess}</div>
              )}
              
              <Button 
                type="submit" 
                disabled={passwordLoading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                {passwordLoading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
