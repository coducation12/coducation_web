'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// TODO: 배포 후 정상화 - 비밀번호 인증으로 복원 필요
// 현재는 개발 편의를 위해 비밀번호 없이 로그인 허용
// 배포 후에는 supabase.auth.signInWithPassword 사용하여 보안 강화 필요

export async function login(formData: FormData) {
  const userType = formData.get('userType') as string;
  
  if (userType === 'teacher') {
    // 강사/관리자: 이메일과 비밀번호로 사용자 확인
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, password')
      .eq('username', email)
      .in('role', ['teacher', 'admin']) // 강사와 관리자 모두 허용
      .single();

    if (!error && user) {
      // 개발용: 비밀번호가 비어있으면 자동 로그인
      if (!password || password.trim() === '') {
        const cookieStore = await cookies();
        cookieStore.set('user_id', user.id, { httpOnly: true, path: '/' })
        cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' })
        redirect('/dashboard')
        return;
      }
      
      // 비밀번호가 있으면 검증
      if (user.password && await bcrypt.compare(password, user.password)) {
        const cookieStore = await cookies();
        cookieStore.set('user_id', user.id, { httpOnly: true, path: '/' })
        cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' })
        redirect('/dashboard')
      } else {
        redirect('/login?error=true')
      }
    } else {
      redirect('/login?error=true')
    }
  } else {
    // 학생/학부모: 아이디와 비밀번호로 사용자 확인
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, password')
      .eq('username', username)
      .in('role', ['student', 'parent'])
      .single();

    if (!error && user) {
      // 개발용: 비밀번호가 비어있으면 자동 로그인
      if (!password || password.trim() === '') {
        const cookieStore = await cookies();
        cookieStore.set('user_id', user.id, { httpOnly: true, path: '/' })
        cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' })
        redirect('/dashboard')
        return;
      }
      
      // 비밀번호가 있으면 검증
      if (user.password && await bcrypt.compare(password, user.password)) {
        const cookieStore = await cookies();
        cookieStore.set('user_id', user.id, { httpOnly: true, path: '/' })
        cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' })
        redirect('/dashboard')
      } else {
        redirect('/login?error=true')
      }
    } else {
      redirect('/login?error=true')
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
      .select('id, name, role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
}

// TODO: 배포 후 정상화 - Supabase Auth 로그아웃으로 복원 필요
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id')
  cookieStore.delete('user_role')
  redirect('/login')
}

// 학생 추가 서버 액션
export async function addStudent(formData: FormData) {
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
      classSchedules: JSON.parse(formData.get('classSchedules') as string)
    };

    // 1. 학생 ID에 'p'를 붙여서 학부모 계정 자동 생성
    let parentId = null;
    const parentUsername = `${studentData.studentId}p`;
    
    // 학부모 비밀번호 해시 처리 (학생 비밀번호와 동일하게 설정)
    const parentPasswordHash = await bcrypt.hash(studentData.password, 10);
    
    const { data: parentData, error: parentError } = await supabase
      .from('users')
      .insert({
        username: parentUsername,
        name: `${studentData.name} 학부모`,
        role: 'parent',
        password: parentPasswordHash,
        phone: studentData.parentPhone || null,
        academy: '코딩메이커',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!parentError) {
      parentId = parentData.id;
    } else {
      // 학부모 계정 생성 실패 시에도 계속 진행 (선택사항이므로)
    }

    // 2. users 테이블에 학생 정보 등록 (비밀번호 포함)
    // 학생 비밀번호 해시 처리
    const studentPasswordHash = await bcrypt.hash(studentData.password, 10);
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: studentData.studentId, // 항상 학생 ID를 username으로 사용
        name: studentData.name,
        role: 'student',
        password: studentPasswordHash,
        phone: studentData.phone,
        birth_year: studentData.birthYear ? parseInt(studentData.birthYear) : null,
        academy: '코딩메이커',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    // 3. 수업 일정을 attendance_schedule 형식으로 변환
    const attendanceSchedule: any = {};
    
    studentData.classSchedules.forEach((schedule: any) => {
      if (schedule.day && schedule.startTime) {
        const dayMap: { [key: string]: string } = {
          'monday': '1', 'tuesday': '2', 'wednesday': '3', 
          'thursday': '4', 'friday': '5', 'saturday': '6', 'sunday': '0'
        };
        const dayNumber = dayMap[schedule.day];
        
        if (dayNumber) {
          // 시작시간과 종료시간을 모두 저장
          let startTime = schedule.startTime;
          let endTime = schedule.endTime || '';
          
          // 시간 형식 정리 (HH:MM 형식으로 통일)
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
          
          // 종료시간이 항상 있어야 하므로 검증
          if (!endTime || endTime.trim() === '') {
            throw new Error(`${schedule.day}의 종료시간을 입력해주세요.`);
          }
          
          // 항상 객체 형태로 저장 (startTime과 endTime 포함)
          attendanceSchedule[dayNumber] = {
            startTime: startTime,
            endTime: endTime
          };
        }
      }
    });

    // 4. students 테이블에 학생 상세 정보 등록
    const studentInsertData = {
      user_id: userData.id,
      assigned_teachers: currentUserRole === 'teacher' && currentUserId ? [currentUserId] : [], // 강사인 경우에만 담당 강사로 설정, 아니면 빈 배열
      parent_id: parentId,
      current_curriculum_id: null,
      enrollment_start_date: new Date().toISOString().split('T')[0],
      attendance_schedule: Object.keys(attendanceSchedule).length > 0 ? attendanceSchedule : null,
      created_at: new Date().toISOString()
    };
    
    const { error: studentError } = await supabase
      .from('students')
      .insert(studentInsertData);

    if (studentError) {
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
      classSchedules: JSON.parse(formData.get('classSchedules') as string)
    };

    // 1. 학생 계정 정보 업데이트
    const updateData: any = {
      name: studentData.name,
      phone: studentData.phone,
      birth_year: studentData.birthYear ? parseInt(studentData.birthYear) : null,
    };

    // 비밀번호가 입력된 경우에만 업데이트
    if (studentData.password) {
      const studentPasswordHash = await bcrypt.hash(studentData.password, 10);
      updateData.password = studentPasswordHash;
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

    // 3. 수업 일정을 attendance_schedule 형식으로 변환
    const attendanceSchedule: any = {};
    
    studentData.classSchedules.forEach((schedule: any) => {
      if (schedule.day && schedule.startTime) {
        const dayMap: { [key: string]: string } = {
          'monday': '1', 'tuesday': '2', 'wednesday': '3', 
          'thursday': '4', 'friday': '5', 'saturday': '6', 'sunday': '0'
        };
        const dayNumber = dayMap[schedule.day];
        if (dayNumber) {
          // 시작시간과 종료시간을 모두 저장
          let startTime = schedule.startTime;
          let endTime = schedule.endTime || '';
          
          // 시간 형식 정리 (HH:MM 형식으로 통일)
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
          
          // 종료시간이 항상 있어야 하므로 검증
          if (!endTime || endTime.trim() === '') {
            throw new Error(`${schedule.day}의 종료시간을 입력해주세요.`);
          }
          
          // 항상 객체 형태로 저장 (startTime과 endTime 포함)
          attendanceSchedule[dayNumber] = {
            startTime: startTime,
            endTime: endTime
          };
        }
      }
    });

    // 4. students 테이블의 attendance_schedule 업데이트
    const { error: studentError } = await supabase
      .from('students')
      .update({
        attendance_schedule: Object.keys(attendanceSchedule).length > 0 ? attendanceSchedule : null
      })
      .eq('user_id', (await supabase.from('users').select('id').eq('username', studentData.studentId).single()).data?.id);

    if (studentError) {
      return { success: false, error: studentError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('학생 정보 수정 중 오류:', error);
    return { success: false, error: '학생 정보 수정 중 오류가 발생했습니다.' };
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
