'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ArrowUpRight, BookUser, Users, GraduationCap, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";

export const dynamic = 'force-dynamic';

interface ActivityItem {
    id: string;
    type: 'community' | 'learning';
    title: string;
    username: string;
    createdAt: string;
    pageType: string;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        todayAttendance: 0,
        totalCurriculum: 0
    });
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentActivities();
    }, []);

    const fetchStats = async () => {
        try {
            // 총 학생수 조회
            const { count: studentsCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            // 금일 출석 조회 (오늘 날짜의 출석 기록 - 세션 기반)
            const today = new Date().toISOString().split('T')[0];
            const { count: attendanceCount } = await supabase
                .from('attendance_sessions')
                .select('*', { count: 'exact', head: true })
                .in('status', ['attended', 'makeup'])
                .eq('date', today);

            // 커리큘럼 수 조회
            const { count: curriculumCount } = await supabase
                .from('curriculums')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalStudents: studentsCount || 0,
                todayAttendance: attendanceCount || 0,
                totalCurriculum: curriculumCount || 0
            });
        } catch (error) {
            console.error('통계 조회 중 오류:', error);
        }
    };

    const fetchRecentActivities = async () => {
        try {
            // 커뮤니티 게시글 조회
            const { data: communityPosts, error: communityError } = await supabase
                .from('community_posts')
                .select(`
                    id,
                    title,
                    created_at,
                    users!inner(name)
                `)
                .order('created_at', { ascending: false })
                .limit(10);

            if (communityError) {
                console.error('커뮤니티 게시글 조회 실패:', communityError);
                setRecentActivities([]);
                return;
            }

            const activities: ActivityItem[] = [];

            // 커뮤니티 게시글 추가
            if (communityPosts) {
                communityPosts.forEach((post: any) => {
                    activities.push({
                        id: post.id,
                        type: 'community',
                        title: post.title,
                        username: post.users?.name || '알 수 없음',
                        createdAt: post.created_at,
                        pageType: '커뮤니티'
                    });
                });
            }

            setRecentActivities(activities);
        } catch (error) {
            console.error('최근 활동 조회 중 오류:', error);
            setRecentActivities([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardPageWrapper>
                <div className="text-cyan-100">로딩 중...</div>
            </DashboardPageWrapper>
        );
    }

    return (
        <DashboardPageWrapper>
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7] mb-6 pr-2">관리자 대시보드</h1>

            {/* 통계 카드 */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 mb-6">
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
                        <CardTitle className="text-[10px] sm:text-sm font-medium text-cyan-200">총 학생수</CardTitle>
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-2xl font-bold text-cyan-100">{stats.totalStudents}</div>
                        <p className="text-[10px] sm:text-xs text-cyan-300">전체 등록 학생</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
                        <CardTitle className="text-[10px] sm:text-sm font-medium text-cyan-200">금일 출석</CardTitle>
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-2xl font-bold text-cyan-100">{stats.todayAttendance}</div>
                        <p className="text-[10px] sm:text-xs text-cyan-300">오늘 출석한 학생</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
                        <CardTitle className="text-[10px] sm:text-sm font-medium text-cyan-200">커리큘럼 수</CardTitle>
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-2xl font-bold text-cyan-100">{stats.totalCurriculum}</div>
                        <p className="text-[10px] sm:text-xs text-cyan-300">전체 커리큘럼</p>
                    </CardContent>
                </Card>
            </div>

            {/* 최근 활동 테이블 */}
            <div>
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardHeader>
                        <CardTitle className="font-headline text-cyan-100">최근 활동</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-6">
                        <div className="overflow-x-auto">
                            <Table className="text-[12px] sm:text-sm">
                                <TableHeader>
                                    <TableRow className="border-cyan-500/20">
                                        <TableHead className="text-cyan-200 whitespace-nowrap">페이지 종류</TableHead>
                                        <TableHead className="text-cyan-200 whitespace-nowrap">제목</TableHead>
                                        <TableHead className="text-cyan-200 whitespace-nowrap">사용자명</TableHead>
                                        <TableHead className="text-cyan-200 whitespace-nowrap">시간</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentActivities.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-cyan-200 py-8">
                                                최근 활동이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentActivities.map((activity) => (
                                            <TableRow key={activity.id} className="border-cyan-500/10 whitespace-nowrap">
                                                <TableCell className="text-cyan-100">
                                                    <Badge className={`
                                                        text-[10px] px-1.5 py-0
                                                        ${activity.type === 'community'
                                                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                                                            : 'bg-green-600/20 text-green-300 border-green-500/30'}
                                                    `}>
                                                        {activity.pageType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-cyan-200 font-medium max-w-[150px] truncate sm:max-w-none sm:whitespace-normal">
                                                    {activity.title}
                                                </TableCell>
                                                <TableCell className="text-cyan-200">
                                                    {activity.username}
                                                </TableCell>
                                                <TableCell className="text-cyan-200">
                                                    {new Date(activity.createdAt).toLocaleString('ko-KR', {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardPageWrapper>
    );
}
