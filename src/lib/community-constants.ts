import { RoleConfig } from '@/types/community';

export const ROLE_LABELS: Record<string, string> = {
  student: '학생',
  parent: '학부모',
  teacher: '강사',
  admin: '관리자',
};

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  student: {
    label: '학생',
    color: 'text-white',
    bgColor: 'bg-cyan-700',
  },
  parent: {
    label: '학부모',
    color: 'text-white',
    bgColor: 'bg-green-700',
  },
  teacher: {
    label: '강사',
    color: 'text-white',
    bgColor: 'bg-purple-700',
  },
  admin: {
    label: '관리자',
    color: 'text-white',
    bgColor: 'bg-red-700',
  },
};

export const BADGE_COLOR_MAP = {
  student: 'bg-cyan-700 text-white',
  parent: 'bg-green-700 text-white',
  teacher: 'bg-purple-700 text-white',
  admin: 'bg-red-700 text-white',
};

export const PAGINATION_DEFAULTS = {
  POSTS_PER_PAGE: 15,
  COMMENTS_PER_PAGE: 20,
  MAX_VISIBLE_PAGES: 5,
};

export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_POST: 5,
};
