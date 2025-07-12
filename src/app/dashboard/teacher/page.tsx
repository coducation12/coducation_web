import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthenticatedUser } from "@/lib/auth";
import { ArrowUpRight, BookCopy, Users, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { AttendanceScheduler } from "./components/AttendanceScheduler";

const mockStudents = [
    { id: 'student-1', name: '김민준', curriculum: 'React 기초', progress: 25 },
    { id: 'student-2', name: '이서아', curriculum: 'Python 중급', progress: 75 },
    { id: 'student-3', name: '박도윤', curriculum: 'React 기초', progress: 50 },
    { id: 'student-4', name: '최지우', curriculum: '알고리즘', progress: 10 },
]

const mockStats = [
    { label: '담당 학생 수', value: '12', icon: Users, change: '+2명 (지난 달 대비)' },
    { label: '금일 출석률', value: '92%', icon: Calendar, change: '12명 중 11명 출석' },
    { label: '평균 진행률', value: '78%', icon: TrendingUp, change: '전체 과정' },
    { label: '이번 달 완료', value: '8', icon: BookCopy, change: '과정 완료' },
];

export default async function TeacherDashboardPage() {
    const user = await getAuthenticatedUser();
    
    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div>
                <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">강사 대시보드</h1>
            </div>
            <AttendanceScheduler />
            
            {/* 학생 목록 카드 전체 삭제 */}
        </div>
    );
}
