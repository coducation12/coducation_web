const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const subjects = [
    { category: "컴퓨터 기초", title: "한글 실무 기초", imgKey: "basic" },
    { category: "컴퓨터 기초", title: "엑셀 데이터 활용", imgKey: "basic" },
    { category: "컴퓨터 기초", title: "파워포인트 디자인", imgKey: "basic" },
    { category: "컴퓨터 기초", title: "윈도우/인터넷 활용", imgKey: "basic" },
    { category: "코딩", title: "파이썬 기초 프로그래밍", imgKey: "coding" },
    { category: "코딩", title: "엔트리 AI 블록코딩", imgKey: "coding" },
    { category: "코딩", title: "C언어 프로그래밍", imgKey: "coding" },
    { category: "코딩", title: "자바 객체지향 기초", imgKey: "coding" },
    { category: "코딩", title: "팅커캐드 3D 코딩", imgKey: "coding" },
    { category: "코딩", title: "아두이노 하드웨어", imgKey: "coding" },
    { category: "자격증", title: "ITQ 한글 자격반", imgKey: "cert" },
    { category: "자격증", title: "ITQ 엑셀 자격반", imgKey: "cert" },
    { category: "자격증", title: "COS Pro 파이썬 2급", imgKey: "cert" },
    { category: "드로잉", title: "블랜더 3D 모델링", imgKey: "draw" },
    { category: "드로잉", title: "디지털 일러스트 기초", imgKey: "draw" }
];

async function run() {
    const { data: files } = await supabase.storage.from('content-images').list();
    const latest = (prefix) => {
        const found = files.filter(f => f.name.startsWith(`seed-${prefix}-`)).sort((a,b) => b.name.localeCompare(a.name))[0];
        return found ? found.name : null;
    };

    const urlMap = {
        basic: latest('basic'),
        coding: latest('coding'),
        cert: latest('cert'),
        draw: latest('draw')
    };

    const finalData = subjects.map(s => {
        const fileName = urlMap[s.imgKey];
        const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(fileName);
        return {
            category: s.category,
            title: s.title,
            image: publicUrl,
            level: '기초',
            status: '진행중'
        };
    });

    fs.writeFileSync('src/scripts/seed-data.json', JSON.stringify(finalData, null, 2));
    console.log('Seed data written to src/scripts/seed-data.json');
}

run();
