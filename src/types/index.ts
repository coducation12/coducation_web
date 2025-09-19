export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  birth_year?: number;
  phone?: string;
  academy: string;
  assigned_teacher_id?: string;
  status: string;
  created_at: string;
}

export interface Student {
  user_id: string;
  assigned_teachers: string[];
  parent_id?: string;
  tuition_fee?: number;
  current_curriculum_id?: string;
  enrollment_start_date: string;
  enrollment_end_date?: string;
  attendance_schedule?: any;
  created_at: string;
}

export interface Teacher {
  user_id: string;
  bio?: string;
  image?: string;
  certs?: string;
  career?: string;
  created_at: string;
}

export interface Curriculum {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level: '기초' | '중급' | '고급';
  image?: string;
  checklist?: string[];
  created_by?: string;
  public: boolean;
  created_at: string;
}

export interface TypingExercise {
  id: string;
  title: string;
  content: string;
  language: 'Korean' | 'English' | 'Code';
  level: '기초' | '중급' | '고급';
  exercise_type: '자리연습' | '실전연습';
  created_at: string;
}

export interface StudentActivityLog {
  id: string;
  student_id: string;
  date: string;
  attended: boolean;
  typing_score?: number;
  typing_speed?: number;
  typing_language?: 'korean' | 'english';
  result_image?: string;
  result_url?: string;
  result_file?: string;
  memo?: string;
  created_at: string;
}

export interface TuitionPayment {
  id: string;
  student_id: string;
  amount: number;
  paid_at: string;
  note?: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_notice: boolean;
  created_at: string;
  author_name?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  course: string;
  content: string;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  profile_image: string;
  subject?: string;
  certs?: string;
  career?: string;
  email?: string;
  phone?: string;
}

export interface Consultation {
  id: number;
  name: string;
  phone: string;
  academy: string;
  subject: string;
  message: string;
  privacy_consent: boolean;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
  responded_at?: string;
  response_note?: string;
}
