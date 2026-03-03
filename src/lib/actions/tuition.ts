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
 * 납부 정보 업데이트 (전체 덮어쓰기 또는 신규 생성)
 */
export async function saveTuitionPayment(data: {
    student_id: string;
    payment_month: string;
    base_amount: number;
    payment_details: any[];
    status: string;
    memo?: string;
    recorded_by: string;
}) {
    try {
        const total_paid_amount = data.payment_details.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const { error } = await supabaseAdmin
            .from('tuition_payments')
            .upsert({
                student_id: data.student_id,
                payment_month: data.payment_month,
                base_amount: data.base_amount,
                total_paid_amount,
                payment_details: data.payment_details,
                status: data.status,
                memo: data.memo,
                recorded_by: data.recorded_by,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'student_id,payment_month'
            });

        if (error) throw error;

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
        const { data, error } = await supabase
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
