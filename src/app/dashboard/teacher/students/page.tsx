import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone } from "lucide-react";

const mockStudents = [
    {
        id: 'student-1',
        name: '김민준',
        email: 'minjun@example.com',
        phone: '010-1234-5678',
        avatar: '/avatars/student1.jpg',
        curriculum: 'React 기초',
        progress: 25,
        attendance: 85,
        status: '활성',
        joinDate: '2024-01-15',
        lastLogin: '2024-03-20'
    },
    {
        id: 'student-2',
        name: '이서아',
        email: 'seoa@example.com',
        phone: '010-2345-6789',
        avatar: '/avatars/student2.jpg',
        curriculum: 'Python 중급',
        progress: 75,
        attendance: 92,
        status: '활성',
        joinDate: '2024-02-01',
        lastLogin: '2024-03-21'
    },
    {
        id: 'student-3',
        name: '박도윤',
        email: 'doyoon@example.com',
        phone: '010-3456-7890',
        avatar: '/avatars/student3.jpg',
        curriculum: 'React 기초',
        progress: 50,
        attendance: 78,
        status: '활성',
        joinDate: '2024-01-20',
        lastLogin: '2024-03-19'
    },
    {
        id: 'student-4',
        name: '최지우',
        email: 'jiwoo@example.com',
        phone: '010-4567-8901',
        avatar: '/avatars/student4.jpg',
        curriculum: '알고리즘',
        progress: 10,
        attendance: 65,
        status: '휴면',
        joinDate: '2024-02-10',
        lastLogin: '2024-03-10'
    },
    {
        id: 'student-5',
        name: '정현우',
        email: 'hyunwoo@example.com',
        phone: '010-5678-9012',
        avatar: '/avatars/student5.jpg',
        curriculum: '웹 개발 심화',
        progress: 90,
        attendance: 95,
        status: '활성',
        joinDate: '2023-12-01',
        lastLogin: '2024-03-21'
    }
];

const mockStats = [
    { label: '총 학생 수', value: '25', change: '+3명 (이번 달)' },
    { label: '활성 학생', value: '22', change: '88% 비율' },
    { label: '평균 출석률', value: '87%', change: '+5% (지난 달 대비)' },
    { label: '평균 진행률', value: '72%', change: '전체 과정' }
];

export default function TeacherStudentsPage() {
    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">학생관리</h1>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    학생 추가
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mockStats.map((stat, index) => (
                    <Card key={index} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-cyan-200">{stat.label}</CardDescription>
                            <CardTitle className="text-3xl font-bold text-cyan-100">{stat.value}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-cyan-300">{stat.change}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-cyan-100">학생 목록</CardTitle>
                            <CardDescription className="text-cyan-200">
                                등록된 모든 학생들의 정보와 학습 현황을 확인합니다.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-cyan-300" />
                                <Input
                                    placeholder="학생 검색..."
                                    className="pl-8 bg-cyan-900/20 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-300"
                                />
                            </div>
                            <Select>
                                <SelectTrigger className="w-[140px] bg-cyan-900/20 border-cyan-500/30 text-cyan-100">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="필터" />
                                </SelectTrigger>
                                <SelectContent className="bg-cyan-900/90 border-cyan-500/30">
                                    <SelectItem value="all" className="text-cyan-100">전체</SelectItem>
                                    <SelectItem value="active" className="text-cyan-100">활성</SelectItem>
                                    <SelectItem value="inactive" className="text-cyan-100">휴면</SelectItem>
                                    <SelectItem value="high-progress" className="text-cyan-100">진행률 높음</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-cyan-500/20">
                                <TableHead className="text-cyan-200">학생</TableHead>
                                <TableHead className="text-cyan-200">연락처</TableHead>
                                <TableHead className="text-cyan-200">수강 과정</TableHead>
                                <TableHead className="text-cyan-200">진행률</TableHead>
                                <TableHead className="text-cyan-200">출석률</TableHead>
                                <TableHead className="text-cyan-200">상태</TableHead>
                                <TableHead className="text-cyan-200">최근 로그인</TableHead>
                                <TableHead className="text-right text-cyan-200">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockStudents.map((student) => (
                                <TableRow key={student.id} className="border-cyan-500/10">
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={student.avatar} />
                                                <AvatarFallback className="bg-cyan-600 text-cyan-100 text-xs">
                                                    {student.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-cyan-100">{student.name}</div>
                                                <div className="text-xs text-cyan-300">가입일: {student.joinDate}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-cyan-200">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {student.email}
                                            </div>
                                            <div className="flex items-center text-sm text-cyan-200">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {student.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-cyan-200">
                                        {student.curriculum}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={student.progress > 70 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : student.progress > 40
                                                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                                : 'bg-red-600/20 text-red-300 border-red-500/30'
                                            }
                                        >
                                            {student.progress}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={student.attendance > 90 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : student.attendance > 70
                                                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                                                : 'bg-red-600/20 text-red-300 border-red-500/30'
                                            }
                                        >
                                            {student.attendance}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={student.status === '활성' 
                                                ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                                : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                                            }
                                        >
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-cyan-200 text-sm">
                                        {student.lastLogin}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
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