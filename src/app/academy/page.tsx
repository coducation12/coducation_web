import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, BookOpen, Users } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: '최적의 학습 환경',
    description: '전남 광양에 위치한 저희 학원은 학생들이 코딩에만 집중할 수 있도록 쾌적하고 현대적인 학습 공간을 제공합니다.',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: '체계적인 교육 철학',
    description: '프로젝트 기반 학습(PBL)을 통해 학생들이 실제 문제를 해결하며 배우는 실용적인 교육을 추구합니다.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: '소수 정예 맞춤 수업',
    description: '소수 정예로 클래스를 운영하여 강사가 학생 한 명 한 명에게 집중하고, 맞춤형 피드백을 제공합니다.',
  },
];

export default function AcademyPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">코딩메이커 학원 안내</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          창의력과 기술이 만나는 곳, 코딩메이커 학원에 오신 것을 환영합니다.
        </p>
      </div>
      
      <div className="relative w-full h-96 rounded-xl overflow-hidden mb-12">
        <Image src="https://placehold.co/1200x400.png" data-ai-hint="modern classroom" alt="Academy interior" layout="fill" objectFit="cover" />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-col items-center text-center">
              {feature.icon}
              <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
