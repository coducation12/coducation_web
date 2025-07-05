import Link from 'next/link';
import { Card } from '@/components/ui/card';

export function HeroSection() {
  const headingText = "코딩으로 세상을 교육하다, Coducation";
  const buttonText = "과정 둘러보기";
  
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
                코딩메이커 학원과 함께 미래를 코딩하세요. 전문적인 커리큘럼과 맞춤형 학습으로 여러분의 잠재력을 깨워드립니다.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                 <Link href="/curriculum" className="cyber-button">
                    {buttonText}
                  </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
