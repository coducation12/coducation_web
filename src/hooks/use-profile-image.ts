import { useState, useEffect } from 'react';

export function useProfileImage() {
  const [profileImage, setProfileImage] = useState<string>('');

  useEffect(() => {
    // 로컬 스토리지에서 프로필 이미지 불러오기
    const savedImage = localStorage.getItem('profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // 로컬 스토리지 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profile_image') {
        setProfileImage(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서의 변경도 감지하기 위해 커스텀 이벤트 사용
    const handleCustomStorageChange = () => {
      const savedImage = localStorage.getItem('profile_image');
      setProfileImage(savedImage || '');
    };

    window.addEventListener('profileImageUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageUpdated', handleCustomStorageChange);
    };
  }, []);

  return profileImage;
}
