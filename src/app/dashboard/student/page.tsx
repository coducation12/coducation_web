import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAuthenticatedUser } from "@/lib/auth";
import { ArrowRight, Book, Target } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboardPage() {
    const user = await getAuthenticatedUser();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">안녕하세요, {user?.name}님!</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Book className="w-5 h-5" />
                            오늘의 수업
                        </CardTitle>
                        <CardDescription>React 기초: 컴포넌트와 Props</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            오늘은 React의 핵심 개념인 컴포넌트와 Props에 대해 배웁니다.
                        </p>
                        <Progress value={25} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-2">25% 완료</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Target className="w-5 h-5" />
                            타자 연습 챌린지
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80">새로운 AI 추천 연습으로 실력을 향상시키세요!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/dashboard/student/typing">
                                연습 시작하기
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">최근 성적</CardTitle>
                        <CardDescription>지난 타자 연습 결과입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">정확도</span>
                            <strong>98%</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">타수 (WPM)</span>
                            <strong>65</strong>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
