'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import type { Instructor } from '@/types';

interface InstructorDetailModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstructorDetailModal({ instructor, isOpen, onClose }: InstructorDetailModalProps) {
  if (!instructor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">
            강사 상세 정보
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 프로필 섹션 */}
          <div className="flex flex-col items-center space-y-4">
            {/* 큰 프로필 이미지 (사각형) */}
            <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-primary/20">
              <Image
                src={instructor.profile_image}
                alt={instructor.name}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/400x400.png';
                }}
              />
            </div>

            {/* 이름과 담당 과목 / 직위 */}
            <div className="text-center space-y-2">
              <div className="flex flex-col items-center">
                <h3 className="text-3xl font-bold font-headline">{instructor.name}</h3>
                {instructor.position && (
                  <span className="text-lg text-cyan-400 font-medium">{instructor.position}</span>
                )}
              </div>
              {instructor.subject && (
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/20">
                  {instructor.subject}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* 자기소개 */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="text-lg font-semibold mb-3 text-primary">자기소개</h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {instructor.bio}
              </p>
            </CardContent>
          </Card>

          {/* 경력 정보 */}
          {instructor.career && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-3 text-primary">경력</h4>
                {Array.isArray(instructor.career) ? (
                  <ul className="space-y-3">
                    {instructor.career.map((item: any, index: number) => (
                      <li key={index} className="flex flex-col border-l-2 border-cyan-500/30 pl-3">
                        <span className="font-semibold text-cyan-100">{item.company}</span>
                        <div className="flex justify-between text-sm text-cyan-200/70">
                          <span>{item.position}</span>
                          <span>{item.period}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {instructor.career}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 자격증 정보 */}
          {instructor.certs && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-3 text-primary">자격증</h4>
                {Array.isArray(instructor.certs) ? (
                  <ul className="space-y-2">
                    {instructor.certs.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-cyan-100">
                        <span className="text-cyan-400">•</span>
                        <div className="flex-1 flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-sm text-cyan-200/50">{item.issuer} {item.date && `(${item.date})`}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {instructor.certs}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 이메일 정보 (있는 경우) */}
          {instructor.email && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-3 text-primary">이메일</h4>
                <p className="text-muted-foreground">
                  {instructor.email}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
