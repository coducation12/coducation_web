"use client"
import { useState } from "react"
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // userId는 localStorage에서 가져옴(임시)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!userId) {
      setError('로그인이 필요합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    // 현재 비밀번호 확인
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single()
    if (fetchError || !user) {
      setError('사용자 정보를 불러올 수 없습니다.')
      setLoading(false)
      return
    }
    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) {
      setError('현재 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }
    // 새 비밀번호 해시 후 update
    const hashed = await bcrypt.hash(newPassword, 10)
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', userId)
    setLoading(false)
    if (!updateError) {
      setSuccess('비밀번호가 성공적으로 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setError('비밀번호 변경에 실패했습니다.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <form onSubmit={handleChangePassword} className="mx-auto max-w-sm w-full bg-black/40 rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">비밀번호 변경</h2>
        <div className="mb-4">
          <Label htmlFor="currentPassword" className="text-white">현재 비밀번호</Label>
          <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="newPassword" className="text-white">새 비밀번호</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <div className="mb-6">
          <Label htmlFor="confirmPassword" className="text-white">새 비밀번호 확인</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}
        {success && <div className="text-sky-400 text-sm text-center mb-4">{success}</div>}
        <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold" disabled={loading}>{loading ? '변경 중...' : '비밀번호 변경'}</Button>
      </form>
    </div>
  )
} 