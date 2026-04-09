'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Layers } from 'lucide-react';
import type { Curriculum } from '@/types';
import { cn } from "@/lib/utils";

interface CurriculumCardProps {
  curriculum: Curriculum;
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const levelColors = {
    '기초': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    '중급': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    '고급': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <Card className="group relative overflow-hidden bg-[#0a1120] border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] h-full">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-cyan-500/5 blur-[60px] group-hover:bg-cyan-500/10 transition-colors" />
      
      {/* Image Section - Height reduced for mobile density */}
      <div className="relative h-28 sm:h-48 w-full overflow-hidden bg-slate-900/50 flex items-center justify-center">
        {curriculum.image ? (
          <img 
            src={curriculum.image} 
            alt={curriculum.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-800" />
        )}
        
        {/* Floating Badge */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
          <Badge className={cn("px-1.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded sm:rounded-lg border", levelColors[curriculum.level as keyof typeof levelColors] || levelColors['기초'])}>
            {curriculum.level}
          </Badge>
        </div>
      </div>

      <CardContent className="p-2 sm:p-4">
        {/* Title */}
        <h3 className="text-sm sm:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1 text-center">
          {curriculum.title}
        </h3>
      </CardContent>
    </Card>
  );
}
