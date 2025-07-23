import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ArrowUpRight, BookUser, Users, GraduationCap } from "lucide-react";
import Link from "next/link";

const mockRecentActivities = [
    { type: '신규 학생 등록', name: '김지아', time: '10분 전'},
    { type: '커리큘럼 수정', name: '박선생님', time: '1시간 전'},
    { type: '공지사항 등록', name: '관리자', time: '3시간 전'},
]

export default function AdminDashboardPage() {
    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <h1 className="text-3xl font-bold font-headline">관리자 대시보드</h1>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">125</div>
                        <p className="text-xs text-muted-foreground">+5.2% (지난 달 대비)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 강사진</CardTitle>
                        <BookUser className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">5</div>
                        <p className="text-xs text-muted-foreground">+1 (신규 채용)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">활성 과정</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">8</div>
                        <p className="text-xs text-muted-foreground">+1 (신규 개설)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">금일 활동</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">21</div>
                        <p className="text-xs text-muted-foreground">수업 및 제출</p>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">최근 활동</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>활동 종류</TableHead>
                                    <TableHead>사용자</TableHead>
                                    <TableHead>시간</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockRecentActivities.map((activity, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{activity.type}</TableCell>
                                        <TableCell className="font-medium">{activity.name}</TableCell>
                                        <TableCell>{activity.time}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
