'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { TypingExercise } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../../../../components/ui/button';
import { RefreshCw } from 'lucide-react';

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
    const inputRef = useRef<HTMLInputElement>(null);

    const textToType = exercise.content;
    const isFinished = userInput.length === textToType.length;

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

            setResult({ wpm, accuracy, duration: durationInSeconds });
        }
    }, [isFinished, startTime, textToType, userInput]);

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
                        !isTyped && 'text-muted-foreground/50',
                        isTyped && (isCorrect ? 'text-green-500' : 'text-red-500 bg-red-100'),
                        isCurrent && 'border-b-2 border-primary'
                    )}
                >
                    {char === ' ' && isTyped && !isCorrect ? <span className='bg-red-200'>_</span> : char}
                </span>
            );
        });
    }, [textToType, userInput]);

    return (
        <Card>
            <CardContent className="p-6">
                <div className="text-2xl tracking-wider p-4 border rounded-md mb-4 relative" onClick={() => inputRef.current?.focus()}>
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
                    <div className="text-center p-4 border rounded-md bg-muted">
                        <h3 className="text-xl font-bold mb-2 font-headline">결과</h3>
                        <div className="flex justify-around">
                            <div>
                                <p className="text-sm text-muted-foreground">타수 (WPM)</p>
                                <p className="text-3xl font-bold text-primary">{result.wpm}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">정확도</p>
                                <p className="text-3xl font-bold text-primary">{result.accuracy}%</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">소요 시간</p>
                                <p className="text-3xl font-bold text-primary">{result.duration.toFixed(1)}s</p>
                            </div>
                        </div>
                        <Button onClick={resetPractice} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" /> 다시 시작
                        </Button>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        키보드를 입력하여 연습을 시작하세요.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
