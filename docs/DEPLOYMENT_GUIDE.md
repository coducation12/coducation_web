# 🚀 Coducation Web 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 완료된 작업
- [x] 비밀번호 입력 필수화 (개발용 자동 로그인 제거)
- [x] Supabase Auth 연동 (강사/관리자 계정)
- [x] 환경 변수 설정 확인
- [x] 데이터베이스 마이그레이션 확인

### ⚠️ 배포 전 필수 작업

## 1. 🔐 환경 변수 설정

### Firebase App Hosting 환경 변수
다음 환경 변수들을 Firebase App Hosting에 설정해야 합니다:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xcljkkvfsufndxzfcigp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (서버 사이드에서 사용) - 중요!
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 기타 설정
NODE_ENV=production
```

### 로컬 개발 환경 변수
로컬 개발을 위해 `.env.local` 파일을 생성하세요:

```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=https://xcljkkvfsufndxzfcigp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=development
```

### Service Role Key 획득 방법
1. Supabase Dashboard → Settings → API
2. "service_role" 키를 복사
3. ⚠️ **주의**: 이 키는 데이터베이스에 대한 전체 접근 권한을 가집니다. 절대 공개하지 마세요!

### 환경 변수 설정 방법
1. Firebase Console → App Hosting → 프로젝트 선택
2. Settings → Environment Variables
3. 위의 환경 변수들을 추가

## 2. 🛡️ 보안 설정 (중요!)

### Supabase RLS (Row Level Security) 활성화
현재 많은 테이블에서 RLS가 비활성화되어 있습니다. 다음 SQL을 Supabase SQL Editor에서 실행하세요:

```sql
-- 1. 모든 주요 테이블에 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 2. students 테이블 정책
CREATE POLICY "관리자는 모든 학생 조회 가능" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "강사는 담당 학생만 조회 가능" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
            AND students.assigned_teachers @> ARRAY[users.id::text]
        )
    );

CREATE POLICY "학생은 자신의 정보만 조회 가능" ON public.students
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- 3. teachers 테이블 정책
CREATE POLICY "관리자는 모든 강사 조회 가능" ON public.teachers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "강사는 자신의 정보만 조회 가능" ON public.teachers
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- 4. community_posts 테이블 정책
CREATE POLICY "모든 사용자는 게시글 조회 가능" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "인증된 사용자는 게시글 작성 가능" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "작성자는 자신의 게시글 수정/삭제 가능" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "작성자는 자신의 게시글 삭제 가능" ON public.community_posts
    FOR DELETE USING (user_id = auth.uid());

-- 5. community_comments 테이블 정책
CREATE POLICY "모든 사용자는 댓글 조회 가능" ON public.community_comments
    FOR SELECT USING (true);

CREATE POLICY "인증된 사용자는 댓글 작성 가능" ON public.community_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "작성자는 자신의 댓글 수정/삭제 가능" ON public.community_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "작성자는 자신의 댓글 삭제 가능" ON public.community_comments
    FOR DELETE USING (user_id = auth.uid());

-- 6. curriculums 테이블 정책
CREATE POLICY "모든 사용자는 커리큘럼 조회 가능" ON public.curriculums
    FOR SELECT USING (true);

CREATE POLICY "강사와 관리자는 커리큘럼 작성 가능" ON public.curriculums
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "작성자와 관리자는 커리큘럼 수정 가능" ON public.curriculums
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 7. consultations 테이블 정책
CREATE POLICY "관리자와 강사는 상담문의 조회 가능" ON public.consultations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY "인증된 사용자는 상담문의 작성 가능" ON public.consultations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "관리자와 강사는 상담문의 수정 가능" ON public.consultations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'teacher')
        )
    );
```

### Supabase Auth 보안 설정
1. **Password Strength 설정**:
   - Supabase Dashboard → Authentication → Settings
   - Password Strength: Strong 이상으로 설정
   - Leaked Password Protection 활성화

2. **Email Settings**:
   - Email confirmation 활성화 (필요시)
   - Email templates 설정

## 3. 🗄️ 데이터베이스 마이그레이션

### 기존 마이그레이션 적용
```bash
# Supabase CLI 사용 (로컬에서)
supabase db push

# 또는 Supabase Dashboard에서 SQL Editor 사용
# supabase/migrations/20241220000000_create_approval_system.sql 실행
```

## 4. 🚀 배포 과정

### Firebase App Hosting 배포
```bash
# 1. 프로젝트 빌드
npm run build

# 2. Firebase CLI 로그인
firebase login

# 3. 프로젝트 초기화 (이미 되어 있다면 생략)
firebase init hosting

# 4. 배포
firebase deploy --only hosting
```

### 배포 설정 파일 확인
- `apphosting.yaml`: Firebase App Hosting 설정
- `next.config.ts`: Next.js 설정 (이미 최적화됨)

## 5. 🔍 배포 후 검증

### 필수 테스트 항목
1. **로그인 테스트**:
   - [ ] 강사/관리자 계정 로그인 (Supabase Auth)
   - [ ] 학생/학부모 계정 로그인 (기존 방식)
   - [ ] 비밀번호 없이 로그인 시도 (차단 확인)

2. **기능 테스트**:
   - [ ] 관리자 프로필 수정 (비밀번호 변경 포함)
   - [ ] 강사 프로필 수정 (비밀번호 변경 포함)
   - [ ] 학생 관리 기능
   - [ ] 커뮤니티 기능
   - [ ] 상담문의 기능

3. **보안 테스트**:
   - [ ] RLS 정책 동작 확인
   - [ ] 권한 없는 데이터 접근 차단 확인

## 6. 📊 모니터링 설정

### Supabase 모니터링
- Supabase Dashboard에서 로그 확인
- Auth 사용자 활동 모니터링
- 데이터베이스 성능 모니터링

### Firebase 모니터링
- Firebase Console에서 앱 성능 모니터링
- 에러 로그 확인

## 7. 🚨 알려진 이슈 및 해결방법

### 이슈 1: RLS 정책 충돌
**문제**: 기존 users 테이블에 RLS 정책이 있지만 RLS가 비활성화됨
**해결**: 위의 SQL을 실행하여 RLS 활성화

### 이슈 2: 관리자 계정 이메일 null
**문제**: 관리자 계정의 email 필드가 null
**해결**: 코드에서 username을 email로 사용하도록 처리됨

### 이슈 3: 비밀번호 해시 불일치
**문제**: Auth와 users 테이블의 비밀번호 해시가 다를 수 있음
**해결**: 비밀번호 변경 시 양쪽 모두 업데이트하도록 처리됨

## 8. 📞 지원 및 문의

### 기술 지원
- Supabase: [Supabase Dashboard](https://supabase.com/dashboard)
- Firebase: [Firebase Console](https://console.firebase.google.com)

### 로그 확인
- Supabase 로그: Dashboard → Logs
- Firebase 로그: Console → Functions → Logs

---

## 🎉 배포 완료 후

배포가 완료되면 다음 사항들을 확인하세요:

1. **도메인 설정**: Firebase App Hosting에서 커스텀 도메인 설정
2. **SSL 인증서**: 자동으로 설정됨
3. **CDN**: Firebase CDN 자동 적용
4. **백업**: Supabase 자동 백업 활성화 확인

**성공적인 배포를 위해 위의 모든 단계를 순서대로 진행하세요!** 🚀
