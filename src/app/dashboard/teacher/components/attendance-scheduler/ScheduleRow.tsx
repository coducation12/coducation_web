import React from 'react';
import { Student, STATUS_CONFIG, AttendanceSession } from '../types';
import { timeToIndex } from './utils';

interface ScheduleRowProps {
    student: Student;
    rowIdx: number;
    isMobile?: boolean;
    updatingIds: Set<string>;
}

export const ScheduleRow = React.memo(({ student, rowIdx, isMobile = false, updatingIds }: ScheduleRowProps) => {
    // 배지 스타일 로직 (세션별로 다를 수 있음)
    const getBadgeStyle = (session: AttendanceSession) => {
        const status = session.attendanceTime.status;
        
        if (session.isMakeup) {
            if (status === 'unregistered') {
                return 'bg-transparent border-yellow-500/50 text-yellow-500/70';
            }
            if (status === 'present') {
                return 'bg-yellow-500 border-yellow-400 text-black';
            }
            if (status === 'absent') {
                return 'bg-red-500/20 border-red-500 text-red-500';
            }
        }
        return STATUS_CONFIG[status].color;
    };

    if (isMobile) {
        return (
            <div className={`flex flex-col px-4 py-2 border-b border-cyan-500/20 ${rowIdx % 2 === 0 ? 'bg-cyan-900/10' : ''}`}>
                <div className="text-cyan-100 text-sm font-bold mb-2">
                    {student.name}
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {student.sessions.map((session) => {
                        const isUpdating = updatingIds.has(session.id);
                        return (
                            <div key={session.id} className="inline-block">
                                <div className={`px-3 py-1.5 rounded border-2 flex items-center justify-center transition-all duration-300 
                                    ${isUpdating ? 'opacity-50 animate-pulse cursor-wait' : ''}
                                    ${getBadgeStyle(session)}`
                                }>
                                    <span className="text-[10px] sm:text-xs font-bold tracking-wider">
                                        {isUpdating ? '갱신 중...' : `${session.isMakeup ? '[보강] ' : ''}${session.attendanceTime.start} ~ ${session.attendanceTime.end}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 데스크톱 뷰: 겹치는 세션들을 트랙(라인)별로 분리
    const sessionInfos = student.sessions
        .map(s => ({
            id: s.id,
            startIdx: timeToIndex(s.attendanceTime.start),
            endIdx: timeToIndex(s.attendanceTime.end),
            session: s
        }))
        .sort((a, b) => a.startIdx - b.startIdx);

    const tracks: typeof sessionInfos[] = [];
    sessionInfos.forEach(session => {
        let placed = false;
        for (const track of tracks) {
            const lastSession = track[track.length - 1];
            // 이전 세션이 끝난 후(또는 같이 끝나는 시점)에 시작하면 같은 트랙에 배치 가능
            if (session.startIdx >= lastSession.endIdx) {
                track.push(session);
                placed = true;
                break;
            }
        }
        if (!placed) {
            tracks.push([session]);
        }
    });

    // 트랙이 없으면 빈 행 표시 (최소 1개 가상 트랙)
    const effectiveTracks = tracks.length > 0 ? tracks : [[]];

    return (
        <React.Fragment>
            {/* 학생 이름 셀: 트랙 수만큼 병합 */}
            <div
                className="flex items-center justify-center px-2 border-b border-cyan-500/20 text-cyan-100 text-sm font-medium text-center min-w-0 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ 
                    gridRow: `span ${effectiveTracks.length}`,
                    background: rowIdx % 2 === 0 ? 'rgba(8, 40, 80, 0.1)' : 'transparent'
                }}
            >
                {student.name}
            </div>

            {/* 각 트랙별 렌더링 */}
            {effectiveTracks.map((track, trackIdx) => (
                <React.Fragment key={`${student.userId}-track-${trackIdx}`}>
                    {Array.from({ length: 32 }).map((_, colIdx) => {
                        const sessionToStart = track.find(si => si.startIdx === colIdx);
                        
                        if (sessionToStart) {
                            const colSpan = sessionToStart.endIdx - sessionToStart.startIdx;
                            const isUpdating = updatingIds.has(sessionToStart.id);
                            return (
                                <div
                                    key={sessionToStart.id + '-bar'}
                                    className={`relative h-8 flex items-center justify-center border-b border-cyan-500/20 ${rowIdx % 2 === 0 ? 'bg-cyan-900/10' : ''}`}
                                    style={{ gridColumn: `span ${colSpan}`, zIndex: 1 }}
                                >
                                    <div className={`w-full h-6 rounded border-2 flex items-center justify-center transition-all duration-300 
                                        ${isUpdating ? 'opacity-50 animate-pulse cursor-wait' : ''}
                                        ${getBadgeStyle(sessionToStart.session)}
                                    `}>
                                        <span className="text-[8px] sm:text-[10px] md:text-xs opacity-80 leading-tight w-full text-center select-none truncate px-1 font-bold">
                                            <span className="hidden sm:inline">{sessionToStart.session.attendanceTime.start}~{sessionToStart.session.attendanceTime.end}</span>
                                            <span className="sm:hidden">{sessionToStart.session.attendanceTime.start}</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        }

                        const isInsideAny = track.some(si => colIdx > si.startIdx && colIdx < si.endIdx);
                        if (isInsideAny) return null;

                        return (
                            <div
                                key={`${student.userId}-empty-${trackIdx}-${colIdx}`}
                                className={`h-8 border-b border-cyan-500/20 ${rowIdx % 2 === 0 ? 'bg-cyan-900/10' : ''}`}
                                style={{
                                    borderLeft: colIdx % 4 === 0 ? '1px dashed #67e8f9' : undefined,
                                }}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </React.Fragment>
    );
});

ScheduleRow.displayName = 'ScheduleRow';

ScheduleRow.displayName = 'ScheduleRow';
