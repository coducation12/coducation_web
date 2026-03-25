const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const baseDir = "C:\\Users\\tech_ha\\.gemini\\antigravity\\brain\\4d0b0a6f-a63c-402a-b25a-b2a22032f500\\";
const images = [
    { key: "basic", file: "comp_basic_icon_1774337473562.png", cat: "컴퓨터 기초" },
    { key: "coding", file: "coding_icon_1774337487482.png", cat: "코딩" },
    { key: "cert", file: "certificate_icon_1774337502421.png", cat: "자격증" },
    { key: "draw", file: "drawing_icon_v2_1774337528127.png", cat: "드로잉" }
];

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
    const urlMap = {};
    for (const img of images) {
        try {
            const buf = fs.readFileSync(path.join(baseDir, img.file));
            const name = `seed-${img.key}-${Date.now()}.png`;
            await supabase.storage.from('content-images').upload(name, buf, { contentType: 'image/png' });
            const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(name);
            urlMap[img.key] = publicUrl;
            console.log(`Uploaded ${img.key}`);
        } catch (e) {
            console.error(`Error ${img.key}: ${e.message}`);
        }
    }

    const data = subjects.map(s => ({
        category: s.category,
        title: s.title,
        image: urlMap[s.imgKey],
        level: '기초',
        status: '진행중'
    }));

    const { error } = await supabase.from('curriculums').insert(data);
    if (error) console.error('Insert error:', error.message);
    else console.log('Done!');
}

run();
