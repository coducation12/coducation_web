'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/lib/actions'

export default function LoginPage() {
  const [userType, setUserType] = useState<'teacher' | 'student'>('student')
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
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {

      
      const formData = new FormData()
      formData.append('userType', userType)
      formData.append('password', password)
      
      if (userType === 'teacher') {
        formData.append('email', email)
      } else {
        formData.append('username', username)
      }
      
      await login(formData)
    } catch (error) {
      console.error('Login error:', error)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <form onSubmit={handleLogin} className="mx-auto max-w-sm w-full bg-black/40 rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-headline font-bold text-white">로그인</div>
          <div className="flex gap-2">
            <button type="button" className={`px-3 py-1 text-sm rounded-lg border font-semibold transition-colors ${userType === 'student' ? 'text-sky-600 font-bold border-sky-400 bg-transparent' : 'text-gray-500 border-gray-200 bg-transparent hover:bg-sky-100'}`} onClick={() => setUserType('student')}>학생/학부모</button>
            <button type="button" className={`px-3 py-1 text-sm rounded-lg border font-semibold transition-colors ${userType === 'teacher' ? 'text-sky-600 font-bold border-sky-400 bg-transparent' : 'text-gray-500 border-gray-200 bg-transparent hover:bg-sky-100'}`} onClick={() => setUserType('teacher')}>강사/관리자</button>
          </div>
        </div>
        
        {userType === 'teacher' ? (
          <div className="mb-6">
            <Label htmlFor="email" className="text-white">이메일</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              autoComplete="off" 
              placeholder="강사 이메일을 입력하세요"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="mb-6">
            <Label htmlFor="username" className="text-white">아이디</Label>
            <Input 
              id="username" 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              autoComplete="off" 
              placeholder="학생/학부모 아이디를 입력하세요"
              disabled={isLoading}
            />
          </div>
        )}
        
        <div className="mb-6">
          <Label htmlFor="password" className="text-white">비밀번호 (선택사항)</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            autoComplete="new-password" 
            placeholder="비밀번호를 입력하세요 (개발용: 비워두면 자동 로그인)"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-400 mt-1">개발용: 비밀번호를 비워두면 자동으로 로그인됩니다</p>
        </div>
        
        {error && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}
        <Button 
          type="submit" 
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
        

      </form>
    </div>
  )
}
