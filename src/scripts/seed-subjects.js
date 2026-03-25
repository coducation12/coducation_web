const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const baseDir = "C:\\Users\\tech_ha\\.gemini\\antigravity\\brain\\4d0b0a6f-a63c-402a-b25a-b2a22032f500\\";
const imageMap = {
    "컴퓨터 기초": path.join(baseDir, "comp_basic_icon_1774337473562.png"),
    "코딩": path.join(baseDir, "coding_icon_1774337487482.png"),
    "자격증": path.join(baseDir, "certificate_icon_1774337502421.png"),
    "드로잉": path.join(baseDir, "drawing_icon_v2_1774337528127.png")
};

const subjectsToSeed = [
    { category: "컴퓨터 기초", title: "한글 실무 기초" },
    { category: "컴퓨터 기초", title: "엑셀 데이터 활용" },
    { category: "컴퓨터 기초", title: "파워포인트 디자인" },
    { category: "컴퓨터 기초", title: "윈도우/인터넷 활용" },
    { category: "코딩", title: "파이썬 기초 프로그래밍" },
    { category: "코딩", title: "엔트리 AI 블록코딩" },
    { category: "코딩", title: "C언어/C++ 핵심 문법" },
    { category: "코딩", title: "자바 객체지향 기초" },
    { category: "코딩", title: "팅커캐드 3D 코딩" },
    { category: "코딩", title: "아두이노 하드웨어" },
    { category: "자격증", title: "ITQ 한글 자격 취득반" },
    { category: "자격증", title: "ITQ 엑셀 자격 취득반" },
    { category: "자격증", title: "COS Pro 파이썬 2급" },
    { category: "자격증", title: "컴활 2급 실기 대비" },
    { category: "드로잉", title: "블랜더 3D 모델링" },
    { category: "드로잉", title: "디지털 일러스트 기초" },
    { category: "드로잉", title: "포토샵 디자인 입문" }
];

async function seed() {
    console.log('Starting seed process...');
    
    // 1. Upload Images and get URLs
    const urlMap = {};
    for (const [cat, filePath] of Object.entries(imageMap)) {
        try {
            const fileName = `seed-${cat}-${Date.now()}.png`;
            const fileBuffer = fs.readFileSync(filePath);
            
            const { data, error } = await supabase.storage
                .from('content-images')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('content-images')
                .getPublicUrl(fileName);
            
            urlMap[cat] = publicUrl;
            console.log(`Uploaded ${cat} image: ${publicUrl}`);
        } catch (err) {
            console.error(`Failed to upload ${cat} image:`, err.message);
        }
    }

    // 2. Prepare and Insert Subjects
    const finalSubjects = subjectsToSeed.map(s => ({
        ...s,
        image: urlMap[s.category] || null,
        level: '기초',
        public: true,
        status: '진행중',
        checklist: []
    }));

    const { error: insertError } = await supabase
        .from('curriculums')
        .insert(finalSubjects);

    if (insertError) {
        console.error('Seeding failed:', insertError.message);
    } else {
        console.log(`Successfully seeded ${finalSubjects.length} subjects!`);
    }
}

seed();
