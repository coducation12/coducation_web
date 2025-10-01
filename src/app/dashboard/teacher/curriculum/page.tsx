// TODO: 강사 커리큘럼 페이지 완성 후 활성화 예정
// import CurriculumManager from "@/components/curriculum/CurriculumManager";

export default function TeacherCurriculumPage() {
    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-400 mb-4">커리큘럼 관리</h1>
                    <p className="text-gray-500 text-lg">현재 페이지는 개발 중입니다.</p>
                    <p className="text-gray-500 text-sm mt-2">곧 이용하실 수 있습니다.</p>
                </div>
            </div>
        </div>
    );
    // return <CurriculumManager userRole="teacher" />;
} 