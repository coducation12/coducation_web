# Coducation 개발 가이드

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **Git**: 최신 버전

### 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone <repository-url>
cd "Coducation Web"

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (서버 사이드에서 사용)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google AI (Genkit)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# 개발 환경
NODE_ENV=development
```

### 개발 서버 실행

```bash
# 개발 서버 시작 (포트 9002)
npm run dev

# 브라우저에서 접속
# http://localhost:9002
```

### Genkit 개발 서버 (AI 기능)

```bash
# Genkit 개발 서버 시작
npm run genkit:dev

# 또는 watch 모드
npm run genkit:watch
```

---

## 📁 프로젝트 구조

### 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # 역할별 대시보드
│   ├── login/              # 로그인 페이지
│   ├── signup/             # 회원가입 페이지
│   └── page.tsx            # 메인 페이지
├── components/             # React 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── landing/            # 랜딩 페이지 컴포넌트
│   ├── curriculum/         # 커리큘럼 컴포넌트
│   └── community/          # 커뮤니티 컴포넌트
├── lib/                    # 유틸리티 및 설정
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── auth.ts             # 인증 함수
│   ├── actions.ts          # 서버 액션
│   └── image-utils.ts      # 이미지 처리
├── types/                  # TypeScript 타입
└── hooks/                  # 커스텀 훅
```

---

## 🛠️ 개발 워크플로우

### 1. 새 기능 개발

#### 브랜치 전략
```bash
# 기능 브랜치 생성
git checkout -b feature/feature-name

# 개발 완료 후
git add .
git commit -m "feat: 기능 설명"
git push origin feature/feature-name
```

#### 컴포넌트 생성
```bash
# 컴포넌트는 src/components/ 디렉토리에 생성
# 예: src/components/common/NewComponent.tsx
```

### 2. 스타일링

#### TailwindCSS 사용
```tsx
// 유틸리티 클래스 사용
<div className="flex items-center justify-between p-4 bg-card border-2 border-primary">
  <h1 className="text-2xl font-headline">제목</h1>
</div>
```

#### 테마 색상
- Primary: Deep Sky Blue (사이버 테마)
- Background: Dark theme
- Cards: 두꺼운 테두리 강조

#### 폰트
- Headline: `font-headline` (IBM Plex Sans KR)
- Body: `font-body` (Noto Sans KR)
- Code: `font-code` (Source Code Pro)

### 3. 데이터베이스 작업

#### Supabase 클라이언트 사용
```typescript
import { supabase } from '@/lib/supabase';

// 데이터 조회
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'student');

// 데이터 삽입
const { data, error } = await supabase
  .from('users')
  .insert({ username: 'test', name: '테스트', role: 'student', academy: '코딩메이커' });
```

#### 서버 액션 사용
```typescript
// src/lib/actions.ts
'use server'

export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

### 4. 이미지 업로드

#### 이미지 업로드 컴포넌트 사용
```tsx
import { ImageUploader } from '@/components/ui/image-uploader';

<ImageUploader
  onUploadComplete={(url) => {
    console.log('업로드 완료:', url);
  }}
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

#### 이미지 압축
```typescript
import { compressImage } from '@/lib/image-utils';

const compressedFile = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8
});
```

---

## 🧪 테스트

### 타입 체크
```bash
npm run typecheck
```

### 린트
```bash
npm run lint
```

### 빌드 테스트
```bash
npm run build
```

---

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 로컬 프로덕션 서버 실행
```bash
npm start
```

### 배포
- **Vercel**: 자동 배포 (GitHub 연동)
- **Firebase App Hosting**: `firebase deploy --only hosting`

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)를 참고하세요.

---

## 🔧 개발 팁

### 1. 서버 컴포넌트 vs 클라이언트 컴포넌트

#### 서버 컴포넌트 (기본)
```tsx
// 데이터 페칭에 적합
export default async function Page() {
  const data = await getData();
  return <div>{data}</div>;
}
```

#### 클라이언트 컴포넌트
```tsx
'use client'

// 인터랙션에 적합
export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 2. 인증 처리

#### 서버 사이드
```typescript
import { getAuthenticatedUser } from '@/lib/auth';

export default async function Page() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');
  // ...
}
```

#### 클라이언트 사이드
```typescript
import { useAuth } from '@/hooks/use-auth';

export default function Component() {
  const { user, loading } = useAuth();
  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;
  // ...
}
```

### 3. 에러 처리

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  // 성공 처리
} catch (error) {
  console.error('에러 발생:', error);
  // 에러 처리
}
```

### 4. 폼 처리

```tsx
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요'),
});

export default function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    // 서버 액션 호출
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">제출</button>
    </form>
  );
}
```

---

## 🐛 디버깅

### 개발자 도구
- **React DevTools**: 컴포넌트 상태 확인
- **Next.js DevTools**: 성능 분석
- **Supabase Dashboard**: 데이터베이스 쿼리 확인

### 로그 확인
```typescript
// 클라이언트 사이드
console.log('디버그 정보:', data);

// 서버 사이드
console.error('에러 발생:', error);
```

### Supabase 로그
- Supabase Dashboard → Logs에서 API 요청 및 에러 확인

---

## 📚 참고 자료

### 공식 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)

### 프로젝트 문서
- [프로젝트 개요](./PROJECT_OVERVIEW.md)
- [아키텍처](./ARCHITECTURE.md)
- [기능 상세](./FEATURES.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)

---

## ❓ 자주 묻는 질문

### Q: 환경 변수가 적용되지 않아요
A: `.env.local` 파일을 확인하고, 개발 서버를 재시작하세요.

### Q: Supabase 연결이 안 돼요
A: Supabase URL과 API 키가 올바른지 확인하세요.

### Q: 이미지 업로드가 실패해요
A: Supabase Storage 버킷이 생성되어 있고, 권한이 설정되어 있는지 확인하세요.

### Q: 타입 에러가 발생해요
A: `npm run typecheck`를 실행하여 타입 에러를 확인하고 수정하세요.

---

## 🤝 기여 가이드

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성
3. 코드 작성 및 테스트
4. 커밋 및 푸시
5. Pull Request 생성

