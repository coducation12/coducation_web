'use server'

import { supabase, supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

/**
 * 학원비 수납 현황 및 대시보드 데이터 조회
 */
export async function getTuitionDashboardData(month: string, currentUserId: string, currentUserRole: string) {
    try {
        // 1. 권한 확인 (관리자 또는 특권 강사 여부)
        let canManageAll = currentUserRole === 'admin';
        if (!canManageAll && currentUserRole === 'teacher') {
            const { data: userData } = await supabase
                .from('users')
                .select('can_manage_all_payments')
                .eq('id', currentUserId)
                .single();
            canManageAll = userData?.can_manage_all_payments || false;
        }

        // 2. 학생 목록 조회 (관리자 권한의 admin 클라이언트 사용 권장)
        let studentsQuery = supabaseAdmin
            .from('users')
            .select(`
        id, 
        name, 
        phone, 
        status,
        students!students_user_id_fkey!inner (
          tuition_fee,
          assigned_teachers,
          parent_id,
          enrollment_end_date,
          sub_subject,
          main_subject,
          parent:users!students_parent_id_fkey (
            name,
            phone
          )
        )
      `)
            .eq('role', 'student');

        if (!canManageAll && currentUserRole === 'teacher') {
            // !inner 조인인 경우 해당 테이블의 컬럼으로 바로 필터링 가능
            studentsQuery = studentsQuery.filter('students.assigned_teachers', 'cs', `{"${currentUserId}"}`);
        }

        const { data: students, error: studentError } = await studentsQuery;
        if (studentError) throw studentError;

        const { data: payments, error: paymentError } = await supabaseAdmin
            .from('tuition_payments')
            .select('*')
            .eq('payment_month', month);
        if (paymentError) throw paymentError;

        // 4. 강사 목록 조회 (ID -> 이름 매핑용)
        const { data: allTeachers } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .eq('role', 'teacher');
        const teacherMap = new Map(allTeachers?.map((t: any) => [t.id as string, t.name as string]) || []);

        const paymentMap = new Map(payments?.map((p: any) => [p.student_id, p]) || []);

        // 4. 데이터 가공 및 자동 제외 로직 적용
        const dashboardData = (students || []).map((user: any) => {
            // Supabase 릴레이션은 기본적으로 배열로 반환됨
            const student = Array.isArray(user.students) ? user.students[0] : user.students;
            if (!student) return null;

            const payment = paymentMap.get(user.id) as any;
            const studentStatus = user.status;

            const isEnded = student.enrollment_end_date && new Date(student.enrollment_end_date) < new Date(month);
            const isNotActive = studentStatus === 'suspended' || studentStatus === 'inactive' || studentStatus === '휴강' || studentStatus === '종료';

            // 휴강, 종료, 비활성 학생은 목록에서 완전히 제외
            if (isEnded || isNotActive) return null;

            let autoStatus = 'pending';

            // 담당 강사 이름들
            const assignedTeacherIds = student.assigned_teachers || [];
            const teacherNames = assignedTeacherIds.map((tid: string) => teacherMap.get(tid) || tid).join(', ');

            return {
                student_id: user.id,
                name: user.name,
                phone: user.phone,
                parent_name: student.parent && (Array.isArray(student.parent) ? student.parent[0]?.name : student.parent?.name),
                parent_phone: student.parent && (Array.isArray(student.parent) ? student.parent[0]?.phone : student.parent?.phone),
                subject: student.sub_subject || student.main_subject,
                base_amount: payment ? (payment.base_amount || student.tuition_fee) : (student.tuition_fee || 0),
                teacher_names: teacherNames,
                teacher_ids: assignedTeacherIds,
                payment: payment || {
                    status: autoStatus,
                    total_paid_amount: 0,
                    payment_details: []
                }
            };
        }).filter(Boolean);

        return { success: true, data: dashboardData };
    } catch (error: any) {
        console.error('Tuition dashboard error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 납부 정보 업데이트 (다중 월 지원 및 등록년월 기반 처리)
 */
export async function saveTuitionPayment(data: {
    student_id: string;
    payment_details: any[]; // 각 항목에 targetMonth가 포함됨
    recorded_by: string;
}) {
    try {
        // 1. 등록년월(targetMonth)별로 항목 그룹화
        const monthlyData: Record<string, any[]> = {};
        data.payment_details.forEach(item => {
            const month = item.targetMonth;
            if (!monthlyData[month]) monthlyData[month] = [];
            monthlyData[month].push(item);
        });

        // 2. 학생의 기존 수납 기록이 있는 모든 월 조회
        const { data: existingRecords } = await supabaseAdmin
            .from('tuition_payments')
            .select('payment_month')
            .eq('student_id', data.student_id);

        const existingMonths = existingRecords?.map((r: any) => r.payment_month) || [];

        // 3. 입력 데이터에 있는 월 + 기존에 데이터가 있던 월의 합집합 구성
        const allAffectedMonths = Array.from(new Set([...existingMonths, ...Object.keys(monthlyData)]));

        // 4. 학생의 기본 수강료(base_amount) 조회
        const { data: student } = await supabaseAdmin
            .from('students')
            .select('tuition_fee')
            .eq('user_id', data.student_id)
            .maybeSingle();

        const baseFee = student?.tuition_fee || 0;

        // 5. 각 월별로 DB 업데이트 (병렬 처리)
        const updatePromises = allAffectedMonths.map(async (month) => {
            const details = monthlyData[month] || [];
            const total_paid_amount = details.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

            // 상태 결정: 항목이 없으면 'pending', 전액 이상이면 'paid', 그 외 'partial'
            let status = 'pending';
            if (details.length > 0) {
                status = total_paid_amount >= baseFee ? 'paid' : 'partial';
            }

            return supabaseAdmin
                .from('tuition_payments')
                .upsert({
                    student_id: data.student_id,
                    payment_month: month,
                    base_amount: baseFee,
                    total_paid_amount,
                    payment_details: details,
                    status,
                    recorded_by: data.recorded_by,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'student_id,payment_month'
                });
        });

        const results = await Promise.all(updatePromises);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) {
            console.error('Save tuition errors:', errors);
            throw new Error('데이터 저장 중 오류가 발생했습니다.');
        }

        revalidatePath('/dashboard/admin/payments');
        revalidatePath('/dashboard/teacher/payments');
        return { success: true };
    } catch (error: any) {
        console.error('Save tuition error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 특정 학생의 과거 납부 이력 조회
 */
export async function getStudentPaymentHistory(studentId: string) {
    try {
        // 관리자/강사 권한으로 조회하기 위해 supabaseAdmin 사용 (RLS 우회)
        const { data, error } = await supabaseAdmin
            .from('tuition_payments')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_month', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error('Payment history error:', error);
        return { success: false, error: error.message };
    }
}
