import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student, AttendanceStatus } from "./types";
import { MakeupSessionModal } from "./MakeupSessionModal";
import { StudentRow } from "./StudentRow";

interface StudentListProps {
  students: Student[];
  onAttendanceChange: (id: string, value: AttendanceStatus) => void;
  teacherId?: string | null;
  allActiveStudents?: { id: string, name: string }[];
  onRefresh?: () => void;
  onStudentClick: (userId: string) => void;
  onProgressClick: (userId: string, userName: string) => void;
  refreshTrigger?: number;
  updatingIds: Set<string>;
}

export function StudentList({ 
  students, 
  onAttendanceChange, 
  teacherId, 
  allActiveStudents = [], 
  onRefresh, 
  onStudentClick,
  onProgressClick,
  refreshTrigger = 0,
  updatingIds
}: StudentListProps) {
  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 mt-8">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-cyan-100">출석부</CardTitle>
        <MakeupSessionModal
          students={allActiveStudents}
          teacherId={teacherId || undefined}
          onSuccess={onRefresh || (() => { })}
        />
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] sm:text-sm text-cyan-100 table-fixed">
            <thead>
              <tr className="bg-cyan-900/30">
                <th className="px-2 py-2 text-center w-[14.28%]">
                    <span className="md:hidden">이름</span>
                    <span className="hidden md:inline">학생 이름</span>
                </th>
                <th className="px-2 py-2 text-center w-[14.28%]">
                    <span className="md:hidden">요일</span>
                    <span className="hidden md:inline">수강 요일</span>
                </th>
                <th className="px-2 py-2 text-center w-[14.28%] hidden sm:table-cell">학습 과목</th>
                <th className="px-2 py-2 text-center w-[14.28%]">
                    <span className="md:hidden">출결</span>
                    <span className="hidden md:inline">출결 상태</span>
                </th>
                <th className="px-2 py-2 text-center w-[14.28%]">출결 기록</th>
                <th className="px-2 py-2 text-center w-[14.28%]">출결 캘린더</th>
                <th className="px-2 py-2 text-center w-[14.28%]">학습 진도</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <StudentRow
                  key={student.userId}
                  student={student}
                  idx={idx}
                  onAttendanceChange={onAttendanceChange}
                  teacherId={teacherId}
                  onStudentClick={onStudentClick}
                  onProgressClick={onProgressClick}
                  onRefresh={onRefresh}
                  refreshTrigger={refreshTrigger}
                  updatingIds={updatingIds}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

