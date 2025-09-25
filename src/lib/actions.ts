'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-utils'

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
      .select('id, username, role, password, status')
      .eq('username', email)
      .in('role', ['teacher', 'admin']) // 강사와 관리자 모두 허용
      .single();

    if (!error && user) {
      // 강사/관리자: active가 아니면 로그인 거부
      if (user.status !== 'active') {
        redirect('/login?error=pending')
        return;
      }
      
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
      .select('id, username, role, password, status')
      .eq('username', username)
      .in('role', ['student', 'parent'])
      .single();

    if (!error && user) {
      // 사용자 상태 확인 (학생의 경우 수강 상태도 확인)
      if (user.role === 'student') {
        // 학생: active이면서 수강 중이어야 로그인 가능
        if (user.status !== 'active' || user.status === '휴강' || user.status === '종료') {
          if (user.status === 'pending') {
            redirect('/login?error=pending')
          } else if (user.status === '휴강') {
            redirect('/login?error=suspended')
          } else if (user.status === '종료') {
            redirect('/login?error=terminated')
          } else {
            redirect('/login?error=inactive')
          }
          return;
        }
      } else {
        // 학부모: active가 아니면 로그인 거부
        if (user.status !== 'active') {
          redirect('/login?error=pending')
          return;
        }
      }
      
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

// TODO: 배포 후 정상화 - Supabase Auth 로그아웃으로 복원 필요
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id')
  cookieStore.delete('user_role')
  redirect('/login')
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

    // 1. 학생 ID에 'p'를 붙여서 학부모 계정 자동 생성 (회원가입 시에만)
    let parentId = null;
    if (isSignup) {
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
          academy: studentData.academy || 'coding-maker',
          status: 'pending', // 회원가입 시에는 pending 상태
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!parentError) {
        parentId = parentData.id;
      } else {
        // 학부모 계정 생성 실패 시에도 계속 진행 (선택사항이므로)
      }
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
        academy: studentData.academy || 'coding-maker',
        assigned_teacher_id: studentData.assignedTeacherId || null,
        status: isSignup ? 'pending' : 'active', // 회원가입 시에는 pending, 관리자 추가 시에는 active
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    // 3. 수업 일정을 attendance_schedule 형식으로 변환 (관리자 추가 시에만)
    const attendanceSchedule: any = {};
    
    if (!isSignup && studentData.classSchedules) {
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
    }

    // 4. students 테이블에 학생 상세 정보 등록
    const studentInsertData = {
      user_id: userData.id,
      assigned_teachers: isSignup ? (studentData.assignedTeacherId ? [studentData.assignedTeacherId] : []) : (currentUserRole === 'teacher' && currentUserId ? [currentUserId] : []),
      parent_id: parentId,
      current_curriculum_id: null,
      enrollment_start_date: isSignup ? null : new Date().toISOString().split('T')[0], // 회원가입 시에는 null
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
      status: formData.get('status') as string,
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
      .eq('user_id', userData.id);

    // 5. users 테이블의 status 업데이트 (통합된 상태 관리)
    const statusMap: { [key: string]: string } = {
      '수강': 'active',
      '휴강': '휴강',
      '종료': '종료'
    };
    
    const { error: userStatusError } = await supabase
      .from('users')
      .update({
        status: statusMap[studentData.status] || studentData.status || 'active'
      })
      .eq('id', userData.id);

    if (studentError) {
      return { success: false, error: studentError.message };
    }

    if (userStatusError) {
      return { success: false, error: userStatusError.message };
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
      about_title: formData.get('about_title') as string,
      about_subtitle: formData.get('about_subtitle') as string,
      about_mission: formData.get('about_mission') as string,
      about_vision: formData.get('about_vision') as string,
      about_image: formData.get('about_image') as string,
      academy_title: formData.get('academy_title') as string,
      academy_subtitle: formData.get('academy_subtitle') as string,
      academy_features: JSON.parse(formData.get('academy_features') as string),
      academy_slides: JSON.parse(formData.get('academy_slides') as string),
      featured_card_1_title: formData.get('featured_card_1_title') as string,
      featured_card_1_image_1: formData.get('featured_card_1_image_1') as string,
      featured_card_1_image_2: formData.get('featured_card_1_image_2') as string,
      featured_card_2_title: formData.get('featured_card_2_title') as string,
      featured_card_2_image_1: formData.get('featured_card_2_image_1') as string,
      featured_card_2_image_2: formData.get('featured_card_2_image_2') as string,
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
        image: teacherData.image || null, // 업로드된 이미지 또는 null
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
      try {
        // Auth 사용자 목록에서 이메일로 조회
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (!listError && authUsers.users) {
          const authUser = authUsers.users.find(user => user.email === teacherData.email);
          
          if (authUser) {
            // Auth 비밀번호 업데이트
            const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
              authUser.id,
              { password: teacherData.password }
            );
            
            if (authUpdateError) {
              console.error('Supabase Auth 비밀번호 업데이트 실패:', authUpdateError);
              // Auth 업데이트 실패해도 계속 진행 (개발 환경 고려)
            }
          }
        }
      } catch (error) {
        console.error('Supabase Auth 업데이트 중 오류:', error);
        // Auth 업데이트 실패해도 계속 진행
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
        image: teacherData.image || null,
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
    const { data, error } = await supabase
      .from('teachers')
      .select('bio, certs, career, image, subject')
      .eq('user_id', teacherId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: data || { bio: '', certs: '', career: '', image: '', subject: '코딩 교육' }
    };
  } catch (error) {
    console.error('강사 상세 정보 조회 중 오류:', error);
    return { success: false, error: '강사 상세 정보 조회 중 오류가 발생했습니다.' };
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
    const userRole = cookies().get('user_role')?.value;
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
    const userRole = cookies().get('user_role')?.value;
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
    const sortedInstructors = instructors.sort((a, b) => {
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

// ==================== 학생 회원가입 서버 액션 ====================

// 학생 회원가입 서버 액션 (트랜잭션 처리 개선)

// ==================== 학생 가입 요청 관련 액션 ====================

// 학생 가입 요청 목록 조회 (교사용)
export async function getStudentSignupRequests(teacherId?: string) {
  try {
    console.log('getStudentSignupRequests 호출됨, teacherId:', teacherId);
    
    let query = supabase
      .from('users')
      .select(`
        *,
        assigned_teacher:assigned_teacher_id(name)
      `)
      .eq('role', 'student')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // 특정 교사의 담당 학생만 조회하는 경우
    if (teacherId) {
      console.log('특정 교사 필터 적용:', teacherId);
      query = query.eq('assigned_teacher_id', teacherId);
    }

    const { data, error } = await query;
    console.log('쿼리 결과:', { data, error });

    if (error) {
      console.error('학생 가입 요청 조회 중 오류:', error);
      return { success: false, error: '학생 가입 요청 조회 중 오류가 발생했습니다.' };
    }

    // 데이터 매핑 (기존 인터페이스와 호환)
    const requests = (data || []).map((user: any) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      birth_year: user.birth_year,
      academy: user.academy,
      assigned_teacher_id: user.assigned_teacher_id || '',
      status: user.status,
      requested_at: user.created_at,
      processed_at: null,
      processed_by: null,
      rejection_reason: null,
      teacher_name: user.assigned_teacher?.name || '담당 교사 미지정'
    }));

    return { success: true, data: requests };

  } catch (error) {
    console.error('학생 가입 요청 조회 중 오류:', error);
    return { success: false, error: '학생 가입 요청 조회 중 오류가 발생했습니다.' };
  }
}

// 학생 가입 요청 승인 (데이터 동기화 개선)
export async function approveStudentSignupRequest(requestId: string) {
  try {
    // 현재 사용자 정보 가져오기
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: '인증이 필요합니다.' };
    }

    // 1. 사용자 상태를 active로 변경
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'active'
      })
      .eq('id', requestId)
      .eq('status', 'pending');

    if (updateError) {
      console.error('가입 요청 승인 중 오류:', updateError);
      return { success: false, error: '가입 요청 승인 중 오류가 발생했습니다.' };
    }

    // 2. students 테이블이 존재하는지 확인하고 없으면 생성
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('user_id')
      .eq('user_id', requestId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('students 테이블 확인 중 오류:', checkError);
      return { success: false, error: '학생 데이터 확인 중 오류가 발생했습니다.' };
    }

    // students 테이블에 데이터가 없으면 생성, 있으면 assigned_teachers 업데이트
    if (!existingStudent) {
      const { error: createStudentError } = await supabase
        .from('students')
        .insert({
          user_id: requestId,
          parent_id: null,
          current_curriculum_id: null,
          enrollment_start_date: new Date().toISOString().split('T')[0],
          attendance_schedule: null,
          assigned_teachers: []
        });

      if (createStudentError) {
        console.error('students 테이블 생성 중 오류:', createStudentError);
        // users 테이블 상태를 다시 pending으로 롤백
        await supabase
          .from('users')
          .update({ status: 'pending' })
          .eq('id', requestId);
        
        return { success: false, error: '학생 데이터 생성 중 오류가 발생했습니다.' };
      }
    } else {
      // 기존 students 테이블 데이터가 있으면 그대로 유지 (업데이트 불필요)
      console.log('students 테이블에 이미 데이터가 존재합니다. 승인 완료.');
    }

    return { success: true, message: '가입 요청이 승인되었습니다.' };

  } catch (error) {
    console.error('학생 가입 요청 승인 중 오류:', error);
    return { success: false, error: '학생 가입 요청 승인 중 오류가 발생했습니다.' };
  }
}

// 학생 가입 요청 거부 (데이터 정합성 개선)
export async function rejectStudentSignupRequest(requestId: string, rejectionReason?: string) {
  try {
    // 현재 사용자 정보 가져오기
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: '인증이 필요합니다.' };
    }

    // 1. 먼저 students 테이블에서 관련 데이터 삭제
    const { error: studentError } = await supabase
      .from('students')
      .delete()
      .eq('user_id', requestId);

    if (studentError) {
      console.error('students 테이블 삭제 중 오류:', studentError);
      // students 테이블 삭제 실패해도 계속 진행 (데이터가 없을 수도 있음)
    }

    // 2. users 테이블에서 사용자 계정 삭제
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', requestId)
      .eq('status', 'pending');

    if (userError) {
      console.error('가입 요청 거부 중 오류:', userError);
      return { success: false, error: '가입 요청 거부 중 오류가 발생했습니다.' };
    }

    return { success: true, message: '가입 요청이 거부되었습니다.' };

  } catch (error) {
    console.error('학생 가입 요청 거부 중 오류:', error);
    return { success: false, error: '학생 가입 요청 거부 중 오류가 발생했습니다.' };
  }
}

