
import { getContent, getMainCurriculums } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AcademyContentSettings from "@/components/admin/content/AcademyContentSettings";
import CurriculumSettings from "@/components/admin/content/CurriculumSettings";
import PromoModalSettings from "@/components/admin/content/PromoModalSettings";

export const dynamic = 'force-dynamic';

export default async function ContentManagePage() {
  const { data: content } = await getContent();
  const { data: curriculums } = await getMainCurriculums();

  // 기본값 설정 (null 방지)
  const initialData = {
    academy_title: content?.academy_title || '',
    academy_subtitle: content?.academy_subtitle || '',
    academy_slides: content?.academy_slides || [],
    featured_card_1_title: content?.featured_card_1_title || '',
    featured_card_1_image_1: content?.featured_card_1_image_1 || '',
    featured_card_1_image_2: content?.featured_card_1_image_2 || '',
    featured_card_1_link: content?.featured_card_1_link || '',
    featured_card_2_title: content?.featured_card_2_title || '',
    featured_card_2_image_1: content?.featured_card_2_image_1 || '',
    featured_card_2_image_2: content?.featured_card_2_image_2 || '',
    featured_card_2_link: content?.featured_card_2_link || '',
    promo_active: content?.promo_active || false,
    promo_image: content?.promo_image || ''
  };

  return (
    <div className="p-6 space-y-6 pt-16 lg:pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-cyan-100 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
          컨텐츠 관리
        </h1>
        <p className="text-muted-foreground mt-2">
          메인 화면의 컨텐츠와 프로모션 팝업을 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="academy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="academy">학원 소개</TabsTrigger>
          <TabsTrigger value="curriculum">교육 과정</TabsTrigger>
          <TabsTrigger value="promo">프로모션</TabsTrigger>
        </TabsList>

        <TabsContent value="academy">
          <AcademyContentSettings initialData={initialData} />
        </TabsContent>

        <TabsContent value="curriculum">
          <CurriculumSettings initialCurriculums={curriculums || []} />
        </TabsContent>

        <TabsContent value="promo">
          <PromoModalSettings initialData={initialData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}