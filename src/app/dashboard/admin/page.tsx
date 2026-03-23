'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Users, 
    Calendar, 
    MessageSquare, 
    Monitor, 
    CreditCard, 
    TrendingUp, 
    AlertCircle, 
    RefreshCw, 
    ChevronRight, 
    UserPlus,
    Clock,
    LayoutDashboard,
    ArrowUpRight,
    BookOpen,
    Layout
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { getTuitionDashboardData } from "@/lib/actions/tuition";
import { getPCRoomLayouts } from "@/lib/actions/pc-management";
import { getAdminDashboardData } from "@/lib/actions";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import VisitorChart from "@/components/dashboard/VisitorChart";

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
    console.log('[Dashboard] AdminDashboardPage render');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        todayAttendance: 0,
        pendingConsultations: 0,
        faultyPCs: 0,
        todayVisits: 0,
        uniqueVisitors: 0,
        visitorHistory: [] as any[]
    });

    const [paymentStats, setPaymentStats] = useState({
        totalTarget: 0,
        totalCollected: 0,
        collectionRate: 0
    });

    const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
    const [newStudents, setNewStudents] = useState<any[]>([]);
    const [communityPosts, setCommunityPosts] = useState<any[]>([]);
    const [pcIssues, setPcIssues] = useState<any[]>([]);
    const [todayAttendanceList, setTodayAttendanceList] = useState<any[]>([]);

    const fetchData = async () => {
        console.log('[Dashboard] fetchData started');
        try {
            setRefreshing(true);
            
            // 0. 현재 사용자 정보 (클라이언트 측 세션 시도만 하고 실패해도 진행)
            console.log('[Dashboard] Fetching user auth...');
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            console.log('[Dashboard] User auth result:', { user: user?.id, error: authError });
            
            // user가 없어도 서버 액션은 자체 쿠키를 사용하므로 중단하지 않음
            const currentUserId = user?.id || '';
            const currentUserRole = 'admin'; // 대시보드 접근 자체가 관리자 권한 필요하므로 기본값 설정
            
            // 1. 통합 데이터 페칭 (RLS 우회)
            const adminDataRes = await getAdminDashboardData();
            
            if (!adminDataRes.success || !adminDataRes.data) {
                console.error('[Dashboard] Failed to fetch admin data:', adminDataRes.error);
            }

            const adminData = adminDataRes.data || {
                stats: { 
                    totalStudents: 0, 
                    todayAttendance: 0, 
                    pendingConsultations: 0, 
                    todayVisits: 0, 
                    uniqueVisitors: 0,
                    visitorHistory: []
                },
                recentInquiries: [],
                newStudents: [],
                communityPosts: []
            };

            // 2. 수납 데이터 (이번 달)
            const currentMonth = format(new Date(), 'yyyy-MM-01');
            const tuitionRes = await getTuitionDashboardData(currentMonth, currentUserId, currentUserRole);
            
            let target = 0;
            let collected = 0;
            if (tuitionRes.success && tuitionRes.data) {
                tuitionRes.data.forEach((item: any) => {
                    target += item.base_amount || 0;
                    collected += item.payment?.total_paid_amount || 0;
                });
            }

            // 3. PC 상태
            const academies = ['코딩메이커', '광양코딩', '순천코딩', '여수코딩'];
            let allFaultyCount = 0;
            const allIssues: any[] = [];

            for (const academy of academies) {
                const pcRes = await getPCRoomLayouts(academy);
                if (pcRes.success && pcRes.data) {
                    pcRes.data.forEach((room: any) => {
                        const layout = room.layout_data as any[] || [];
                        const roomFaulty = layout.filter(pc => pc.status !== '정상 작동');
                        allFaultyCount += roomFaulty.length;
                        if (roomFaulty.length > 0) {
                            allIssues.push({
                                roomName: room.room_name,
                                academy: room.academy_name,
                                count: roomFaulty.length
                            });
                        }
                    });
                }
            }

            // 상태 업데이트
            setStats({
                totalStudents: adminData.stats?.totalStudents || 0,
                todayAttendance: adminData.stats?.todayAttendance || 0,
                pendingConsultations: adminData.stats?.pendingConsultations || 0,
                faultyPCs: allFaultyCount,
                todayVisits: adminData.stats?.todayVisits || 0,
                uniqueVisitors: adminData.stats?.uniqueVisitors || 0,
                visitorHistory: adminData.stats?.visitorHistory || []
            });

            setPaymentStats({
                totalTarget: target,
                totalCollected: collected,
                collectionRate: target > 0 ? (collected / target) * 100 : 0
            });

            setRecentInquiries(adminData.recentInquiries || []);
            setNewStudents(adminData.newStudents || []);
            setCommunityPosts(adminData.communityPosts || []);
            setPcIssues(allIssues);

        } catch (error) {
            console.error('Data fetching error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardPageWrapper>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    <p className="text-cyan-400 font-medium animate-pulse">시스템 데이터 분석 중...</p>
                </div>
            </DashboardPageWrapper>
        );
    }

    return (
        <DashboardPageWrapper>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,255,247,0.5)]">
                        ADMIN <span className="text-cyan-400">COMMAND CENTER</span>
                    </h1>
                    <p className="text-cyan-500/70 text-sm mt-1 font-medium italic">Coducation Management System v2.0</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center px-4 py-2 bg-cyan-900/20 border border-cyan-500/20 rounded-full text-[11px] text-cyan-400/80 font-mono gap-2">
                        <Clock className="w-3 h-3" />
                        LAST SYNC: {format(new Date(), 'HH:mm:ss')}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchData} 
                        disabled={refreshing}
                        className="bg-cyan-900/30 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20 rounded-full px-4 group"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 group-hover:rotate-180 transition-all duration-500 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? '동기화 중...' : '데이터 새로고침'}
                    </Button>
                </div>
            </div>

            {/* Top Cards (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="전체 재원생" 
                    value={stats.totalStudents} 
                    icon={<Users className="w-5 h-5 text-cyan-400" />} 
                    subText="활성 계정 기준" 
                    color="cyan"
                    link="/dashboard/admin/students"
                />
                <StatCard 
                    title="금일 출석" 
                    value={`${stats.todayAttendance} / ${stats.totalStudents}`} 
                    icon={<Calendar className="w-5 h-5 text-blue-400" />} 
                    subText={`${stats.totalStudents > 0 ? Math.round((stats.todayAttendance/stats.totalStudents)*100) : 0}% 참여율`} 
                    color="blue"
                    link="/dashboard/admin/timetable"
                />
                <StatCard 
                    title="PC 상태 이상" 
                    value={stats.faultyPCs} 
                    icon={<Monitor className="w-5 h-5 text-red-400" />} 
                    subText="정비 필요 장비" 
                    color="red"
                    link="/dashboard/admin/pc-management"
                    alert={stats.faultyPCs > 0}
                />
                <StatCard 
                    title="상담 대기" 
                    value={stats.pendingConsultations} 
                    icon={<MessageSquare className="w-5 h-5 text-yellow-400" />} 
                    subText="미처리 문의 건수" 
                    color="yellow"
                    link="/dashboard/admin/consultations"
                    alert={stats.pendingConsultations > 0}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left (8 Cols): Monthly Tuition + New Students */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tuition Card */}
                    <Card className="bg-[#0a203f]/40 border-cyan-500/30 overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-cyan-100 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-cyan-400" />
                                    월간 수납 분석 <span className="text-xs font-normal text-cyan-500/60 ml-2">{format(new Date(), 'MMMM')}</span>
                                </CardTitle>
                                <CardDescription className="text-cyan-500/70">목표액 대비 현재 수동 실적을 실시간으로 집계합니다.</CardDescription>
                            </div>
                            <Link href="/dashboard/admin/payments">
                                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10">
                                    상세보기 <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-cyan-400/70 font-medium uppercase tracking-wider">수납 달성률</p>
                                            <h3 className="text-4xl font-black text-white">{paymentStats.collectionRate.toFixed(1)}%</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-green-400/70 font-medium">Collected</p>
                                            <p className="text-xl font-bold text-green-400">{paymentStats.totalCollected.toLocaleString()}원</p>
                                        </div>
                                    </div>
                                    <div className="relative h-6 bg-cyan-950/50 rounded-full overflow-hidden border border-cyan-500/20">
                                        <Progress value={paymentStats.collectionRate} className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-1000" />
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-[shimmer_2s_infinite] w-1/2"></div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[11px] text-cyan-500/60 italic">목표 수납액: {paymentStats.totalTarget.toLocaleString()}원</p>
                                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">REAL-TIME SYNC</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* New Students Check */}
                    <Card className="bg-[#0a203f]/40 border-cyan-500/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-cyan-100 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-green-400" />
                                신규 등록 학생
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {newStudents.length === 0 ? (
                                    <div className="col-span-full py-6 text-center text-cyan-600/50 italic text-sm">최근 등록된 학생이 없습니다.</div>
                                ) : (
                                    newStudents.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-3 bg-cyan-900/10 border border-cyan-500/10 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-200 font-bold">
                                                    {student.name.slice(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-cyan-100">{student.name}</p>
                                                    <p className="text-[10px] text-cyan-500/60 uppercase">{format(new Date(student.created_at), 'yyyy-MM-dd')}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">NEW</Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right (4 Cols): Community + Visitor Graph */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Community Card - Moved to TOP of right column and expanded */}
                    <Card className="bg-[#0a203f]/40 border-cyan-500/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold text-cyan-100 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-purple-400" />
                                커뮤니티 최신글
                            </CardTitle>
                            <Link href="/dashboard/admin/community">
                                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-200">
                                    전체보기 <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4"> {/* Increased space-y for better prominence */}
                                {communityPosts.length === 0 ? (
                                    <div className="py-8 text-center text-cyan-600/50 italic text-sm">최근 게시글이 없습니다.</div>
                                ) : (
                                    communityPosts.map((post) => (
                                        <div key={post.id} className="flex items-center justify-between p-3.5 bg-purple-900/10 border border-purple-500/10 rounded-lg hover:bg-purple-900/20 transition-colors cursor-pointer group">
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <p className="text-[14px] font-bold text-cyan-100 group-hover:text-purple-300 transition-colors truncate">{post.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-purple-500/30 text-purple-400">NEWS</Badge>
                                                    <p className="text-[10px] text-cyan-500/60 uppercase">{post.users?.name || '익명'} • {format(new Date(post.created_at), 'MM-dd')}</p>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-cyan-700 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visitor Graph - Reduced size */}
                    <Card className="bg-[#0a203f]/40 border-cyan-500/30">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-lg font-bold text-cyan-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    방문객 통계
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-cyan-500 font-normal uppercase">Today Total</span>
                                    <span className="text-lg font-black text-cyan-300">{stats.todayVisits}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VisitorChart data={stats.visitorHistory} height={160} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </DashboardPageWrapper>
    );
}

function StatCard({ title, value, icon, subText, color, link, alert = false }: any) {
    const colorMap: any = {
        cyan: "from-cyan-900/40 to-cyan-800/20 border-cyan-500/40 text-cyan-400",
        blue: "from-blue-900/40 to-blue-800/20 border-blue-500/40 text-blue-400",
        yellow: "from-yellow-900/40 to-yellow-800/20 border-yellow-500/40 text-yellow-400",
        red: "from-red-900/40 to-red-800/20 border-red-500/40 text-red-100",
        green: "from-green-900/40 to-green-800/20 border-green-500/40 text-green-400"
    };

    return (
        <Link href={link}>
            <Card className={`relative overflow-hidden bg-gradient-to-br ${colorMap[color]} border transition-all hover:scale-[1.02] cursor-pointer group`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</CardTitle>
                    <div className={`p-1.5 rounded-lg bg-black/20 ${alert ? 'animate-bounce' : ''}`}>
                        {icon}
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                    <div className="text-2xl font-black tracking-tighter">{value}</div>
                    <p className="text-[9px] font-medium opacity-50 truncate">{subText}</p>
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickLink({ title, href, icon }: any) {
    return (
        <Link href={href} className="flex items-center justify-center gap-2 p-3 bg-cyan-900/20 border border-cyan-500/20 rounded-xl text-cyan-200 text-[11px] font-bold hover:bg-cyan-500/20 hover:border-cyan-400 transition-all">
            {icon}
            {title}
        </Link>
    );
}
