'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Trash2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { StudentSectionTitle, StudentText, studentButtonStyles, studentInputStyles } from "./StudentThemeProvider";
import { getStudentGoals, addStudentGoal, toggleStudentGoal, deleteStudentGoal as deleteStudentGoalAction } from "@/lib/actions";

interface Goal {
  title: string;        // 할 일 제목만
  isCompleted: boolean; // 완료 여부만
}

export function GoalsCard({ studentId, fixedInput, readOnly }: { studentId: string, fixedInput?: boolean, readOnly?: boolean }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [studentId]);

  const fetchGoals = async () => {
    try {
      setError(null);
      const result = await getStudentGoals(studentId);

      if (result.success) {
        setGoals(result.data || []);
      } else {
        throw new Error(result.error || '할 일 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 조회 실패:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    setIsAdding(true);
    setError(null);
    try {
      const result = await addStudentGoal(studentId, newGoal.trim());

      if (result.success) {
        setNewGoal('');
        setGoals(result.data || []);
      } else {
        throw new Error(result.error || '할 일을 추가하는데 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 추가 실패:', error);
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleGoal = async (goalIndex: number) => {
    try {
      setError(null);
      const result = await toggleStudentGoal(studentId, goalIndex);

      if (result.success) {
        setGoals(result.data || []);
      } else {
        throw new Error(result.error || '상태를 변경하는데 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 상태 변경 실패:', error);
      setError(errorMessage);
    }
  };

  const deleteGoal = async (goalIndex: number) => {
    try {
      setError(null);
      const result = await deleteStudentGoalAction(studentId, goalIndex);

      if (result.success) {
        setGoals(result.data || []);
      } else {
        throw new Error(result.error || '할 일을 삭제하는데 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 삭제 실패:', error);
      setError(errorMessage);
    }
  };


  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;

  // 모든 할 일을 한 줄로 표시
  const allGoals = goals;

  return (
    <div className="h-full flex flex-col">
      <StudentSectionTitle icon={<Target className="w-5 h-5" />}>To-Do List</StudentSectionTitle>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
          <StudentText variant="muted" className="text-red-400 text-sm">
            {error}
          </StudentText>
        </div>
      )}

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {/* 할 일 추가 */}
        {!readOnly && !fixedInput && (
          <div className="flex gap-2">
            <Input
              placeholder="새로운 할 일을 입력하세요"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              disabled={isAdding}
              className={studentInputStyles}
            />
            <Button
              onClick={addGoal}
              disabled={isAdding || !newGoal.trim()}
              size="sm"
              className={studentButtonStyles.primary}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* 할 일 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <StudentText variant="muted" className="ml-2">로딩 중...</StudentText>
          </div>
        ) : allGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-8 h-8 mx-auto mb-2 text-cyan-400/50" />
            <StudentText variant="muted">아직 등록된 할 일이 없습니다.</StudentText>
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col min-h-[200px] md:min-h-0">
            {/* 할 일 목록 */}
            <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide min-h-0">
              {allGoals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20 hover:bg-cyan-400/10 transition-colors">
                  {!readOnly && (
                    <Checkbox
                      checked={goal.isCompleted}
                      onCheckedChange={() => toggleGoal(index)}
                      className="text-cyan-400 border-cyan-400"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${goal.isCompleted ? 'text-cyan-400 line-through' : 'text-cyan-100'}`}>
                        {goal.title}
                      </span>
                    </div>
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(index)}
                      className="h-6 w-6 p-0 text-cyan-400/60 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 고정 입력창 */}
        {!readOnly && fixedInput && (
          <div className="flex gap-2 mt-auto pt-4 border-t border-cyan-400/20">
            <Input
              placeholder="새로운 할 일을 입력하세요"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              disabled={isAdding}
              className={studentInputStyles}
            />
            <Button
              onClick={addGoal}
              disabled={isAdding || !newGoal.trim()}
              size="sm"
              className={studentButtonStyles.primary}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 