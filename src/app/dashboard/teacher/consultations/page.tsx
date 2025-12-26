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
import { CalendarDays, Phone, User, MessageSquare, Building2 } from 'lucide-react';

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

export const dynamic = 'force-dynamic';

export default function TeacherConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-20 lg:pt-6 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">상담문의를 불러오는 중...</div>
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

      {/* 대기중인 상담문의 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-sky-600">대기중인 상담문의</h2>
        <div className="grid gap-6">
          {consultations.filter(c => c.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">대기중인 상담문의가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            consultations.filter(c => c.status === 'pending').map((consultation) => (
              <Card key={consultation.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="text-left hover:text-blue-400 transition-colors cursor-pointer"
                            onClick={() => setSelectedConsultation(consultation)}
                          >
                            {consultation.name}
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>상담문의 처리하기</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>상태 선택</Label>
                              <Select
                                defaultValue={consultation.status}
                                onValueChange={(value) => {
                                  setSelectedConsultation(prev =>
                                    prev ? { ...prev, status: value as any } : null
                                  );
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

                            <div>
                              <Label>응답 내용 (선택사항)</Label>
                              <Textarea
                                placeholder="상담 응답 내용을 입력하세요..."
                                value={responseNote}
                                onChange={(e) => setResponseNote(e.target.value)}
                                rows={4}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedConsultation(null);
                                  setResponseNote('');
                                }}
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => {
                                  if (selectedConsultation) {
                                    handleStatusUpdate(selectedConsultation.id, selectedConsultation.status);
                                  }
                                }}
                                disabled={isUpdating}
                              >
                                {isUpdating ? '업데이트 중...' : '처리하기'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <span className="text-sm font-normal text-white ml-2">
                        {consultation.phone}
                      </span>
                      <span className="text-sm font-normal text-white ml-4">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        {academyLabels[consultation.academy as keyof typeof academyLabels]}
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
                          {subjectLabels[consultation.subject as keyof typeof subjectLabels]}
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
            ))
          )}
        </div>
      </div>

      {/* 완료된 상담문의 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-sky-600">완료된 상담문의</h2>
        <div className="grid gap-6">
          {consultations.filter(c => c.status === 'completed').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">완료된 상담문의가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            consultations.filter(c => c.status === 'completed').map((consultation) => (
              <Card key={consultation.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="text-left hover:text-blue-400 transition-colors cursor-pointer"
                            onClick={() => setSelectedConsultation(consultation)}
                          >
                            {consultation.name}
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>상담문의 처리하기</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>상태 선택</Label>
                              <Select
                                defaultValue={consultation.status}
                                onValueChange={(value) => {
                                  setSelectedConsultation(prev =>
                                    prev ? { ...prev, status: value as any } : null
                                  );
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

                            <div>
                              <Label>응답 내용 (선택사항)</Label>
                              <Textarea
                                placeholder="상담 응답 내용을 입력하세요..."
                                value={responseNote}
                                onChange={(e) => setResponseNote(e.target.value)}
                                rows={4}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedConsultation(null);
                                  setResponseNote('');
                                }}
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => {
                                  if (selectedConsultation) {
                                    handleStatusUpdate(selectedConsultation.id, selectedConsultation.status);
                                  }
                                }}
                                disabled={isUpdating}
                              >
                                {isUpdating ? '업데이트 중...' : '처리하기'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <span className="text-sm font-normal text-white ml-2">
                        {consultation.phone}
                      </span>
                      <span className="text-sm font-normal text-white ml-4">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        {academyLabels[consultation.academy as keyof typeof academyLabels]}
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
                          {subjectLabels[consultation.subject as keyof typeof subjectLabels]}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}