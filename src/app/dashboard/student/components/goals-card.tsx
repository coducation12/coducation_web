'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Trash2, Edit3, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StudentSectionTitle, StudentText, studentButtonStyles, studentInputStyles } from "./StudentThemeProvider";

interface Goal {
  title: string;        // 할 일 제목만
  isCompleted: boolean; // 완료 여부만
}

export function GoalsCard({ studentId, fixedInput, readOnly }: { studentId: string, fixedInput?: boolean, readOnly?: boolean }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [studentId]);

  const fetchGoals = async () => {
    try {
      setError(null);
      
      // Students 테이블에서 todolist 컬럼을 조회
      const { data, error: supabaseError } = await supabase
        .from('students')
        .select('todolist')
        .eq('user_id', studentId)
        .single();

      if (supabaseError) {
        console.error('Supabase 에러:', JSON.stringify(supabaseError, null, 2));
        throw new Error(`데이터베이스 조회 실패: ${supabaseError.message || '알 수 없는 오류'}`);
      }

      // todolist 컬럼이 없거나 null인 경우 빈 배열로 초기화
      const todolistData = data?.todolist || [];
      setGoals(todolistData);
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
      const newGoalData = {
        title: newGoal.trim(),
        isCompleted: false
      };

      // 기존 todolist 배열에 새로운 할 일 추가
      const { data: currentData, error: fetchError } = await supabase
        .from('students')
        .select('todolist')
        .eq('user_id', studentId)
        .single();

      if (fetchError) {
        console.error('기존 할 일 조회 에러:', JSON.stringify(fetchError, null, 2));
        throw new Error(`기존 할 일 조회 실패: ${fetchError.message || '알 수 없는 오류'}`);
      }

      const currentTodolist = currentData?.todolist || [];
      const updatedTodolist = [...currentTodolist, newGoalData];

      // Students 테이블의 todolist 컬럼 업데이트
      const { error: updateError } = await supabase
        .from('students')
        .update({ todolist: updatedTodolist })
        .eq('user_id', studentId);

      if (updateError) {
        console.error('할 일 추가 에러:', JSON.stringify(updateError, null, 2));
        throw new Error(`할 일 추가 실패: ${updateError.message || '알 수 없는 오류'}`);
      }

      setNewGoal('');
      await fetchGoals();
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
      
      // 기존 todolist 배열 조회
      const { data: currentData, error: fetchError } = await supabase
        .from('students')
        .select('todolist')
        .eq('user_id', studentId)
        .single();

      if (fetchError) {
        console.error('기존 할 일 조회 에러:', JSON.stringify(fetchError, null, 2));
        throw new Error(`기존 할 일 조회 실패: ${fetchError.message || '알 수 없는 오류'}`);
      }

      const currentTodolist = currentData?.todolist || [];
      const updatedTodolist = currentTodolist.map((goal: any, index: number) => {
        if (index === goalIndex) {
          return {
            ...goal,
            isCompleted: !goal.isCompleted
          };
        }
        return goal;
      });

      // Students 테이블의 todolist 컬럼 업데이트
      const { error: updateError } = await supabase
        .from('students')
        .update({ todolist: updatedTodolist })
        .eq('user_id', studentId);

      if (updateError) {
        console.error('할 일 상태 변경 에러:', JSON.stringify(updateError, null, 2));
        throw new Error(`할 일 상태 변경 실패: ${updateError.message || '알 수 없는 오류'}`);
      }

      await fetchGoals();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 상태 변경 실패:', error);
      setError(errorMessage);
    }
  };

  const deleteGoal = async (goalIndex: number) => {
    try {
      setError(null);
      
      // 기존 todolist 배열 조회
      const { data: currentData, error: fetchError } = await supabase
        .from('students')
        .select('todolist')
        .eq('user_id', studentId)
        .single();

      if (fetchError) {
        console.error('기존 할 일 조회 에러:', JSON.stringify(fetchError, null, 2));
        throw new Error(`기존 할 일 조회 실패: ${fetchError.message || '알 수 없는 오류'}`);
      }

      const currentTodolist = currentData?.todolist || [];
      const updatedTodolist = currentTodolist.filter((_: any, index: number) => index !== goalIndex);

      // Students 테이블의 todolist 컬럼 업데이트
      const { error: updateError } = await supabase
        .from('students')
        .update({ todolist: updatedTodolist })
        .eq('user_id', studentId);

      if (updateError) {
        console.error('할 일 삭제 에러:', JSON.stringify(updateError, null, 2));
        throw new Error(`할 일 삭제 실패: ${updateError.message || '알 수 없는 오류'}`);
      }

      await fetchGoals();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 삭제 실패:', error);
      setError(errorMessage);
    }
  };

  const startEditing = (goalIndex: number) => {
    setEditingGoalIndex(goalIndex);
    setEditingTitle(goals[goalIndex].title);
    setError(null);
  };

  const saveEdit = async (goalIndex: number) => {
    try {
      setError(null);
      
      // 기존 todolist 배열 조회
      const { data: currentData, error: fetchError } = await supabase
        .from('students')
        .select('todolist')
        .eq('user_id', studentId)
        .single();

      if (fetchError) {
        console.error('기존 할 일 조회 에러:', JSON.stringify(fetchError, null, 2));
        throw new Error(`기존 할 일 조회 실패: ${fetchError.message || '알 수 없는 오류'}`);
      }

      const currentTodolist = currentData?.todolist || [];
      const updatedTodolist = currentTodolist.map((goal: any, index: number) => {
        if (index === goalIndex) {
          return {
            ...goal,
            title: editingTitle.trim()
          };
        }
        return goal;
      });

      // Students 테이블의 todolist 컬럼 업데이트
      const { error: updateError } = await supabase
        .from('students')
        .update({ todolist: updatedTodolist })
        .eq('user_id', studentId);

      if (updateError) {
        console.error('할 일 제목 수정 에러:', JSON.stringify(updateError, null, 2));
        throw new Error(`할 일 제목 수정 실패: ${updateError.message || '알 수 없는 오류'}`);
      }

      setEditingGoalIndex(null);
      setEditingTitle('');
      await fetchGoals();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('할 일 제목 수정 실패:', error);
      setError(errorMessage);
    }
  };

  const cancelEdit = () => {
    setEditingGoalIndex(null);
    setEditingTitle('');
    setError(null);
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
          <div className="space-y-4 flex-1">
            {/* 할 일 목록 */}
            <div className="space-y-2">
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
                    {editingGoalIndex === index ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-7 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(index)}
                          onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit(index)}
                          className="h-7 px-2 text-xs"
                        >
                          저장
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          className="h-7 px-2 text-xs"
                        >
                          취소
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${goal.isCompleted ? 'text-cyan-400 line-through' : 'text-cyan-100'}`}>
                          {goal.title}
                        </span>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(index)}
                            className="h-5 w-5 p-0 text-cyan-400/60 hover:text-cyan-400"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
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