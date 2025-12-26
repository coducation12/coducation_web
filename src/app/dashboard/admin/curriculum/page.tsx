import CurriculumManager from "@/components/curriculum/CurriculumManager";

export const dynamic = 'force-dynamic';

export default function AdminCurriculumPage() {
    return <CurriculumManager userRole="admin" />;
} 