import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import TeacherProfileClient from "./profile-client";

export const dynamic = 'force-dynamic';

export default async function TeacherProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  // 관리자나 강사만 접근 가능
  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/dashboard");
  }

  // 🌍 서버 사이드에서 강사 추가 정보 조회 (supabaseAdmin으로 RLS 우회)
  const { data: teacherData } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return <TeacherProfileClient user={user} initialTeacherData={teacherData} />;
}