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
import { CalendarDays, Phone, User, MessageSquare, Building2, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusLabels: Record<'pending' | 'completed', string> = {
  pending: '대기중',
  completed: '완료'
};

const statusColors: Record<'pending' | 'completed', string> = {
  pending: 'bg-yellow-500 text-white',
  completed: 'bg-green-500 text-white'
};

const subjectLabels = {
  'certification': '자격증',
  'block-coding': '블록 코딩',
  'advanced-programming': '프로그래밍 언어',
  'other': '기타'
};

const academyLabels = {
  'coding-maker': '코딩메이커 (중마)',
  'gwangyang-coding': '광양코딩 (창덕)'
};

export default function AdminConsultationsPage() {
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
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
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
      <div className="container mx-auto p-6 pt-20 lg:pt-6 space-y-6 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400 text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-20 lg:pt-6 space-y-6 h-screen overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-sky-600">상담문의 관리</h1>
        <Button onClick={loadConsultations} variant="outline">
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 문의</p>
                <p className="text-2xl font-bold text-sky-600">{total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-sky-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">대기중</p>
                <p className="text-2xl font-bold text-yellow-600">{pending}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">완료</p>
                <p className="text-2xl font-bold text-green-600">{completed}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="pending">대기중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={academyFilter} onValueChange={setAcademyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 학원</SelectItem>
            <SelectItem value="coding-maker">코딩메이커 (중마)</SelectItem>
            <SelectItem value="gwangyang-coding">광양코딩 (창덕)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 대기중인 상담문의 */}
      {pendingConsultations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-sky-600">대기중인 상담문의</h2>
          {pendingConsultations.map((consultation) => (
            <Dialog
              key={consultation.id}
              onOpenChange={(open) => {
                if (open) {
                  setSelectedConsultation(consultation);
                  setResponseNote(consultation.response_note || '');
                }
              }}
            >
              <DialogTrigger asChild>
                <Card
                  className="border-2 cursor-pointer hover:border-sky-400 transition-all group"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-left group-hover:text-sky-400 transition-colors">
                          {consultation.name}
                        </span>
                        <span className="text-sm font-normal text-white ml-2">
                          {consultation.phone}
                        </span>
                        <span className="text-sm font-normal text-white ml-4">
                          <Building2 className="h-4 w-4 inline mr-1" />
                          {academyLabels[consultation.academy as keyof typeof academyLabels] || consultation.academy}
                        </span>
                        <span className="text-sm font-normal text-white ml-4">
                          <CalendarDays className="h-4 w-4 inline mr-1" />
                          {formatDate(consultation.created_at)}
                        </span>
                      </CardTitle>
                      <Badge className={statusColors[consultation.status]}>
                        {statusLabels[consultation.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-4">
                        <div className="col-span-1">
                          <Label className="text-sm font-medium">문의 과목</Label>
                          <p className="text-sm text-white">
                            {subjectLabels[consultation.subject as keyof typeof subjectLabels] || consultation.subject}
                          </p>
                        </div>
                        <div className="col-span-4">
                          <Label className="text-sm font-medium">문의 내용</Label>
                          <p className="text-sm text-white whitespace-pre-wrap">
                            {consultation.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>상담문의 처리하기 (ID: {consultation.id})</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>상태 변경</Label>
                    <Select
                      value={selectedConsultation?.id === consultation.id ? selectedConsultation.status : consultation.status}
                      onValueChange={(value: string) => {
                        setSelectedConsultation({
                          ...consultation,
                          status: value as 'pending' | 'completed'
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">대기중</SelectItem>
                        <SelectItem value="completed">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>응답 내용 (기존 내용 유지됨)</Label>
                    <Textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="응답 내용을 입력하세요..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      className="w-full bg-sky-600 hover:bg-sky-700"
                      onClick={() => handleStatusUpdate(consultation.id, selectedConsultation?.status || consultation.status)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? '처리 중...' : '저장하기'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* 완료된 상담문의 */}
      {completedConsultations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-sky-600">완료된 상담문의</h2>
          {completedConsultations.map((consultation) => (
            <Dialog
              key={consultation.id}
              onOpenChange={(open) => {
                if (open) {
                  setSelectedConsultation(consultation);
                  setResponseNote(consultation.response_note || '');
                }
              }}
            >
              <DialogTrigger asChild>
                <Card
                  className="border-2 cursor-pointer hover:border-sky-400 transition-all group opacity-80 hover:opacity-100"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-left group-hover:text-sky-400 transition-colors">
                          {consultation.name}
                        </span>
                        <span className="text-sm font-normal text-white ml-2">
                          {consultation.phone}
                        </span>
                        <span className="text-sm font-normal text-white ml-4">
                          <Building2 className="h-4 w-4 inline mr-1" />
                          {academyLabels[consultation.academy as keyof typeof academyLabels] || consultation.academy}
                        </span>
                        <span className="text-sm font-normal text-white ml-4">
                          <CalendarDays className="h-4 w-4 inline mr-1" />
                          {formatDate(consultation.created_at)}
                        </span>
                      </CardTitle>
                      <Badge className={statusColors[consultation.status]}>
                        {statusLabels[consultation.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-4">
                        <div className="col-span-1">
                          <Label className="text-sm font-medium">문의 과목</Label>
                          <p className="text-sm text-white">
                            {subjectLabels[consultation.subject as keyof typeof subjectLabels] || consultation.subject}
                          </p>
                        </div>
                        <div className="col-span-4">
                          <Label className="text-sm font-medium">문의 내용</Label>
                          <p className="text-sm text-white whitespace-pre-wrap">
                            {consultation.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>상담문의 확인/수정 (ID: {consultation.id})</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>상태 변경</Label>
                    <Select
                      value={selectedConsultation?.id === consultation.id ? selectedConsultation.status : consultation.status}
                      onValueChange={(value: string) => {
                        setSelectedConsultation({
                          ...consultation,
                          status: value as 'pending' | 'completed'
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">대기중</SelectItem>
                        <SelectItem value="completed">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>응답 내용</Label>
                    <Textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="응답 내용을 입력하세요..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      className="w-full bg-sky-600 hover:bg-sky-700"
                      onClick={() => handleStatusUpdate(consultation.id, selectedConsultation?.status || consultation.status)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? '처리 중...' : '저장하기'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {filteredConsultations.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">상담문의가 없습니다.</p>
        </div>
      )}
    </div>
  );
}