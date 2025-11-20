# Coducation 기능 상세 문서

## 📚 목차

1. [역할별 대시보드](#역할별-대시보드)
2. [커리큘럼 관리](#커리큘럼-관리)
3. [타자 연습 시스템](#타자-연습-시스템)
4. [출석 관리](#출석-관리)
5. [커뮤니티](#커뮤니티)
6. [강사진 관리](#강사진-관리)
7. [이미지 관리](#이미지-관리)
8. [AI 기능](#ai-기능)

---

## 역할별 대시보드

### 학생 대시보드 (`/dashboard/student`)

#### 주요 기능
- **오늘의 수업**: 오늘 수업이 있는 경우 알림 표시
- **학습 진행 상황**: 현재 커리큘럼 진행률 시각화
- **타자 연습 결과**: 최근 타자 연습 통계 (속도, 정확도)
- **출석 체크**: 오늘 출석 여부 확인 및 체크
- **목표 설정**: 학습 목표 설정 및 추적

#### 컴포넌트
- `DashboardCard.tsx`: 대시보드 카드 레이아웃
- `learning-progress.tsx`: 학습 진행률 표시
- `typing-chart.tsx`: 타자 연습 통계 차트
- `attendance-check-card.tsx`: 출석 체크 카드
- `goals-card.tsx`: 목표 설정 카드

### 학부모 대시보드 (`/dashboard/parent`)

#### 주요 기능
- **자녀 학습 현황**: 자녀의 학습 진행 상황 확인
- **출석률**: 자녀의 출석률 통계
- **타자 연습 결과**: 자녀의 타자 연습 성과
- **학원비 납부 내역**: 납부 이력 확인
- **담당 강사 정보**: 자녀의 담당 강사 정보

### 강사 대시보드 (`/dashboard/teacher`)

#### 주요 기능
- **담당 학생 목록**: 담당 학생 전체 목록
- **출석 현황**: 담당 학생들의 출석 현황
- **커리큘럼 관리**: 커리큘럼 생성 및 수정
- **학생 진도 평가**: 학생별 학습 진도 확인
- **상담 관리**: 상담 문의 확인 및 처리

#### 컴포넌트
- `StudentList.tsx`: 학생 목록 컴포넌트
- `AttendanceScheduler.tsx`: 출석 일정 관리
- `WeeklyCalendar.tsx`: 주간 캘린더

### 관리자 대시보드 (`/dashboard/admin`)

#### 주요 기능
- **전체 통계**: 학원 전체 통계 정보
- **사용자 관리**: 학생/강사/학부모 계정 관리
- **커리큘럼 관리**: 전체 커리큘럼 관리
- **타자 연습 문제 관리**: 타자 연습 문제 CRUD
- **공지사항 관리**: 공지사항 작성 및 관리
- **상담 관리**: 전체 상담 문의 관리

---

## 커리큘럼 관리

### 커리큘럼 구조

```typescript
interface Curriculum {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level: '기초' | '중급' | '고급';
  image?: string;
  checklist: string[];  // 단계별 체크리스트
  created_by?: string;
  public: boolean;
  show_on_main?: boolean;
  main_display_order?: number;
}
```

### 주요 기능

#### 1. 커리큘럼 생성 및 수정
- **권한**: 강사, 관리자
- **기능**:
  - 제목, 설명, 카테고리 설정
  - 난이도 선택 (기초/중급/고급)
  - 체크리스트 단계 추가/삭제
  - 이미지 업로드
  - 메인 페이지 표시 여부 설정

#### 2. 학생 커리큘럼 진행
- **위치**: `/dashboard/student/study`
- **기능**:
  - 현재 배정된 커리큘럼 확인
  - 단계별 체크리스트 진행
  - 결과물 업로드 (이미지/URL/파일)
  - 메모 작성
  - 강사 피드백 확인
  - 완료 처리

#### 3. 커리큘럼 피드백
- **작성자**: 강사
- **기능**:
  - 학생 결과물 확인
  - 피드백 작성
  - 완료 여부 확인

### 컴포넌트

- `curriculum-card.tsx`: 커리큘럼 카드 표시
- `curriculum-upload.tsx`: 결과물 업로드 컴포넌트
- `curriculum-memo.tsx`: 메모 및 피드백 컴포넌트
- `CurriculumManager.tsx`: 커리큘럼 관리 컴포넌트

---

## 타자 연습 시스템

### 타자 연습 종류

#### 1. 기본 타자 연습 (`/dashboard/student/typing/basic`)
- **언어**: 한글, 영어
- **유형**: 자리연습, 실전연습
- **기능**:
  - 단계별 자리 연습
  - 실전 문장 연습
  - 속도 및 정확도 측정
  - 결과 저장

#### 2. 단어 타자 연습 (`/dashboard/student/typing/word`)
- **언어**: 한글, 영어
- **특징**: 프로그래밍 용어 중심
- **기능**:
  - 단어별 연습
  - 카테고리별 연습
  - 통계 추적

#### 3. AI 기반 타자 연습
- **기술**: Google AI (Genkit)
- **기능**:
  - 학생 수준에 맞는 맞춤형 문제 생성
  - 과거 성과 기반 난이도 조절
  - 커리큘럼 연계 문제 생성

### 타자 연습 데이터 구조

```typescript
interface TypingExercise {
  id: string;
  title: string;
  content: string;
  language: 'Korean' | 'English' | 'Code';
  level: '기초' | '중급' | '고급';
  exercise_type: '자리연습' | '실전연습';
  created_at: string;
}
```

### 결과 저장

- **저장 위치**: `student_activity_logs` 테이블
- **저장 정보**:
  - `typing_score`: 점수
  - `typing_speed`: 타자 속도 (타/분)
  - `typing_exercise_id`: 연습 문제 ID

---

## 출석 관리

### 출석 일정 설정

```typescript
// attendance_schedule 예시
{
  "1": "14:00",  // 월요일 14시
  "3": "15:00",  // 수요일 15시
  "5": "16:00"   // 금요일 16시
}
```

### 주요 기능

#### 1. 출석 일정 관리
- **권한**: 강사, 관리자
- **기능**:
  - 학생별 출석 요일 및 시간 설정
  - 수강 시작일/종료일 설정
  - 일정 수정

#### 2. 출석 체크
- **권한**: 학생, 강사
- **기능**:
  - 오늘 출석 여부 체크
  - 출석 기록 저장
  - 출석률 계산

#### 3. 출석 통계
- **기능**:
  - 월별 출석률
  - 요일별 출석 현황
  - 출석 이력 조회

### 컴포넌트

- `attendance-calendar.tsx`: 출석 캘린더
- `timetable.tsx`: 시간표 컴포넌트

---

## 커뮤니티

### 게시판 기능

#### 1. 게시글 작성
- **권한**: 모든 인증된 사용자
- **기능**:
  - 제목, 내용 작성
  - 이미지 업로드 (다중)
  - 게시글 수정/삭제

#### 2. 댓글 시스템
- **기능**:
  - 댓글 작성
  - 댓글 수정/삭제
  - Soft Delete (is_deleted 플래그)

#### 3. 역할 표시
- **기능**:
  - 작성자 역할 배지 표시
  - 아바타 표시

### 컴포넌트

- `PostCard.tsx`: 게시글 카드
- `CommentCard.tsx`: 댓글 카드
- `PostForm.tsx`: 게시글 작성 폼
- `CommentForm.tsx`: 댓글 작성 폼
- `RoleBadge.tsx`: 역할 배지
- `UserAvatar.tsx`: 사용자 아바타

### 데이터 구조

```typescript
interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  images?: string[];
  is_deleted?: boolean;
  created_at: string;
}

interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_deleted?: boolean;
  created_at: string;
}
```

---

## 강사진 관리

### 강사 프로필

#### 1. 강사 정보
- **저장 위치**: `teachers` 테이블
- **정보**:
  - 프로필 이미지
  - 소개 (bio)
  - 경력 (career)
  - 자격증 (certs)

#### 2. 강사 표시
- **위치**: 메인 페이지 (`/`)
- **기능**:
  - DB 기반 자동 정렬 (원장/부원장 우선)
  - 반응형 레이아웃 (2+3 구조)
  - 상세 모달 표시

#### 3. 강사 관리
- **권한**: 관리자
- **기능**:
  - 강사 추가
  - 강사 정보 수정
  - 강사 삭제

### 컴포넌트

- `instructor-card.tsx`: 강사 카드
- `instructor-detail-modal.tsx`: 강사 상세 모달
- `instructors-section.tsx`: 강사진 섹션

---

## 이미지 관리

### 이미지 업로드 프로세스

1. **이미지 선택**: 사용자가 이미지 파일 선택
2. **압축 처리**: Canvas API를 사용하여 WebP 형식으로 변환
3. **리사이징**: 최대 크기 제한 (예: 1920x1080)
4. **업로드**: Supabase Storage에 업로드
5. **URL 저장**: Public URL을 데이터베이스에 저장

### 이미지 최적화

- **형식**: WebP (자동 변환)
- **압축률**: 품질 80%
- **최대 크기**: 1920x1080px
- **캐싱**: 1년 캐시 설정

### 컴포넌트

- `image-upload.tsx`: 이미지 업로드 컴포넌트
- `image-uploader.tsx`: 이미지 업로더
- `image-modal.tsx`: 이미지 모달
- `image-compression.ts`: 이미지 압축 유틸리티

---

## AI 기능

### AI 기반 타자 연습 생성

#### 기술 스택
- **Google AI (Genkit)**: AI 모델 통합
- **위치**: `src/ai/flows/suggest-typing-exercise.ts`

#### 프로세스

1. **학생 데이터 분석**
   - 과거 타자 연습 결과 조회
   - 평균 속도, 정확도 계산
   - 약점 파악

2. **커리큘럼 정보 확인**
   - 현재 배정된 커리큘럼 확인
   - 학습 주제 파악

3. **AI 요청**
   - 학생 수준에 맞는 문제 생성 요청
   - 커리큘럼과 연계된 내용 포함

4. **결과 저장**
   - 생성된 문제를 데이터베이스에 저장
   - 학생에게 추천

### AI 설정

```typescript
// src/ai/genkit.ts
- Google AI API 키 설정
- Genkit 플로우 정의
- 타입 안전성 보장
```

---

## 추가 기능

### 상담 예약
- **위치**: `/dashboard/parent`, `/dashboard/teacher/consultations`
- **기능**: 학부모가 상담을 예약하고, 강사/관리자가 확인

### 공지사항
- **권한**: 관리자, 강사
- **기능**: 중요 공지사항 작성 및 관리

### 프로필 관리
- **기능**: 사용자 프로필 수정, 비밀번호 변경

### 시간표 관리
- **기능**: 학생별 수업 시간표 확인 및 관리

