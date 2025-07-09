'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StudentSectionTitle, StudentText, studentButtonStyles, studentInputStyles } from "./StudentThemeProvider";

interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export function GoalsCard({ studentId, fixedInput }: { studentId: string, fixedInput?: boolean }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [studentId]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('student_activity_logs')
        .select('id, memo, created_at')
        .eq('student_id', studentId)
        .like('memo', 'GOAL:%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedGoals: Goal[] = (data || []).map(item => ({
        id: item.id,
        title: item.memo?.replace('GOAL:', '') || '',
        isCompleted: false,
        createdAt: item.created_at
      }));

      setGoals(parsedGoals);
    } catch (error) {
      console.error('목표 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('student_activity_logs')
        .insert({
          student_id: studentId,
          date: new Date().toISOString().split('T')[0],
          memo: `GOAL:${newGoal.trim()}`,
          attended: false,
          typing_score: 0,
          typing_speed: 0
        });

      if (error) throw error;

      setNewGoal('');
      await fetchGoals();
    } catch (error) {
      console.error('목표 추가 실패:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleGoal = async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const { error } = await supabase
        .from('student_activity_logs')
        .update({ 
          memo: goal.isCompleted 
            ? `GOAL:${goal.title}` 
            : `GOAL:${goal.title} (COMPLETED)`
        })
        .eq('id', goalId);

      if (error) throw error;

      await fetchGoals();
    } catch (error) {
      console.error('목표 상태 변경 실패:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('student_activity_logs')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      await fetchGoals();
    } catch (error) {
      console.error('목표 삭제 실패:', error);
    }
  };

  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;

  return (
    <div className="h-full flex flex-col">
      <StudentSectionTitle icon={<Target className="w-5 h-5" />}>
        목표설정
      </StudentSectionTitle>
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {/* 목표 추가 */}
        {!fixedInput && (
          <div className="flex gap-2">
            <Input
              placeholder="새로운 목표를 입력하세요"
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
        {/* 진행률 */}
        {totalGoals > 0 && (
          <div className="text-center p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
            <div className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_6px_#00fff7]">
              {completedGoals}/{totalGoals}
            </div>
            <div className="text-sm text-cyan-400">목표 달성</div>
          </div>
        )}
        {/* 목표 목록 */}
        {isLoading ? (
          <StudentText variant="muted">로딩 중...</StudentText>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-8 h-8 mx-auto mb-2 text-cyan-400/50" />
            <StudentText variant="muted">아직 설정된 목표가 없습니다.</StudentText>
          </div>
        ) : (
                      <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-400/10 border border-transparent hover:border-cyan-400/20 transition-colors">
                  <Checkbox
                    checked={goal.isCompleted}
                    onCheckedChange={() => toggleGoal(goal.id)}
                    className="text-cyan-400"
                  />
                  <span className={`flex-1 text-sm ${goal.isCompleted ? 'line-through text-cyan-400' : 'text-cyan-100'}`}>
                    {goal.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="h-6 w-6 p-0 text-cyan-400 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
        )}
        {/* 하단 고정 입력창 */}
        {fixedInput && (
          <div className="flex gap-2 mt-auto pt-4 border-t border-cyan-400/20">
            <Input
              placeholder="새로운 목표를 입력하세요"
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