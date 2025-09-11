'use client';

import { useState } from 'react';
import { saveConsultation } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    academy: '',
    subject: '',
    message: ''
  });

  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const academyOptions = [
    { value: 'coding-maker', label: '코딩메이커 (중마)' },
    { value: 'gwangyang-coding', label: '광양코딩 (창덕)' }
  ];

  const subjectOptions = [
    { value: 'certification', label: '자격증' },
    { value: 'block-coding', label: '블록 코딩' },
    { value: 'advanced-programming', label: '프로그래밍 언어' },
    { value: 'graphics', label: '그래픽스' },
    { value: 'other', label: '기타' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name || !formData.phone || !formData.academy || !formData.subject || !formData.message) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    
    // 개인정보 동의 검증
    if (!privacyConsent) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // FormData 생성
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('phone', formData.phone);
      formDataToSubmit.append('academy', formData.academy);
      formDataToSubmit.append('subject', formData.subject);
      formDataToSubmit.append('message', formData.message);
      formDataToSubmit.append('privacy_consent', privacyConsent.toString());
      
      // 서버 액션 호출
      const result = await saveConsultation(formDataToSubmit);
      
      if (result.success) {
        // 폼 초기화
        setFormData({ name: '', phone: '', academy: '', subject: '', message: '' });
        setPrivacyConsent(false);
        // 모달 닫기
        onOpenChange(false);
        // 성공 메시지 표시
        alert(result.message || '상담 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
      } else {
        alert(result.error || '상담 문의 접수 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('상담 문의 제출 중 오류:', error);
      alert('상담 문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">상담 문의</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              type="text"
              placeholder="성함 또는 자녀의 이름을 입력해주세요"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">연락처 *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="연락 가능한 번호를 입력해주세요"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="academy">학원 선택 *</Label>
            <Select value={formData.academy} onValueChange={(value) => handleInputChange('academy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="학원을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {academyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">희망 과목 *</Label>
            <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
              <SelectTrigger>
                <SelectValue placeholder="희망하시는 과목을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">문의 내용 *</Label>
            <Textarea
              id="message"
              placeholder="문의사항을 적어주세요."
              rows={4}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
            />
          </div>
          
          {/* 개인정보 수집 및 이용 동의 */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-2">개인정보 수집 및 이용 동의 (필수)</p>
              <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
                <p><strong>• 수집 항목:</strong> 이름, 연락처</p>
                <p><strong>• 수집 목적:</strong> 상담 문의 응답 및 교육 서비스 안내</p>
                <p><strong>• 보유 기간:</strong> 상담 완료 후 1년</p>
                <p><strong>• 동의 거부 권리:</strong> 개인정보 수집에 동의하지 않을 권리가 있으며, 동의 거부 시 상담 서비스 이용이 제한될 수 있습니다.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="privacy-consent" 
                checked={privacyConsent}
                onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
              />
              <Label 
                htmlFor="privacy-consent" 
                className="text-sm cursor-pointer"
              >
                개인정보 수집 및 이용에 동의합니다. (필수)
              </Label>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? '접수 중...' : '상담 문의'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
