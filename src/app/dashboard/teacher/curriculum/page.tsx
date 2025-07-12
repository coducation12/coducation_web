import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

const mockCurriculums = [
    { id: 'curriculum-1', title: 'React 기초 과정', level: '초급', students: 8, status: '진행중' },
    { id: 'curriculum-2', title: 'Python 중급 과정', level: '중급', students: 5, status: '진행중' },
    { id: 'curriculum-3', title: '알고리즘 기초', level: '초급', students: 12, status: '진행중' },
    { id: 'curriculum-4', title: '웹 개발 심화', level: '고급', students: 3, status: '준비중' },
];

export default function TeacherCurriculumPage() {
    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">커리큘럼 관리</h1>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    새 커리큘럼 추가
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-cyan-200">총 커리큘럼</CardDescription>
                        <CardTitle className="text-3xl font-bold text-cyan-100">4</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-cyan-300">활성 과정</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-cyan-200">총 학생 수</CardDescription>
                        <CardTitle className="text-3xl font-bold text-cyan-100">28</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-cyan-300">수강 중인 학생</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-cyan-200">평균 진행률</CardDescription>
                        <CardTitle className="text-3xl font-bold text-cyan-100">78%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-cyan-300">전체 과정</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-cyan-200">완료된 과정</CardDescription>
                        <CardTitle className="text-3xl font-bold text-cyan-100">12</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-cyan-300">이번 달</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <CardTitle className="text-cyan-100">커리큘럼 목록</CardTitle>
                    <CardDescription className="text-cyan-200">
                        현재 운영 중인 모든 커리큘럼을 확인하고 관리합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200">커리큘럼명</TableHead>
                                <TableHead className="text-cyan-200">레벨</TableHead>
                                <TableHead className="text-cyan-200">수강생 수</TableHead>
                                <TableHead className="text-cyan-200">상태</TableHead>
                                <TableHead className="text-right text-cyan-200">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCurriculums.map((curriculum) => (
                                <TableRow key={curriculum.id} className="border-cyan-500/10">
                                    <TableCell className="font-medium text-cyan-100">
                                        {curriculum.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-200">
                                            {curriculum.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-cyan-200">
                                        {curriculum.students}명
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={curriculum.status === '진행중' 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                            }
                                        >
                                            {curriculum.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" className="text-cyan-200 hover:text-cyan-100">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-cyan-200 hover:text-cyan-100">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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