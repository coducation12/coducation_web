'use client';

import { TypingPractice } from "./typing-practice";
import type { TypingExercise } from '@/types';

const defaultExercise: TypingExercise = {
  id: 'ko-1',
  title: '한국어 기초 타자',
  language: 'Korean',
  level: '기초',
  content: '안녕하세요. 반갑습니다. 코딩 교육의 새로운 시작, Coducation입니다.',
  exercise_type: '자리연습',
  created_at: ''
};

export default function TypingPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6 text-cyan-100">타자연습</h1>
      <TypingPractice exercise={defaultExercise} />
    </div>
  );
}
