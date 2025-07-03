'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestTypingExercise } from '@/ai/flows/suggest-typing-exercise';
import type { SuggestTypingExerciseOutput, SuggestTypingExerciseInput } from '@/ai/flows/suggest-typing-exercise';
import type { TypingExercise } from '@/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

interface AiExerciseGeneratorProps {
    onExerciseGenerated: (exercise: TypingExercise) => void;
}

const formSchema = z.object({
    studentId: z.string().default('student-uuid-1'), // Mock ID
    pastPerformance: z.string().min(10, '최소 10자 이상 입력해주세요.'),
    currentCurriculum: z.string().min(5, '최소 5자 이상 입력해주세요.'),
});

export function AiExerciseGenerator({ onExerciseGenerated }: AiExerciseGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SuggestTypingExerciseOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: 'student-uuid-1',
            pastPerformance: '최근 정확도는 높지만, 영문 타자 속도가 느린 편입니다. 특히 대문자와 특수기호 입력 시 오타가 잦습니다.',
            currentCurriculum: 'React와 TypeScript를 사용한 웹 개발 기초',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const aiResult = await suggestTypingExercise(values as SuggestTypingExerciseInput);
            setResult(aiResult);
        } catch (e) {
            setError('AI 추천 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStartExercise = () => {
        if (result) {
            const newExercise: TypingExercise = {
                id: `ai-${Date.now()}`,
                language: result.exerciseLanguage as any,
                level: result.exerciseLevel as any,
                content: result.exerciseContent,
                created_at: new Date().toISOString(),
            };
            onExerciseGenerated(newExercise);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">AI 맞춤형 연습 생성기</CardTitle>
                    <CardDescription>
                        현재 학습 상태와 과거 성과를 바탕으로 AI가 최적의 타자 연습 문장을 추천해줍니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="pastPerformance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>과거 성과 요약</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="예: 영문 타자 속도가 느리고, 특수기호에서 오타가 많음" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentCurriculum"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>현재 학습중인 커리큘럼</FormLabel>
                                        <FormControl>
                                            <Input placeholder="예: 파이썬 기초 문법" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                AI 추천 받기
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {error && <p className="text-destructive">{error}</p>}
            
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI 추천 연습</CardTitle>
                        <CardDescription>{result.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-md bg-muted font-code">
                            {result.exerciseContent}
                        </div>
                        <Button onClick={handleStartExercise}>이 내용으로 연습 시작</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
