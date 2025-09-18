"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <Card className="mx-auto max-w-md w-full bg-black/40 border-sky-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">회원가입</CardTitle>
          <CardDescription className="text-gray-300">
            가입하실 계정 유형을 선택해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => router.push('/student-signup')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold h-12 text-lg"
          >
            학생 회원가입
          </Button>
          
          <div className="text-center text-gray-400 text-sm">
            학생 계정은 담당 교사의 승인 후 활성화됩니다
          </div>
          
          <div className="border-t border-gray-600 pt-4">
            <Button
              onClick={() => router.push('/login')}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              이미 계정이 있으신가요? 로그인
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 