# Coducation - 코딩으로 세상을 교육하다

전남 광양 코딩메이커 학원의 교육 관리 시스템입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google AI (Genkit)
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
- **Primary**: Deep blue (#293B5F)
- **Background**: Light gray (#E9E9ED)
- **Accent**: Muted teal (#5F9EA0)

### 폰트
- **Headline**: Space Grotesk
- **Body**: Inter
- **Code**: Source Code Pro

## 🔐 역할 기반 접근

시스템은 다음 4가지 역할을 지원합니다:

1. **학생 (Student)**: 타자 연습, 커리큘럼 확인, 출석 관리
2. **학부모 (Parent)**: 자녀 진도 확인, 학원비 납부 내역
3. **강사 (Teacher)**: 학생 관리, 커리큘럼 생성, 진도 평가
4. **관리자 (Admin)**: 전체 시스템 관리, 사용자 관리

## 📊 주요 기능

- **역할별 대시보드**: 각 역할에 맞는 맞춤형 인터페이스
- **타자 연습**: AI 기반 동적 타자 연습 문제 생성
- **커리큘럼 관리**: 체계적인 교육 과정 관리
- **출석 관리**: 학생별 출석 및 활동 기록
- **학원비 관리**: 납부 내역 및 관리
- **커뮤니티**: 학부모-강사 간 소통 공간

## 🤖 AI 기능

- **타자 연습 생성**: Google AI를 활용한 맞춤형 타자 연습 문제 생성
- **성과 분석**: 학생별 학습 성과 분석 및 개선점 제안

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
