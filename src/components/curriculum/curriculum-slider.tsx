'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Curriculum } from '@/types';
import { CurriculumCard } from '@/components/curriculum/curriculum-card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const levels = ['기초', '중급', '고급'] as const;

interface CurriculumSliderProps {
  level: typeof levels[number];
  curriculums: Curriculum[];
}

export function CurriculumSlider({ level, curriculums }: CurriculumSliderProps) {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  // 커리큘럼이 없을 경우 빈 상태 표시
  if (curriculums.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-headline text-primary">
            {level} 과정
          </h3>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            아직 {level} 과정이 등록되지 않았습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-headline text-primary">
          {level} 과정
        </h3>
        {curriculums.length > 3 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={current === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={current === curriculums.length - 3}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'start',
          loop: false,
        }}
        plugins={[
          Autoplay({ delay: 4000, stopOnInteraction: true })
        ]}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {curriculums.map((curriculum, index) => (
            <CarouselItem key={curriculum.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <CurriculumCard curriculum={curriculum} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* 인디케이터 */}
        {curriculums.length > 3 && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(curriculums.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index * 3)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(current / 3) === index 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`슬라이드 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </div>
        )}
      </Carousel>
    </div>
  );
} 