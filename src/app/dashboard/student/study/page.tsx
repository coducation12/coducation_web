"use client";
import { useState, useEffect } from "react";
import CurriculumUpload from "@/components/curriculum/curriculum-upload";
import CurriculumMemo from "@/components/curriculum/curriculum-memo";
import CurriculumFeedback from "@/components/curriculum/curriculum-feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Circle, Trophy } from "lucide-react";
import { StudentHeading, StudentText, studentButtonStyles } from "../components/StudentThemeProvider";
import { supabase } from "@/lib/supabase";

// 커리큘럼 목록 상태 추가
const [curriculums, setCurriculums] = useState<any[]>([]);
useEffect(() => {
  fetchCurriculums();
}, []);

const fetchCurriculums = async () => {
  const { data, error } = await supabase
    .from('curriculums')
    .select('id, title, checklist');
  if (error) {
    setCurriculums([]);
    return;
  }
  // checklist가 string[]이므로 id 부여
  const mapped = (data || []).map((cur: any) => ({
    ...cur,
    checklist: (cur.checklist || []).map((title: string, idx: number) => ({ id: idx + 1, title }))
  }));
  setCurriculums(mapped);
};

interface ProgressItem {
  done: boolean;
  date: string;
  uploads: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  feedbacks: Array<{
    id: string;
    content: string;
    author: {
      name: string;
      role: "admin" | "teacher" | "parent" | "student";
    };
    createdAt: string;
  }>;
}

export default function TodayLearningPage() {
  const [progressList, setProgressList] = useState<ProgressItem[][]>([]);
  useEffect(() => {
    if (!curriculums.length) return;
    fetchProgressList();
  }, [curriculums]);

  const fetchProgressList = async () => {
    // TODO: 실제 로그인 학생 ID로 대체 필요
    const studentId = "1";
    const newProgressList = await Promise.all(curriculums.map(async (cur: any) => {
      const { data: logs } = await supabase
        .from('student_activity_logs')
        .select('memo, date, uploads, feedbacks')
        .eq('student_id', studentId)
        .eq('curriculum_id', cur.id);
      return (cur.checklist || []).map((step: any) => {
        const log = (logs || []).find((l: any) => l.memo?.includes(step.title));
        return {
          done: !!log,
          date: log?.date || '',
          uploads: log?.uploads || [],
          feedbacks: log?.feedbacks || []
        };
      });
    }));
    setProgressList(newProgressList);
  };
  
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [currentUserRole] = useState<"admin" | "teacher" | "parent" | "student">("student");

  // 진행/완료 커리큘럼 분리
  const ongoing = curriculums
    .map((cur: any, idx: number) => ({ ...cur, idx, progress: progressList[idx as number] }))
    .filter((cur: any) => cur.progress.some((step: any) => !step.done));
  const completed = curriculums
    .map((cur: any, idx: number) => ({ ...cur, idx, progress: progressList[idx as number] }))
    .filter((cur: any) => cur.progress.every((step: any) => step.done));

  const handleUpload = async (curIdx: number, stepIndex: number, files: File[]) => {
    const newUploads = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    const newProgressList = [...progressList];
    newProgressList[curIdx] = [...newProgressList[curIdx]];
    newProgressList[curIdx][stepIndex].uploads = [
      ...newProgressList[curIdx][stepIndex].uploads,
      ...newUploads,
    ];
    if (
      newProgressList[curIdx][stepIndex].uploads.length > 0 &&
      !newProgressList[curIdx][stepIndex].done
    ) {
      newProgressList[curIdx][stepIndex].done = true;
      newProgressList[curIdx][stepIndex].date = new Date().toISOString().split('T')[0];
    }
    setProgressList(newProgressList);
  };

  const handleDeleteUpload = (curIdx: number, stepIndex: number, fileId: string) => {
    const newProgressList = [...progressList];
    newProgressList[curIdx] = [...newProgressList[curIdx]];
    newProgressList[curIdx][stepIndex].uploads = newProgressList[curIdx][stepIndex].uploads.filter(
      upload => upload.id !== fileId
    );
    if (newProgressList[curIdx][stepIndex].uploads.length === 0) {
      newProgressList[curIdx][stepIndex].done = false;
      newProgressList[curIdx][stepIndex].date = "";
    }
    setProgressList(newProgressList);
  };

  const handleAddFeedback = async (curIdx: number, stepIndex: number, content: string) => {
    const newFeedback = {
      id: `${Date.now()}`,
      content,
      author: {
        name: "현재 사용자",
        role: currentUserRole,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };
    const newProgressList = [...progressList];
    newProgressList[curIdx] = [...newProgressList[curIdx]];
    newProgressList[curIdx][stepIndex].feedbacks = [
      ...newProgressList[curIdx][stepIndex].feedbacks,
      newFeedback,
    ];
    setProgressList(newProgressList);
  };

  // 완료된 학습 2단 접이식 구현
  const [openedCompleted, setOpenedCompleted] = useState<number | null>(null);
  const [expandedCompletedStep, setExpandedCompletedStep] = useState<{[curId: number]: string | null}>({});

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-16 lg:pt-2">
      <StudentHeading size="h1" className="mb-6">오늘의 학습</StudentHeading>
      {/* 진행 중인 커리큘럼 */}
      {ongoing.map(cur => (
        <div key={cur.id} className="bg-transparent border-2 border-cyan-400/60 p-6 shadow-[0_0_24px_0_rgba(0,255,255,0.15)] mb-8">
          <h2 className="text-xl font-bold text-cyan-100 mb-4 drop-shadow-[0_0_6px_#00fff7]">{cur.title}</h2>
          <ul className="space-y-4">
            {cur.checklist.map((step: any, idx: number) => (
              <li key={step.id} className="bg-transparent border border-cyan-400/40 shadow-[0_0_12px_0_rgba(0,255,255,0.10)]">
                <div
                  className={
                    "flex items-center justify-between cursor-pointer select-none hover:bg-cyan-400/10 transition-colors duration-150 px-4 py-3"
                  }
                  onClick={() => setExpandedStep(expandedStep === `${cur.idx}-${idx}` ? null : `${cur.idx}-${idx}`)}
                >
                  <div className="flex items-center gap-3">
                    {cur.progress[idx].done ? (
                      <CheckCircle className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_#00fff7]" />
                    ) : (
                      <Circle className="w-5 h-5 text-cyan-700" />
                    )}
                    <span className="font-semibold text-cyan-100 text-base drop-shadow-[0_0_4px_#00fff7]">{step.title}</span>
                    {cur.progress[idx].done && (
                      <span className="ml-2 text-xs text-cyan-200 drop-shadow-[0_0_4px_#00fff7]">완료일: {cur.progress[idx].date}</span>
                    )}
                    {cur.progress[idx].uploads.length > 0 && (
                      <span className="ml-2 text-xs text-fuchsia-400 drop-shadow-[0_0_4px_#e946fd]">
                        결과물 {cur.progress[idx].uploads.length}개
                      </span>
                    )}
                  </div>
                </div>
                {expandedStep === `${cur.idx}-${idx}` && (
                  <div className="space-y-4 pt-3 px-4 pb-4 border-t border-cyan-400/20">
                    <CurriculumUpload
                      stepId={step.id}
                      uploads={cur.progress[idx].uploads}
                      onUpload={(files) => handleUpload(cur.idx, idx, files as File[])}
                      onDelete={(fileId) => handleDeleteUpload(cur.idx, idx, fileId)}
                      isAdmin={currentUserRole === "admin"}
                      isCompleted={cur.progress[idx].done}
                    />
                    <CurriculumMemo
                      stepId={step.id}
                      feedbacks={cur.progress[idx].feedbacks}
                      onAddFeedback={(content) => handleAddFeedback(cur.idx, idx, content)}
                      currentUserRole={currentUserRole}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
              {/* 완료된 학습 */}
        <div className="mt-10">
          <div className="flex items-center gap-2 font-bold text-lg mb-2">
            <Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_#ffff00]" />
            <span className="text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">완료된 학습</span>
          </div>
        <ul className="flex flex-col gap-2">
          {completed.length === 0 ? (
            <li className="px-4 py-2 border border-cyan-400/40 text-cyan-400 font-semibold bg-transparent italic">
              아직 완료된 학습이 없습니다.
            </li>
          ) : (
            completed.map(cur => (
              <li key={cur.id} className="mb-4">
                {/* 1단계: 제목만 */}
                <div
                  className="px-4 py-2 min-h-[56px] flex items-center border-2 border-cyan-400/60 text-base font-bold text-cyan-100 bg-transparent cursor-pointer hover:bg-cyan-400/10 transition-colors duration-150 shadow-[0_0_24px_0_rgba(0,255,255,0.15)]"
                  onClick={() => setOpenedCompleted(openedCompleted === cur.id ? null : cur.id)}
                >
                  {cur.title}
                </div>
                {/* 2단계: 상세 카드 */}
                {openedCompleted === cur.id && (
                  <div className="bg-transparent border-2 border-cyan-400/60 p-6 min-h-[120px] shadow-[0_0_24px_0_rgba(0,255,255,0.15)] mt-2">
                    <ul className="space-y-4">
                      {cur.checklist.map((step: any, idx: number) => (
                        <li key={step.id} className="bg-transparent border border-cyan-400/40 shadow-[0_0_12px_0_rgba(0,255,255,0.10)]">
                          <div
                            className={
                              "flex items-center justify-between cursor-pointer select-none hover:bg-cyan-400/10 transition-colors duration-150 px-4 py-3"
                            }
                            onClick={() => setExpandedCompletedStep(prev => ({
                              ...prev,
                              [cur.id]: prev[cur.id] === `${cur.idx}-${idx}` ? null : `${cur.idx}-${idx}`
                            }))}
                          >
                            <div className="flex items-center gap-3">
                              {cur.progress[idx].done ? (
                                <CheckCircle className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_#00fff7]" />
                              ) : (
                                <Circle className="w-5 h-5 text-cyan-700" />
                              )}
                              <span className="font-semibold text-cyan-100 text-xl">{step.title}</span>
                              {cur.progress[idx].done && (
                                <span className="ml-2 text-xs text-cyan-200">완료일: {cur.progress[idx].date}</span>
                              )}
                              {cur.progress[idx].uploads.length > 0 && (
                                <span className="ml-2 text-xs text-fuchsia-400">
                                  결과물 {cur.progress[idx].uploads.length}개
                                </span>
                              )}
                            </div>
                          </div>
                          {expandedCompletedStep[cur.id] === `${cur.idx}-${idx}` && (
                            <div className="space-y-4 pt-3 px-4 pb-4 border-t border-cyan-400/20">
                              <CurriculumUpload
                                stepId={step.id}
                                uploads={cur.progress[idx].uploads}
                                onUpload={() => {}}
                                onDelete={() => {}}
                                isAdmin={false}
                                isCompleted={cur.progress[idx].done}
                              />
                              <CurriculumMemo
                                stepId={step.id}
                                feedbacks={cur.progress[idx].feedbacks}
                                onAddFeedback={() => {}}
                                currentUserRole={currentUserRole}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
} 