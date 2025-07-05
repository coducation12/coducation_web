## 🚀 Coducation 웹사이트 통합 개발 프론프트 (Vercel + Supabase 기반)

### 🤩 프로젝트키 개요

* 🌐 서비스명: Coducation
* 홍보 학원: 코딩메이커 학원 (전남 광양)
* 기술 스택:

  * **Frontend**: Next.js (App Router) + TailwindCSS
  * **Auth & DB**: Supabase (Auth + PostgreSQL)
  * **Storage**: Supabase Storage
  * **배포**: Vercel
  * **기타**: 역할 기반 대시보드, 공통 커리큘럼, 출석 관리, 타자 연습

---

## 📁 폴더 구조

```
/app
 ├── layout.tsx
 ├── page.tsx                       # 메인
 ├── login/page.tsx
 ├── dashboard/
 │   ├── layout.tsx              # 사이드바 공통
 │   ├── student/...
 │   ├── parent/...
 │   ├── teacher/...
 │   └── admin/...
/components
 ├── common/                         # Button, Card, Modal
 ├── sidebar/                        # 역할 기반 사이드바
 ├── hero/                           # 히어로 슬라이드
 ├── notices/                        # 공지 카드
 ├── profile/                        # 강사 컨텐츠
 └── curriculum/                     # 과정 카드
/lib
 ├── supabase.ts                     # Supabase client
 ├── auth.ts                         # 역할 기반 구현
 └── rls.ts                          # RLS 설정
/utils
 └── helpers.ts
/types
 └── index.ts                        # 타입 선언
/styles
 └── globals.css
/public/images
 └── (강사/과정 이미지)
```

---

## 🔐 Supabase Auth + DB Schema

### 📅 사용자 역할 및 관계

```sql
-- 1. users (모든 계정)
create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  name text not null,
  role text not null, -- 'student', 'parent', 'teacher', 'admin'
  birth_year int,
  academy text, -- 소속 학원명
  created_at timestamp default now()
);

-- 2. students (학생별 정보)
create table students (
  user_id uuid primary key references users(id) on delete cascade,
  assigned_teachers uuid[] not null, -- 담당 강사 id 배열
  parent_id uuid unique references users(id), -- 학부모 id (1:1)
  tuition_fee int, -- 월 기본 학원비
  current_curriculum_id uuid references curriculums(id),
  enrollment_start_date date not null, -- 수강 시작일
  enrollment_end_date date, -- 수강 종료일 (null이면 진행중)
  attendance_schedule jsonb, -- 출석 일정 {요일: 시간} 형태 (예: {"1": "14:00", "3": "15:00", "5": "16:00"})
  created_at timestamp default now()
);

-- 3. teachers (강사별 정보)
create table teachers (
  user_id uuid primary key references users(id) on delete cascade,
  bio text,
  image text,
  certs text,
  career text,
  created_at timestamp default now()
);

-- 4. curriculums (교육과정)
create table curriculums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  image text,
  checklist text[], -- 커리큘럼별 체크리스트
  created_by uuid references users(id),
  created_at timestamp default now()
);

-- 5. typing_exercises (타자연습)
create table typing_exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  language text not null, -- 'Korean', 'English', 'Code'
  exercise_type text not null, -- '자리연습', '실전연습'
  created_at timestamp default now(),
  constraint valid_exercise_type
    check (
      (language in ('Korean', 'English') and exercise_type in ('자리연습', '실전연습'))
      or (language = 'Code' and exercise_type = '실전연습')
    )
);

-- 6. student_activity_logs (학생 활동 기록)
create table student_activity_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id) not null,
  date date not null,
  attended boolean,
  typing_score int,
  typing_speed int,
  curriculum_id uuid references curriculums(id),
  typing_exercise_id uuid references typing_exercises(id),
  result_image text,
  result_url text,
  result_file text,
  memo text,
  created_at timestamp default now()
);

-- 7. tuition_payments (학원비 납부)
create table tuition_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id) not null,
  amount int not null,
  paid_at timestamp not null,
  note text
);

-- 8. community_posts (커뮤니티 게시글)
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  title text not null,
  content text not null,
  is_deleted boolean default false,
  created_at timestamp default now()
);

-- 9. community_comments (커뮤니티 댓글)
create table community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) not null,
  user_id uuid references users(id) not null,
  content text not null,
  is_deleted boolean default false,
  created_at timestamp default now()
);
```

---

## 🔐 권한범위 & RLS 예시

```sql
-- 학생 본인 데이터 접근
create policy "Student can access own data"
  on students
  for select
  using (auth.uid() = user_id);

-- 학부모 자녀 데이터 접근
create policy "Parent can access child data"
  on students
  for select
  using (parent_id = auth.uid());

-- 강사 담당 학생 데이터 접근
create policy "Teacher can access assigned students"
  on students
  for select
  using (auth.uid() = any(assigned_teachers));

-- 관리자 전체 데이터 접근
create policy "Admin can access all data"
  on students
  for all
  using (exists (
    select 1 from users 
    where id = auth.uid() and role = 'admin'
  ));
```

---

## 📅 역할별 작동방식

### 👨‍🎓 학생 (Student)
- **대시보드**: 오늘의 수업, 타자연습 결과, 커리큘럼 진행상황
- **수강 일정**: 자신의 출석 요일과 시간 확인
- **타자연습**: 
  - 한글/영어: 자리연습 → 실전연습 순서
  - 코드: 실전연습만
- **커리큘럼**: 체크리스트 기반 진행상황 확인
- **출석**: 수업 참여 여부 기록
- **결과물**: 이미지/URL/파일 업로드

### 👨‍👩‍👧‍👦 학부모 (Parent)
- **대시보드**: 자녀 학습 현황, 출석률, 타자연습 결과
- **자녀 일정**: 자녀의 출석 요일과 시간 확인
- **학원비**: 납부 내역 확인
- **커뮤니티**: 공지사항 및 게시글 확인
- **자녀 정보**: 담당 강사, 현재 커리큘럼 확인

### 👨‍🏫 강사 (Teacher)
- **대시보드**: 담당 학생 목록, 출석 현황, 커리큘럼 진행상황
- **학생 관리**: 담당 학생별 활동 기록 확인
- **수강 일정**: 담당 학생들의 출석 요일과 시간 관리
- **수강 종료**: 담당 학생의 수강 종료 설정 (enrollment_end_date)
- **커리큘럼**: 체크리스트 관리, 진행상황 업데이트
- **결과물**: 학생 제출물 확인 및 피드백
- **타자연습**: 학생별 연습 결과 분석

### 👨‍💼 관리자 (Admin)
- **대시보드**: 전체 통계, 학원별 현황
- **계정 관리**: 학생/강사/학부모 계정 생성 및 관리
- **학원 관리**: academy별 데이터 관리
- **수강 일정**: 전체 학생의 출석 요일과 시간 관리
- **수강 종료**: 모든 학생의 수강 종료 설정 및 관리
- **커리큘럼**: 전체 커리큘럼 관리
- **타자연습**: 연습 문제 관리
- **커뮤니티**: 공지사항 관리
- **학원비**: 전체 납부 현황 관리

---

## 🔮 DB Seed 예시

```sql
-- 테스트 사용자 생성
insert into users (username, password, name, role, academy) values
('student1', 'password123', '김학생', 'student', '코딩메이커'),
('parent1', 'password123', '김부모', 'parent', '코딩메이커'),
('teacher1', 'password123', '김강사', 'teacher', '코딩메이커'),
('admin1', 'password123', '김관리자', 'admin', '코딩메이커');

-- 학생 정보 생성 (수강 일정 포함)
insert into students (user_id, assigned_teachers, parent_id, tuition_fee, enrollment_start_date, attendance_schedule) values
((select id from users where username = 'student1'), 
 array[(select id from users where username = 'teacher1')], 
 (select id from users where username = 'parent1'), 
 150000, 
 '2024-01-01', 
 '{"1": "14:00", "3": "15:00", "5": "16:00"}'); -- 월 14시, 수 15시, 금 16시

-- 커리큘럼 생성
insert into curriculums (title, description, category, checklist, created_by) values
('파이썬 기초', '입문자를 위한 파이썬 문법', '프로그래밍', 
 array['변수와 데이터타입', '조건문과 반복문', '함수 정의'], 
 (select id from users where username = 'teacher1'));

-- 타자연습 생성
insert into typing_exercises (title, content, language, exercise_type) values
('한글 자리연습', '안녕하세요 반갑습니다', 'Korean', '자리연습'),
('한글 실전연습', '오늘 날씨가 좋네요', 'Korean', '실전연습'),
('영어 자리연습', 'Hello World', 'English', '자리연습'),
('파이썬 코드', 'print("Hello World")', 'Code', '실전연습');

---

## 🔍 유용한 SQL 쿼리 예시

### 📅 오늘 수업이 있는 학생 조회
```sql
-- 오늘 요일에 수업이 있는 학생들 조회
SELECT 
  u.name as student_name,
  u.academy,
  s.attendance_schedule,
  s.attendance_schedule->EXTRACT(DOW FROM CURRENT_DATE)::text as today_time
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.role = 'student' 
  AND s.enrollment_end_date IS NULL  -- 수강 종료되지 않은 학생
  AND s.attendance_schedule ? EXTRACT(DOW FROM CURRENT_DATE)::text;  -- 오늘 요일이 일정에 있는 학생
```

### 👨‍🏫 강사별 담당 학생 수업 일정 조회
```sql
-- 특정 강사의 담당 학생들 수업 일정
SELECT 
  u.name as student_name,
  t.name as teacher_name,
  s.attendance_schedule,
  s.enrollment_start_date,
  s.enrollment_end_date
FROM students s
JOIN users u ON s.user_id = u.id
JOIN users t ON t.id = ANY(s.assigned_teachers)
WHERE t.username = 'teacher1'  -- 특정 강사
  AND s.enrollment_end_date IS NULL;  -- 수강 중인 학생만
```

### 📊 요일별 수업 학생 수 통계
```sql
-- 요일별로 수업하는 학생 수 집계
SELECT 
  CASE 
    WHEN day = '0' THEN '일요일'
    WHEN day = '1' THEN '월요일'
    WHEN day = '2' THEN '화요일'
    WHEN day = '3' THEN '수요일'
    WHEN day = '4' THEN '목요일'
    WHEN day = '5' THEN '금요일'
    WHEN day = '6' THEN '토요일'
  END as day_name,
  COUNT(*) as student_count
FROM (
  SELECT jsonb_object_keys(s.attendance_schedule) as day
  FROM students s
  JOIN users u ON s.user_id = u.id
  WHERE u.role = 'student' AND s.enrollment_end_date IS NULL
) sub
GROUP BY day
ORDER BY day;
```

### ⏰ 특정 시간대 수업 학생 조회
```sql
-- 오후 2시에 수업하는 학생들 조회
SELECT 
  u.name as student_name,
  u.academy,
  s.attendance_schedule
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.role = 'student'
  AND s.enrollment_end_date IS NULL
  AND s.attendance_schedule @> '{"1": "14:00", "3": "14:00", "5": "14:00"}';  -- 월,수,금 14시
```

### 📈 학원별 수업 일정 분석
```sql
-- 학원별로 가장 인기 있는 수업 시간대 분석
SELECT 
  u.academy,
  s.attendance_schedule->>day as class_time,
  COUNT(*) as student_count
FROM (
  SELECT 
    s.user_id,
    jsonb_object_keys(s.attendance_schedule) as day
  FROM students s
  JOIN users u ON s.user_id = u.id
  WHERE u.role = 'student' AND s.enrollment_end_date IS NULL
) sub
JOIN students s ON sub.user_id = s.user_id
JOIN users u ON s.user_id = u.id
GROUP BY u.academy, s.attendance_schedule->>day
ORDER BY u.academy, student_count DESC;
```

### 🔄 수강 종료 학생 조회
```sql
-- 수강이 종료된 학생들 조회
SELECT 
  u.name as student_name,
  u.academy,
  s.enrollment_start_date,
  s.enrollment_end_date,
  s.attendance_schedule
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.role = 'student' 
  AND s.enrollment_end_date IS NOT NULL
  AND s.enrollment_end_date <= CURRENT_DATE;
```

### 📅 이번 주 수업 일정 조회
```sql
-- 이번 주 수업 일정이 있는 학생들 조회
SELECT 
  u.name as student_name,
  u.academy,
  s.attendance_schedule,
  CASE 
    WHEN s.attendance_schedule ? '1' THEN '월요일 ' || (s.attendance_schedule->>'1') || '시'
    ELSE ''
  END ||
  CASE 
    WHEN s.attendance_schedule ? '2' THEN ', 화요일 ' || (s.attendance_schedule->>'2') || '시'
    ELSE ''
  END ||
  CASE 
    WHEN s.attendance_schedule ? '3' THEN ', 수요일 ' || (s.attendance_schedule->>'3') || '시'
    ELSE ''
  END ||
  CASE 
    WHEN s.attendance_schedule ? '4' THEN ', 목요일 ' || (s.attendance_schedule->>'4') || '시'
    ELSE ''
  END ||
  CASE 
    WHEN s.attendance_schedule ? '5' THEN ', 금요일 ' || (s.attendance_schedule->>'5') || '시'
    ELSE ''
  END as weekly_schedule
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.role = 'student' 
  AND s.enrollment_end_date IS NULL;
```
```

---

## 🎯 주요 기능별 작동방식

### 📚 커리큘럼 관리
- **체크리스트**: text[] 배열로 단계별 진행상황 관리
- **진행상황**: student_activity_logs에서 curriculum_id로 추적
- **결과물**: 이미지/URL/파일 형태로 저장

### ⌨️ 타자연습 시스템
- **한글/영어**: 자리연습 → 실전연습 순차 진행
- **코드**: 실전연습만 제공
- **기록**: typing_score, typing_speed 저장
- **분석**: 학생별 진행상황 및 성취도 분석

### 👥 학생-강사 관계
- **다대다**: students.assigned_teachers에 uuid[] 배열로 관리
- **확장성**: 한 학생이 여러 강사에게 배정 가능
- **권한**: 담당 강사만 해당 학생 데이터 접근

### 💰 학원비 관리
- **기본값**: students.tuition_fee에 월 기본 학원비 설정
- **실제 납부**: tuition_payments 테이블에서 개별 기록
- **추적**: 학생별 납부 이력 및 미납 현황 관리

### 💬 커뮤니티
- **Soft Delete**: is_deleted 컬럼으로 삭제 처리
- **공지사항**: community_posts에서 관리자/강사 작성
- **댓글**: 계층형 구조로 게시글별 댓글 관리

### 🏫 학원 구분
- **단순화**: users.academy 컬럼으로 문자열 관리
- **확장성**: 별도 academies 테이블 없이 유연한 학원명 관리
- **권한**: academy별 데이터 접근 제어 가능

---
