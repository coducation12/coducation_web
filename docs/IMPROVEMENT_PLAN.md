# Coducation 개선 계획

이 문서는 프로젝트의 타입 안정성/성능 최적화 및 메인 페이지/컨텐츠 관리 구조 개선을 위한 계획을 정의합니다.

## 1. 타입 안정성 개선 (진행 완료)

- [x] **공통 인터페이스 불일치 해결**: `User` 타입에 `email`, `profile_image_url`, `grade` 추가 및 `CommunityPost` 타입 통합 완료.
- [x] **암시적 'any' 타입 해결**: `community.ts`의 `reduce` 및 이벤트 핸들러(`admin/main-curriculum`, `admin/students`) 타입 오류 수정 완료.
- [x] **모달/컴포넌트 Props 오류 해결**: `EditCurriculumModal` 및 `AttendanceCalendar` Props 오류 수정 완료.

---

## 2. 성능 최적화 (일부 완료)

### 2-1. 로그인 딜레이 해결 (완료)
- [x] `src/app/login/page.tsx`의 `setTimeout` 제거하여 즉시 리다이렉트되도록 개선.

### 2-2. 게시글 등록 딜레이 해결 (예정)
- [ ] **낙관적 업데이트(Optimistic Update)** 적용: UI 선반영 후 백그라운드 서버 요청.
- [ ] **쿼리 최적화**: 댓글 수 조회 쿼리 최적화.

---

## 3. 메인 페이지 및 컨텐츠 관리 구조 개선 (New)

메인 페이지의 커리큘럼 설정을 컨텐츠 관리와 통합하고, 홍보용 모달 기능을 추가합니다.

### 3-1. 컨텐츠 관리 페이지 통합 (`src/app/dashboard/admin/content/page.tsx`)
1. **Tabs 구조 도입**: "기본 컨텐츠", "커리큘럼 설정", "홍보 모달 설정" 탭으로 분리.
2. **커리큘럼 관리 통합**: 기존 `admin/main-curriculum/page.tsx`의 기능을 "커리큘럼 설정" 탭으로 이동.
3. **홍보 모달 설정 추가**:
    - **기능**: 메인 페이지 접속 시 띄울 홍보 모달의 활성화 여부 및 이미지 설정.
    - **데이터 필드**: `promo_active` (활성화 여부), `promo_image` (이미지 URL).

### 3-2. 메인 페이지 홍보 모달 구현
1. **`PromoModal` 컴포넌트 개발**:
    - `src/components/common/PromoModal.tsx` 생성.
    - **"오늘 하루 보지 않기" 기능**: `localStorage`를 활용하여 체크 시 24시간 동안 노출 차단.
    - 서버에서 설정된 `promo_active`가 `true`일 때만 활성화.
2. **메인 페이지 연동**: `src/app/page.tsx`에 `PromoModal` 추가.

### 3-3. 데이터베이스 및 서버 액션 업데이트
1. **DB 스키마 추가 (예상)**:
   - `content_management` 테이블에 `promo_active` (boolean), `promo_image` (text) 컬럼 추가 필요.
2. **서버 액션 수정 (`src/lib/actions.ts`)**:
   - `getContent`, `updateContent` 함수에 위 필드 처리 로직 추가.

---

## 4. 실행 계획 (Action Plan)

1. **DB 마이그레이션**: `content_management` 테이블에 홍보 모달 관련 컬럼 추가 SQL 작성 및 실행.
2. **서버 액션 수정**: `src/lib/actions.ts` 업데이트.
3. **관리자 페이지 개편**: `admin/content/page.tsx` 리팩토링 및 `main-curriculum` 코드 이관.
4. **프론트엔드 모달 구현**: `PromoModal` 컴포넌트 생성 및 메인 페이지 적용.
5. **청소**: 기존 `admin/main-curriculum` 디렉토리 삭제.
