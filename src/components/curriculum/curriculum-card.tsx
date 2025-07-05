import type { Curriculum } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CurriculumCardProps {
  curriculum: Curriculum;
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const levelColor = {
    '기초': 'bg-green-500',
    '중급': 'bg-yellow-500',
    '고급': 'bg-red-500',
  };

  return (
    <Card className="cyber-card flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
            <Image src={curriculum.image || 'https://placehold.co/600x400.png'} data-ai-hint="abstract technology" alt={curriculum.title} layout="fill" objectFit="cover" />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl font-headline">{curriculum.title}</CardTitle>
            <Badge className={cn("text-white", levelColor[curriculum.level])}>{curriculum.level}</Badge>
        </div>
        <CardDescription>{curriculum.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
