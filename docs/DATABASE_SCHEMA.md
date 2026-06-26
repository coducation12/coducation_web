# Coducation 데이터베이스 스키마 및 가이드

이 문서는 **Coducation (코딩으로 세상을 교육하다)** 시스템의 Supabase (PostgreSQL) 데이터베이스 구조와 개편된 테이블 및 데이터를 설명합니다.

---

## 📊 데이터베이스 개요

* **플랫폼**: Supabase (PostgreSQL)
* **인증**: Supabase Auth (이메일 기반: 강사/관리자) + Custom Auth (아이디 기반: 학생/학부모)
* **RLS (Row Level Security)**: 활성화되어 있으며, 강사/관리자 전용 세션 및 작업은 `supabaseAdmin` (Service Role Key)을 사용해 수행합니다.

---

## 🗂️ 테이블 현황 일람

최근 개편 작업을 거치며 데이터 모델이 최적화되었습니다. 현재 시스템에서 참조 및 연동되는 활성 테이블은 다음과 같습니다.

### 1. 핵심 사용자 및 교육 과정
* **`users`**: 모든 사용자의 공통 계정 및 역할 정보
* **`students`**: 학생 회원의 수강료, 배정 강사, 현재 진행 단계 등의 상세 정보
* **`teachers`**: 강사 프로필, 소개, 경력 정보
* **`curriculums`**: 학원의 교육 과정(커리큘럼) 마스터 정보
* **`main_curriculums`**: 메인 페이지(랜딩)에 소개용으로 노출할 특정 교육 과정 목록

### 2. 출결 및 진도/성과 관리
* **`attendance_sessions` (★ 중요)**: 일별 정규/보강 수업 출결 및 **일일 타자연습 최고 점수 기록**
* **`student_schedules`**: 학생별 요일별 기본 등원 시간 설정
* **`timetable_snapshots`**: 학원 행정용 요일별/시간별 전체 학생 시간표 스냅샷
* **`student_progresses`**: 학생별 커리큘럼 이수율 및 개별 평가 점수
* **`student_achievements`**: 학생이 획득한 자격증(Certificate) 및 수상 내역(Award)
* **`student_todos`**: 학생 대시보드의 개인 To-Do 할 일 목록

### 3. 실습실 및 사이트 설정
* **`pc_room_layouts`**: 컴퓨터 실습실의 PC 배치 및 회전 상태 정보
* **`content_management`**: 메인 페이지의 슬라이드, 슬로건, 특징 카드 등 동적 컨텐츠 설정
* **`site_statistics`**: 일별 페이지 뷰 및 순 방문자(Unique Visitors) 통계

### 4. 타자 연습
* **`typing_exercises`**: 타자연습 시스템에 등록된 전체 예문 목록
* **`typing_weekly_stats` (★ 폐기)**: 주차별 타자 통계 (더 이상 사용하지 않음, 삭제 예정)
* **`typing_logs` (★ 폐기)**: 개별 타자연습 로그 (더 이상 사용하지 않음, 삭제 예정)

### 5. 소통 및 가입 승인
* **`student_signup_requests`**: 신규 학생 가입 신청 상태 및 보류 사유
* **`approval_logs`**: 가입 승인/반려 히스토리 로그
* **`community_posts`**: 학원 게시판 글 정보 (소통, 알림)
* **`community_comments`**: 게시글 댓글 정보
* **`consultations`**: 학부모와 강사 간의 온라인 상담 신청 및 답변 내역

---

## 🔄 테이블 개편 및 폐기(Deprecated) 안내

테이블 개편 과정에서 미사용/대체된 테이블들의 현황입니다.

| 기존 테이블 (Deprecated) | 신규 테이블 (Active) | 변경 배경 및 비고 |
| :--- | :--- | :--- |
| **`student_activity_logs`** | **`attendance_sessions`** | 과거에는 일일 활동을 로깅 테이블 형태로 누적했으나, **출결과 연계된 하루 1회의 고유한 학습 세션**으로 관리하기 위해 일자별 고유 키를 가지는 세션 테이블로 통합되었습니다. |
| **`tuition_payments`** | **`tuition_annual_records`** | 월별로 수많은 행이 생성되던 과거 구조에서, **학생별-연도별 단 1개의 행(Row)**만 생성하고 내부 `monthly_data` 컬럼을 JSONB 타입으로 구조화하여 쿼리 속도와 용량을 비약적으로 최적화했습니다. |
| **`typing_logs`** | **`attendance_sessions`** | 원래 타자연습 매 시도마다 로그를 남기려 설계했던 흔적이나, 불필요한 쓰기 오버헤드를 막기 위해 **시도 결과는 일별 최고 속도(CPM)만 `attendance_sessions`에 합산**하므로 현재는 비어 있고 동작에 영향을 주지 않는 유령 테이블입니다. (완전히 삭제됨) |
| **`typing_weekly_stats`** | **`attendance_sessions`** | 학생의 주차별 타자 속도/정확도 통계 데이터용으로 설계되었으나, 실제 학생 타자 차트는 `attendance_sessions`를 통해 직접 조회하므로 필요가 없어 완전 폐기되었습니다. |

---

## 🚨 문제 해결 가이드: 비정상 타수(5000 CPM 등) 수동 제거 및 수정 방법

부정행위 등으로 인해 비정상적으로 높은 타수 기록이 등록되었을 때, 이를 DB에서 제거/수정하는 절차입니다.

### 1. 타수가 저장된 물리적 공간
타수가 저장되는 실제 컬럼은 **`attendance_sessions`** 테이블의 아래 컬럼들입니다.
* **`korean_typing_speed`**: 당일 한국어 최고 타수 (CPM)
* **`english_typing_speed`**: 당일 영어 최고 타수 (CPM)

### 2. SQL을 사용한 수정/초기화 쿼리
Supabase SQL Editor 또는 데이터베이스 툴에서 아래 쿼리를 사용하여 해당 학생의 점수를 강제 수정하거나 `NULL`(또는 `0`)로 리셋할 수 있습니다.

```sql
-- 특정 학생의 특정 날짜 타수 기록을 리셋(NULL로 변경)하는 쿼리
UPDATE public.attendance_sessions
SET 
  korean_typing_speed = NULL,
  english_typing_speed = NULL,
  updated_at = NOW()
WHERE 
  student_id = '학생_UUID_값'
  AND date = '2026-06-26'; -- 해당 학생이 플레이한 날짜
```

> [!TIP]
> 학생의 UUID는 `users` 테이블에서 `username` 또는 `name`으로 조회할 수 있습니다.

---

## 📜 상세 활성 테이블 정의 (주요 필드)

### 1. users (사용자 기본 계정)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'admin')),
  birth_year INTEGER,
  phone TEXT,
  academy TEXT NOT NULL CHECK (academy IN ('코딩메이커', '광양코딩')),
  assigned_teacher_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  can_manage_all_payments BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. attendance_sessions (출결 및 당일 최고 타수)
```sql
CREATE TABLE public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'regular' CHECK (session_type IN ('regular', 'makeup')),
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'makeup')),
  korean_typing_speed INTEGER, -- 당일 한글 최고 속도
  english_typing_speed INTEGER, -- 당일 영어 최고 속도
  teacher_id UUID REFERENCES users(id),
  start_time TIME,
  end_time TIME,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date, session_type)
);
```

### 3. tuition_annual_records (연도별 수강료 수납 통합본)
```sql
CREATE TABLE public.tuition_annual_records (
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  monthly_data JSONB DEFAULT '{}'::JSONB, -- 1월 ~ 12월의 수납상태, 실 수령액, 조정액, 상세 결제내역
  memo TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (student_id, year)
);
```

#### `monthly_data` JSONB 저장 구조 예시:
```json
{
  "01": {
    "base_amount": 150000,
    "total_paid_amount": 150000,
    "status": "paid",
    "payment_details": [
      {
        "amount": 150000,
        "date": "2026-01-10",
        "method": "card",
        "recorded_by": "선생님_UUID"
      }
    ]
  },
  "02": {
    "base_amount": 150000,
    "total_paid_amount": 0,
    "status": "pending",
    "payment_details": []
  }
}
```

### 4. pc_room_layouts (실습실 PC 배치 레이아웃)
```sql
CREATE TABLE public.pc_room_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_name TEXT NOT NULL,
  room_name TEXT NOT NULL,
  layout_data JSONB DEFAULT '[]'::JSONB, -- 모니터, 본체 배치 및 좌표값 배열
  rotation INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(academy_name, room_name)
);
```

### 5. timetable_snapshots (시간표 스냅샷)
```sql
CREATE TABLE public.timetable_snapshots (
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL, -- 저장 시점의 전체 시간표 렌더링용 매트릭스 데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (year, month)
);
```
