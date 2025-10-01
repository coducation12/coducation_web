'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/lib/actions'

function LoginForm() {
  const [userType, setUserType] = useState<'teacher' | 'student'>('student')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 파라미터에서 오류 확인
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'true') {
      setError('로그인에 실패했습니다. 아이디/이메일과 비밀번호를 확인해주세요.')
    } else if (errorParam === 'password_required') {
      setError('비밀번호를 입력해주세요.')
    } else if (errorParam === 'pending') {
      setError('계정이 아직 승인되지 않았습니다. 담당교사의 승인을 기다려주세요.')
    } else if (errorParam === 'suspended') {
      setError('휴강 중인 계정입니다. 수강 재개 후 로그인해주세요.')
    } else if (errorParam === 'terminated') {
      setError('수강이 종료된 계정입니다. 관리자에게 문의해주세요.')
    } else if (errorParam === 'inactive') {
      setError('비활성화된 계정입니다. 관리자에게 문의해주세요.')
    }
  }, [searchParams])

  // 로고 더블클릭으로 탭 전환
  const handleLogoDoubleClick = () => {
    if (!isAdminMode) {
      // 학생 모드에서 강사 모드로 전환
      setIsAdminMode(true)
      setUserType('teacher')
    } else {
      // 강사 모드에서 학생 모드로 전환
      setIsAdminMode(false)
      setUserType('student')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      // 관리자 모드가 아닐 때는 항상 학생 로그인으로 처리
      const actualUserType = isAdminMode ? userType : 'student'
      formData.append('userType', actualUserType)
      formData.append('password', password)
      
      if (actualUserType === 'teacher') {
        formData.append('email', email)
      } else {
        formData.append('username', username)
      }
      
      const result = await login(formData)
      
      if (result.success) {
        if (result.redirect) {
          window.location.href = result.redirect
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        setError(result.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <div className="mx-auto max-w-md w-full">
        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="bg-black/40 rounded-lg shadow-xl p-8" autoComplete="off">
          {/* 로고 - 더블클릭으로 탭 전환 */}
          <div className="text-center mb-6">
            <div 
              onDoubleClick={handleLogoDoubleClick}
              className="inline-block cursor-pointer select-none"
            >
              <div className="text-2xl font-bold text-sky-400 mb-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                Coducation
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">로그인</h1>
            <p className="text-gray-400">
              {!isAdminMode 
                ? '학생/학부모 계정으로 로그인하세요' 
                : '강사/관리자 계정으로 로그인하세요'
              }
            </p>
          </div>
          
          {/* 에러 메시지 고정 공간 */}
          <div className="mb-6 h-12 flex items-center justify-center">
            {error && (
              <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 rounded-lg border border-red-500/30 w-full">
                {error}
              </div>
            )}
          </div>
          
          {!isAdminMode ? (
            <div className="mb-6">
              <Label htmlFor="username" className="text-white text-sm font-medium">아이디</Label>
              <Input 
                id="username" 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                autoComplete="off" 
                placeholder="학생/학부모 아이디를 입력하세요"
                disabled={isLoading}
                className="mt-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          ) : (
            <div className="mb-6">
              <Label htmlFor="email" className="text-white text-sm font-medium">이메일</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                autoComplete="off" 
                placeholder="강사/관리자 이메일을 입력하세요"
                disabled={isLoading}
                className="mt-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          )}
          
          <div className="mb-6">
            <Label htmlFor="password" className="text-white text-sm font-medium">비밀번호</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              autoComplete="new-password" 
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
              className="mt-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500 focus:ring-sky-500"
            />
          </div>
          
          
          <Button 
            type="submit" 
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          
          {/* 회원가입 버튼 - 관리자 모드에서는 비활성화 */}
          <div className="mt-6 text-center">
            {isAdminMode ? (
              <Button
                type="button"
                variant="outline"
                disabled
                className="w-full border-red-500 text-red-400 bg-red-900/20 cursor-not-allowed py-3 rounded-lg font-semibold"
              >
                강사, 관리자 전용
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/student-signup')}
                className="w-full border-sky-400 text-sky-400 hover:bg-sky-50 hover:text-sky-600 py-3 rounded-lg transition-all duration-200"
              >
                회원가입
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12"><div className="text-white">로딩 중...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
