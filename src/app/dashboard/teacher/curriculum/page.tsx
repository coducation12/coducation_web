import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

const mockCurriculums = [
    { id: 'curriculum-1', title: 'React 기초 과정', category: '프론트엔드', level: '초급', students: 8, status: '진행중' },
    { id: 'curriculum-2', title: 'Python 중급 과정', category: '백엔드', level: '중급', students: 5, status: '진행중' },
    { id: 'curriculum-3', title: '알고리즘 기초', category: 'AI', level: '초급', students: 12, status: '진행중' },
    { id: 'curriculum-4', title: '웹 개발 심화', category: '프론트엔드', level: '고급', students: 3, status: '준비중' },
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

            {/* 상단 4개 카드(통계) 제거됨 */}

            {/* 이하 커리큘럼 목록 등 기존 내용 유지 */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <CardTitle className="text-cyan-100">커리큘럼 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200 text-center">커리큘럼명</TableHead>
                                <TableHead className="text-cyan-200 text-center">분류</TableHead>
                                <TableHead className="text-cyan-200 text-center">레벨</TableHead>
                                <TableHead className="text-cyan-200 text-center">수강생 수</TableHead>
                                <TableHead className="text-cyan-200 text-center">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCurriculums.map((curriculum) => (
                                <TableRow key={curriculum.id} className="border-cyan-500/10">
                                    <TableCell className="font-medium text-cyan-100 text-center">
                                        {curriculum.title}
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-center">
                                        {curriculum.category}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            className={
                                                curriculum.level === '초급'
                                                    ? 'bg-green-500 text-white'
                                                    : curriculum.level === '중급'
                                                    ? 'bg-yellow-500 text-white'
                                                    : curriculum.level === '고급'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-cyan-600/20 text-cyan-200 border-cyan-400/40'
                                            }
                                        >
                                            {curriculum.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-center">
                                        {curriculum.students}명
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            className={curriculum.status === '진행중' 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                            }
                                        >
                                            {curriculum.status}
                                        </Badge>
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