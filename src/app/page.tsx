import { HeroSection } from '@/components/hero/hero-section';
import { AcademySection } from '@/components/landing/academy-section';
import { CurriculumSection } from '@/components/landing/curriculum-section';
import { InstructorsSection } from '@/components/landing/instructors-section';
import PromoModal from '@/components/common/PromoModal';
import { getContent } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: content } = await getContent();

  return (
    <div className="flex flex-col">
      <PromoModal
        active={content?.promo_active ?? false}
        imageUrl={content?.promo_image}
      />
      <HeroSection />
      <AcademySection />
      <InstructorsSection />
      <CurriculumSection />
    </div>
  );
}
