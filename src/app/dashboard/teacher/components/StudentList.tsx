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
}

export function StudentList({ students, onAttendanceChange, teacherId, allActiveStudents = [], onRefresh, onStudentClick }: StudentListProps) {
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
          <table className="w-full text-[13px] sm:text-sm text-cyan-100 table-auto">
            <thead>
              <tr className="bg-cyan-900/30">
                <th className="px-2 py-2 text-center min-w-[50px]">
                    <span className="md:hidden">이름</span>
                    <span className="hidden md:inline">학생 이름</span>
                </th>
                <th className="px-2 py-2 text-center min-w-[40px]">
                    <span className="md:hidden">요일</span>
                    <span className="hidden md:inline">수강 요일</span>
                </th>
                <th className="px-2 py-2 text-center min-w-[80px] hidden sm:table-cell">과목</th>
                <th className="px-2 py-2 text-center min-w-[120px] hidden lg:table-cell">학습 진도</th>
                <th className="px-2 py-2 text-center min-w-[60px]">
                    <span className="md:hidden">출결</span>
                    <span className="hidden md:inline">출결 상태</span>
                </th>
                <th className="px-2 py-2 text-center min-w-[80px]">
                    <span className="md:hidden">상세</span>
                    <span className="hidden md:inline">상세 관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  idx={idx}
                  onAttendanceChange={onAttendanceChange}
                  teacherId={teacherId}
                  onStudentClick={onStudentClick}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

