-- student_activity_logs에서 attendance_sessions로 데이터 이관 및 통합
-- 1. 출석 데이터 이관 (세션 타입 = regular)
INSERT INTO public.attendance_sessions (
    student_id,
    teacher_id,
    date,
    session_type,
    status,
    start_time,
    end_time,
    memo,
    created_at,
    updated_at
)
SELECT 
    student_id,
    teacher_id,
    date,
    CASE WHEN is_makeup THEN 'makeup' ELSE 'regular' END,
    status,
    NULLIF(start_time, '')::TIME,
    NULLIF(end_time, '')::TIME,
    memo,
    created_at,
    created_at
FROM public.student_activity_logs
WHERE activity_type = 'attendance'
ON CONFLICT DO NOTHING;

-- 2. 타자 연습 데이터 이관 및 통합
-- 같은 날짜, 같은 학생의 데이터가 이미 있으면 업데이트, 없으면 삽입 시도
-- (참고: 기존 데이터는 한글/영어가 행으로 분리되어 있을 수 있음)

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM public.student_activity_logs WHERE activity_type = 'typing' LOOP
        -- 이미 해당 날짜의 세션이 있는지 확인 (출석 데이터가 먼저 들어갔을 가능성이 큼)
        IF EXISTS (SELECT 1 FROM public.attendance_sessions WHERE student_id = r.student_id AND date = r.date AND session_type = 'regular') THEN
            -- 기존 세션 업데이트
            IF r.typing_language = 'korean' THEN
                UPDATE public.attendance_sessions 
                SET korean_typing_speed = GREATEST(korean_typing_speed, r.typing_speed),
                    updated_at = NOW()
                WHERE student_id = r.student_id AND date = r.date AND session_type = 'regular';
            ELSE
                UPDATE public.attendance_sessions 
                SET english_typing_speed = GREATEST(english_typing_speed, r.typing_speed),
                    updated_at = NOW()
                WHERE student_id = r.student_id AND date = r.date AND session_type = 'regular';
            END IF;
        ELSE
            -- 세션이 없으면 새로 생성 (attendance_sessions의 NOT NULL 제약조건 주의)
            INSERT INTO public.attendance_sessions (
                student_id,
                date,
                session_type,
                status,
                korean_typing_speed,
                english_typing_speed,
                created_at
            ) VALUES (
                r.student_id,
                r.date,
                'regular',
                'present', -- 타자를 쳤으니 출석으로 간주
                CASE WHEN r.typing_language = 'korean' THEN r.typing_speed ELSE 0 END,
                CASE WHEN r.typing_language = 'english' THEN r.typing_speed ELSE 0 END,
                r.created_at
            );
        END IF;
    END LOOP;
END $$;
