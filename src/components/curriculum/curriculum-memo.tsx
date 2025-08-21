"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface Feedback {
  id: string;
  content: string;
  author: {
    name: string;
    role: "admin" | "teacher" | "parent" | "student";
  };
  createdAt: string;
}

interface CurriculumMemoProps {
  stepId: number;
  feedbacks: Feedback[];
  onAddFeedback: (content: string) => void;
  onDeleteFeedback?: (feedbackId: string) => void;
  currentUserRole: "admin" | "teacher" | "parent" | "student";
  currentUserName?: string;
}

const roleColors = {
  admin: "bg-red-600",
  teacher: "bg-blue-600", 
  parent: "bg-green-600",
  student: "bg-purple-600"
};

const roleNames = {
  admin: "관리자",
  teacher: "강사",
  parent: "학부모", 
  student: "학생"
};

export default function CurriculumMemo({
  stepId,
  feedbacks,
  onAddFeedback,
  onDeleteFeedback,
  currentUserRole,
  currentUserName
}: CurriculumMemoProps) {
  const [newFeedback, setNewFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newFeedback.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddFeedback(newFeedback);
      setNewFeedback("");
    } catch (error) {
      console.error("작성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (feedbackId: string) => {
    if (onDeleteFeedback) {
      onDeleteFeedback(feedbackId);
    }
  };

  const isOwnFeedback = (feedback: Feedback) => {
    // 기존 메모의 작성자 정보가 비어있는 경우 처리
    if (!feedback.author || !feedback.author.name || feedback.author.name === "현재 사용자") {
      return false;
    }
    
    const isOwn = feedback.author.name === currentUserName && feedback.author.role === currentUserRole;
    console.log('본인 확인:', {
      feedbackAuthor: feedback.author,
      currentUserName,
      currentUserRole,
      isOwn
    });
    return isOwn;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-cyan-200">메모/피드백</h4>
      {/* 목록 */}
      <div className="space-y-3">
        {feedbacks.length === 0 && (
          <div className="text-cyan-400 text-sm italic">아직 작성된 메모/피드백이 없습니다.</div>
        )}
        {feedbacks.map((feedback) => {
          const shouldShowDelete = isOwnFeedback(feedback) && onDeleteFeedback;
          console.log('삭제 버튼 조건:', {
            feedbackId: feedback.id,
            isOwnFeedback: isOwnFeedback(feedback),
            onDeleteFeedback: !!onDeleteFeedback,
            shouldShow: shouldShowDelete
          });
          
          return (
            <div key={feedback.id} className="bg-cyan-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${roleColors[feedback.author.role]} text-white text-xs`}>
                    {roleNames[feedback.author.role]}
                  </Badge>
                  <span className="text-cyan-200 text-sm font-medium">{feedback.author.name}</span>
                  <span className="text-cyan-400 text-xs">{feedback.createdAt}</span>
                </div>
                {shouldShowDelete && (
                  <Button
                    onClick={() => handleDelete(feedback.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-cyan-100 text-sm whitespace-pre-wrap">{feedback.content}</p>
            </div>
          );
        })}
      </div>
      {/* 입력란 */}
      <div className="space-y-2">
        <Textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="메모 또는 피드백을 작성하세요..."
          className="bg-[#1a2a3a] text-cyan-100 border-cyan-400/30 min-h-[80px]"
        />
        <div className="flex justify-between items-center">
          <Badge className={`${roleColors[currentUserRole]} text-white text-xs`}>
            {roleNames[currentUserRole]}
          </Badge>
          <Button
            onClick={handleSubmit}
            disabled={!newFeedback.trim() || isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
          >
            {isSubmitting ? "작성 중..." : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
} 