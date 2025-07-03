'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypingPractice } from '@/components/typing/typing-practice';
import { AiExerciseGenerator } from '@/components/typing/ai-exercise-generator';
import type { TypingExercise } from '@/types';
import { Sparkles } from 'lucide-react';

const mockExercises: TypingExercise[] = [
    { id: 'ko-1', language: 'Korean', level: '기초', content: '안녕하세요. 반갑습니다. 코딩 교육의 새로운 시작, Coducation입니다.', created_at: '' },
    { id: 'en-1', language: 'English', level: '기초', content: 'The quick brown fox jumps over the lazy dog.', created_at: '' },
    { id: 'code-1', language: 'Code', level: '기초', content: 'console.log("Hello, World!");', created_at: '' },
];


export default function TypingPage() {
    const [exercise, setExercise] = useState<TypingExercise>(mockExercises[0]);
    const [key, setKey] = useState(Date.now());

    const handleSelectExercise = (ex: TypingExercise) => {
        setExercise(ex);
        setKey(Date.now()); // Force re-mount of TypingPractice component
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">타자 연습</h1>
            <p className="text-muted-foreground">
                언어와 난이도를 선택하거나, AI 추천을 받아 타자 연습을 시작하세요.
            </p>

            <Tabs defaultValue="practice" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="practice">일반 연습</TabsTrigger>
                    <TabsTrigger value="ai-suggest">
                        <Sparkles className="mr-2 h-4 w-4" /> AI 추천
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="practice">
                    <div className="flex items-center gap-4 my-4">
                        {mockExercises.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => handleSelectExercise(ex)}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${exercise.id === ex.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            >
                                {ex.language} ({ex.level})
                            </button>
                        ))}
                    </div>
                    <TypingPractice key={key} exercise={exercise} />
                </TabsContent>
                <TabsContent value="ai-suggest">
                    <AiExerciseGenerator onExerciseGenerated={handleSelectExercise} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
