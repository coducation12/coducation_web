import { StudentHeading } from "../components/StudentThemeProvider";

export default function TodayLearningPage() {
  // TODO: 학생 학습하기 페이지 완성 후 활성화 예정
  return (
    <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <StudentHeading size="h1" className="mb-4 text-gray-400">오늘의 학습</StudentHeading>
          <p className="text-gray-500 text-lg">현재 페이지는 개발 중입니다.</p>
          <p className="text-gray-500 text-sm mt-2">곧 이용하실 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
} 