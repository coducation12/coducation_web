# Coducation - 코딩으로 세상을 교육하다

전남 광양 코딩메이커 학원의 종합 교육 관리 시스템입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (이미지 관리)
- **Authentication**: Supabase Auth
- **AI**: Google AI (Genkit)
- **Image Processing**: Canvas API (WebP 압축)
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 역할별 대시보드
│   │   ├── student/       # 학생 대시보드
│   │   ├── parent/        # 학부모 대시보드
│   │   ├── teacher/       # 강사 대시보드
│   │   └── admin/         # 관리자 대시보드
│   ├── login/             # 로그인 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── landing/          # 랜딩 페이지 컴포넌트
│   ├── typing/           # 타자 연습 컴포넌트
│   └── sidebar/          # 사이드바 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── auth.ts           # 인증 관련 함수
│   ├── actions.ts        # 서버 액션 (DB 작업)
│   ├── image-utils.ts    # 이미지 압축 유틸리티
│   └── utils.ts          # 유틸리티 함수
├── types/                # TypeScript 타입 정의
└── hooks/                # 커스텀 훅
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google AI (for Genkit)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Development
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:9002`에서 실행됩니다.

### 4. 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Deep Sky Blue (사이버 테마)
- **Background**: Dark theme with cyber elements
- **Cards**: Cyber-card 스타일 (두꺼운 테두리)
- **Accent**: Neon blue highlights

### 폰트
- **Headline**: Space Grotesk
- **Body**: Inter
- **Code**: Source Code Pro

### UI 특징
- **사이버펑크 테마**: 미래지향적 디자인
- **카드 기반 레이아웃**: 두꺼운 테두리선 강조
- **반응형 디자인**: 모바일부터 데스크톱까지 지원

## 🔐 역할 기반 접근

시스템은 다음 4가지 역할을 지원합니다:

1. **학생 (Student)**: 타자 연습, 커리큘럼 확인, 출석 관리
2. **학부모 (Parent)**: 자녀 진도 확인, 학원비 납부 내역
3. **강사 (Teacher)**: 학생 관리, 커리큘럼 생성, 진도 평가
4. **관리자 (Admin)**: 전체 시스템 관리, 사용자 관리

## 📊 주요 기능

### 🎓 교육 관리
- **역할별 대시보드**: 학생/학부모/강사/관리자별 맞춤형 인터페이스
- **커리큘럼 관리**: 체계적인 교육 과정 관리 및 진도 추적
- **출석 관리**: 실시간 출석 체크 및 활동 기록
- **성적 관리**: 학생별 성과 분석 및 피드백

### 💻 타자 연습 시스템
- **기본 타자 연습**: 단계별 타자 연습 프로그램
- **단어 타자 연습**: 프로그래밍 용어 중심 연습
- **AI 기반 문제 생성**: Google AI를 활용한 맞춤형 연습 문제
- **실시간 통계**: 타자 속도, 정확도 분석

### 🖼️ 이미지 관리
- **자동 압축**: WebP 변환을 통한 용량 최적화
- **프로그레시브 로딩**: 블러 효과를 통한 부드러운 로딩
- **캐싱**: 1년 캐시 설정으로 성능 최적화

### 👥 강사진 관리
- **DB 연동**: 실시간 강사진 정보 관리
- **자동 정렬**: 원장/부원장 우선 배치
- **상세 모달**: 강사 프로필, 경력, 자격증 정보
- **반응형 레이아웃**: 2+3 구조의 최적화된 배치

### 💬 커뮤니티
- **학부모-강사 소통**: 실시간 게시판 시스템
- **공지사항**: 중요 알림 및 학원 소식
- **상담 예약**: 온라인 상담 신청 시스템

## 🤖 AI 기능

- **타자 연습 생성**: Google AI를 활용한 맞춤형 타자 연습 문제 생성
- **성과 분석**: 학생별 학습 성과 분석 및 개선점 제안
- **동적 난이도 조절**: 학생 수준에 맞는 자동 난이도 조정

## 🔧 최근 업데이트

### v2.1.0 (2024-12-19)
- ✨ 강사진 섹션 완전 개편
- 🖼️ 이미지 압축 시스템 도입 (WebP, 자동 리사이징)
- 📱 반응형 레이아웃 최적화
- 🎨 카드 디자인 통일 (340x250px 고정)
- 🔄 DB 기반 자동 정렬 시스템
- 📋 강사 상세 모달 추가

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
