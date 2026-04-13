'use server'

import { supabase, supabaseAdmin } from '@/lib/supabase'

// Supabase Storage에 이미지 업로드 (FormData 사용)
export async function uploadImageToStorage(formData: FormData): Promise<string> {
  try {
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'community';
    
    if (!file) {
      throw new Error('파일이 제공되지 않았습니다.');
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const cleanFileName = file.name.replace(/\s+/g, '_').split('.')[0] || 'upload';
    
    const fileName = `${timestamp}_${cleanFileName}_${randomString}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // File을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 🟢 최적화: 서버 액션에서는 supabaseAdmin을 사용하여 권한 제약 없이 업로드합니다.
    const { data, error } = await supabaseAdmin.storage
      .from('content-images')
      .upload(filePath, uint8Array, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Image upload error:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    // 공개 URL 가져오기
    const { data: urlData } = supabaseAdmin.storage
      .from('content-images')
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
      .from('content-images')
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
