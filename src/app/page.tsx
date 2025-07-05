
import { HeroSection } from '@/components/hero/hero-section';
import { AboutSection } from '@/components/landing/about-section';
import { AcademySection } from '@/components/landing/academy-section';
import { CurriculumSection } from '@/components/landing/curriculum-section';
import { InstructorsSection } from '@/components/landing/instructors-section';
import { ReviewsSection } from '@/components/landing/reviews-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <AcademySection />
      <InstructorsSection />
      <CurriculumSection />
      <ReviewsSection />
    </div>
  );
}
