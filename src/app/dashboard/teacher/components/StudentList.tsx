'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student, AttendanceStatus } from "./types";

interface StudentListProps {
  students: Student[];
  onAttendanceChange: (id: string, value: AttendanceStatus) => void;
}

export function StudentList({ students, onAttendanceChange }: StudentListProps) {
  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-cyan-100">학생 목록</CardTitle>
        <button
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded transition-colors text-sm"
          onClick={() => alert('추가 기능 준비중')}
        >
          수업추가
        </button>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm text-cyan-100 table-auto">
          <thead>
            <tr className="bg-cyan-900/30">
              <th className="px-2 py-1 text-center min-w-[60px] truncate">학생 이름</th>
              <th className="px-2 py-1 text-center min-w-[48px] truncate">수강 요일</th>
              <th className="px-2 py-1 text-center min-w-[80px] truncate">과목</th>
              <th className="px-2 py-1 text-center min-w-[160px] truncate hidden sm:table-cell">수업 과정</th>
              <th className="px-2 py-1 text-center min-w-[100px] truncate hidden sm:table-cell">연락처</th>
              <th className="px-2 py-1 text-center min-w-[70px] truncate">출결</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={student.id} className={idx % 2 === 0 ? 'bg-cyan-900/10' : ''}>
                <td className="px-2 py-1 text-center min-w-[60px] truncate">{student.name}</td>
                <td className="px-2 py-1 text-center min-w-[48px] truncate">{student.day}</td>
                <td className="px-2 py-1 text-center min-w-[80px] truncate">{student.course}</td>
                <td className="px-2 py-1 text-center min-w-[160px] truncate hidden sm:table-cell">기초 과정</td>
                <td className="px-2 py-1 text-center min-w-[100px] truncate hidden sm:table-cell">{student.phone}</td>
                <td className="px-2 py-1 text-center min-w-[70px] truncate">
                  <select
                    className={`border border-cyan-700 rounded px-2 py-1 focus:outline-none transition-colors duration-200 ${
                      student.attendanceTime.status === 'unregistered' ? 'bg-gray-600 text-white' :
                      student.attendanceTime.status === 'present' ? 'bg-green-600 text-white' :
                      student.attendanceTime.status === 'absent' ? 'bg-red-600 text-white' :
                      student.attendanceTime.status === 'makeup' ? 'bg-yellow-400 text-black' :
                      'bg-gray-900 text-white'
                    }`}
                    value={student.attendanceTime.status}
                    onChange={e => onAttendanceChange(student.id, e.target.value as AttendanceStatus)}
                  >
                    <option value="unregistered"></option>
                    <option value="present">출석</option>
                    <option value="absent">결석</option>
                    <option value="makeup">보강</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
} 