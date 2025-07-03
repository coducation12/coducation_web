import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAuthenticatedUser } from "@/lib/auth";
import { BarChart, CheckCircle, Clock } from "lucide-react";

export default async function ParentDashboardPage() {
    const user = await getAuthenticatedUser();
    const childName = "김민준"; // Mock data

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{user?.name}님, 안녕하세요!</h1>
            <p className="text-lg text-muted-foreground">자녀({childName})의 학습 현황을 확인하세요.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Clock className="w-5 h-5" />
                            최근 학습 활동
                        </CardTitle>
                        <CardDescription>2024년 7월 21일</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm"><strong>수업:</strong> React 기초 - 컴포넌트와 Props</p>
                        <p className="text-sm"><strong>타자연습:</strong> English (중급)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <CheckCircle className="w-5 h-5" />
                            전체 과정 진행률
                        </CardTitle>
                        <CardDescription>웹 개발 중급 과정</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={60} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-2">60% 완료</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <BarChart className="w-5 h-5" />
                            타자 연습 성과
                        </CardTitle>
                        <CardDescription>최근 5회 평균</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">평균 정확도</span>
                            <strong>97%</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">평균 타수 (WPM)</span>
                            <strong>62</strong>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
