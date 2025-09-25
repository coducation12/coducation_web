'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { addStudent } from '@/lib/actions'
import { supabase } from '@/lib/supabase'

interface Teacher {
  id: string
  name: string
  academy: string
}

// 한글을 영문으로 변환하는 함수
const convertKoreanToEnglish = (korean: string): string => {
  const koreanToEnglish: { [key: string]: string } = {
    'ㄱ': 'r', 'ㄴ': 's', 'ㄷ': 'e', 'ㄹ': 'f', 'ㅁ': 'a', 'ㅂ': 'q', 'ㅅ': 't', 'ㅇ': 'd', 'ㅈ': 'w', 'ㅊ': 'c', 'ㅋ': 'z', 'ㅌ': 'x', 'ㅍ': 'v', 'ㅎ': 'g',
    'ㅏ': 'k', 'ㅑ': 'i', 'ㅓ': 'j', 'ㅕ': 'u', 'ㅗ': 'h', 'ㅛ': 'y', 'ㅜ': 'n', 'ㅠ': 'b', 'ㅡ': 'm', 'ㅣ': 'l',
    'ㄲ': 'R', 'ㄸ': 'E', 'ㅃ': 'Q', 'ㅆ': 'T', 'ㅉ': 'W'
  };
  
  let result = '';
  for (let i = 0; i < korean.length; i++) {
    const char = korean[i];
    if (koreanToEnglish[char]) {
      result += koreanToEnglish[char];
    } else {
      result += char;
    }
  }
  return result;
};

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


// 휴대폰번호 유효성 검사 함수
const validatePhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/[^0-9]/g, '');
  return numbers.length === 11 && numbers.startsWith('010');
};



export default function StudentSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    password: '',
    confirmPassword: '',
    phone: '',
    parentPhone: '',
    email: '',
    academy: '',
    assignedTeacherId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // 자동 생성된 아이디 계산
  const generatedUsername = formData.name && formData.birthYear 
    ? `${formData.name}${formData.birthYear.slice(-2)}`
    : '';

  // 교사 목록 상태 추가
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teachersLoading, setTeachersLoading] = useState(true)

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
  const handlePhoneChange = (field: 'phone' | 'parentPhone', value: string) => {
    const formattedValue = formatPhoneNumber(value)
    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    setError('')
  }


  const validateForm = () => {
    // 필수 필드 검증
    if (!formData.name || !formData.birthYear || !formData.password || 
        !formData.confirmPassword || !formData.phone || !formData.academy || !formData.assignedTeacherId) {
      setError("필수 필드를 모두 입력해주세요.");
      return false;
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    // 비밀번호 길이 검증
    if (formData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return false;
    }

    // 생년 형식 검증
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(formData.birthYear)) {
      setError('출생년도를 4자리(yyyy)로 입력해주세요.');
      return false;
    }

    // 생년 유효성 검증 (1900년 ~ 현재년도)
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(formData.birthYear);
    if (birthYear < 1900 || birthYear > currentYear) {
      setError('올바른 출생년도를 입력해주세요.');
      return false;
    }


    // 이메일 형식 검증 (입력된 경우에만)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("올바른 이메일 형식을 입력해주세요.");
        return false;
      }
    }

    // 전화번호 형식 검증
    if (!validatePhoneNumber(formData.phone)) {
      setError("올바른 휴대폰번호를 입력해주세요. (010으로 시작하는 11자리)");
      return false;
    }
    if (formData.parentPhone && !validatePhoneNumber(formData.parentPhone)) {
      setError("올바른 학부모 휴대폰번호를 입력해주세요. (010으로 시작하는 11자리)");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // FormData로 변환하여 서버 액션 호출
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('studentId', generatedUsername)
      formDataToSubmit.append('name', formData.name)
      formDataToSubmit.append('birthYear', formData.birthYear)
      formDataToSubmit.append('password', formData.password)
      formDataToSubmit.append('subject', '프로그래밍') // 기본값으로 설정
      formDataToSubmit.append('phone', formData.phone)
      formDataToSubmit.append('parentPhone', formData.parentPhone || '')
      formDataToSubmit.append('email', formData.email || '')
      formDataToSubmit.append('classSchedules', JSON.stringify([]))
      formDataToSubmit.append('academy', formData.academy)
      formDataToSubmit.append('assignedTeacherId', formData.assignedTeacherId)

      // 서버 액션 호출
      const result = await addStudent(formDataToSubmit)

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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <Card className="mx-auto max-w-2xl w-full bg-black/40 border-sky-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">학생 회원가입</CardTitle>
          <CardDescription className="text-gray-300">
            가입 요청 후 담당 교사의 승인을 받아야 합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 자동 생성된 아이디 표시 */}
            <div className="bg-sky-900/20 border border-sky-500/30 rounded-lg p-6 text-center">
              <Label className="text-sky-200 font-medium text-lg">자동 생성된 아이디</Label>
              <p className="text-sky-100 text-3xl font-mono font-bold mt-2">
                {generatedUsername || ''}
              </p>
            </div>

            <div className="flex gap-2 w-full min-w-0">
              <div className="flex-1 min-w-0 space-y-2">
                <Label htmlFor="name" className="text-white">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="학생 이름을 입력하세요"
                  className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                  autoComplete="off"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <Label htmlFor="birthYear" className="text-white">출생년도 *</Label>
                <Input
                  id="birthYear"
                  type="text"
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange("birthYear", e.target.value)}
                  placeholder="예: 2010"
                  className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                  maxLength={4}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full min-w-0">
              <div className="flex-1 min-w-0 space-y-2">
                <Label htmlFor="password" className="text-white">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">비밀번호 확인 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">연락처 *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange("phone", e.target.value)}
                  placeholder="학생 연락처 (숫자만 입력)"
                  className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                  maxLength={13}
                  autoComplete="off"
                />
                <span className="text-cyan-400 text-lg">/</span>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handlePhoneChange("parentPhone", e.target.value)}
                  placeholder="학부모 연락처 (선택)"
                  className="flex-1 bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                  maxLength={13}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">이메일 <span className="text-cyan-400 text-xs">(선택)</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@email.com"
                className="bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academy" className="text-white">학원 *</Label>
              <Select
                value={formData.academy}
                onValueChange={(value) => {
                  handleInputChange('academy', value)
                  handleInputChange('assignedTeacherId', '') // 학원 변경 시 교사 선택 초기화
                }}
                disabled={loading}
              >
                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                  <SelectValue placeholder="학원을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-background border-cyan-400/40">
                  <SelectItem value="coding-maker" className="text-cyan-100 hover:bg-cyan-900/20">코딩메이커</SelectItem>
                  <SelectItem value="gwangyang-coding" className="text-cyan-100 hover:bg-cyan-900/20">광양코딩</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTeacher" className="text-white">담당 교사 *</Label>
              <Select
                value={formData.assignedTeacherId}
                onValueChange={(value) => handleInputChange('assignedTeacherId', value)}
                disabled={loading || !formData.academy || teachersLoading}
              >
                <SelectTrigger className="bg-background/40 border-cyan-400/40 text-cyan-100 focus:border-cyan-400/80">
                  <SelectValue placeholder={
                    !formData.academy 
                      ? "먼저 학원을 선택하세요" 
                      : teachersLoading 
                        ? "교사 목록을 불러오는 중..." 
                        : "담당 교사를 선택하세요"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-background border-cyan-400/40">
                  {teachers
                    .filter(teacher => !formData.academy || teacher.academy === formData.academy)
                    .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id} className="text-cyan-100 hover:bg-cyan-900/20">
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.academy && (
                <p className="text-xs text-cyan-400 mt-1">먼저 학원을 선택해주세요</p>
              )}
              {teachersLoading && (
                <p className="text-xs text-cyan-400 mt-1">교사 목록을 불러오는 중...</p>
              )}
            </div>


            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-400 text-sm text-center">
                가입요청이 완료되었습니다. 담당교사의 승인을 기다려주세요.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
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