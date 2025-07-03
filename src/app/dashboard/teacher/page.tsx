import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthenticatedUser } from "@/lib/auth";
import { ArrowUpRight, BookCopy } from "lucide-react";
import Link from "next/link";

const mockStudents = [
    { id: 'student-1', name: '김민준', curriculum: 'React 기초', progress: 25 },
    { id: 'student-2', name: '이서아', curriculum: 'Python 중급', progress: 75 },
    { id: 'student-3', name: '박도윤', curriculum: 'React 기초', progress: 50 },
    { id: 'student-4', name: '최지우', curriculum: '알고리즘', progress: 10 },
]

export default async function TeacherDashboardPage() {
    const user = await getAuthenticatedUser();
    
    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>담당 학생 수</CardDescription>
                  <CardTitle className="text-4xl font-headline">12</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +2명 (지난 달 대비)
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>금일 출석률</CardDescription>
                  <CardTitle className="text-4xl font-headline">92%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    12명 중 11명 출석
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="px-7">
                <CardTitle className="font-headline">담당 학생 목록</CardTitle>
                <CardDescription>
                  학생들의 학습 진행 상황을 확인하고 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학생 이름</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        수강 과정
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        진행률
                      </TableHead>
                      <TableHead className="text-right">상세보기</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudents.map(student => (
                        <TableRow key={student.id}>
                            <TableCell>
                                <div className="font-medium">{student.name}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                {student.curriculum}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge className="text-xs" variant={student.progress > 50 ? 'default' : 'secondary'}>
                                {student.progress}%
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost">보기</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
    );
}
