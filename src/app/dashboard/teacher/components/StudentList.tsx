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
}

export function StudentList({ students, onAttendanceChange, teacherId, allActiveStudents = [], onRefresh }: StudentListProps) {
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
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-cyan-100 table-auto">
            <thead>
              <tr className="bg-cyan-900/30">
                <th className="px-2 py-2 text-center min-w-[60px]">학생 이름</th>
                <th className="px-2 py-2 text-center min-w-[48px]">수강 요일</th>
                <th className="px-2 py-2 text-center min-w-[80px]">과목</th>
                <th className="px-2 py-2 text-center min-w-[120px] hidden sm:table-cell">수업 과정</th>
                <th className="px-2 py-2 text-center min-w-[70px]">출결</th>
                <th className="px-2 py-2 text-center min-w-[100px]">상세 관리</th>
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
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
