
import { HeroSection } from '@/components/hero/hero-section';
import { AcademySection } from '@/components/landing/academy-section';
import { CurriculumSection } from '@/components/landing/curriculum-section';
import { InstructorsSection } from '@/components/landing/instructors-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AcademySection />
      <InstructorsSection />
      <CurriculumSection />
    </div>
  );
}
