'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/ui/contact-modal';

export function HeroSection() {
  const headingText = "코딩으로 세상을 교육하다, Coducation";
  const contactButtonText = "상담 문의";
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  return (
    <section id="home" className="w-full min-h-screen flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <Card className="relative overflow-hidden border-primary/20 shadow-lg shadow-primary/10">
          <div className="relative z-10 p-8 md:p-16">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h1
                className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none font-headline glitch-heading"
                data-text={headingText}
              >
                {headingText}
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
              코듀케이션과 함께 미래를 코딩하세요. <br /> 전문적인 커리큘럼과 맞춤형 학습으로 여러분의 잠재력을 깨워드립니다.
              </p>
              <div className="flex justify-center pt-6">
                 <Button 
                   onClick={() => setIsContactModalOpen(true)}
                   className="relative px-16 py-6 text-2xl font-black bg-black border-2 border-primary text-primary hover:border-white hover:text-white transition-all duration-300 group"
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
        </Card>
      </div>
      
      <ContactModal 
        open={isContactModalOpen} 
        onOpenChange={setIsContactModalOpen} 
      />
    </section>
  );
}
