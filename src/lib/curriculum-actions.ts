'use server';

import { supabase } from './supabase';
import type { Curriculum } from '@/types';

// Supabase 연결 상태 확인
function checkSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key || url === 'https://your-project.supabase.co' || key === 'your-anon-key') {
    throw new Error('Supabase 환경 변수가 올바르게 설정되지 않았습니다.');
  }
}

// 커리큘럼 조회 (공개된 것만)
export async function getPublicCurriculums(): Promise<Curriculum[]> {
  try {
    checkSupabaseConnection();
    
    const { data, error } = await supabase
      .from('curriculums')
      .select(`
        *,
        teachers:created_by(name)
      `)
      .eq('public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('커리큘럼 조회 오류:', error);
      return [];
    }

    return data?.map(curriculum => ({
      ...curriculum,
      created_at: curriculum.created_at,
      author_name: curriculum.teachers?.name
    })) || [];
  } catch (error) {
    console.error('커리큘럼 조회 중 오류:', error);
    return [];
  }
}

// 레벨별 커리큘럼 조회
export async function getCurriculumsByLevel(level: '기초' | '중급' | '고급'): Promise<Curriculum[]> {
  try {
    checkSupabaseConnection();
    
    const { data, error } = await supabase
      .from('curriculums')
      .select(`
        *,
        teachers:created_by(name)
      `)
      .eq('public', true)
      .eq('level', level)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('레벨별 커리큘럼 조회 오류:', error);
      return [];
    }

    return data?.map(curriculum => ({
      ...curriculum,
      created_at: curriculum.created_at,
      author_name: curriculum.teachers?.name
    })) || [];
  } catch (error) {
    console.error('레벨별 커리큘럼 조회 중 오류:', error);
    return [];
  }
}

// 강사별 커리큘럼 조회
export async function getCurriculumsByTeacher(teacherId: string): Promise<Curriculum[]> {
  try {
    checkSupabaseConnection();
    
    const { data, error } = await supabase
      .from('curriculums')
      .select(`
        *,
        teachers:created_by(name)
      `)
      .eq('created_by', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('강사별 커리큘럼 조회 오류:', error);
      return [];
    }

    return data?.map(curriculum => ({
      ...curriculum,
      created_at: curriculum.created_at,
      author_name: curriculum.teachers?.name
    })) || [];
  } catch (error) {
    console.error('강사별 커리큘럼 조회 중 오류:', error);
    return [];
  }
}

// 커리큘럼 생성 (강사/관리자용)
export async function createCurriculum(curriculum: Omit<Curriculum, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    checkSupabaseConnection();
    
    const { error } = await supabase
      .from('curriculums')
      .insert({
        title: curriculum.title,
        description: curriculum.description,
        level: curriculum.level,
        created_by: curriculum.created_by,
        public: curriculum.public,
        image: curriculum.image
      });

    if (error) {
      console.error('커리큘럼 생성 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('커리큘럼 생성 중 오류:', error);
    return { success: false, error: '커리큘럼 생성에 실패했습니다.' };
  }
}

// 커리큘럼 수정 (강사/관리자용)
export async function updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<{ success: boolean; error?: string }> {
  try {
    checkSupabaseConnection();
    
    const { error } = await supabase
      .from('curriculums')
      .update({
        title: updates.title,
        description: updates.description,
        level: updates.level,
        public: updates.public,
        image: updates.image
      })
      .eq('id', id);

    if (error) {
      console.error('커리큘럼 수정 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('커리큘럼 수정 중 오류:', error);
    return { success: false, error: '커리큘럼 수정에 실패했습니다.' };
  }
}

// 커리큘럼 삭제 (강사/관리자용)
export async function deleteCurriculum(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    checkSupabaseConnection();
    
    const { error } = await supabase
      .from('curriculums')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('커리큘럼 삭제 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('커리큘럼 삭제 중 오류:', error);
    return { success: false, error: '커리큘럼 삭제에 실패했습니다.' };
  }
}

// 커리큘럼 이미지 업로드
export async function uploadCurriculumImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    checkSupabaseConnection();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `curriculum-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('이미지 업로드 오류:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('이미지 업로드 중 오류:', error);
    return { success: false, error: '이미지 업로드에 실패했습니다.' };
  }
} 