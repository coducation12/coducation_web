'use client';

import { ArrowLeft, Code2 } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText } from "../../components/StudentThemeProvider";
import { useRouter } from 'next/navigation';

interface CodeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function CodeCard({ title, description, icon, href }: CodeCardProps) {
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

export default function CodeTypingPage() {
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
        <StudentHeading size="h1">코드 타자</StudentHeading>
      </div>
      
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CodeCard
            title="C언어"
            description="C언어 코드를 타이핑하고 실행해보세요"
            icon={<Code2 className="w-full h-full" />}
            href="/dashboard/student/typing/code/c"
          />
          
          <CodeCard
            title="Python"
            description="파이썬 코드를 타이핑하고 실행해보세요"
            icon={<Code2 className="w-full h-full" />}
            href="/dashboard/student/typing/code/python"
          />
          
          <CodeCard
            title="Java"
            description="자바 코드를 타이핑하고 실행해보세요"
            icon={<Code2 className="w-full h-full" />}
            href="/dashboard/student/typing/code/java"
          />
          
          <CodeCard
            title="JavaScript"
            description="자바스크립트 코드를 타이핑하고 실행해보세요"
            icon={<Code2 className="w-full h-full" />}
            href="/dashboard/student/typing/code/javascript"
          />
          
          <CodeCard
            title="HTML"
            description="HTML 코드를 타이핑하고 결과를 확인해보세요"
            icon={<Code2 className="w-full h-full" />}
            href="/dashboard/student/typing/code/html"
          />
        </div>
      </div>
    </div>
  );
}
