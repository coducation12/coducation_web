'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Curriculum } from '@/types';
import { CurriculumCard } from '@/components/curriculum/curriculum-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { supabase } from '@/lib/supabase';

export function CurriculumSection() {
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // DB?먯꽌 硫붿씤?붾㈃???쒖떆??而ㅻ━?섎읆 議고쉶
    useEffect(() => {
        const fetchCurriculums = async () => {
            try {
                const { data, error } = await supabase
                    .from('curriculums')
                    .select('id, title, description, category, level, image, checklist, created_by, created_at, public')
                    .eq('show_on_main', true)
                    .order('level', { ascending: true })
                    .order('main_display_order', { ascending: true });

                if (error) {
                    console.error('而ㅻ━?섎읆 議고쉶 ?ㅻ쪟:', error);
                    setCurriculums([]);
                } else {
                    // Curriculum ??낆뿉 留욊쾶 蹂??                    const formattedCurriculums: Curriculum[] = (data || []).map((curr: any) => ({
                        id: curr.id,
                        title: curr.title,
                        description: curr.description || '',
                        category: curr.category,
                        level: curr.level as '湲곗큹' | '以묎툒' | '怨좉툒',
                        image: curr.image || 'https://placehold.co/600x400.png',
                        checklist: curr.checklist || [],
                        created_by: curr.created_by,
                        public: curr.public ?? true,
                        created_at: curr.created_at,
                    }));
                    setCurriculums(formattedCurriculums);
                }
            } catch (error) {
                console.error('而ㅻ━?섎읆 濡쒕뱶 以??ㅻ쪟:', error);
                setCurriculums([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurriculums();
    }, []);

    const groupedCurriculums = curriculums.reduce((acc, curriculum) => {
        const level = curriculum.level;
        if (!acc[level]) {
        acc[level] = [];
        }
        acc[level].push(curriculum);
        return acc;
    }, {} as Record<Curriculum['level'], Curriculum[]>);

    const levelOrder: Curriculum['level'][] = ['湲곗큹', '以묎툒', '怨좉툒'];

    // 濡쒕뵫 以묒씠嫄곕굹 而ㅻ━?섎읆???놁쓣 ??    if (isLoading) {
        return (
            <section id="curriculum" className="container w-full py-32 md:py-52">
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">泥닿퀎?곸씤 而ㅻ━?섎읆</h2>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        湲곗큹遺???ы솕源뚯?, ?щ윭遺꾩쓽 ?깆옣???대걣 Coducation???꾨Ц 援먯쑁 怨쇱젙??留뚮굹蹂댁꽭??
                    </p>
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="text-muted-foreground">而ㅻ━?섎읆??遺덈윭?ㅻ뒗 以?..</div>
                </div>
            </section>
        );
    }

    // 而ㅻ━?섎읆???놁쓣 ??    if (curriculums.length === 0) {
        return (
            <section id="curriculum" className="container w-full py-32 md:py-52">
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">泥닿퀎?곸씤 而ㅻ━?섎읆</h2>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        湲곗큹遺???ы솕源뚯?, ?щ윭遺꾩쓽 ?깆옣???대걣 Coducation???꾨Ц 援먯쑁 怨쇱젙??留뚮굹蹂댁꽭??
                    </p>
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="text-muted-foreground">?쒖떆??而ㅻ━?섎읆???놁뒿?덈떎.</div>
                </div>
            </section>
        );
    }

    return (
        <section id="curriculum" className="container w-full py-32 md:py-52">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">泥닿퀎?곸씤 而ㅻ━?섎읆</h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    湲곗큹遺???ы솕源뚯?, ?щ윭遺꾩쓽 ?깆옣???대걣 Coducation???꾨Ц 援먯쑁 怨쇱젙??留뚮굹蹂댁꽭??
                </p>
            </div>

            <div className="w-full space-y-12">
                {levelOrder.map((level, index) => (
                groupedCurriculums[level] && groupedCurriculums[level].length > 0 && (
                    <div key={level}>
                        <h3 className="text-3xl font-bold font-headline mb-6 text-left text-primary">{level} 怨쇱젙</h3>
                        <Carousel
                            opts={{
                                align: 'start',
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 3000, // 3珥덈쭏???먮룞 ?щ씪?대뱶
                                    stopOnInteraction: false, // ?ъ슜???곹샇?묒슜 ?쒖뿉??怨꾩냽 ?먮룞 ?щ씪?대뱶
                                    stopOnMouseEnter: false, // 留덉슦???몃쾭 ?쒖뿉??怨꾩냽 ?먮룞 ?щ씪?대뱶
                                })
                            ]}
                            className="w-full"
                        >
                            <CarouselContent>
                                {groupedCurriculums[level].map((curriculum) => (
                                    <CarouselItem key={curriculum.id} className="md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <CurriculumCard curriculum={curriculum} />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden lg:flex" />
                            <CarouselNext className="hidden lg:flex"/>
                        </Carousel>
                    </div>
                )
                ))}
            </div>
        </section>
    );
}
