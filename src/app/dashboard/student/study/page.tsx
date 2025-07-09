"use client";
import { useState } from "react";
import CurriculumUpload from "@/components/curriculum/curriculum-upload";
import CurriculumMemo from "@/components/curriculum/curriculum-memo";
import CurriculumFeedback from "@/components/curriculum/curriculum-feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Circle, Trophy } from "lucide-react";
import { StudentHeading, StudentText, studentButtonStyles } from "../components/StudentThemeProvider";

// TODO: 실제 데이터는 Supabase에서 불러오도록 구현
const mockCurriculums = [
  {
    id: 1,
    title: "파이썬 기초",
    checklist: [
      { id: 1, title: "변수와 데이터타입" },
      { id: 2, title: "조건문과 반복문" },
      { id: 3, title: "함수 정의" },
    ],
  },
  {
    id: 2,
    title: "웹 개발 입문",
    checklist: [
      { id: 1, title: "HTML/CSS" },
      { id: 2, title: "자바스크립트 기초" },
    ],
  },
];

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
  const [progressList, setProgressList] = useState<ProgressItem[][]>([
    [ // 파이썬 기초 (진행 중)
      { done: true, date: "2024-07-05", uploads: [{ id: "1", name: "result1.txt", url: "#", size: 12345, uploadedAt: "2024-07-05" }], feedbacks: [] },
      { done: false, date: "", uploads: [], feedbacks: [] },
      { done: false, date: "", uploads: [], feedbacks: [] },
    ],
    [ // 웹 개발 입문 (완료)
      { done: true, date: "2024-07-01", uploads: [{ id: "a", name: "index.html", url: "#", size: 1000, uploadedAt: "2024-07-01" }], feedbacks: [] },
      { done: true, date: "2024-07-02", uploads: [{ id: "b", name: "main.js", url: "#", size: 2000, uploadedAt: "2024-07-02" }], feedbacks: [] },
    ],
  ]);
  
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [currentUserRole] = useState<"admin" | "teacher" | "parent" | "student">("student");

  // 진행/완료 커리큘럼 분리
  const ongoing = mockCurriculums
    .map((cur, idx) => ({ ...cur, idx, progress: progressList[idx] }))
    .filter(cur => cur.progress.some(step => !step.done));
  const completed = mockCurriculums
    .map((cur, idx) => ({ ...cur, idx, progress: progressList[idx] }))
    .filter(cur => cur.progress.every(step => step.done));

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
    <div className="container mx-auto p-6 max-w-4xl">
      <StudentHeading size="h1" className="mb-6">오늘의 학습</StudentHeading>
      {/* 진행 중인 커리큘럼 */}
      {ongoing.map(cur => (
        <div key={cur.id} className="bg-transparent border-2 border-cyan-400/60 p-6 shadow-[0_0_24px_0_rgba(0,255,255,0.15)] mb-8">
          <h2 className="text-xl font-bold text-cyan-100 mb-4 drop-shadow-[0_0_6px_#00fff7]">{cur.title}</h2>
          <ul className="space-y-4">
            {cur.checklist.map((step, idx) => (
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
                      {cur.checklist.map((step, idx) => (
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