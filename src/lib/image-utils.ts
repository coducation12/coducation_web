/**
 * 이미지 압축 및 리사이징 유틸리티
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'webp' | 'png';
}

/**
 * 이미지 파일을 압축하고 리사이징합니다
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 이미지 Blob
 */
export async function compressImage(
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    outputFormat = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // 원본 크기
        let { width, height } = img;

        // 비율을 유지하면서 크기 조정
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Canvas 크기 설정
        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기 (고품질 설정)
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Blob으로 변환
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('이미지 압축에 실패했습니다.'));
              }
            },
            outputFormat === 'jpeg' ? 'image/jpeg' : 
            outputFormat === 'webp' ? 'image/webp' : 'image/png',
            quality
          );
        } else {
          reject(new Error('Canvas context를 가져올 수 없습니다.'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    // 파일을 이미지로 로드
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 이미지 파일을 Base64로 압축합니다
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 Base64 문자열
 */
export async function compressImageToBase64(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    outputFormat = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // 원본 크기
        let { width, height } = img;

        // 비율을 유지하면서 크기 조정
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Canvas 크기 설정
        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기 (고품질 설정)
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Base64로 변환
          const dataUrl = canvas.toDataURL(
            outputFormat === 'jpeg' ? 'image/jpeg' : 
            outputFormat === 'webp' ? 'image/webp' : 'image/png',
            quality
          );

          resolve(dataUrl);
        } else {
          reject(new Error('Canvas context를 가져올 수 없습니다.'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    // 파일을 이미지로 로드
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 * @param bytes 바이트 크기
 * @returns 포맷된 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 이미지 파일 유효성 검사
 * @param file 검사할 파일
 * @param maxSize 최대 크기 (바이트)
 * @returns 유효성 검사 결과
 */
export function validateImageFile(file: File, maxSize: number = 10 * 1024 * 1024) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `파일 크기는 ${formatFileSize(maxSize)} 이하여야 합니다.`
    };
  }

  return { valid: true };
}

