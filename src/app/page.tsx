import { HeroSection } from '@/components/hero/hero-section';
import { BusinessSection } from '@/components/landing/business-section';
import { AcademySection } from '@/components/landing/academy-section';
import { StudentWorksSection } from '@/components/landing/student-works-section';
import { CurriculumSection } from '@/components/landing/curriculum-section';
import { InstructorsSection } from '@/components/landing/instructors-section';
import PromoModal from '@/components/common/PromoModal';
import FloatingBanner from '@/components/common/FloatingBanner';
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
      <BusinessSection initialBusinessAreas={content?.business_areas} />
      <AcademySection />
      <StudentWorksSection />
      <InstructorsSection />
      <CurriculumSection />
      <FloatingBanner 
        isActive={content?.floating_banner_active ?? false}
        imageUrl={content?.floating_banner_image}
        linkUrl={content?.floating_banner_link}
      />
    </div>
  );
}
