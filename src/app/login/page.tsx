'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { login } from "@/lib/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">로그인</CardTitle>
          <CardDescription>
            아이디와 비밀번호를 입력하여 대시보드에 접속하세요.
            <br />
            <span className="text-xs text-muted-foreground">
              (테스트 아이디: student, parent, teacher, admin)
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login}>
            <div className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    아이디 또는 비밀번호가 올바르지 않습니다.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required defaultValue="password" />
              </div>
              <Button type="submit" className="w-full">
                로그인
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Google로 로그인
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
