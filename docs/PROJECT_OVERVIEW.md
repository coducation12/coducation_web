# Coducation 프로젝트 개요

## 📌 프로젝트 소개

**Coducation**은 전남 광양 코딩메이커 학원을 위한 종합 교육 관리 시스템입니다. 역할 기반 접근 제어를 통해 학생, 학부모, 강사, 관리자가 각각의 역할에 맞는 기능을 제공하는 웹 애플리케이션입니다.

### 프로젝트 목표
- 효율적인 교육 과정 관리
- 실시간 출석 및 진도 추적
- 타자 연습 시스템을 통한 기초 실력 향상
- 학부모-강사 간 소통 채널 제공
- AI 기반 맞춤형 학습 지원

## 🎯 핵심 가치

1. **역할 기반 접근**: 4가지 역할(학생, 학부모, 강사, 관리자)별 맞춤형 인터페이스
2. **실시간 관리**: 출석, 진도, 성적을 실시간으로 추적 및 관리
3. **AI 통합**: Google AI(Genkit)를 활용한 동적 타자 연습 문제 생성
4. **사이버펑크 디자인**: 미래지향적이고 현대적인 UI/UX

## 📊 프로젝트 현황

### 현재 버전
- **버전**: 0.1.0
- **최종 업데이트**: 2024-12-19

### 주요 완료 사항
- ✅ 역할 기반 대시보드 구현
- ✅ 커리큘럼 관리 시스템
- ✅ 타자 연습 시스템 (한글/영어/코드)
- ✅ 출석 관리 시스템
- ✅ 커뮤니티 기능
- ✅ 강사진 관리 및 프로필 시스템
- ✅ 이미지 압축 및 최적화 시스템
- ✅ Supabase Auth 통합 (강사/관리자)
- ✅ 하이브리드 인증 시스템 (학생/학부모: DB, 강사/관리자: Auth)

### 진행 중인 작업
- 🔄 RLS(Row Level Security) 정책 최적화
- 🔄 성능 최적화
- 🔄 모바일 반응형 개선

## 🏗️ 프로젝트 구조

```
Coducation Web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # 역할별 대시보드
│   │   │   ├── student/        # 학생 대시보드
│   │   │   ├── parent/         # 학부모 대시보드
│   │   │   ├── teacher/        # 강사 대시보드
│   │   │   └── admin/          # 관리자 대시보드
│   │   ├── login/              # 로그인 페이지
│   │   ├── signup/             # 회원가입 페이지
│   │   └── page.tsx            # 메인 랜딩 페이지
│   ├── components/             # React 컴포넌트
│   │   ├── common/            # 공통 컴포넌트
│   │   ├── ui/                # shadcn/ui 컴포넌트
│   │   ├── landing/           # 랜딩 페이지 컴포넌트
│   │   ├── curriculum/        # 커리큘럼 관련 컴포넌트
│   │   └── community/         # 커뮤니티 컴포넌트
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── supabase.ts        # Supabase 클라이언트
│   │   ├── auth.ts            # 인증 관련 함수
│   │   ├── actions.ts         # 서버 액션
│   │   └── image-utils.ts     # 이미지 처리 유틸리티
│   ├── types/                 # TypeScript 타입 정의
│   └── hooks/                 # 커스텀 훅
├── supabase/
│   └── migrations/            # 데이터베이스 마이그레이션
├── docs/                      # 프로젝트 문서
├── public/                    # 정적 파일
└── package.json              # 프로젝트 의존성
```

## 🚀 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI 기반)
- **State Management**: React Hooks, Server Actions

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (강사/관리자), Custom Auth (학생/학부모)
- **Storage**: Supabase Storage
- **API**: Next.js Server Actions, API Routes

### AI & 기타
- **AI**: Google AI (Genkit) - 타자 연습 문제 생성
- **Image Processing**: Canvas API (WebP 압축)
- **Deployment**: Vercel / Firebase App Hosting

## 📝 관련 문서

- [아키텍처 문서](./ARCHITECTURE.md)
- [기능 상세 문서](./FEATURES.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- [개발 가이드](./DEVELOPMENT.md)
- [배포 가이드](../DEPLOYMENT_GUIDE.md)
- [변경 이력](./CHANGELOG.md)

## 👥 역할별 주요 기능

### 학생 (Student)
- 타자 연습 (한글/영어/코드)
- 커리큘럼 진행 상황 확인
- 출석 체크
- 학습 결과물 업로드
- 커뮤니티 참여

### 학부모 (Parent)
- 자녀 학습 현황 확인
- 출석률 및 진도 확인
- 학원비 납부 내역
- 커뮤니티 소통
- 상담 예약

### 강사 (Teacher)
- 담당 학생 관리
- 커리큘럼 생성 및 관리
- 출석 관리
- 학생 진도 평가
- 피드백 작성
- 상담 관리

### 관리자 (Admin)
- 전체 시스템 관리
- 사용자 계정 관리
- 커리큘럼 관리
- 타자 연습 문제 관리
- 공지사항 관리
- 전체 통계 확인

## 🔐 보안

- **RLS (Row Level Security)**: Supabase에서 역할별 데이터 접근 제어
- **하이브리드 인증**: 역할에 따라 다른 인증 방식 적용
- **비밀번호 암호화**: bcrypt를 통한 비밀번호 해싱
- **환경 변수 관리**: 민감한 정보는 환경 변수로 관리

## 📞 문의 및 지원

프로젝트 관련 문의사항은 프로젝트 관리자에게 연락하시기 바랍니다.

