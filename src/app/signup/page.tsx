"use client"

import { useState } from "react"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (!error && data.user) {
      // users 테이블에 insert
      await supabase.from('users').insert({
        id: data.user.id,
        username: email,
        name,
        role: 'teacher',
        created_at: new Date().toISOString(),
      });
    }
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 1500)
    } else {
      setError(error.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <div className="mx-auto max-w-sm w-full">
        <div className="bg-black/40 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">강사 회원가입</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">이름</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">이메일</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">비밀번호</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            {success && <div className="text-sky-400 text-sm text-center">회원가입이 완료되었습니다!</div>}
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold" disabled={loading}>{loading ? '가입 중...' : '회원가입'}</Button>
          </form>
        </div>
      </div>
    </div>
  )
} 