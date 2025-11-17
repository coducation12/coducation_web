import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 싱글톤 패턴으로 클라이언트 인스턴스 관리
let supabaseInstance: any = null;
let supabaseAdminInstance: any = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
})();

// Service Role Key를 사용하는 관리자용 클라이언트
// 환경 변수가 없을 때는 일반 클라이언트를 사용
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    if (supabaseServiceKey) {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      supabaseAdminInstance = supabase; // Service Role Key가 없으면 일반 클라이언트 사용
    }
  }
  return supabaseAdminInstance;
})();

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          name: string;
          role: 'student' | 'parent' | 'teacher' | 'admin';
          birth_year?: number;
          phone?: string;
          academy: string;
          assigned_teacher_id?: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          name: string;
          role: 'student' | 'parent' | 'teacher' | 'admin';
          birth_year?: number;
          phone?: string;
          academy: string;
          assigned_teacher_id?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          name?: string;
          role?: 'student' | 'parent' | 'teacher' | 'admin';
          birth_year?: number;
          phone?: string;
          academy?: string;
          assigned_teacher_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      students: {
        Row: {
          user_id: string;
          assigned_teachers: string[];
          parent_id?: string;
          tuition_fee?: number;
          current_curriculum_id?: string;
          enrollment_start_date: string;
          enrollment_end_date?: string;
          attendance_schedule?: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          assigned_teachers: string[];
          parent_id?: string;
          tuition_fee?: number;
          current_curriculum_id?: string;
          enrollment_start_date: string;
          enrollment_end_date?: string;
          attendance_schedule?: any;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          assigned_teachers?: string[];
          parent_id?: string;
          tuition_fee?: number;
          current_curriculum_id?: string;
          enrollment_start_date?: string;
          enrollment_end_date?: string;
          attendance_schedule?: any;
          created_at?: string;
        };
      };
      curriculums: {
        Row: {
          id: string;
          title: string;
          description?: string;
          category?: string;
          level: '기초' | '중급' | '고급';
          image?: string;
          checklist?: string[];
          created_by?: string;
          public: boolean;
          show_on_main?: boolean;
          main_display_order?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category?: string;
          level: '기초' | '중급' | '고급';
          image?: string;
          checklist?: string[];
          created_by?: string;
          public: boolean;
          show_on_main?: boolean;
          main_display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          level?: '기초' | '중급' | '고급';
          image?: string;
          checklist?: string[];
          created_by?: string;
          public?: boolean;
          show_on_main?: boolean;
          main_display_order?: number;
          created_at?: string;
        };
      };
      typing_exercises: {
        Row: {
          id: string;
          title: string;
          content: string;
          language: 'Korean' | 'English' | 'Code';
          level: '기초' | '중급' | '고급';
          exercise_type: '자리연습' | '실전연습';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          language: 'Korean' | 'English' | 'Code';
          level: '기초' | '중급' | '고급';
          exercise_type: '자리연습' | '실전연습';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          language?: 'Korean' | 'English' | 'Code';
          level?: '기초' | '중급' | '고급';
          exercise_type?: '자리연습' | '실전연습';
          created_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          images?: string[];
          is_deleted?: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          images?: string[];
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          images?: string[];
          is_deleted?: boolean;
          created_at?: string;
        };
      };
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          is_deleted?: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          is_deleted?: boolean;
          created_at?: string;
        };
      };
    };
  };
} 