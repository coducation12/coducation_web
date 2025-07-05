"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Feedback {
  id: string;
  content: string;
  author: {
    name: string;
    role: "admin" | "teacher" | "parent" | "student";
  };
  createdAt: string;
}

interface CurriculumFeedbackProps {
  stepId: number;
  feedbacks: Feedback[];
  onAddFeedback: (content: string) => void;
  currentUserRole: "admin" | "teacher" | "parent" | "student";
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

export default function CurriculumFeedback({ 
  stepId, 
  feedbacks, 
  onAddFeedback, 
  currentUserRole 
}: CurriculumFeedbackProps) {
  const [newFeedback, setNewFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newFeedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddFeedback(newFeedback);
      setNewFeedback("");
    } catch (error) {
      console.error("피드백 작성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-cyan-200">피드백</h4>
      
      {/* 피드백 목록 */}
      <div className="space-y-3">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-cyan-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${roleColors[feedback.author.role]} text-white text-xs`}>
                {roleNames[feedback.author.role]}
              </Badge>
              <span className="text-cyan-200 text-sm font-medium">{feedback.author.name}</span>
              <span className="text-cyan-400 text-xs">{feedback.createdAt}</span>
            </div>
            <p className="text-cyan-100 text-sm">{feedback.content}</p>
          </div>
        ))}
      </div>

      {/* 피드백 작성 */}
      <div className="space-y-2">
        <Textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="피드백을 작성하세요..."
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
            {isSubmitting ? "작성 중..." : "피드백 작성"}
          </Button>
        </div>
      </div>
    </div>
  );
} 