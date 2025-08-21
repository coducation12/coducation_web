'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { TypingExercise } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../../../../components/ui/button';
import { RefreshCw } from 'lucide-react';
import { StudentCard, StudentText, studentButtonStyles } from '../components/StudentThemeProvider';
import { supabase } from '@/lib/supabase';

interface TypingPracticeProps {
    exercise: TypingExercise;
}

interface Result {
    wpm: number;
    accuracy: number;
    duration: number;
}

export function TypingPractice({ exercise }: TypingPracticeProps) {
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const textToType = exercise.content;
    const isFinished = userInput.length === textToType.length;

    // 타이핑 결과를 데이터베이스에 저장
    const saveTypingResult = async (result: Result) => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('student_activity_logs')
                .insert({
                    student_id: user.id,
                    activity_type: 'typing',
                    date: new Date().toISOString().split('T')[0],
                    typing_score: result.accuracy,
                    typing_speed: result.wpm,
                    typing_exercise_id: exercise.id,
                    attended: true
                });

            if (error) {
                console.error('타이핑 결과 저장 실패:', error);
            }
        } catch (error) {
            console.error('타이핑 결과 저장 중 오류:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isFinished && startTime) {
            const endTime = Date.now();
            const durationInSeconds = (endTime - startTime) / 1000;
            const words = textToType.split(' ').length;
            const wpm = Math.round((words / durationInSeconds) * 60);

            let errors = 0;
            userInput.split('').forEach((char, index) => {
                if (char !== textToType[index]) {
                    errors++;
                }
            });
            const accuracy = Math.round(((textToType.length - errors) / textToType.length) * 100);

            const newResult = { wpm, accuracy, duration: durationInSeconds };
            setResult(newResult);
            
            // 결과를 데이터베이스에 저장
            saveTypingResult(newResult);
        }
    }, [isFinished, startTime, textToType, userInput, exercise.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFinished) return;
        if (!startTime) {
            setStartTime(Date.now());
        }
        setUserInput(e.target.value);
    };

    const resetPractice = () => {
        setUserInput('');
        setStartTime(null);
        setResult(null);
        inputRef.current?.focus();
    };

    useEffect(() => {
        resetPractice();
    }, [exercise]);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    const characters = useMemo(() => {
        return textToType.split('').map((char, index) => {
            const isTyped = index < userInput.length;
            const isCorrect = char === userInput[index];
            const isCurrent = index === userInput.length;
            
            return (
                <span
                    key={index}
                    className={cn(
                        'font-code',
                        !isTyped && 'text-cyan-400/50',
                        isTyped && (isCorrect ? 'text-green-400 drop-shadow-[0_0_6px_#00ff00]' : 'text-red-400 bg-red-400/20'),
                        isCurrent && 'border-b-2 border-cyan-400 drop-shadow-[0_0_4px_#00fff7]'
                    )}
                >
                    {char === ' ' && isTyped && !isCorrect ? <span className='bg-red-400/20'>_</span> : char}
                </span>
            );
        });
    }, [textToType, userInput]);

    return (
        <StudentCard className="max-w-2xl w-full">
            <div className="p-6">
                <div className="text-2xl tracking-wider p-4 border border-cyan-400/40 rounded-md mb-4 relative bg-background/40 shadow-[0_0_12px_0_rgba(0,255,255,0.10)]" onClick={() => inputRef.current?.focus()}>
                    {characters}
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        className="absolute inset-0 opacity-0 cursor-default"
                        disabled={!!result}
                        autoFocus
                    />
                </div>

                {result ? (
                    <div className="text-center p-4 border border-cyan-400/20 rounded-md bg-cyan-400/10">
                        <h3 className="text-xl font-bold mb-2 text-cyan-100 drop-shadow-[0_0_4px_#00fff7]">결과</h3>
                        <div className="flex justify-around">
                            <div>
                                <StudentText variant="muted" className="text-sm">타수 (WPM)</StudentText>
                                <p className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_6px_#00fff7]">{result.wpm}</p>
                            </div>
                            <div>
                                <StudentText variant="muted" className="text-sm">정확도</StudentText>
                                <p className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_6px_#00fff7]">{result.accuracy}%</p>
                            </div>
                             <div>
                                <StudentText variant="muted" className="text-sm">소요 시간</StudentText>
                                <p className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_6px_#00fff7]">{result.duration.toFixed(1)}s</p>
                            </div>
                        </div>
                        {isSaving && (
                            <div className="mt-2 text-sm text-cyan-200">
                                결과 저장 중...
                            </div>
                        )}
                        <Button onClick={resetPractice} className={cn("mt-4", studentButtonStyles.primary)}>
                            <RefreshCw className="mr-2 h-4 w-4" /> 다시 시작
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <StudentText variant="muted">키보드를 입력하여 연습을 시작하세요.</StudentText>
                    </div>
                )}
            </div>
        </StudentCard>
    );
}
