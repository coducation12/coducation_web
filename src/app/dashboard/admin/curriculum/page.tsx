import CurriculumManager from "@/components/curriculum/CurriculumManager";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";

export const dynamic = 'force-dynamic';

export default function AdminCurriculumPage() {
    return (
        <DashboardPageWrapper>
            <CurriculumManager userRole="admin" />
        </DashboardPageWrapper>
    );
} 