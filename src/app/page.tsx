import { HeroSection } from '@/components/hero/hero-section';
import { NoticesSection } from '@/components/notices/notices-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <NoticesSection />
    </div>
  );
}
