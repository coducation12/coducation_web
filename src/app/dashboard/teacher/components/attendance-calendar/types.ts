import { AttendanceStatus } from "../types";

export interface AttendanceRecord {
    id?: string;
    date: string;
    status: AttendanceStatus;
    memo?: string;
    is_makeup?: boolean;
    start_time?: string;
    end_time?: string;
}
