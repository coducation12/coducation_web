export interface User {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  avatar?: string;
  email?: string;
  grade?: number;
  phone?: string;
  academy?: string;
  birth_year?: number;
  profile_image_url?: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  images?: string[];
  user_id: string;
  author: User;
  created_at: string;
  comments_count: number;
}

export interface CommunityComment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  author: User;
  created_at: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  postsPerPage: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
}

export interface PostFormData {
  title: string;
  content: string;
  images?: string[];
}

export interface CommentFormData {
  content: string;
}

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface RoleConfig {
  label: string;
  color: string;
  bgColor: string;
}
