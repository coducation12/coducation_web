import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          academy?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          name: string;
          role: 'student' | 'parent' | 'teacher' | 'admin';
          birth_year?: number;
          academy?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          name?: string;
          role?: 'student' | 'parent' | 'teacher' | 'admin';
          birth_year?: number;
          academy?: string;
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