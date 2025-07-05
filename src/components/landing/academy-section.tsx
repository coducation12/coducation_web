'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, BookOpen, Users } from 'lucide-react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

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

const academySlides = [
  {
    image: 'https://placehold.co/600x400.png',
    alt: '쾌적하고 현대적인 학습 공간',
    title: '최첨단 학습 환경',
    description: '학생들이 창의력을 마음껏 발휘할 수 있는 현대적이고 영감을 주는 공간을 제공합니다.',
    hint: 'modern classroom',
  },
  {
    image: 'https://placehold.co/600x400.png',
    alt: '소수 정예 맞춤형 수업',
    title: '개인별 맞춤 지도',
    description: '소수 정예 수업으로 강사가 학생 한 명 한 명에게 집중하여 잠재력을 최대로 이끌어냅니다.',
    hint: 'teacher student interaction',
  },
  {
    image: 'https://placehold.co/600x400.png',
    alt: '프로젝트 기반 실습',
    title: '실전 프로젝트 중심',
    description: '실제 문제를 해결하는 프로젝트를 통해 코딩 실력과 문제 해결 능력을 동시에 기릅니다.',
    hint: 'students programming',
  },
];

export function AcademySection() {
    const mainCarouselPlugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

  return (
    <section id="academy" className="container w-full py-32 md:py-52">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">코딩메이커 학원 안내</h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          창의력과 기술이 만나는 곳, 코딩메이커 학원에 오신 것을 환영합니다.
        </p>
      </div>
      
      <Carousel
        plugins={[mainCarouselPlugin.current]}
        className="w-full mb-12"
        opts={{ loop: true }}
        onMouseEnter={mainCarouselPlugin.current.stop}
        onMouseLeave={mainCarouselPlugin.current.reset}
      >
        <CarouselContent>
          {academySlides.map((slide, index) => (
            <CarouselItem key={index}>
               <div className="grid grid-cols-1 md:grid-cols-2 items-center bg-card rounded-xl overflow-hidden">
                <div className="p-8 md:p-12 space-y-4 order-2 md:order-1">
                  <h3 className="text-3xl font-bold text-primary font-headline tracking-wider">{slide.title}</h3>
                  <p className="text-lg text-muted-foreground mt-2">{slide.description}</p>
                </div>
                <div className="relative w-full h-96 order-1 md:order-2">
                  <Image src={slide.image} data-ai-hint={slide.hint} alt={slide.alt} layout="fill" objectFit="cover" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="w-full grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="flex flex-col cyber-card">
            <CardHeader className="flex flex-col items-center text-center">
              {feature.icon}
              <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground flex-grow">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
