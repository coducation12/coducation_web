'use client';

import { useState, useEffect } from 'react';
import { getConsultations, updateConsultationStatus } from '@/lib/actions';
import { Consultation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarDays, Phone, MessageSquare, Building2, Filter } from 'lucide-react';

const statusLabels: Record<'pending' | 'completed', string> = {
    pending: '대기중',
    completed: '완료'
};

const statusColors: Record<'pending' | 'completed', string> = {
    pending: 'bg-yellow-500 text-white',
    completed: 'bg-green-500 text-white'
};

const subjectLabels: Record<string, string> = {
    'block-coding': '블록 코딩',
    'advanced-programming': '프로그래밍 언어',
    'ai-vibe-coding': 'Ai 바이브 코딩',
    'certification': '자격증',
    'digital-drawing': '디지털 드로잉',
    '3d-modeling': '3D 모델링',
    'project': '프로젝트',
    'etc': '기타 문의',
    'other': '기타'
};

const academyLabels: Record<string, string> = {
    '코딩메이커': '코딩메이커 (중마)',
    '광양코딩': '광양코딩 (창덕)',
    'codingmaker': '코딩메이커 (중마)',
    'coding-maker': '코딩메이커 (중마)',
    'coding_maker': '코딩메이커 (중마)',
    'gwangyangcoding': '광양코딩 (창덕)',
    'gwangyang-coding': '광양코딩 (창덕)',
    'gwangyang_coding': '광양코딩 (창덕)'
};

interface ConsultationsViewProps {
    role: 'admin' | 'teacher';
}

export default function ConsultationsView({ role }: ConsultationsViewProps) {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [responseNote, setResponseNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [academyFilter, setAcademyFilter] = useState<string>('all');

    useEffect(() => {
        loadConsultations();
    }, []);

    const loadConsultations = async () => {
        try {
            setLoading(true);
            const result = await getConsultations();
            if (result.success) {
                setConsultations(result.data || []);
            } else {
                console.error('상담문의 조회 실패:', result.error);
            }
        } catch (error) {
            console.error('상담문의 조회 중 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (consultationId: number, newStatus: string) => {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append('consultationId', consultationId.toString());
            formData.append('status', newStatus);
            if (responseNote) {
                formData.append('responseNote', responseNote);
            }

            const result = await updateConsultationStatus(formData);
            if (result.success) {
                await loadConsultations();
                setSelectedConsultation(null);
                setResponseNote('');
            } else {
                alert(result.error || '상태 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('상태 업데이트 중 오류:', error);
            alert('상태 업데이트 중 오류가 발생했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusCounts = () => {
        const total = consultations.length;
        const pending = consultations.filter(c => c.status === 'pending').length;
        const completed = consultations.filter(c => c.status === 'completed').length;
        return { total, pending, completed };
    };

    const filteredConsultations = consultations.filter(consultation => {
        const statusMatch = statusFilter === 'all' || consultation.status === statusFilter;
        const academyMatch = academyFilter === 'all' || consultation.academy === academyFilter;
        return statusMatch && academyMatch;
    });

    const pendingConsultations = filteredConsultations.filter(c => c.status === 'pending');
    const completedConsultations = filteredConsultations.filter(c => c.status === 'completed');

    const { total, pending, completed } = getStatusCounts();

    if (loading) {
        return (
            <div className="container mx-auto p-6 pt-20 lg:pt-6 h-screen overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-center h-64">
                    <div className="text-cyan-400 text-lg">상담문의를 불러오는 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 pt-20 lg:pt-6 space-y-6 h-screen overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">상담문의 관리</h1>
                    <p className="text-cyan-300 mt-2">대기 중이거나 완료된 상담 문의를 확인하세요</p>
                </div>
                <Button
                    onClick={loadConsultations}
                    className="bg-cyan-900/40 border border-cyan-500/50 text-cyan-100 hover:bg-cyan-800/60 transition-colors"
                >
                    새로고침
                </Button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-cyan-300">전체 문의</p>
                                <p className="text-2xl font-bold text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">{total}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-cyan-400/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-300">대기중</p>
                                <p className="text-2xl font-bold text-yellow-100 drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]">{pending}</p>
                            </div>
                            <div className="h-8 w-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-300">완료</p>
                                <p className="text-2xl font-bold text-green-100 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">{completed}</p>
                            </div>
                            <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 필터 */}
            <div className="flex flex-wrap gap-4 items-center bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-cyan-400" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32 bg-cyan-900/40 border-cyan-500/30 text-cyan-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-cyan-950 border-cyan-500/30 text-cyan-100">
                            <SelectItem value="all">전체 상태</SelectItem>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Select value={academyFilter} onValueChange={setAcademyFilter}>
                    <SelectTrigger className="w-48 bg-cyan-900/40 border-cyan-500/30 text-cyan-100">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cyan-950 border-cyan-500/30 text-cyan-100">
                        <SelectItem value="all">전체 학원</SelectItem>
                        <SelectItem value="코딩메이커">코딩메이커 (중마)</SelectItem>
                        <SelectItem value="광양코딩">광양코딩 (창덕)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 대기중인 상담문의 */}
            {(statusFilter === 'all' || statusFilter === 'pending') && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">대기중인 상담문의</h2>
                    <div className="grid gap-4">
                        {pendingConsultations.length === 0 ? (
                            <Card className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border-cyan-500/20">
                                <CardContent className="p-8 text-center text-cyan-400/60">
                                    <p>해당하는 대기중 상담문의가 없습니다.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            pendingConsultations.map((consultation) => (
                                <ConsultationCard
                                    key={consultation.id}
                                    consultation={consultation}
                                    onUpdate={loadConsultations}
                                    formatDate={formatDate}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 완료된 상담문의 */}
            {(statusFilter === 'all' || statusFilter === 'completed') && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">완료된 상담문의</h2>
                    <div className="grid gap-4">
                        {completedConsultations.length === 0 ? (
                            <Card className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border-cyan-500/20">
                                <CardContent className="p-8 text-center text-cyan-400/60">
                                    <p>해당하는 완료된 상담문의가 없습니다.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            completedConsultations.map((consultation) => (
                                <ConsultationCard
                                    key={consultation.id}
                                    consultation={consultation}
                                    onUpdate={loadConsultations}
                                    formatDate={formatDate}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ConsultationCard({ consultation, onUpdate, formatDate }: {
    consultation: Consultation,
    onUpdate: () => void,
    formatDate: (d: string) => string
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [responseNote, setResponseNote] = useState(consultation.response_note || '');
    const [selectedStatus, setSelectedStatus] = useState(consultation.status);
    const [open, setOpen] = useState(false);

    const handleUpdate = async () => {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append('consultationId', consultation.id.toString());
            formData.append('status', selectedStatus);
            if (responseNote) {
                formData.append('responseNote', responseNote);
            }

            const result = await updateConsultationStatus(formData);
            if (result.success) {
                onUpdate();
                setOpen(false);
            } else {
                alert(result.error || '업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('업데이트 중 오류:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card
                    className={`bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border-cyan-500/30 cursor-pointer hover:border-cyan-400 hover:bg-cyan-900/20 transition-all group ${consultation.status === 'completed' ? 'opacity-80 hover:opacity-100' : ''}`}
                >
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="text-lg font-bold text-cyan-100 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]">
                                    {consultation.name}
                                </span>
                                <span className="text-sm font-normal text-cyan-200/80 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {consultation.phone}
                                </span>
                                <span className="text-sm font-normal text-cyan-200/60 flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDate(consultation.created_at)}
                                </span>
                                <span className="text-sm font-normal text-cyan-200/80 flex items-center gap-1">
                                    <Building2 className="h-3 w-3 text-cyan-400" />
                                    {academyLabels[consultation.academy as keyof typeof academyLabels] || consultation.academy}
                                </span>
                            </CardTitle>
                            <Badge className={`${statusColors[consultation.status]} border-none shadow-[0_0_8px_rgba(255,255,255,0.2)]`}>
                                {statusLabels[consultation.status]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-1">
                                <Label className="text-xs font-medium text-cyan-400/70 uppercase tracking-wider">문의 과목</Label>
                                <p className="text-sm text-cyan-100 font-medium mt-1">
                                    {subjectLabels[consultation.subject as keyof typeof subjectLabels] || consultation.subject}
                                </p>
                            </div>
                            <div className="md:col-span-4">
                                <Label className="text-xs font-medium text-cyan-400/70 uppercase tracking-wider">문의 내용</Label>
                                <p className="text-sm text-cyan-100 whitespace-pre-wrap mt-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                                    {consultation.message}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-cyan-950 border-cyan-500/30 text-cyan-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">
                        상담문의 {consultation.status === 'pending' ? '처리하기' : '상세정보'} (ID: {consultation.id})
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4 bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/20">
                        <div className="space-y-1">
                            <Label className="text-xs text-cyan-400/70">이름 / 연락처</Label>
                            <p className="font-bold">{consultation.name} / {consultation.phone}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-cyan-400/70">신청 일시</Label>
                            <p>{formatDate(consultation.created_at)}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-cyan-400/70">학원 / 과목</Label>
                            <p>{academyLabels[consultation.academy as keyof typeof academyLabels] || consultation.academy} / {subjectLabels[consultation.subject as keyof typeof subjectLabels] || consultation.subject}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-cyan-300">문의 내용</Label>
                        <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/20 text-sm whitespace-pre-wrap min-h-[100px]">
                            {consultation.message}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-cyan-300">상태 변경</Label>
                            <Select value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
                                <SelectTrigger className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-cyan-950 border-cyan-500/30 text-cyan-100">
                                    <SelectItem value="pending">대기중</SelectItem>
                                    <SelectItem value="completed">완료</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-cyan-300">상담 응답/메모</Label>
                        <Textarea
                            placeholder="상담 결과나 메모를 입력하세요..."
                            value={responseNote}
                            onChange={(e) => setResponseNote(e.target.value)}
                            className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-600/50 min-h-[120px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-cyan-400 hover:text-cyan-100 hover:bg-cyan-900/40"
                        >
                            취소
                        </Button>
                        <Button
                            className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(0,255,255,0.3)] min-w-[120px]"
                            onClick={handleUpdate}
                            disabled={isUpdating}
                        >
                            {isUpdating ? '저장 중...' : '정보 업데이트'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
