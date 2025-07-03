'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="w-full bg-card py-6 md:py-8 lg:py-10">
      <div className="container px-4 md:px-6">
        <Carousel
          className="w-full"
          plugins={[plugin.current]}
          setApi={setApi}
        >
          <CarouselContent>
            <CarouselItem>
              <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_350px] lg:gap-8 xl:grid-cols-[1fr_450px]">
                <div className="flex flex-col justify-center space-y-3 md:space-y-4">
                  <div className="space-y-2 md:space-y-3">
                    <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl/none font-headline text-primary">
                      코딩으로 세상을 교육하다, Coducation
                    </h1>
                    <p className="max-w-[600px] text-sm md:text-base lg:text-lg text-muted-foreground">
                      코딩메이커 학원과 함께 미래를 코딩하세요. 전문적인
                      커리큘럼과 맞춤형 학습으로 여러분의 잠재력을
                      깨워드립니다.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button asChild size="sm" className="text-sm md:text-base h-8 md:h-9 px-4 md:px-6">
                      <Link href="/curriculum">
                        과정 둘러보기
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-sm md:text-base h-8 md:h-9 px-4 md:px-6">
                      <Link href="/academy">학원 소개</Link>
                    </Button>
                  </div>
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-xl lg:order-last w-full mx-auto max-w-[400px] max-h-[180px] md:max-h-[260px] md:max-w-[400px] lg:max-h-[320px] xl:max-w-[480px]">
                  <img
                    src="https://placehold.co/600x400.png"
                    data-ai-hint="coding education"
                    alt="Hero"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_350px] lg:gap-8 xl:grid-cols-[1fr_450px]">
                <div className="flex flex-col justify-center space-y-3 md:space-y-4">
                  <div className="space-y-2 md:space-y-3">
                    <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl/none font-headline text-primary">
                      실력있는 강사진
                    </h1>
                    <p className="max-w-[600px] text-sm md:text-base lg:text-lg text-muted-foreground">
                      검증된 실력과 경험을 갖춘 강사진이 여러분의 성장을
                      이끌어갑니다.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button asChild size="sm" className="text-sm md:text-base h-8 md:h-9 px-4 md:px-6">
                      <Link href="/instructors">
                        강사진 보기
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-xl lg:order-last w-full mx-auto max-w-[400px] max-h-[180px] md:max-h-[260px] md:max-w-[400px] lg:max-h-[320px] xl:max-w-[480px]">
                  <img
                    src="https://placehold.co/600x400.png"
                    data-ai-hint="instructors"
                    alt="Hero"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_350px] lg:gap-8 xl:grid-cols-[1fr_450px]">
                <div className="flex flex-col justify-center space-y-3 md:space-y-4">
                  <div className="space-y-2 md:space-y-3">
                    <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl/none font-headline text-primary">
                      최신 기술 스택
                    </h1>
                    <p className="max-w-[600px] text-sm md:text-base lg:text-lg text-muted-foreground">
                      현업에서 가장 많이 사용하는 기술들을 중심으로 학습합니다.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button asChild size="sm" className="text-sm md:text-base h-8 md:h-9 px-4 md:px-6">
                      <Link href="/curriculum">
                        커리큘럼 확인
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-xl lg:order-last w-full mx-auto max-w-[400px] max-h-[180px] md:max-h-[260px] md:max-w-[400px] lg:max-h-[320px] xl:max-w-[480px]">
                  <img
                    src="https://placehold.co/600x400.png"
                    data-ai-hint="tech stack"
                    alt="Hero"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        
        {/* 인디케이터 버튼들 */}
        <div className="flex justify-center mt-4 md:mt-5">
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                  current === index 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
