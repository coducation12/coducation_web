'use client';

import { ArrowLeft, Type, FileText, BookOpen } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText } from "../../components/StudentThemeProvider";
import { useRouter } from 'next/navigation';

interface ExerciseCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function ExerciseCard({ title, description, icon, href }: ExerciseCardProps) {
  return (
    <a href={href} className="block">
      <StudentCard className="cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_20px_0_rgba(0,255,255,0.30)]">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 text-cyan-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-cyan-100 mb-2">{title}</h3>
          <p className="text-cyan-300 text-sm">{description}</p>
        </div>
      </StudentCard>
    </a>
  );
}

export default function EnglishTypingPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-cyan-400/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cyan-300" />
        </button>
        <StudentHeading size="h1">영어 타자</StudentHeading>
      </div>
      
      <div className="max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExerciseCard
            title="자리연습"
            description="영어 알파벳의 기본 위치를 익혀보세요"
            icon={<Type className="w-full h-full" />}
            href="/dashboard/student/typing/english/basic"
          />
          
          <ExerciseCard
            title="낱말연습"
            description="영어 단어를 타이핑하여 어휘력을 키워보세요"
            icon={<FileText className="w-full h-full" />}
            href="/dashboard/student/typing/english/word"
          />
          
          <ExerciseCard
            title="장문연습"
            description="긴 영어 문장을 타이핑하여 실력을 향상시켜보세요"
            icon={<BookOpen className="w-full h-full" />}
            href="/dashboard/student/typing/english/sentence"
          />
        </div>
      </div>
    </div>
  );
}
