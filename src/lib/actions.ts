'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-utils'
import { getAuthenticatedUser } from '@/lib/auth'

// 학생 가입 요청 관련 타입
interface StudentSignupRequest {
  id: number
  username: string
  name: string
  birth_year?: number
  academy: string
  assigned_teacher_id: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  processed_at?: string
  processed_by?: string
  rejection_reason?: string
  teacher_name?: string
}

// 강사 정보 타입
interface TeacherInfo {
  id: string
  name: string
  bio: string
  profile_image: string
  subject: string
  certs: string
  career: string
  email: string
  phone: string
}

// Supabase Auth를 사용한 로그인 시스템

export async function login(formData: FormData) {
  const userType = formData.get('userType') as string;
  
  if (userType === 'teacher') {
    // 강사/관리자: Supabase Auth를 사용한 이메일과 비밀번호 인증
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      // Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        console.error('Auth 로그인 실패:', authError);
        return { success: false, error: '로그인에 실패했습니다.' };
      }

      if (!authData.user) {
        return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
      }

      // users 테이블에서 사용자 정보 조회 (이메일 또는 username으로 조회)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, role, status, email')
        .or(`email.eq.${email},username.eq.${email}`)
        .in('role', ['teacher', 'admin'])
        .single();

      if (userError || !user) {
        console.error('사용자 정보 조회 실패:', userError);
        return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
      }

      // 사용자 상태 확인
      if (user.status !== 'active') {
        return { success: false, error: '계정이 아직 승인되지 않았습니다.' };
      }

      // 쿠키에 사용자 정보 저장
      const cookieStore = await cookies();
      cookieStore.set('user_id', user.id, { httpOnly: true, path: '/' });
      cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' });
      cookieStore.set('auth_token', authData.session?.access_token || '', { httpOnly: true, path: '/' });
      
      return { success: true, redirect: '/dashboard' };
    } catch (error) {
      console.error('로그인 중 오류:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  } else {
    // 학생/학부모: 기존 방식 유지 (Auth 사용하지 않음)
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, role, password, status')
        .eq('username', username)
        .in('role', ['student', 'parent'])
        .single();

      if (error || !user) {
        return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
      }

      // 사용자 상태 확인 (학생의 경우 수강 상태도 확인)
      if (user.role === 'student') {
        // 학생: active이면서 수강 중이어야 로그인 가능
        if (user.status !== 'active' || user.status === '휴강' || user.status === '종료') {
          if (user.status === 'pending') {
            return { success: false, error: '계정이 아직 승인되지 않았습니다.' };
          } else if (user.status === '휴강') {
            return { success: false, error: '휴강 중인 계정입니다.' };
          } else if (user.status === '종료') {
            return { success: false, error: '수강이 종료된 계정입니다.' };
          } else {
            return { success: false, error: '비활성화된 계정입니다.' };
          }
        }
      } else {
        // 학부모: active가 아니면 로그인 거부
        if (user.status !== 'active') {
          return { success: false, error: '계정이 아직 승인되지 않았습니다.' };
        }
      }
      
      // 배포 환경: 비밀번호 필수 입력
      if (!password || password.trim() === '') {
        return { success: false, error: '비밀번호를 입력해주세요.' };
      }
      
      // 비밀번호가 있으면 검증
      if (user.password && await bcrypt.compare(password, user.password)) {
        const cookieStore = await cookies();
        cookieStore.set('user_id', user.id, { httpOnly: true, path: '/' });
        cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' });
        return { success: true, redirect: '/dashboard' };
      } else {
        return { success: false, error: '비밀번호가 올바르지 않습니다.' };
      }
    } catch (error) {
      console.error('로그인 중 오류:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  }
}

// 사용자 정보 조회 서버 액션 (클라이언트 컴포넌트용)
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;
    
    if (!userId || !userRole) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, email, grade, phone, academy, birth_year, profile_image_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    // 에러 로그 제거 - 조용히 처리
    return null;
  }
}

// Supabase Auth를 사용한 로그아웃
export async function logout() {
  try {
    // Supabase Auth에서 로그아웃
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Auth 로그아웃 실패:', error);
    }
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
  } finally {
    // 쿠키 삭제
    const cookieStore = await cookies();
    cookieStore.delete('user_id');
    cookieStore.delete('user_role');
    cookieStore.delete('auth_token');
  }
  
  return { success: true, redirect: '/login' };
}

// 학생 추가 서버 액션
export async function addStudent(formData: FormData, isSignup: boolean = false) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;
    const currentUserRole = cookieStore.get('user_role')?.value;

    const studentData = {
      studentId: formData.get('studentId') as string,
      name: formData.get('name') as string,
      birthYear: formData.get('birthYear') as string,
      password: formData.get('password') as string,
      subject: formData.get('subject') as string,
      phone: formData.get('phone') as string,
      parentPhone: formData.get('parentPhone') as string,
      email: formData.get('email') as string,
      classSchedules: JSON.parse(formData.get('classSchedules') as string),
      academy: formData.get('academy') as string,
      assignedTeacherId: formData.get('assignedTeacherId') as string
    };

    // 회원가입인 경우 새로운 시스템 사용
    if (isSignup) {
      return await createStudentSignupRequest({
        studentId: studentData.studentId,
        name: studentData.name,
        birthYear: studentData.birthYear,
        password: studentData.password,
        phone: studentData.phone,
        parentPhone: studentData.parentPhone,
        academy: studentData.academy,
        assignedTeacherId: studentData.assignedTeacherId
      });
    }

    // 관리자가 학생을 직접 추가하는 경우 (기존 로직 유지)
    // 서버 측 유효성 검증
    // 이름 검증 (한글만 허용, 2-10자)
    const nameRegex = /^[가-힣]{2,10}$/;
    if (!nameRegex.test(studentData.name)) {
      return { success: false, error: '이름은 한글 2-10자로만 입력 가능합니다.' };
    }

    // 출생년도 검증 (4자리 숫자, 1900-현재년도)
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(studentData.birthYear)) {
      return { success: false, error: '출생년도는 4자리 숫자로 입력해주세요.' };
    }

    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(studentData.birthYear);
    if (birthYear < 1900 || birthYear > currentYear) {
      return { success: false, error: '올바른 출생년도를 입력해주세요. (1900년 ~ 현재년도)' };
    }

    // 1. 학생 ID에 'p'를 붙여서 학부모 계정 자동 생성
    const parentUsername = `${studentData.studentId}p`;
    const parentPasswordHash = await bcrypt.hash(studentData.password, 10);

    const { data: parentData, error: parentError } = await supabase
      .from('users')
      .insert({
        username: parentUsername,
        name: `${studentData.name} 학부모`,
        role: 'parent',
        password: parentPasswordHash,
        phone: studentData.parentPhone || null,
        academy: studentData.academy || 'coding-maker',
        status: 'active', // 관리자 추가 시에는 바로 active
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (parentError) {
      console.error('학부모 계정 생성 실패:', parentError);
      return { success: false, error: '학부모 계정 생성에 실패했습니다.' };
    }

    // 2. users 테이블에 학생 정보 등록
    const studentPasswordHash = await bcrypt.hash(studentData.password, 10);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: studentData.studentId,
        name: studentData.name,
        role: 'student',
        password: studentPasswordHash,
        phone: studentData.phone,
        birth_year: studentData.birthYear ? parseInt(studentData.birthYear) : null,
        academy: studentData.academy || 'coding-maker',
        assigned_teacher_id: studentData.assignedTeacherId || null,
        status: 'active', // 관리자 추가 시에는 바로 active
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      // 학부모 계정 롤백
      await supabase.from('users').delete().eq('id', parentData.id);
      return { success: false, error: userError.message };
    }

    // 3. 수업 일정을 attendance_schedule 형식으로 변환
    const attendanceSchedule: any = {};

    if (studentData.classSchedules) {
      studentData.classSchedules.forEach((schedule: any) => {
        if (schedule.day && schedule.startTime) {
          const dayMap: { [key: string]: string } = {
            'monday': '1', 'tuesday': '2', 'wednesday': '3',
            'thursday': '4', 'friday': '5', 'saturday': '6', 'sunday': '0'
          };
          const dayNumber = dayMap[schedule.day];

          if (dayNumber) {
            let startTime = schedule.startTime;
            let endTime = schedule.endTime || '';

            // 시간 형식 정리
            if (startTime && !startTime.includes(':')) {
              const numbers = startTime.replace(/[^0-9]/g, '');
              if (numbers.length === 4) {
                const hours = numbers.slice(0, 2);
                const minutes = numbers.slice(2, 4);
                startTime = `${hours}:${minutes}`;
              }
            }

            if (endTime && !endTime.includes(':')) {
              const numbers = endTime.replace(/[^0-9]/g, '');
              if (numbers.length === 4) {
                const hours = numbers.slice(0, 2);
                const minutes = numbers.slice(2, 4);
                endTime = `${hours}:${minutes}`;
              }
            }

            if (!endTime || endTime.trim() === '') {
              throw new Error(`${schedule.day}의 종료시간을 입력해주세요.`);
            }

            attendanceSchedule[dayNumber] = {
              startTime: startTime,
              endTime: endTime
            };
          }
        }
      });
    }

    // 4. students 테이블에 학생 상세 정보 등록
    const studentInsertData = {
      user_id: userData.id,
      assigned_teachers: currentUserRole === 'teacher' && currentUserId ? [currentUserId] : [],
      parent_id: parentData.id,
      current_curriculum_id: null,
      attendance_schedule: Object.keys(attendanceSchedule).length > 0 ? attendanceSchedule : null,
      created_at: new Date().toISOString()
    };

    const { error: studentError } = await supabase
      .from('students')
      .insert(studentInsertData);

    if (studentError) {
      // 롤백: users 테이블에서 학생과 학부모 계정 삭제
      await supabase.from('users').delete().eq('id', userData.id);
      await supabase.from('users').delete().eq('id', parentData.id);
      return { success: false, error: studentError.message };
    }

    return { success: true, data: userData };
  } catch (error) {
    console.error('학생 추가 중 오류:', error);
    return { success: false, error: '학생 추가 중 오류가 발생했습니다.' };
  }
}

// 학생 정보 수정 서버 액션
export async function updateStudent(formData: FormData) {
  try {
    const studentData = {
      studentId: formData.get('studentId') as string,
      name: formData.get('name') as string,
      birthYear: formData.get('birthYear') as string,
      password: formData.get('password') as string,
      subject: formData.get('subject') as string,
      phone: formData.get('phone') as string,
      parentPhone: formData.get('parentPhone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as string,
      classSchedules: formData.get('classSchedules') ? JSON.parse(formData.get('classSchedules') as string) : []
    };

    console.log('받은 학생 데이터:', studentData);

    // 1. 학생 계정 정보 업데이트
    const updateData: any = {
      name: studentData.name,
      phone: studentData.phone,
      birth_year: studentData.birthYear ? parseInt(studentData.birthYear) : null,
      status: studentData.status === '휴강' ? 'suspended' : 'active' // 상태 업데이트 (suspended 또는 active만 허용)
    };

    console.log('업데이트할 데이터:', updateData);

    // 비밀번호가 입력된 경우에만 업데이트
    if (studentData.password) {
      const studentPasswordHash = await bcrypt.hash(studentData.password, 10);
      updateData.password = studentPasswordHash;
    }

    // 먼저 사용자 ID를 가져오기
    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('id')
      .eq('username', studentData.studentId)
      .single();

    if (userFetchError || !existingUser) {
      return { success: false, error: '학생을 찾을 수 없습니다.' };
    }

    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', studentData.studentId);

    if (userError) {
      return { success: false, error: userError.message };
    }

    // 2. 학부모 연락처 업데이트 (학부모 계정이 있는 경우)
    const parentUsername = `${studentData.studentId}p`;
    const { error: parentError } = await supabase
      .from('users')
      .update({ phone: studentData.parentPhone })
      .eq('username', parentUsername);

    // 학부모 업데이트 실패는 무시 (선택사항)

    // 3. 수업 일정 업데이트 (선택사항)
    if (studentData.classSchedules && studentData.classSchedules.length > 0) {
      // 수업 일정을 attendance_schedule 형식으로 변환
      const attendanceSchedule: any = {};
      
      studentData.classSchedules.forEach((schedule: any) => {
        if (schedule.day && schedule.startTime && schedule.endTime) {
          const dayMap: { [key: string]: string } = {
            'monday': '1', 'tuesday': '2', 'wednesday': '3', 
            'thursday': '4', 'friday': '5', 'saturday': '6', 'sunday': '0'
          };
          const dayNumber = dayMap[schedule.day];
          if (dayNumber) {
            // 시간 형식 정리 (HH:MM 형식으로 통일)
            let startTime = schedule.startTime;
            let endTime = schedule.endTime;
            
            if (startTime && !startTime.includes(':')) {
              const numbers = startTime.replace(/[^0-9]/g, '');
              if (numbers.length === 4) {
                const hours = numbers.slice(0, 2);
                const minutes = numbers.slice(2, 4);
                startTime = `${hours}:${minutes}`;
              }
            }
            
            if (endTime && !endTime.includes(':')) {
              const numbers = endTime.replace(/[^0-9]/g, '');
              if (numbers.length === 4) {
                const hours = numbers.slice(0, 2);
                const minutes = numbers.slice(2, 4);
                endTime = `${hours}:${minutes}`;
              }
            }
            
            attendanceSchedule[dayNumber] = {
              startTime: startTime,
              endTime: endTime
            };
          }
        }
      });

      // students 테이블의 attendance_schedule 업데이트
      if (Object.keys(attendanceSchedule).length > 0) {
        const { error: studentError } = await supabase
          .from('students')
          .update({
            attendance_schedule: attendanceSchedule
          })
          .eq('user_id', existingUser.id);

        if (studentError) {
          console.warn('수업 일정 업데이트 실패 (무시):', studentError);
        }
      }
    }

    return { success: true, message: '학생 정보가 성공적으로 업데이트되었습니다.' };
  } catch (error: any) {
    console.error('학생 정보 수정 중 오류:', error);
    return { success: false, error: error.message || '학생 정보 수정 중 오류가 발생했습니다.' };
  }
}

// 커리큘럼 추가 서버 액션
export async function addCurriculum(formData: FormData) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;
    const currentUserRole = cookieStore.get('user_role')?.value;

    if (!currentUserId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 강사나 관리자만 커리큘럼 추가 가능
    if (currentUserRole !== 'teacher' && currentUserRole !== 'admin') {
      return { success: false, error: '권한이 없습니다.' };
    }

    // FormData에서 데이터 추출
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const level = formData.get('level') as string;
    const status = formData.get('status') as string;
    const courses = JSON.parse(formData.get('courses') as string) as string[];
    const description = formData.get('description') as string || '';
    const image = formData.get('image') as string || '';

    // 이미지 크기 제한 (1MB)
    if (image && image.length > 1024 * 1024) {
      return { success: false, error: '이미지 크기가 너무 큽니다. 1MB 이하로 압축해주세요.' };
    }

    // 필수 필드 검증
    if (!title || !category || !level || !status || !courses || courses.length === 0) {
      return { success: false, error: '모든 필수 항목을 입력해주세요.' };
    }

    // 커리큘럼 데이터 준비
    const curriculumData = {
      title: title.trim(),
      category: category.trim(),
      level: level.trim(),
      status: status.trim(),
      description: description.trim(),
      image: image.trim(),
      checklist: courses.filter(course => course.trim() !== ''),
      created_by: currentUserId,
      created_at: new Date().toISOString()
    };

    // Supabase에 커리큘럼 추가
    const { data, error } = await supabase
      .from('curriculums')
      .insert([curriculumData])
      .select()
      .single();

    if (error) {
      console.error('커리큘럼 추가 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('커리큘럼 추가 중 오류:', error);
    return { success: false, error: '커리큘럼 추가 중 오류가 발생했습니다.' };
  }
}

// 커리큘럼 수정 서버 액션
export async function updateCurriculum(formData: FormData) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;
    const currentUserRole = cookieStore.get('user_role')?.value;

    if (!currentUserId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 강사나 관리자만 커리큘럼 수정 가능
    if (currentUserRole !== 'teacher' && currentUserRole !== 'admin') {
      return { success: false, error: '권한이 없습니다.' };
    }

    // FormData에서 데이터 추출
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const level = formData.get('level') as string;
    const courses = JSON.parse(formData.get('courses') as string) as string[];
    const description = formData.get('description') as string || '';
    const image = formData.get('image') as string || '';

    // 필수 필드 검증
    if (!id || !title || !category || !level || !courses || courses.length === 0) {
      return { success: false, error: '모든 필수 항목을 입력해주세요.' };
    }

    // 커리큘럼 데이터 준비
    const curriculumData = {
      title: title.trim(),
      category: category.trim(),
      level: level.trim(),
      description: description.trim(),
      image: image.trim(),
      checklist: courses.filter(course => course.trim() !== ''),
      status: formData.get('status') as string || 'preparing' // 상태 업데이트 지원
    };

    // Supabase에서 커리큘럼 수정
    const { data, error } = await supabase
      .from('curriculums')
      .update(curriculumData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('커리큘럼 수정 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('커리큘럼 수정 중 오류:', error);
    return { success: false, error: '커리큘럼 수정 중 오류가 발생했습니다.' };
  }
}

// 타자연습 결과 저장 서버 액션
export async function saveTypingResult(data: {
  accuracy: number;
  speed: number;
  wpm?: number;
  time: number;
  language: 'korean' | 'english';
}) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    
    if (!userId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const today = new Date().toISOString().split('T')[0];

    // 같은 날짜, 같은 언어의 기존 기록 확인
    const { data: existingRecord, error: selectError } = await supabase
      .from('student_activity_logs')
      .select('id, typing_score, typing_speed')
      .eq('student_id', userId)
      .eq('activity_type', 'typing')
      .eq('date', today)
      .eq('typing_language', data.language)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116은 "not found" 에러이므로 정상, 다른 에러는 처리
      console.error('기존 기록 조회 실패:', selectError);
      return { success: false, error: selectError.message };
    }

    if (existingRecord) {
      // 기존 기록이 있으면 더 좋은 점수로만 업데이트
      const shouldUpdate = data.accuracy > existingRecord.typing_score || 
                          (data.accuracy === existingRecord.typing_score && data.speed > existingRecord.typing_speed);
      
      if (shouldUpdate) {
        const { error } = await supabase
          .from('student_activity_logs')
          .update({
            typing_score: data.accuracy,
            typing_speed: data.speed,
            attended: true,
            created_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (error) {
          console.error('타자연습 결과 업데이트 실패:', error);
          return { success: false, error: error.message };
        }
      }
      // 기존 기록이 더 좋으면 업데이트하지 않음
    } else {
      // 새로운 기록 생성
      const { error } = await supabase
        .from('student_activity_logs')
        .insert({
          student_id: userId,
          activity_type: 'typing',
          date: today,
          typing_score: data.accuracy,
          typing_speed: data.speed,
          typing_language: data.language,
          attended: true
        });

      if (error) {
        console.error('타자연습 결과 저장 실패:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('타자연습 결과 저장 중 오류:', error);
    return { success: false, error: '타자연습 결과 저장 중 오류가 발생했습니다.' };
  }
}

// 타자연습 기록 조회 서버 액션
export async function getTypingRecords(studentId: string, daysBack: number = 90) {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    const fromDateString = fromDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('student_activity_logs')
      .select('date, typing_score, typing_speed, typing_language, created_at')
      .eq('student_id', studentId)
      .eq('activity_type', 'typing')
      .not('typing_score', 'is', null)
      .gte('date', fromDateString)
      .order('date', { ascending: true });

    if (error) {
      console.error('타자연습 기록 조회 실패:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('타자연습 기록 조회 중 오류:', error);
    return { success: false, error: '타자연습 기록 조회 중 오류가 발생했습니다.' };
  }
}

// 컨텐츠 이미지 Supabase Storage 업로드
export async function uploadContentImage(file: File, section: string): Promise<{success: boolean, url?: string, error?: string}> {
  try {
    console.log('이미지 업로드 시작:', { fileName: file.name, fileSize: file.size, fileType: file.type, section });
    
    // 인증 정보 확인
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;
    console.log('현재 사용자 정보:', { userId, userRole });
    
    if (!userId || userRole !== 'admin') {
      return { success: false, error: '관리자만 이미지를 업로드할 수 있습니다.' };
    }
    
    // 파일 유효성 검사
    const validation = validateImageFile(file, 10 * 1024 * 1024); // 10MB 제한
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    console.log(`원본 파일 크기: ${formatFileSize(file.size)}`);

    // 이미지 압축
    const compressedBlob = await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85,
      outputFormat: 'webp'
    });

    console.log(`압축 후 크기: ${formatFileSize(compressedBlob.size)} (${((compressedBlob.size / file.size) * 100).toFixed(1)}%)`);

    // 압축된 파일을 File 객체로 변환
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    // 파일명 정리 (특수문자 제거)
    const cleanFileName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${section}/${Date.now()}-${cleanFileName}`;
    
    console.log('업로드 파일명:', fileName);

    // Supabase Storage에 압축된 이미지 업로드
    const { data, error } = await supabase.storage
      .from('content-images')
      .upload(fileName, compressedFile, {
        cacheControl: '31536000', // 1년 캐시
        upsert: true // 같은 파일명이 있어도 덮어쓰기
      });

    if (error) {
      console.error('Storage 업로드 오류:', error);
      return { 
        success: false, 
        error: `이미지 업로드에 실패했습니다: ${error.message}` 
      };
    }

    console.log('업로드 성공:', data);

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('content-images')
      .getPublicUrl(fileName);

    console.log('공개 URL:', urlData.publicUrl);
    
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return { 
      success: false, 
      error: `이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
    };
  }
}

// 컨텐츠 업데이트 서버 액션 (통합)
export async function updateContent(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const currentUserRole = cookieStore.get('user_role')?.value;

    // 관리자만 수정 가능
    if (currentUserRole !== 'admin') {
      return { success: false, error: '관리자만 수정할 수 있습니다.' };
    }

    const contentData = {
      academy_title: formData.get('academy_title') as string,
      academy_subtitle: formData.get('academy_subtitle') as string,
      academy_features: JSON.parse(formData.get('academy_features') as string),
      academy_slides: JSON.parse(formData.get('academy_slides') as string),
      featured_card_1_title: formData.get('featured_card_1_title') as string,
      featured_card_1_image_1: formData.get('featured_card_1_image_1') as string,
      featured_card_1_image_2: formData.get('featured_card_1_image_2') as string,
      featured_card_1_link: formData.get('featured_card_1_link') as string,
      featured_card_2_title: formData.get('featured_card_2_title') as string,
      featured_card_2_image_1: formData.get('featured_card_2_image_1') as string,
      featured_card_2_image_2: formData.get('featured_card_2_image_2') as string,
      featured_card_2_link: formData.get('featured_card_2_link') as string,
      updated_at: new Date().toISOString()
    };

    // 기존 레코드 업데이트 (항상 첫 번째 레코드)
    const { error } = await supabase
      .from('content_management')
      .update(contentData)
      .eq('id', (await supabase.from('content_management').select('id').limit(1).single()).data?.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('컨텐츠 업데이트 오류:', error);
    return { success: false, error: '저장 중 오류가 발생했습니다.' };
  }
}

// 컨텐츠 조회 서버 액션
export async function getContent() {
  try {
    const { data, error } = await supabase
      .from('content_management')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('컨텐츠 조회 오류:', error);
    return { success: false, error: '데이터 조회 중 오류가 발생했습니다.' };
  }
}

// 강사 추가 서버 액션
export async function addTeacher(formData: FormData) {
  try {
    // 현재 로그인한 사용자가 관리자인지 확인
    const cookieStore = await cookies();
    const currentUserRole = cookieStore.get('user_role')?.value;
    
    if (currentUserRole !== 'admin') {
      return { success: false, error: '관리자만 강사를 추가할 수 있습니다.' };
    }

    const teacherData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      subject: formData.get('subject') as string,
      image: formData.get('image') as string
    };

    // 필수 필드 검증
    if (!teacherData.email || !teacherData.name || !teacherData.phone || !teacherData.password || !teacherData.subject) {
      return { success: false, error: '모든 필수 항목을 입력해주세요.' };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherData.email)) {
      return { success: false, error: '올바른 이메일 형식을 입력해주세요.' };
    }

    // 전화번호 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(teacherData.phone)) {
      return { success: false, error: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)' };
    }

    // 비밀번호 길이 검증
    if (teacherData.password.length < 6) {
      return { success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' };
    }

    // 중복 검사 (이메일, 전화번호)
    const { data: existingUser } = await supabase
      .from('users')
      .select('username, email, phone')
      .or(`username.eq.${teacherData.email},email.eq.${teacherData.email},phone.eq.${teacherData.phone}`)
      .single();

    if (existingUser) {
      if (existingUser.username === teacherData.email || existingUser.email === teacherData.email) {
        return { success: false, error: '이미 존재하는 이메일입니다.' };
      }
      if (existingUser.phone === teacherData.phone) {
        return { success: false, error: '이미 존재하는 전화번호입니다.' };
      }
    }

    // 1. Supabase Auth에 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: teacherData.email,
      password: teacherData.password,
      options: {
        data: {
          name: teacherData.name,
          role: 'teacher'
        }
      }
    });
    
    if (authError) {
      console.error('Supabase Auth 계정 생성 실패:', authError);
      // Auth 생성 실패해도 계속 진행 (개발 환경 고려)
      // return { success: false, error: `인증 계정 생성 실패: ${authError.message}` };
    }

    // 2. 비밀번호 해시 처리
    const passwordHash = await bcrypt.hash(teacherData.password, 10);

    // 3. users 테이블에 강사 정보 등록 (이메일을 username으로 사용)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: teacherData.email, // 이메일을 username으로 사용
        name: teacherData.name,
        role: 'teacher',
        password: passwordHash,
        email: teacherData.email,
        phone: teacherData.phone,
        academy: 'coding-maker',
        profile_image_url: teacherData.image || null, // 프로필 이미지 추가
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      return { success: false, error: `강사 계정 생성 실패: ${userError.message}` };
    }

    // 4. teachers 테이블에 강사 상세 정보 등록
    const { error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user_id: userData.id,
        bio: '코딩 전문 강사',
        certs: '코딩 교육 전문가',
        career: '코딩 교육 전문 강사',
        subject: teacherData.subject, // 입력된 담당과목
        created_at: new Date().toISOString()
      });

    if (teacherError) {
      // users 테이블 롤백
      await supabase.from('users').delete().eq('id', userData.id);
      return { success: false, error: `강사 상세 정보 등록 실패: ${teacherError.message}` };
    }

    return { 
      success: true, 
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      }
    };
  } catch (error) {
    console.error('강사 추가 중 오류:', error);
    return { success: false, error: '강사 추가 중 오류가 발생했습니다.' };
  }
}

// 강사 정보 수정 서버 액션
export async function updateTeacher(formData: FormData) {
  try {
    // 현재 로그인한 사용자가 관리자인지 확인
    const cookieStore = await cookies();
    const currentUserRole = cookieStore.get('user_role')?.value;
    
    if (currentUserRole !== 'admin') {
      return { success: false, error: '관리자만 강사 정보를 수정할 수 있습니다.' };
    }

    const teacherData = {
      teacherId: formData.get('teacherId') as string,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      bio: formData.get('bio') as string,
      certs: formData.get('certs') as string,
      career: formData.get('career') as string,
      image: formData.get('image') as string,
      subject: formData.get('subject') as string
    };

    // 필수 필드 검증
    if (!teacherData.teacherId || !teacherData.email || !teacherData.name || !teacherData.phone) {
      return { success: false, error: '필수 항목을 모두 입력해주세요.' };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherData.email)) {
      return { success: false, error: '올바른 이메일 형식을 입력해주세요.' };
    }

    // 전화번호 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(teacherData.phone)) {
      return { success: false, error: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)' };
    }

    // 비밀번호 길이 검증 (입력된 경우에만)
    if (teacherData.password && teacherData.password.length < 6) {
      return { success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' };
    }

    // 중복 검사 (현재 강사를 제외하고 이메일, 전화번호 중복 체크)
    const { data: existingUser } = await supabase
      .from('users')
      .select('username, email, phone, id')
      .or(`username.eq.${teacherData.email},email.eq.${teacherData.email},phone.eq.${teacherData.phone}`)
      .neq('id', teacherData.teacherId)
      .single();

    if (existingUser) {
      if (existingUser.username === teacherData.email || existingUser.email === teacherData.email) {
        return { success: false, error: '이미 존재하는 이메일입니다.' };
      }
      if (existingUser.phone === teacherData.phone) {
        return { success: false, error: '이미 존재하는 전화번호입니다.' };
      }
    }

    // 1. Supabase Auth 업데이트 (비밀번호 변경 시에만)
    if (teacherData.password) {
      // Service Role Key가 없으면 Auth 업데이트를 건너뛰고 users 테이블만 업데이트
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('Service Role Key가 없어서 Auth 업데이트를 건너뜁니다. users 테이블만 업데이트합니다.');
      } else {
        try {
          // Service Role Key를 사용하여 Auth 사용자 목록 조회
          const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (!listError && authUsers.users) {
            const authUser = authUsers.users.find((user: any) => user.email === teacherData.email);
            
            if (authUser) {
              // Auth 비밀번호 업데이트
              const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                authUser.id,
                { password: teacherData.password }
              );
              
              if (authUpdateError) {
                console.error('Supabase Auth 비밀번호 업데이트 실패:', authUpdateError);
                return { success: false, error: '비밀번호 업데이트에 실패했습니다.' };
              }
            } else {
              console.error('Auth에서 강사 계정을 찾을 수 없습니다.');
              return { success: false, error: '인증 계정을 찾을 수 없습니다.' };
            }
          } else {
            console.error('Auth 사용자 목록 조회 실패:', listError);
            return { success: false, error: '인증 시스템에 연결할 수 없습니다.' };
          }
        } catch (error) {
          console.error('Supabase Auth 업데이트 중 오류:', error);
          return { success: false, error: '비밀번호 업데이트 중 오류가 발생했습니다.' };
        }
      }
    }

    // 2. users 테이블 업데이트
    const updateUserData: any = {
      username: teacherData.email, // 이메일을 username으로 사용
      name: teacherData.name,
      email: teacherData.email,
      phone: teacherData.phone,
      profile_image_url: teacherData.image
    };

    // 비밀번호가 입력된 경우에만 업데이트
    if (teacherData.password) {
      const passwordHash = await bcrypt.hash(teacherData.password, 10);
      updateUserData.password = passwordHash;
    }

    const { error: userError } = await supabase
      .from('users')
      .update(updateUserData)
      .eq('id', teacherData.teacherId);

    if (userError) {
      return { success: false, error: `기본 정보 수정 실패: ${userError.message}` };
    }

    // 3. teachers 테이블 업데이트
    const { error: teacherError } = await supabase
      .from('teachers')
      .update({
        bio: teacherData.bio || null,
        certs: teacherData.certs || null,
        career: teacherData.career || null,
        subject: teacherData.subject || '코딩 교육' // subject 컬럼에 직접 저장
      })
      .eq('user_id', teacherData.teacherId);

    if (teacherError) {
      return { success: false, error: `상세 정보 수정 실패: ${teacherError.message}` };
    }

    return { 
      success: true, 
      data: {
        id: teacherData.teacherId,
        name: teacherData.name,
        email: teacherData.email,
        phone: teacherData.phone
      }
    };
  } catch (error) {
    console.error('강사 정보 수정 중 오류:', error);
    return { success: false, error: '강사 정보 수정 중 오류가 발생했습니다.' };
  }
}

// 강사 상세 정보 조회 서버 액션
export async function getTeacherDetails(teacherId: string) {
  try {
    // teachers 테이블에서 상세 정보 조회
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('bio, certs, career, subject')
      .eq('user_id', teacherId)
      .single();

    if (teacherError && teacherError.code !== 'PGRST116') {
      return { success: false, error: teacherError.message };
    }

    // users 테이블에서 프로필 이미지 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('profile_image_url')
      .eq('id', teacherId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return { success: false, error: userError.message };
    }

    return { 
      success: true, 
      data: {
        bio: teacherData?.bio || '',
        certs: teacherData?.certs || '',
        career: teacherData?.career || '',
        subject: teacherData?.subject || '코딩 교육',
        image: userData?.profile_image_url || ''
      }
    };
  } catch (error) {
    console.error('강사 상세 정보 조회 중 오류:', error);
    return { success: false, error: '강사 상세 정보 조회 중 오류가 발생했습니다.' };
  }
}

// ==================== 관리자 프로필 관련 액션 ====================

// 관리자 프로필 업데이트 서버 액션
export async function updateAdminProfile(formData: FormData) {
  try {
    // 현재 로그인한 사용자가 관리자인지 확인
    const cookieStore = await cookies();
    const currentUserRole = cookieStore.get('user_role')?.value;
    
    if (currentUserRole !== 'admin') {
      return { success: false, error: '관리자만 프로필을 수정할 수 있습니다.' };
    }

    const adminData = {
      adminId: formData.get('adminId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      newPassword: formData.get('newPassword') as string
    };

    // 필수 필드 검증
    if (!adminData.adminId || !adminData.name || !adminData.email || !adminData.phone) {
      return { success: false, error: '필수 항목을 모두 입력해주세요.' };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      return { success: false, error: '올바른 이메일 형식을 입력해주세요.' };
    }

    // 전화번호 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(adminData.phone)) {
      return { success: false, error: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)' };
    }

    // 비밀번호 변경 시 검증
    if (adminData.newPassword) {
      if (adminData.newPassword.length < 6) {
        return { success: false, error: '새 비밀번호는 최소 6자 이상이어야 합니다.' };
      }
    }

    // 중복 검사 (현재 관리자를 제외하고 이메일, 전화번호 중복 체크)
    const { data: existingUser } = await supabase
      .from('users')
      .select('username, email, phone, id')
      .or(`username.eq.${adminData.email},email.eq.${adminData.email},phone.eq.${adminData.phone}`)
      .neq('id', adminData.adminId)
      .single();

    if (existingUser) {
      if (existingUser.username === adminData.email || existingUser.email === adminData.email) {
        return { success: false, error: '이미 존재하는 이메일입니다.' };
      }
      if (existingUser.phone === adminData.phone) {
        return { success: false, error: '이미 존재하는 전화번호입니다.' };
      }
    }

    // 1. Supabase Auth 업데이트 (비밀번호 변경 시에만)
    if (adminData.newPassword) {
      // Service Role Key가 없으면 Auth 업데이트를 건너뛰고 users 테이블만 업데이트
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('Service Role Key가 없어서 Auth 업데이트를 건너뜁니다. users 테이블만 업데이트합니다.');
      } else {
        try {
          // Service Role Key를 사용하여 Auth 사용자 목록 조회
          const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (!listError && authUsers.users) {
            // 관리자 계정의 경우 이메일로 검색
            const authUser = authUsers.users.find((user: any) => user.email === adminData.email);
            
            if (authUser) {
              // Auth 비밀번호 업데이트
              const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                authUser.id,
                { password: adminData.newPassword }
              );
              
              if (authUpdateError) {
                console.error('Supabase Auth 비밀번호 업데이트 실패:', authUpdateError);
                return { success: false, error: '비밀번호 업데이트에 실패했습니다.' };
              }
            } else {
              console.error('Auth에서 관리자 계정을 찾을 수 없습니다.');
              return { success: false, error: '인증 계정을 찾을 수 없습니다.' };
            }
          } else {
            console.error('Auth 사용자 목록 조회 실패:', listError);
            return { success: false, error: '인증 시스템에 연결할 수 없습니다.' };
          }
        } catch (error) {
          console.error('Auth 업데이트 실패:', error);
          return { success: false, error: '비밀번호 업데이트 중 오류가 발생했습니다.' };
        }
      }
    }

    // 2. users 테이블 업데이트
    const updateUserData: any = {
      username: adminData.email, // 이메일을 username으로 사용
      name: adminData.name,
      email: adminData.email, // 이메일 업데이트
      phone: adminData.phone
    };

    // 비밀번호가 입력된 경우에만 업데이트
    if (adminData.newPassword) {
      const passwordHash = await bcrypt.hash(adminData.newPassword, 10);
      updateUserData.password = passwordHash;
    }

    const { error: userError } = await supabase
      .from('users')
      .update(updateUserData)
      .eq('id', adminData.adminId);

    if (userError) {
      return { success: false, error: `프로필 업데이트 실패: ${userError.message}` };
    }

    return { 
      success: true, 
      data: {
        id: adminData.adminId,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone
      }
    };
  } catch (error) {
    console.error('관리자 프로필 업데이트 중 오류:', error);
    return { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' };
  }
}

// ==================== 상담 문의 관련 액션 ====================

// 상담 문의 저장
export async function saveConsultation(formData: FormData) {
  try {
    // FormData에서 데이터 추출
    const consultationData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      academy: formData.get('academy') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      privacy_consent: formData.get('privacy_consent') === 'true'
    };

    // 입력값 검증
    if (!consultationData.name || !consultationData.phone || !consultationData.academy || !consultationData.subject || !consultationData.message) {
      return { success: false, error: '모든 필수 항목을 입력해주세요.' };
    }

    if (!consultationData.privacy_consent) {
      return { success: false, error: '개인정보 수집 및 이용에 동의해주세요.' };
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (!phoneRegex.test(consultationData.phone)) {
      return { success: false, error: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)' };
    }

    // Supabase에 상담 문의 저장
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        name: consultationData.name,
        phone: consultationData.phone,
        academy: consultationData.academy,
        subject: consultationData.subject,
        message: consultationData.message,
        privacy_consent: consultationData.privacy_consent,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('상담 문의 저장 중 오류:', error);
      return { success: false, error: '상담 문의 저장 중 오류가 발생했습니다.' };
    }

    console.log('상담 문의 저장 성공:', data);
    return { 
      success: true, 
      message: '상담 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
      data: data 
    };

  } catch (error) {
    console.error('상담 문의 저장 중 오류:', error);
    return { success: false, error: '상담 문의 저장 중 오류가 발생했습니다.' };
  }
}

// 관리자/강사용: 모든 상담 문의 조회
export async function getConsultations() {
  try {
    // 관리자 또는 강사 권한 확인
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return { success: false, error: '관리자 또는 강사만 접근 가능합니다.' };
    }

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('상담 문의 조회 중 오류:', error);
      return { success: false, error: '상담 문의 조회 중 오류가 발생했습니다.' };
    }

    return { success: true, data: data || [] };

  } catch (error) {
    console.error('상담 문의 조회 중 오류:', error);
    return { success: false, error: '상담 문의 조회 중 오류가 발생했습니다.' };
  }
}

// 관리자/강사용: 상담 문의 상태 업데이트
export async function updateConsultationStatus(formData: FormData) {
  try {
    // 관리자 또는 강사 권한 확인
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return { success: false, error: '관리자 또는 강사만 접근 가능합니다.' };
    }

    const consultationId = formData.get('consultationId') as string;
    const status = formData.get('status') as string;
    const responseNote = formData.get('responseNote') as string;

    if (!consultationId || !status) {
      return { success: false, error: '필수 정보가 누락되었습니다.' };
    }

    const updateData: any = {
      status: status
    };

    // 완료 상태로 변경 시 응답 시간 기록
    if (status === 'completed') {
      updateData.responded_at = new Date().toISOString();
    }

    // 응답 메모가 있으면 추가
    if (responseNote) {
      updateData.response_note = responseNote;
    }

    const { data, error } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', consultationId)
      .select()
      .single();

    if (error) {
      console.error('상담 문의 상태 업데이트 중 오류:', error);
      return { success: false, error: '상담 문의 상태 업데이트 중 오류가 발생했습니다.' };
    }

    return { success: true, message: '상담 문의 상태가 업데이트되었습니다.', data: data };

  } catch (error) {
    console.error('상담 문의 상태 업데이트 중 오류:', error);
    return { success: false, error: '상담 문의 상태 업데이트 중 오류가 발생했습니다.' };
  }
}

// ==================== 강사진 관련 액션 ====================

// 모든 강사진 정보 조회 (공개용)
export async function getInstructors() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        profile_image_url,
        teachers!inner (
          bio,
          certs,
          career,
          subject
        )
      `)
      .in('role', ['teacher', 'admin'])
      .not('teachers.bio', 'is', null)
      .order('name');

    if (error) {
      console.error('강사진 정보 조회 중 오류:', error);
      return { success: false, error: '강사진 정보 조회 중 오류가 발생했습니다.' };
    }

    // 데이터 매핑
    const instructors = (data || []).map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name,
      bio: teacher.teachers.bio || '전문 강사',
      profile_image: teacher.profile_image_url || 'https://placehold.co/400x400.png',
      subject: teacher.teachers.subject || '코딩 교육',
      certs: teacher.teachers.certs || '',
      career: teacher.teachers.career || '',
      email: teacher.email,
      phone: teacher.phone
    }));

    // bio 기준으로 정렬: 원장, 부원장을 상단에 배치
    const sortedInstructors = instructors.sort((a: TeacherInfo, b: TeacherInfo) => {
      const aIsLeader = a.bio.includes('원장');
      const bIsLeader = b.bio.includes('원장');
      
      if (aIsLeader && !bIsLeader) return -1;
      if (!aIsLeader && bIsLeader) return 1;
      
      // 둘 다 원장이거나 둘 다 원장이 아닌 경우 이름순
      return a.name.localeCompare(b.name);
    });

    return { success: true, data: sortedInstructors };

  } catch (error) {
    console.error('강사진 정보 조회 중 오류:', error);
    return { success: false, error: '강사진 정보 조회 중 오류가 발생했습니다.' };
  }
}

// ==================== 학생 삭제 서버 액션 ====================

// 학생 삭제 서버 액션 (관리자만 가능)
export async function deleteStudent(studentId: string) {
  try {
    // 현재 로그인한 사용자가 관리자인지 확인
    const cookieStore = await cookies();
    const currentUserRole = cookieStore.get('user_role')?.value;
    
    if (currentUserRole !== 'admin') {
      return { success: false, error: '관리자만 학생을 삭제할 수 있습니다.' };
    }

    // 1. 학생 정보 조회
    const { data: studentData, error: studentError } = await supabase
      .from('users')
      .select('id, username, name')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (studentError || !studentData) {
      return { success: false, error: '학생을 찾을 수 없습니다.' };
    }

    // 2. 학부모 계정 ID 조회 (학생 ID에 'p'를 붙인 username으로 찾기)
    const parentUsername = `${studentData.username}p`;
    const { data: parentData, error: parentError } = await supabase
      .from('users')
      .select('id')
      .eq('username', parentUsername)
      .eq('role', 'parent')
      .single();

    if (parentError) {
      console.warn('학부모 계정을 찾을 수 없습니다:', parentError);
    }

    // 3. 관련 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
    
    // 3-1. 학생 활동 로그 삭제
    const { error: activityLogsError } = await supabase
      .from('student_activity_logs')
      .delete()
      .eq('student_id', studentId);

    if (activityLogsError) {
      console.warn('학생 활동 로그 삭제 실패:', activityLogsError);
    }

    // 3-2. 학생 학습 로그 삭제
    const { error: learningLogsError } = await supabase
      .from('student_learning_logs')
      .delete()
      .eq('student_id', studentId);

    if (learningLogsError) {
      console.warn('학생 학습 로그 삭제 실패:', learningLogsError);
    }

    // 3-3. 수업료 결제 기록 삭제
    const { error: tuitionError } = await supabase
      .from('tuition_payments')
      .delete()
      .eq('student_id', studentId);

    if (tuitionError) {
      console.warn('수업료 결제 기록 삭제 실패:', tuitionError);
    }

    // 3-4. 커뮤니티 게시글 삭제 (soft delete)
    const { error: postsError } = await supabase
      .from('community_posts')
      .update({ is_deleted: true })
      .eq('user_id', studentId);

    if (postsError) {
      console.warn('커뮤니티 게시글 삭제 실패:', postsError);
    }

    // 3-5. 커뮤니티 댓글 삭제 (soft delete)
    const { error: commentsError } = await supabase
      .from('community_comments')
      .update({ is_deleted: true })
      .eq('user_id', studentId);

    if (commentsError) {
      console.warn('커뮤니티 댓글 삭제 실패:', commentsError);
    }

    // 4. students 테이블에서 학생 상세 정보 삭제
    const { error: studentDetailError } = await supabase
      .from('students')
      .delete()
      .eq('user_id', studentId);

    if (studentDetailError) {
      console.error('학생 상세 정보 삭제 실패:', studentDetailError);
      return { success: false, error: '학생 상세 정보 삭제에 실패했습니다.' };
    }

    // 5. 학부모 계정 삭제 (있는 경우)
    if (parentData) {
      const { error: parentDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', parentData.id);

      if (parentDeleteError) {
        console.warn('학부모 계정 삭제 실패:', parentDeleteError);
      }
    }

    // 6. 학생 계정 삭제
    const { error: studentDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', studentId);

    if (studentDeleteError) {
      console.error('학생 계정 삭제 실패:', studentDeleteError);
      return { success: false, error: '학생 계정 삭제에 실패했습니다.' };
    }

    return { 
      success: true, 
      message: `${studentData.name} 학생의 계정이 성공적으로 삭제되었습니다.` 
    };

  } catch (error) {
    console.error('학생 삭제 중 오류:', error);
    return { success: false, error: '학생 삭제 중 오류가 발생했습니다.' };
  }
}

// ==================== 학생 회원가입 서버 액션 ====================

// 학생 회원가입 서버 액션 (트랜잭션 처리 개선)

// ==================== 새로운 학생 가입 요청 시스템 ====================

// 새로운 승인 시스템을 위한 타입 정의
interface NewStudentSignupRequest {
  id: string;
  student_id: string;
  parent_id?: string;
  academy: string;
  assigned_teacher_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  student_name?: string;
  student_username?: string;
  teacher_name?: string;
}

// 학생 가입 요청 생성 (회원가입 시)
export async function createStudentSignupRequest(studentData: {
  studentId: string;
  name: string;
  birthYear: string;
  password: string;
  phone: string;
  parentPhone: string;
  academy: string;
  assignedTeacherId: string;
}) {
  try {
    // 서버 측 유효성 검증
    // 이름 검증 (한글만 허용, 2-10자)
    const nameRegex = /^[가-힣]{2,10}$/;
    if (!nameRegex.test(studentData.name)) {
      return { success: false, error: '이름은 한글 2-10자로만 입력 가능합니다.' };
    }

    // 출생년도 검증 (4자리 숫자, 1900-현재년도)
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(studentData.birthYear)) {
      return { success: false, error: '출생년도는 4자리 숫자로 입력해주세요.' };
    }

    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(studentData.birthYear);
    if (birthYear < 1900 || birthYear > currentYear) {
      return { success: false, error: '올바른 출생년도를 입력해주세요. (1900년 ~ 현재년도)' };
    }

    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;

    // 1. 학부모 계정 생성
    const parentUsername = `${studentData.studentId}p`;
    const parentPasswordHash = await bcrypt.hash(studentData.password, 10);

    const { data: parentData, error: parentError } = await supabase
      .from('users')
      .insert({
        username: parentUsername,
        name: `${studentData.name} 학부모`,
        role: 'parent',
        password: parentPasswordHash,
        phone: studentData.parentPhone || null,
        academy: studentData.academy,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (parentError) {
      console.error('학부모 계정 생성 실패:', parentError);
      return { success: false, error: '학부모 계정 생성에 실패했습니다.' };
    }

    // 2. 중복 아이디 검사
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', studentData.studentId)
      .single();

    if (existingUser) {
      return { success: false, error: '이미 사용 중인 아이디입니다. 다른 이름이나 출생년도를 입력해주세요.' };
    }

    // 3. 학생 계정 생성
    const studentPasswordHash = await bcrypt.hash(studentData.password, 10);

    const { data: studentUserData, error: studentUserError } = await supabase
      .from('users')
      .insert({
        username: studentData.studentId,
        name: studentData.name,
        role: 'student',
        password: studentPasswordHash,
        phone: studentData.phone,
        birth_year: studentData.birthYear ? parseInt(studentData.birthYear) : null,
        academy: studentData.academy,
        assigned_teacher_id: studentData.assignedTeacherId || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (studentUserError) {
      // 학부모 계정 롤백
      await supabase.from('users').delete().eq('id', parentData.id);
      return { success: false, error: studentUserError.message };
    }

    // 4. students 테이블에 데이터 생성
    const { error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: studentUserData.id,
        assigned_teachers: studentData.assignedTeacherId ? [studentData.assignedTeacherId] : [],
        parent_id: parentData.id,
        current_curriculum_id: null,
        attendance_schedule: null,
        created_at: new Date().toISOString()
      });

    if (studentError) {
      // 롤백: users 테이블에서 학생과 학부모 계정 삭제
      await supabase.from('users').delete().eq('id', studentUserData.id);
      await supabase.from('users').delete().eq('id', parentData.id);
      return { success: false, error: studentError.message };
    }

    // 5. 가입 요청 완료 (현재는 student_signup_requests 테이블이 없으므로 생략)
    // TODO: student_signup_requests 테이블 생성 후 승인 시스템 구현

    return { success: true, data: studentUserData };

  } catch (error) {
    console.error('학생 가입 요청 생성 중 오류:', error);
    return { success: false, error: '학생 가입 요청 생성 중 오류가 발생했습니다.' };
  }
}

// 학생 가입 요청 목록 조회 (새로운 시스템)
export async function getNewStudentSignupRequests(teacherId?: string) {
  try {
    let query = supabase
      .from('student_signup_requests')
      .select(`
        id,
        student_id,
        parent_id,
        academy,
        assigned_teacher_id,
        status,
        requested_at,
        processed_at,
        processed_by,
        rejection_reason
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    // 특정 교사의 담당 학생만 조회하는 경우
    if (teacherId) {
      query = query.eq('assigned_teacher_id', teacherId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('학생 가입 요청 조회 중 오류:', error);
      return { success: false, error: '학생 가입 요청 조회 중 오류가 발생했습니다.' };
    }

    // 학생 정보와 담당 교사 정보를 별도로 조회
    const studentIds = (data || []).map((request: any) => request.student_id);
    const teacherIds = (data || []).map((request: any) => request.assigned_teacher_id).filter(Boolean);
    
    // 학생 정보 조회
    const { data: studentsData } = await supabase
      .from('users')
      .select('id, username, name, birth_year, phone')
      .in('id', studentIds);
    
    // 담당 교사 정보 조회
    const { data: teachersData } = await supabase
      .from('users')
      .select('id, name')
      .in('id', teacherIds);

    // 데이터 매핑
    const requests = (data || []).map((request: any) => {
      const student = studentsData?.find((s: any) => s.id === request.student_id);
      const teacher = teachersData?.find((t: any) => t.id === request.assigned_teacher_id);
      
      return {
        id: request.id,
        student_id: request.student_id,
        student_name: student?.name || '',
        student_username: student?.username || '',
        birth_year: student?.birth_year,
        academy: request.academy,
        assigned_teacher_id: request.assigned_teacher_id || '',
        status: request.status,
        requested_at: request.requested_at,
        processed_at: request.processed_at,
        processed_by: request.processed_by,
        rejection_reason: request.rejection_reason,
        teacher_name: teacher?.name || '담당 교사 미지정'
      };
    });

    return { success: true, data: requests };

  } catch (error) {
    console.error('학생 가입 요청 조회 중 오류:', error);
    return { success: false, error: '학생 가입 요청 조회 중 오류가 발생했습니다.' };
  }
}

// 학생 가입 요청 승인 (새로운 시스템)
export async function approveNewStudentSignupRequest(requestId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: '인증이 필요합니다.' };
    }

    // 1. 가입 요청 정보 조회
    const { data: requestData, error: requestError } = await supabase
      .from('student_signup_requests')
      .select('student_id, parent_id, status')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (requestError || !requestData) {
      return { success: false, error: '가입 요청을 찾을 수 없습니다.' };
    }

    // 2. 학생과 학부모 계정 상태를 active로 변경
    const { error: studentUpdateError } = await supabase
      .from('users')
      .update({
        status: 'active'
      })
      .in('id', [requestData.student_id, requestData.parent_id]);

    if (studentUpdateError) {
      console.error('사용자 상태 업데이트 중 오류:', studentUpdateError);
      return { success: false, error: '사용자 상태 업데이트 중 오류가 발생했습니다.' };
    }

    // 3. students 테이블의 enrollment_start_date 업데이트
    const { error: studentDataUpdateError } = await supabase
      .from('students')
      .update({
        enrollment_start_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', requestData.student_id);

    if (studentDataUpdateError) {
      console.error('학생 데이터 업데이트 중 오류:', studentDataUpdateError);
      // 롤백
      await supabase
        .from('users')
        .update({ status: 'pending' })
        .in('id', [requestData.student_id, requestData.parent_id]);
      return { success: false, error: '학생 데이터 업데이트 중 오류가 발생했습니다.' };
    }

    // 4. 가입 요청 상태를 approved로 변경
    const { error: requestUpdateError } = await supabase
      .from('student_signup_requests')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString(),
        processed_by: user.id
      })
      .eq('id', requestId);

    if (requestUpdateError) {
      console.error('가입 요청 상태 업데이트 중 오류:', requestUpdateError);
      return { success: false, error: '가입 요청 상태 업데이트 중 오류가 발생했습니다.' };
    }

    // 5. 승인 로그 기록
    await supabase
      .from('approval_logs')
      .insert({
        request_id: requestId,
        action: 'approved',
        processed_by: user.id,
        processed_at: new Date().toISOString()
      });

    return { success: true, message: '가입 요청이 승인되었습니다.' };

  } catch (error) {
    console.error('학생 가입 요청 승인 중 오류:', error);
    return { success: false, error: '학생 가입 요청 승인 중 오류가 발생했습니다.' };
  }
}

// 학생 가입 요청 거부 (새로운 시스템)
export async function rejectNewStudentSignupRequest(requestId: string, rejectionReason?: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: '인증이 필요합니다.' };
    }

    // 1. 가입 요청 정보 조회
    const { data: requestData, error: requestError } = await supabase
      .from('student_signup_requests')
      .select('student_id, parent_id, status')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (requestError || !requestData) {
      return { success: false, error: '가입 요청을 찾을 수 없습니다.' };
    }

    // 2. students 테이블에서 관련 데이터 삭제
    const { error: studentError } = await supabase
      .from('students')
      .delete()
      .eq('user_id', requestData.student_id);

    if (studentError) {
      console.error('students 테이블 삭제 중 오류:', studentError);
    }

    // 3. users 테이블에서 학생과 학부모 계정 삭제
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .in('id', [requestData.student_id, requestData.parent_id])
      .eq('status', 'pending');

    if (userError) {
      console.error('사용자 계정 삭제 중 오류:', userError);
      return { success: false, error: '사용자 계정 삭제 중 오류가 발생했습니다.' };
    }

    // 4. 가입 요청 상태를 rejected로 변경
    const { error: requestUpdateError } = await supabase
      .from('student_signup_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: user.id,
        rejection_reason: rejectionReason || null
      })
      .eq('id', requestId);

    if (requestUpdateError) {
      console.error('가입 요청 상태 업데이트 중 오류:', requestUpdateError);
      return { success: false, error: '가입 요청 상태 업데이트 중 오류가 발생했습니다.' };
    }

    // 5. 거부 로그 기록
    await supabase
      .from('approval_logs')
      .insert({
        request_id: requestId,
        action: 'rejected',
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        reason: rejectionReason || null
      });

    return { success: true, message: '가입 요청이 거부되었습니다.' };

  } catch (error) {
    console.error('학생 가입 요청 거부 중 오류:', error);
    return { success: false, error: '학생 가입 요청 거부 중 오류가 발생했습니다.' };
  }
}

