'use client';

import React, { Fragment } from 'react';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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

            {/* 이름과 담당 과목 / 이메일 */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold font-headline text-cyan-100">{instructor.name}</h3>
              <div className="flex flex-col items-center gap-2">
                {instructor.subject && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5">
                    {instructor.subject}
                  </Badge>
                )}
                {instructor.email && (
                  <span className="text-cyan-200/70 text-sm font-medium hover:text-cyan-200 transition-colors">
                    {instructor.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 자기소개 */}
          <Card className="bg-cyan-900/10 border-cyan-500/20">
            <CardContent className="pt-6">
              <h4 className="text-lg font-semibold mb-3 text-cyan-400 font-headline">자기소개</h4>
              <p className="text-cyan-100 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {instructor.bio}
              </p>
            </CardContent>
          </Card>

          {/* 자격증 정보 */}
          {instructor.certs && (
            <Card className="bg-cyan-900/10 border-cyan-500/20">
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-3 text-cyan-400 font-headline">자격증</h4>
                {Array.isArray(instructor.certs) ? (
                  <div className="grid grid-cols-[1.2fr_1fr_auto] gap-x-4 gap-y-3 items-baseline">
                    {instructor.certs.map((item: any, index: number) => (
                      <Fragment key={index}>
                        <span className="text-cyan-100 font-medium text-sm md:text-base line-clamp-1 pb-1 border-b border-cyan-500/5">{item.name}</span>
                        <span className="text-cyan-200/80 text-xs md:text-sm line-clamp-1 pb-1 border-b border-cyan-500/5">{item.issuer}</span>
                        <span className="text-cyan-200/50 text-xs md:text-sm font-mono whitespace-nowrap text-right pb-1 border-b border-cyan-500/5">{item.date}</span>
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="text-cyan-100 text-sm md:text-base whitespace-pre-line">
                    {instructor.certs}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 경력 정보 */}
          {instructor.career && (
            <Card className="bg-cyan-900/10 border-cyan-500/20">
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-3 text-cyan-400 font-headline">경력</h4>
                {Array.isArray(instructor.career) ? (
                  <div className="grid grid-cols-[1.2fr_1fr_auto] gap-x-4 gap-y-3 items-baseline">
                    {instructor.career.map((item: any, index: number) => (
                      <Fragment key={index}>
                        <span className="text-cyan-100 font-medium text-sm md:text-base line-clamp-1 pb-1 border-b border-cyan-500/5">{item.company}</span>
                        <span className="text-cyan-200/80 text-xs md:text-sm line-clamp-1 pb-1 border-b border-cyan-500/5">{item.position}</span>
                        <span className="text-cyan-200/50 text-xs md:text-sm font-mono whitespace-nowrap text-right pb-1 border-b border-cyan-500/5">{item.period}</span>
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="text-cyan-100 text-sm md:text-base whitespace-pre-line">
                    {instructor.career}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
