import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
            About Coducation
          </h1>
          <p className="text-lg text-muted-foreground">
            우리는 코딩 교육을 통해 아이들이 미래의 창의적인 인재로 성장할 수 있도록 돕습니다.
          </p>
          <div className="space-y-6 text-foreground/80">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline">우리의 미션</h2>
              <p>
                Coducation은 단순한 코딩 기술 교육을 넘어, 논리적 사고력, 문제 해결 능력, 창의력을 함양하는 것을 목표로 합니다. 학생 개개인의 잠재력을 최대로 이끌어내어 미래 사회가 요구하는 핵심 인재를 양성합니다.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline">우리의 비전</h2>
              <p>
                우리는 모든 학생이 코딩을 통해 자신의 아이디어를 현실로 만들 수 있는 세상을 꿈꿉니다. 지역 사회와 함께 성장하며, 최고의 코딩 교육 허브가 되는 것이 우리의 비전입니다.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-center">
          <Image
            src="https://placehold.co/600x400.png"
            data-ai-hint="team collaboration"
            alt="Team working on code"
            width={600}
            height={400}
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
