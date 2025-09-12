'use server'

import { supabase } from '@/lib/supabase'

// Supabase Storage에 이미지 업로드
export async function uploadImageToStorage(file: File, folder = 'community'): Promise<string> {
  try {
    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('community')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Image upload error:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('community')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}

// 이미지 삭제
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // folder/filename 형태

    const { error } = await supabase.storage
      .from('community')
      .remove([filePath]);

    if (error) {
      console.error('Image deletion error:', error);
      throw new Error('이미지 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw new Error('이미지 삭제에 실패했습니다.');
  }
}
