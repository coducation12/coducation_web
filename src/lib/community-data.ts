export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: 'student' | 'parent' | 'teacher' | 'admin';
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    role: 'student' | 'parent' | 'teacher' | 'admin';
    avatar?: string;
  };
  createdAt: string;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    title: '타자 연습 팁 공유합니다',
    content: `타자 연습할 때 유용한 팁들을 공유해드릴게요. 정확도보다 속도에 집중하시는 분들이 많은데, 처음에는 정확도를 높이는 것이 중요합니다.

**1. 올바른 자세**
- 손목을 자연스럽게 놓고, 팔꿈치를 90도로 유지하세요
- 키보드에서 손을 떼지 말고 항상 기본 위치에 두세요

**2. 정확도 우선**
- 처음에는 천천히 정확하게 타이핑하는 연습을 하세요
- 속도는 정확도가 높아진 후에 자연스럽게 따라옵니다

**3. 꾸준한 연습**
- 하루에 30분씩 꾸준히 연습하는 것이 효과적입니다
- 다양한 텍스트로 연습하여 실력을 향상시키세요

**4. 도구 활용**
- 온라인 타자 연습 사이트를 활용하세요
- 자신의 실력을 측정할 수 있는 도구를 사용하세요

이런 팁들을 참고하시면 타자 실력이 크게 향상될 것입니다!`,
    author: {
      name: '김학생',
      role: 'student',
      avatar: '/avatars/student1.jpg'
    },
    createdAt: '2024-01-15T10:30:00Z',
    likes: 12,
    comments: 5
  },
  {
    id: '2',
    title: '자녀 학습 진도에 대한 질문',
    content: `초등학교 3학년 자녀가 있는 학부모입니다. 현재 학습 진도가 적절한지 궁금해서 질문드립니다.

**현재 상황:**
- 아이가 코딩에 관심을 보이고 있습니다
- 학교 수업 외에 추가 학습을 고려하고 있습니다
- 하지만 너무 많은 부담을 주고 싶지 않습니다

**궁금한 점:**
1. 3학년 아이에게 적합한 코딩 교육은 무엇인가요?
2. 하루에 얼마나 시간을 투자하는 것이 적절한가요?
3. 학업과의 균형을 어떻게 맞춰야 할까요?

**우려사항:**
- 아이가 스트레스를 받지 않을까 걱정됩니다
- 다른 과목 학습에 지장이 없을까 고민됩니다

경험이 있으신 분들의 조언을 부탁드립니다.`,
    author: {
      name: '이학부모',
      role: 'parent',
      avatar: '/avatars/parent1.jpg'
    },
    createdAt: '2024-01-14T15:20:00Z',
    likes: 8,
    comments: 12
  },
  {
    id: '3',
    title: '새로운 교육 방법론 소개',
    content: `최근 연구된 새로운 교육 방법론에 대해 소개해드리겠습니다. 개인화 학습과 AI 활용에 대한 내용입니다.

## 개인화 학습의 중요성

모든 학생은 서로 다른 학습 속도와 스타일을 가지고 있습니다. 개인화 학습은 이러한 차이를 인정하고 각 학생에게 맞춤형 교육을 제공하는 방법입니다.

### AI 기술의 활용

**1. 학습 진도 분석**
- AI가 학생의 학습 패턴을 분석하여 최적의 진도를 제안
- 실시간으로 학습 성과를 추적하고 피드백 제공

**2. 맞춤형 콘텐츠**
- 학생의 관심사와 수준에 맞는 학습 자료 자동 생성
- 다양한 난이도의 문제를 제공하여 개인별 맞춤 학습

**3. 적응형 평가**
- 학생의 실력에 따라 문제 난이도 자동 조절
- 정확한 실력 측정과 개선점 제시

## 실제 적용 사례

우리 플랫폼에서는 이러한 AI 기술을 활용하여:
- 개인별 학습 경로 설계
- 실시간 성과 모니터링
- 맞춤형 피드백 제공

을 실현하고 있습니다.

앞으로 더욱 발전된 AI 교육 기술을 통해 모든 학생이 자신의 잠재력을 최대한 발휘할 수 있도록 도와드리겠습니다.`,
    author: {
      name: '박강사',
      role: 'teacher',
      avatar: '/avatars/teacher1.jpg'
    },
    createdAt: '2024-01-13T09:15:00Z',
    likes: 25,
    comments: 8
  },
  {
    id: '4',
    title: '시스템 점검 안내',
    content: `내일 오전 2시부터 4시까지 시스템 점검이 있을 예정입니다. 이용에 불편을 드려 죄송합니다.

## 점검 일정
- **일시**: 2024년 1월 16일 오전 2:00 ~ 4:00
- **소요시간**: 약 2시간
- **영향 범위**: 전체 서비스 일시 중단

## 점검 내용
1. 서버 성능 최적화
2. 보안 시스템 업데이트
3. 새로운 기능 배포 준비
4. 데이터베이스 정리

## 점검 중 이용 불가 서비스
- 로그인/회원가입
- 학습 콘텐츠 이용
- 커뮤니티 게시글 작성
- 타자 연습

## 점검 완료 후
- 모든 서비스가 정상적으로 복구됩니다
- 새로운 기능들이 추가될 예정입니다
- 더욱 안정적이고 빠른 서비스를 제공합니다

점검 시간 동안 불편을 드려 죄송합니다. 더 나은 서비스를 위해 노력하겠습니다.`,
    author: {
      name: '관리자',
      role: 'admin',
      avatar: '/avatars/admin1.jpg'
    },
    createdAt: '2024-01-12T16:45:00Z',
    likes: 3,
    comments: 2
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    content: '정말 유용한 팁이네요! 저도 정확도부터 연습하겠습니다.',
    author: {
      name: '최학생',
      role: 'student',
      avatar: '/avatars/student2.jpg'
    },
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '2',
    content: '3학년 아이에게는 스크래치 같은 블록 코딩부터 시작하는 것을 추천합니다.',
    author: {
      name: '김강사',
      role: 'teacher',
      avatar: '/avatars/teacher2.jpg'
    },
    createdAt: '2024-01-14T16:30:00Z'
  }
];

export const roleColors = {
  student: 'bg-blue-100 text-blue-800',
  parent: 'bg-green-100 text-green-800',
  teacher: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800'
};

export const roleLabels = {
  student: '학생',
  parent: '학부모',
  teacher: '강사',
  admin: '관리자'
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return '방금 전';
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInHours < 48) return '어제';
  return date.toLocaleDateString('ko-KR');
}; 