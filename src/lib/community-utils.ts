// 클라이언트에서 사용할 유틸리티 함수들

// 날짜 포맷팅 함수
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return '방금 전';
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInHours < 48) return '어제';
  return date.toLocaleDateString('ko-KR');
};

// 역할별 라벨
export const roleLabels = {
  student: '학생',
  parent: '학부모',
  teacher: '강사',
  admin: '관리자'
};
