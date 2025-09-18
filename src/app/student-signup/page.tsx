'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { submitStudentSignup } from '@/lib/actions'

interface Teacher {
  id: string
  name: string
  academy: string
}

// 휴대폰번호 포맷팅 함수
const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^0-9]/g, '');
  
  // 11자리 제한
  if (numbers.length > 11) {
    return numbers.slice(0, 11);
  }
  
  // 하이픈 추가 (3-4-4 형식)
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
};

export default function StudentSignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthYear: '',
    phone: '',
    academy: '',
    assignedTeacherId: ''
  })
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // 교사 목록 불러오기
  useEffect(() => {
    const fetchTeachers = async () => {
      setTeachersLoading(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, academy')
          .eq('role', 'teacher')
          .order('name')

        if (error) {
          console.error('교사 목록 조회 오류:', error)
          setError('교사 목록을 불러오는 중 오류가 발생했습니다.')
          return
        }
        
        setTeachers(data || [])
      } catch (error) {
        console.error('교사 목록 불러오기 실패:', error)
        setError('교사 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setTeachersLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // 휴대폰번호 입력 처리
  const handlePhoneChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value)
    setFormData(prev => ({ ...prev, phone: formattedValue }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('아이디를 입력해주세요.')
      return false
    }
    if (formData.username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다.')
      return false
    }
    if (!formData.password) {
      setError('비밀번호를 입력해주세요.')
      return false
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.')
      return false
    }
    if (!formData.phone.trim()) {
      setError('휴대폰번호를 입력해주세요.')
      return false
    }
    if (!formData.phone.match(/^01[0-9]-\d{3,4}-\d{4}$/)) {
      setError('휴대폰번호 형식이 올바르지 않습니다. (예: 010-1234-5678)')
      return false
    }
    if (!formData.academy) {
      setError('학원을 선택해주세요.')
      return false
    }
    if (!formData.assignedTeacherId) {
      setError('담당 교사를 선택해주세요.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // 가입 요청 데이터 검증
      console.log('가입 요청 데이터:', {
        username: formData.username,
        name: formData.name,
        phone: formData.phone,
        academy: formData.academy,
        assigned_teacher_id: formData.assignedTeacherId
      })

      // FormData로 변환하여 서버 액션 호출 (강사 추가 로직과 동일한 방식)
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('username', formData.username)
      formDataToSubmit.append('name', formData.name)
      formDataToSubmit.append('password', formData.password)
      formDataToSubmit.append('phone', formData.phone)
      formDataToSubmit.append('birthYear', formData.birthYear)
      formDataToSubmit.append('academy', formData.academy)
      formDataToSubmit.append('assignedTeacherId', formData.assignedTeacherId || '')

      // 서버 액션 호출
      const result = await submitStudentSignup(formDataToSubmit)

      if (result.success) {
        // 성공 메시지 표시
        alert('가입요청이 되었습니다. 담당교사의 승인을 기다려주세요.')
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(result.error || '가입 요청 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('가입 요청 실패:', error)
      setError('가입 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 선택된 학원에 따른 교사 필터링
  const filteredTeachers = teachers.filter(teacher => 
    !formData.academy || teacher.academy === formData.academy
  )

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <Card className="mx-auto max-w-md w-full bg-black/40 border-sky-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">학생 회원가입</CardTitle>
          <CardDescription className="text-gray-300">
            가입 요청 후 담당 교사의 승인을 받아야 합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-white">아이디 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="3자 이상"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-white">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="실명"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="6자 이상"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">비밀번호 확인 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="비밀번호 재입력"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-white">휴대폰번호 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-1234-5678"
                disabled={loading}
                maxLength={13}
              />
            </div>

            <div>
              <Label htmlFor="birthYear" className="text-white">출생년도</Label>
              <Input
                id="birthYear"
                type="number"
                value={formData.birthYear}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                placeholder="예: 2010"
                min="1990"
                max="2024"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="academy" className="text-white">학원 *</Label>
              <Select
                value={formData.academy}
                onValueChange={(value) => {
                  handleInputChange('academy', value)
                  handleInputChange('assignedTeacherId', '') // 학원 변경 시 교사 선택 초기화
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="학원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding-maker">코딩메이커</SelectItem>
                  <SelectItem value="gwangyang-coding">광양코딩</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teacher" className="text-white">담당 교사 *</Label>
              <Select
                value={formData.assignedTeacherId}
                onValueChange={(value) => handleInputChange('assignedTeacherId', value)}
                disabled={loading || !formData.academy || teachersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    teachersLoading 
                      ? "교사 목록을 불러오는 중..." 
                      : "담당 교사를 선택하세요"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.academy && (
                <p className="text-xs text-gray-400 mt-1">먼저 학원을 선택해주세요</p>
              )}
              {teachersLoading && (
                <p className="text-xs text-gray-400 mt-1">교사 목록을 불러오는 중...</p>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sky-400 text-sm text-center bg-sky-900/20 p-2 rounded">
                가입 요청이 완료되었습니다! 담당 교사의 승인을 기다려주세요.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold"
              disabled={loading}
            >
              {loading ? '가입 요청 중...' : '가입 요청'}
            </Button>

            <div className="text-center text-gray-400">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                로그인
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
