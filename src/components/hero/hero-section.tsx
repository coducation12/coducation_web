'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/ui/contact-modal';
import { Instagram } from 'lucide-react';

export function HeroSection() {
  const headingText = "코딩으로 세상을 교육하다, Coducation";
  const contactButtonText = "상담 문의";
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section id="home" className="w-full min-h-[70vh] md:min-h-screen flex items-center justify-center py-8 md:py-0">
      <div className="container px-4 md:px-6">
        <Card className="relative overflow-hidden border-primary/20 shadow-lg shadow-primary/10">
          <div className="relative z-10 p-6 md:p-16">
            <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center">
              <h1
                className="text-3xl sm:text-4xl md:text-6xl xl:text-7xl/none font-bold tracking-tighter font-headline glitch-heading leading-tight"
                data-text={headingText}
              >
                {headingText}
              </h1>
              <p className="max-w-[1000px] text-sm sm:text-base md:text-xl text-muted-foreground px-2">
                코듀케이션과 함께 미래를 코딩하세요. <br className="hidden sm:block" /> 전문적인 커리큘럼과 맞춤형 학습으로 여러분의 잠재력을 깨워드립니다.
              </p>
              <div className="flex justify-center pt-4 md:pt-6">
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="relative px-8 md:px-16 py-4 md:py-6 text-lg md:text-2xl font-black bg-black border-2 border-primary text-primary hover:border-white hover:text-white transition-all duration-300 group"
                  size="lg"
                  style={{
                    textShadow: '0 0 10px currentColor'
                  }}
                >
                  <span className="relative z-10 tracking-wider">{contactButtonText}</span>
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/30 transition-all duration-300"></div>
                </Button>
              </div>
            </div>
          </div>

          <a
            href="https://www.instagram.com/coducation.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 right-6 z-20 transition-all duration-500 hover:scale-110 group"
            aria-label="Coducation Instagram"
          >
            <div className="relative p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-gradient-to-tr group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] transition-all duration-500 shadow-xl group-hover:shadow-[0_0_25px_rgba(238,42,123,0.5)] group-hover:border-transparent">
              <Instagram className="w-8 h-8 md:w-10 md:h-10 text-white transition-transform duration-500 group-hover:rotate-6" />
            </div>
          </a>
        </Card>
      </div>

      <ContactModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
      />
    </section>
  );
}
