# Coducation 데이터베이스 스키마

## 📊 데이터베이스 개요

**데이터베이스**: Supabase (PostgreSQL)  
**인증**: Supabase Auth (강사/관리자) + Custom Auth (학생/학부모)

## 🗂️ 테이블 구조

### 1. users (사용자 기본 정보)

모든 사용자의 기본 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'admin')),
  birth_year INTEGER,
  phone TEXT,
  academy TEXT NOT NULL,
  assigned_teacher_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  can_manage_all_payments BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `id`: 사용자 고유 ID (UUID)
- `username`: 로그인 아이디 (고유)
- `name`: 사용자 이름
- `role`: 역할 (student, parent, teacher, admin)
- `academy`: 소속 학원명
- `assigned_teacher_id`: 배정된 강사 ID (학생의 경우)

#### 인덱스
```sql
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_academy ON public.users(academy);
```

---

### 2. students (학생 상세 정보)

학생별 상세 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE public.students (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  assigned_teachers UUID[] NOT NULL,
  parent_id UUID UNIQUE REFERENCES users(id),
  tuition_fee INTEGER,
  current_curriculum_id UUID REFERENCES curriculums(id),
  enrollment_start_date DATE NOT NULL,
  enrollment_end_date DATE,
  attendance_schedule JSONB,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `user_id`: users 테이블 참조
- `assigned_teachers`: 담당 강사 ID 배열
- `parent_id`: 학부모 ID (1:1 관계)
- `tuition_fee`: 월 기본 학원비
- `current_curriculum_id`: 현재 배정된 커리큘럼
- `enrollment_start_date`: 수강 시작일
- `enrollment_end_date`: 수강 종료일 (NULL이면 진행 중)
- `attendance_schedule`: 출석 일정 (JSONB)
  ```json
  {
    "1": "14:00",  // 월요일 14시
    "3": "15:00",  // 수요일 15시
    "5": "16:00"   // 금요일 16시
  }
  ```

---

### 3. teachers (강사 상세 정보)

강사별 상세 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE public.teachers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  image TEXT,
  certs TEXT,
  career TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `user_id`: users 테이블 참조
- `bio`: 강사 소개
- `image`: 프로필 이미지 URL
- `certs`: 자격증 정보
- `career`: 경력 정보

---

### 4. curriculums (교육 과정)

교육 과정 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE public.curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT NOT NULL CHECK (level IN ('기초', '중급', '고급')),
  image TEXT,
  checklist TEXT[],
  created_by UUID REFERENCES users(id),
  public BOOLEAN NOT NULL DEFAULT false,
  show_on_main BOOLEAN DEFAULT false,
  main_display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `id`: 커리큘럼 고유 ID
- `title`: 커리큘럼 제목
- `description`: 설명
- `category`: 카테고리
- `level`: 난이도 (기초, 중급, 고급)
- `checklist`: 단계별 체크리스트 배열
- `public`: 공개 여부
- `show_on_main`: 메인 페이지 표시 여부
- `main_display_order`: 메인 페이지 표시 순서

---

### 5. main_curriculums (메인 페이지 커리큘럼)

메인 페이지에 표시되는 커리큘럼 정보를 별도로 관리하는 테이블입니다.

```sql
CREATE TABLE public.main_curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT NOT NULL CHECK (level IN ('기초', '중급', '고급')),
  image TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `display_order`: 표시 순서 (낮을수록 먼저 표시)

---

### 6. typing_exercises (타자 연습 문제)

타자 연습 문제를 저장하는 테이블입니다.

```sql
CREATE TABLE public.typing_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('Korean', 'English', 'Code')),
  level TEXT NOT NULL CHECK (level IN ('기초', '중급', '고급')),
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('자리연습', '실전연습')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_exercise_type CHECK (
    (language IN ('Korean', 'English') AND exercise_type IN ('자리연습', '실전연습'))
    OR (language = 'Code' AND exercise_type = '실전연습')
  )
);
```

#### 주요 필드
- `title`: 문제 제목
- `content`: 연습 내용
- `language`: 언어 (Korean, English, Code)
- `level`: 난이도
- `exercise_type`: 연습 유형
  - 한글/영어: 자리연습, 실전연습
  - 코드: 실전연습만

---

### 7. student_activity_logs (학생 활동 기록)

학생의 일일 활동을 기록하는 테이블입니다.

```sql
CREATE TABLE public.student_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  attended BOOLEAN,
  typing_score INTEGER,
  typing_speed INTEGER,
  curriculum_id UUID REFERENCES curriculums(id),
  typing_exercise_id UUID REFERENCES typing_exercises(id),
  result_image TEXT,
  result_url TEXT,
  result_file TEXT,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `student_id`: 학생 ID
- `date`: 활동 날짜
- `attended`: 출석 여부
- `typing_score`: 타자 연습 점수
- `typing_speed`: 타자 속도 (타/분)
- `curriculum_id`: 관련 커리큘럼
- `typing_exercise_id`: 타자 연습 문제 ID
- `result_image`: 결과 이미지 URL
- `result_url`: 결과 URL
- `result_file`: 결과 파일 URL
- `memo`: 메모

#### 인덱스
```sql
CREATE INDEX idx_student_activity_logs_student_id ON public.student_activity_logs(student_id);
CREATE INDEX idx_student_activity_logs_date ON public.student_activity_logs(date);
```

---

### 8. community_posts (커뮤니티 게시글)

커뮤니티 게시글을 저장하는 테이블입니다.

```sql
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `user_id`: 작성자 ID
- `title`: 제목
- `content`: 내용
- `images`: 이미지 URL 배열
- `is_deleted`: 삭제 여부 (Soft Delete)

#### 인덱스
```sql
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
```

---

### 9. community_comments (커뮤니티 댓글)

커뮤니티 댓글을 저장하는 테이블입니다.

```sql
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `post_id`: 게시글 ID
- `user_id`: 작성자 ID
- `content`: 댓글 내용
- `is_deleted`: 삭제 여부 (Soft Delete)

#### 인덱스
```sql
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON public.community_comments(user_id);
```

---

### 10. consultations (상담 문의)

상담 문의를 저장하는 테이블입니다.

```sql
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  response TEXT,
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 주요 필드
- `user_id`: 문의자 ID (학부모)
- `student_id`: 관련 학생 ID
- `title`: 제목
- `content`: 내용
- `status`: 상태 (pending, in_progress, completed)
- `response`: 답변 내용
- `responded_by`: 답변자 ID
- `responded_at`: 답변 시간

---

### 11. tuition_payments (학원비 수납 내역)

학생별 월별 학원비 수납 정보를 관리하는 테이블입니다.

```sql
CREATE TABLE public.tuition_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    payment_month DATE NOT NULL,
    base_amount INTEGER NOT NULL DEFAULT 0,
    total_paid_amount INTEGER DEFAULT 0,
    payment_details JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'excluded')),
    recorded_by UUID REFERENCES public.users(id),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, payment_month)
);
```

#### 주요 필드
- `student_id`: 학생 ID
- `payment_month`: 수납 대상 월 (매월 1일 기준)
- `base_amount`: 해당 월의 기준 학원비
- `total_paid_amount`: 해당 월에 수납된 총액
- `payment_details`: 상세 수납 항목 (배열)
- `status`: 수납 상태 (미납, 부분납, 완납, 제외)
- `recorded_by`: 기록자 (강사/관리자)

---

## 🔐 RLS (Row Level Security) 정책

### users 테이블
- 모든 사용자는 자신의 정보 조회 가능
- 관리자는 모든 사용자 정보 조회 가능

### students 테이블
- 학생: 자신의 정보만 조회 가능
- 학부모: 자녀의 정보만 조회 가능
- 강사: 담당 학생의 정보만 조회 가능
- 관리자: 모든 학생 정보 조회 가능

### teachers 테이블
- 강사: 자신의 정보만 조회 가능
- 관리자: 모든 강사 정보 조회 가능

### curriculums 테이블
- 모든 사용자: 공개된 커리큘럼 조회 가능
- 강사/관리자: 커리큘럼 생성/수정 가능

### community_posts 테이블
- 모든 사용자: 게시글 조회 가능
- 인증된 사용자: 게시글 작성 가능
- 작성자: 자신의 게시글 수정/삭제 가능

### community_comments 테이블
- 모든 사용자: 댓글 조회 가능
- 인증된 사용자: 댓글 작성 가능
- 작성자: 자신의 댓글 수정/삭제 가능

### consultations 테이블
- 학부모: 자신의 상담 문의 작성/조회 가능
- 강사/관리자: 모든 상담 문의 조회/답변 가능

---

## 📈 주요 쿼리 예시

### 오늘 수업이 있는 학생 조회
```sql
SELECT 
  u.name as student_name,
  u.academy,
  s.attendance_schedule,
  s.attendance_schedule->EXTRACT(DOW FROM CURRENT_DATE)::text as today_time
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.role = 'student' 
  AND s.enrollment_end_date IS NULL
  AND s.attendance_schedule ? EXTRACT(DOW FROM CURRENT_DATE)::text;
```

### 강사별 담당 학생 수업 일정
```sql
SELECT 
  u.name as student_name,
  t.name as teacher_name,
  s.attendance_schedule
FROM students s
JOIN users u ON s.user_id = u.id
JOIN users t ON t.id = ANY(s.assigned_teachers)
WHERE t.username = 'teacher1'
  AND s.enrollment_end_date IS NULL;
```

### 학생별 타자 연습 통계
```sql
SELECT 
  student_id,
  AVG(typing_speed) as avg_speed,
  AVG(typing_score) as avg_score,
  COUNT(*) as total_exercises
FROM student_activity_logs
WHERE typing_exercise_id IS NOT NULL
GROUP BY student_id;
```

---

## 🔄 마이그레이션

마이그레이션 파일은 `supabase/migrations/` 디렉토리에 저장됩니다.

### 주요 마이그레이션
- `20241220000000_create_approval_system.sql`: 승인 시스템 생성

### 마이그레이션 적용
```bash
# Supabase CLI 사용
supabase db push

# 또는 Supabase Dashboard에서 SQL Editor 사용
```

---

## 📝 참고사항

1. **Soft Delete**: `community_posts`, `community_comments` 테이블은 실제 삭제 대신 `is_deleted` 플래그 사용
2. **JSONB 활용**: `attendance_schedule`은 JSONB 타입으로 유연한 일정 관리
3. **배열 타입**: `assigned_teachers`는 UUID 배열로 다대다 관계 표현
4. **CASCADE 삭제**: 외래 키 제약조건에 CASCADE 옵션 적용으로 데이터 무결성 보장

