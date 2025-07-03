export type UserRole = 'student' | 'parent' | 'teacher' | 'admin_main' | 'admin_sub';

export interface UserProfile {
  id: string; // auth.users.id
  name: string;
  role: UserRole;
}

export interface Student extends UserProfile {
  role: 'student';
  temp_id?: string;
  assigned_teacher?: string; // teacher's id
  curriculum_id?: string; // curriculum's id
}

export interface Parent extends UserProfile {
  role: 'parent';
  child_id: string; // student's id
}

export interface Teacher extends UserProfile {
  role: 'teacher';
  bio?: string;
  profile_image?: string;
  assigned_students: string[]; // array of student ids
}

export interface Admin extends UserProfile {
  role: 'admin_main' | 'admin_sub';
}

export type User = Student | Parent | Teacher | Admin;

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  level: '기초' | '중급' | '고급';
  created_by: string; // teacher's id
  public: boolean;
  created_at: string;
  image?: string; // Added for UI
}

export interface AttendanceLog {
  id: string;
  student_id: string;
  date: string;
  completed: boolean;
  typing_score?: number;
  typing_duration_seconds?: number;
  level?: string;
  created_at: string;
}

export interface ClassReport {
  id: string;
  student_id: string;
  curriculum_id: string;
  report_date: string;
  report_type: 'image' | 'link';
  content: string;
  submitted_by: string; // teacher's id
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_notice: boolean;
  created_at: string;
  author_name?: string; // For display
}

export interface TypingExercise {
  id: string;
  language: 'Korean' | 'English' | 'Code';
  level: '기초' | '중급' | '고급';
  content: string;
  created_at: string;
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
  assigned_students_count: number;
}

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin_main' | 'admin_sub';

export interface UserProfile {
  id: string; // auth.users.id
  name: string;
  role: UserRole;
}

export interface Student extends UserProfile {
  role: 'student';
  temp_id?: string;
  assigned_teacher?: string; // teacher's id
  curriculum_id?: string; // curriculum's id
}

export interface Parent extends UserProfile {
  role: 'parent';
  child_id: string; // student's id
}

export interface Teacher extends UserProfile {
  role: 'teacher';
  bio?: string;
  profile_image?: string;
  assigned_students: string[]; // array of student ids
}

export interface Admin extends UserProfile {
  role: 'admin_main' | 'admin_sub';
}

export type User = Student | Parent | Teacher | Admin;

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  level: '기초' | '중급' | '수련';
  created_by: string; // teacher's id
  public: boolean;
  created_at: string;
  image?: string; // Added for UI
}

export interface AttendanceLog {
  id: string;
  student_id: string;
  date: string;
  completed: boolean;
  typing_score?: number;
  typing_duration_seconds?: number;
  level?: string;
  created_at: string;
}

export interface ClassReport {
  id: string;
  student_id: string;
  curriculum_id: string;
  report_date: string;
  report_type: 'image' | 'link';
  content: string;
  submitted_by: string; // teacher's id
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_notice: boolean;
  created_at: string;
  author_name?: string; // For display
}

export interface TypingExercise {
  id: string;
  language: 'Korean' | 'English' | 'Code';
  level: '기초' | '중급' | '수련';
  content: string;
  created_at: string;
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
  assigned_students_count: number;
}
