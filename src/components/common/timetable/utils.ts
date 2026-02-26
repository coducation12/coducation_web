import { TimetableStudent } from "@/hooks/use-timetable";

export const timeSlots = [
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
];

export const days = ['월', '화', '수', '목', '금', '토', '일'];

export const dayToNumber: { [key: string]: number } = {
    '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0
};

export const normalizeTimeToHour = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    return `${hour.toString().padStart(2, '0')}:00`;
};

export const getStudentsForTimeSlot = (students: TimetableStudent[], day: string, timeSlot: string) => {
    const dayNumber = dayToNumber[day];

    return students
        .filter(student => {
            const schedule = student.schedule;
            const timeData = schedule[dayNumber] || schedule[dayNumber.toString()];
            if (!timeData) return false;

            return normalizeTimeToHour(timeData.startTime) === timeSlot;
        })
        .map(student => {
            const schedule = student.schedule;
            const timeData = schedule[dayNumber] || schedule[dayNumber.toString()];
            return {
                ...student,
                teacherId: timeData?.teacherId || student.teacherId
            };
        })
        .sort((a, b) => a.teacherId.localeCompare(b.teacherId));
};
