'use server'

import { supabase, supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

/**
 * 학원비 수납 현황 및 대시보드 데이터 조회
 */
export async function getTuitionDashboardData(month: string, currentUserId: string, currentUserRole: string) {
    try {
        const year = parseInt(month.split('-')[0]);
        const monthKey = month.split('-')[1]; // "MM" 형식

        // 1. 권한 확인 (관리자 또는 특격 강사 여부)
        let canManageAll = currentUserRole === 'admin';
        if (!canManageAll && currentUserRole === 'teacher') {
            const { data: userData } = await supabase
                .from('users')
                .select('can_manage_all_payments')
                .eq('id', currentUserId)
                .single();
            canManageAll = userData?.can_manage_all_payments || false;
        }

        // 2. 학생 목록 조회
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
            studentsQuery = studentsQuery.filter('students.assigned_teachers', 'cs', `{"${currentUserId}"}`);
        }

        const { data: students, error: studentError } = await studentsQuery;
        if (studentError) throw studentError;

        // 3. 연도별 수납 기록 조회 (특정 연도 전체)
        const { data: annualRecords, error: paymentError } = await supabaseAdmin
            .from('tuition_annual_records')
            .select('*')
            .eq('year', year);
        if (paymentError) throw paymentError;

        // 4. 강사 목록 조회 (ID -> 이름 매핑용)
        const { data: allTeachers } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .eq('role', 'teacher');
        const teacherMap = new Map(allTeachers?.map((t: any) => [t.id as string, t.name as string]) || []);

        const annualRecordMap = new Map(annualRecords?.map((r: any) => [r.student_id, r]) || []);

        // 5. 데이터 가공 및 대시보드 형식 변환
        const dashboardData = (students || []).map((user: any) => {
            const student = Array.isArray(user.students) ? user.students[0] : user.students;
            if (!student) return null;

            const annualRecord = annualRecordMap.get(user.id) as any;
            const monthlyData = annualRecord?.monthly_data || {};
            const payment = monthlyData[monthKey]; // { base_amount, total_paid_amount, payment_details, status }

            const studentStatus = user.status;
            const isEnded = student.enrollment_end_date && new Date(student.enrollment_end_date) < new Date(month);
            const isNotActive = studentStatus === 'suspended' || studentStatus === 'inactive' || 
                                studentStatus === '휴강' || studentStatus === '종료' || 
                                studentStatus === 'consulting' || studentStatus === '상담';

            if (isEnded || isNotActive) return null;

            const assignedTeacherIds = student.assigned_teachers || [];
            const teacherNames = assignedTeacherIds.map((tid: string) => teacherMap.get(tid) || tid).join(', ');

            const standardFee = student.tuition_fee || 0;
            const hasPaymentRecord = !!payment;

            // 대시보드 표시용 금액 결정 (신규 연도별 구조 반영)
            let displayBaseAmount = standardFee;
            if (hasPaymentRecord && payment.status !== 'pending') {
                displayBaseAmount = payment.base_amount ?? standardFee;
            }

            const autoStatus = standardFee === 0 ? 'paid' : 'pending';

            return {
                student_id: user.id,
                name: user.name,
                phone: user.phone,
                parent_name: student.parent && (Array.isArray(student.parent) ? student.parent[0]?.name : student.parent?.name),
                parent_phone: student.parent && (Array.isArray(student.parent) ? student.parent[0]?.phone : student.parent?.phone),
                subject: student.sub_subject || student.main_subject,
                standard_fee: standardFee,
                base_amount: displayBaseAmount,
                teacher_names: teacherNames,
                teacher_ids: assignedTeacherIds,
                payment: payment ? {
                    ...payment,
                    memo: annualRecord?.memo, // 메모는 연도별로 관리 중
                    status: (payment.base_amount ?? standardFee) === 0 ? 'paid' : payment.status
                } : {
                    status: autoStatus,
                    total_paid_amount: 0,
                    payment_details: []
                }
            };
        }).filter(Boolean);

        return { success: true, data: dashboardData };
    } catch (error: any) {
        console.error('Dashboard data error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 납부 정보 업데이트 (연도별 통합 구조 반영)
 */
export async function saveTuitionPayment(data: {
    student_id: string;
    payment_details: any[];
    memo: string;
    recorded_by: string;
}) {
    try {
        // 1. 연도별 항목 그룹화
        const yearlyGroups: Record<number, any[]> = {};
        data.payment_details.forEach(item => {
            const year = parseInt(item.targetMonth.split('-')[0]);
            if (!yearlyGroups[year]) yearlyGroups[year] = [];
            yearlyGroups[year].push(item);
        });

        // 2. 학생의 기본 수강료 조회
        const { data: student } = await supabaseAdmin
            .from('students')
            .select('tuition_fee')
            .eq('user_id', data.student_id)
            .maybeSingle();
        const standardFee = student?.tuition_fee || 0;

        // 3. 각 연도별로 DB 업데이트
        const updatePromises = Object.keys(yearlyGroups).map(async (yearStr) => {
            const year = parseInt(yearStr);
            const itemsInYear = yearlyGroups[year];

            // 기존 연도별 레코드 로드
            const { data: existingRecord } = await supabaseAdmin
                .from('tuition_annual_records')
                .select('*')
                .eq('student_id', data.student_id)
                .eq('year', year)
                .maybeSingle();

            const updatedMonthlyData = { ...(existingRecord?.monthly_data || {}) };

            // 이번 연도에 수정된 항목들만 루프 돌며 업데이트
            itemsInYear.forEach(item => {
                const monthKey = item.targetMonth.split('-')[1];
                const total_paid_amount = Number(item.amount) || 0;

                // baseAmount 결정
                const baseFee = item.baseAmount !== undefined ? item.baseAmount : standardFee;

                // 상태 결정
                let status = 'pending';
                if (baseFee === 0) {
                    status = 'paid';
                } else {
                    status = total_paid_amount >= baseFee ? 'paid' : (total_paid_amount > 0 ? 'partial' : 'pending');
                }

                updatedMonthlyData[monthKey] = {
                    base_amount: baseFee,
                    total_paid_amount,
                    payment_details: item.payment_details || [item], // 상세 내역 저장
                    status
                };
            });

            return supabaseAdmin
                .from('tuition_annual_records')
                .upsert({
                    student_id: data.student_id,
                    year,
                    monthly_data: updatedMonthlyData,
                    memo: data.memo, // 연도 대표 메모로 저장
                    recorded_by: data.recorded_by,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'student_id,year'
                });
        });

        const results = await Promise.all(updatePromises);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) throw new Error('데이터 저장 중 오류가 발생했습니다.');

        revalidatePath('/dashboard/admin/payments');
        revalidatePath('/dashboard/teacher/payments');
        return { success: true };
    } catch (error: any) {
        console.error('Save annual tuition error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 특정 학생의 과거 납부 이력 조회 (연도별 데이터 기반)
 */
export async function getStudentPaymentHistory(studentId: string) {
    try {
        const { data: annualRecords, error } = await supabaseAdmin
            .from('tuition_annual_records')
            .select('*')
            .eq('student_id', studentId)
            .order('year', { ascending: false });

        if (error) throw error;

        // 연도별/월별 JSON 데이터를 평탄화(Flattening)하여 기존 UI가 기대하는 배열 형식으로 변환
        const flattenedHistory: any[] = [];
        annualRecords?.forEach((record: any) => {
            const months = Object.keys(record.monthly_data || {}).sort((a, b) => parseInt(b) - parseInt(a));
            months.forEach(monthKey => {
                const monthData = record.monthly_data[monthKey];
                flattenedHistory.push({
                    ...monthData,
                    payment_month: `${record.year}-${monthKey}-01`,
                    memo: record.memo,
                    recorded_by: record.recorded_by,
                    updated_at: record.updated_at
                });
            });
        });

        return { success: true, data: flattenedHistory };
    } catch (error: any) {
        console.error('Annual payment history error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 연도별 종합 수납 현황 조회 (모든 학생 대상)
 */
export async function getTuitionYearlySummary(year: number, currentUserId: string, currentUserRole: string) {
    try {
        // 1. 권한 확인
        let canManageAll = currentUserRole === 'admin';
        if (!canManageAll && currentUserRole === 'teacher') {
            const { data: userData } = await supabase
                .from('users')
                .select('can_manage_all_payments')
                .eq('id', currentUserId)
                .single();
            canManageAll = userData?.can_manage_all_payments || false;
        }

        // 2. 모든 학생 목록 조회 (휴강/종료 포함)
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
                    sub_subject,
                    main_subject,
                    enrollment_end_date,
                    parent_id,
                    parent:users!students_parent_id_fkey (
                        name,
                        phone
                    )
                )
            `)
            .eq('role', 'student');

        if (!canManageAll && currentUserRole === 'teacher') {
            studentsQuery = studentsQuery.filter('students.assigned_teachers', 'cs', `{"${currentUserId}"}`);
        }

        const { data: students, error: studentError } = await studentsQuery;
        if (studentError) throw studentError;

        // 3. 해당 연도의 모든 수납 기록 조회
        const { data: annualRecords, error: paymentError } = await supabaseAdmin
            .from('tuition_annual_records')
            .select('*')
            .eq('year', year);
        if (paymentError) throw paymentError;

        // 4. 강사 목록 조회 (ID -> 이름 매핑용)
        const { data: allTeachers } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .eq('role', 'teacher');
        const teacherMap = new Map(allTeachers?.map((t: any) => [t.id as string, t.name as string]) || []);

        const annualRecordMap = new Map(annualRecords?.map((r: any) => [r.student_id, r]) || []);

        // 5. 데이터 가공 및 정렬 (재원생 우선, 하단에 휴강/종료생)
        const yearlyData = (students || []).map((user: any) => {
            const student = Array.isArray(user.students) ? user.students[0] : user.students;
            if (!student) return null;

            const annualRecord = annualRecordMap.get(user.id) as any;
            const monthlyData = annualRecord?.monthly_data || {};

            const isInactive = user.status === 'suspended' || user.status === 'inactive' || 
                               user.status === '휴강' || user.status === '종료' || 
                               user.status === 'consulting' || user.status === '상담';

            // [추가] 휴강/종료생 중 해당 연도에 결제 내역이 하나도 없으면 제외
            if (isInactive && Object.keys(monthlyData).length === 0) {
                return null;
            }

            const assignedTeacherIds = student.assigned_teachers || [];
            const teacherNames = assignedTeacherIds.map((tid: string) => teacherMap.get(tid) || tid).join(', ');

            return {
                student_id: user.id,
                name: user.name,
                phone: user.phone,
                parent_name: student.parent && (Array.isArray(student.parent) ? student.parent[0]?.name : student.parent?.name),
                parent_phone: student.parent && (Array.isArray(student.parent) ? student.parent[0]?.phone : student.parent?.phone),
                status: user.status,
                subject: student.sub_subject || student.main_subject,
                base_amount: student.tuition_fee || 0,
                teacher_names: teacherNames,
                teacher_ids: assignedTeacherIds,
                isInactive,
                monthly_payments: monthlyData,
                memo: annualRecord?.memo
            };
        }).filter(Boolean).sort((a: any, b: any) => {
            // 1순위: 활동 상태 (재원생 우선)
            if (a.isInactive !== b.isInactive) return a.isInactive ? 1 : -1;
            // 2순위: 이름 가나다순
            return a.name.localeCompare(b.name);
        });

        return { success: true, data: yearlyData };
    } catch (error: any) {
        console.error('Yearly summary error:', error);
        return { success: false, error: error.message };
    }
}
