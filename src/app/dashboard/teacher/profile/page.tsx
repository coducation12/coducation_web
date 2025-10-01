import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherProfileClient from "./profile-client";

export default async function TeacherProfilePage() {
  const user = await getAuthenticatedUser();

      if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/dashboard");
  }

  return <TeacherProfileClient user={user} />;
}