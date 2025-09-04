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
    
    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: '파일 크기는 5MB 이하여야 합니다.' };
    }

    // 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.' };
    }

    // 파일명 정리 (특수문자 제거)
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${section}/${Date.now()}-${cleanFileName}`;
    
    console.log('업로드 파일명:', fileName);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('content-images')
      .upload(fileName, file, {
        cacheControl: '3600',
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
      about_title: formData.get('about_title') as string,
      about_subtitle: formData.get('about_subtitle') as string,
      about_mission: formData.get('about_mission') as string,
      about_vision: formData.get('about_vision') as string,
      about_image: formData.get('about_image') as string,
      academy_title: formData.get('academy_title') as string,
      academy_subtitle: formData.get('academy_subtitle') as string,
      academy_features: JSON.parse(formData.get('academy_features') as string),
      academy_slides: JSON.parse(formData.get('academy_slides') as string),
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

