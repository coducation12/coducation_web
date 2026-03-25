'use client';

import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import SubjectManager from "./components/SubjectManager";

export const dynamic = 'force-dynamic';

export default function AdminSubjectsPage() {
    return (
        <DashboardPageWrapper>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,255,247,0.5)]">
                            과목 <span className="text-cyan-400">관리</span>
                        </h1>
                    </div>
                </div>
                
                <SubjectManager />
            </div>
        </DashboardPageWrapper>
    );
}
