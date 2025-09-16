// 클라이언트에서 사용할 유틸리티 함수들

// 날짜 포맷팅 함수 (한국 시간 기준)
export const formatDate = (dateString: string) => {
  // 저장된 시간이 이미 KST라고 가정하고 처리
  const date = new Date(dateString);
  const now = new Date();
  
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays === 1) return '어제';
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

// 역할별 라벨
export const roleLabels = {
  student: '학생',
  parent: '학부모',
  teacher: '강사',
  admin: '관리자'
};
