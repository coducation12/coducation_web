'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Code2, Terminal } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface CodeExercise {
  id: string;
  title: string;
  description: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
}

export default function PythonCodePage() {
  const router = useRouter();
  const [currentExercise, setCurrentExercise] = useState<CodeExercise | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Python 연습 문제들
  const pythonExercises: CodeExercise[] = [
    {
      id: 'py-1',
      title: 'Hello World',
      description: '기본적인 print 문을 사용하여 "Hello, World!"를 출력하는 코드를 작성하세요.',
      code: 'print("Hello, World!")',
      difficulty: 'easy'
    },
    {
      id: 'py-2',
      title: '변수와 계산',
      description: '두 숫자를 변수에 저장하고 덧셈을 수행하는 코드를 작성하세요.',
      code: 'a = 10\nb = 20\nresult = a + b\nprint(f"{a} + {b} = {result}")',
      difficulty: 'easy'
    },
    {
      id: 'py-3',
      title: '반복문',
      description: 'for 반복문을 사용하여 1부터 5까지 출력하는 코드를 작성하세요.',
      code: 'for i in range(1, 6):\n    print(i)',
      difficulty: 'medium'
    },
    {
      id: 'py-4',
      title: '조건문',
      description: 'if-else 문을 사용하여 숫자가 짝수인지 홀수인지 판별하는 코드를 작성하세요.',
      code: 'number = 7\nif number % 2 == 0:\n    print(f"{number}는 짝수입니다.")\nelse:\n    print(f"{number}는 홀수입니다.")',
      difficulty: 'medium'
    },
    {
      id: 'py-5',
      title: '함수 정의',
      description: '두 숫자를 받아서 곱셈을 반환하는 함수를 정의하고 호출하는 코드를 작성하세요.',
      code: 'def multiply(a, b):\n    return a * b\n\nresult = multiply(5, 3)\nprint(f"5 * 3 = {result}")',
      difficulty: 'hard'
    }
  ];

  const startTyping = () => {
    setIsTyping(true);
    setStartTime(Date.now());
    setUserInput('');
    setResult(null);
    setShowOutput(false);
    setExecutionResult('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const resetTyping = () => {
    setIsTyping(false);
    setUserInput('');
    setResult(null);
    setStartTime(null);
    setShowOutput(false);
    setExecutionResult('');
  };

  const calculateResult = () => {
    if (!startTime || !currentExercise) return;
    
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    const totalCharacters = currentExercise.code.length;
    const correctCharacters = [...currentExercise.code].filter((char, index) => 
      userInput[index] === char
    ).length;
    
    const accuracy = Math.round((correctCharacters / totalCharacters) * 100);
    const speed = Math.round(totalCharacters / timeElapsed * 60);
    
    setResult({
      accuracy,
      speed,
      time: Math.round(timeElapsed)
    });
    
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    // 타이핑 완료 체크
    if (value.length === currentExercise?.code.length) {
      calculateResult();
    }
  };

  const executeCode = () => {
    if (!currentExercise) return;
    
    try {
      // 실제 Python 실행은 서버 사이드에서 처리해야 하지만,
      // 여기서는 시뮬레이션으로 처리
      let output = '';
      
      switch (currentExercise.id) {
        case 'py-1':
          output = 'Hello, World!';
          break;
        case 'py-2':
          output = '10 + 20 = 30';
          break;
        case 'py-3':
          output = '1\n2\n3\n4\n5';
          break;
        case 'py-4':
          output = '7는 홀수입니다.';
          break;
        case 'py-5':
          output = '5 * 3 = 15';
          break;
        default:
          output = '실행 결과가 여기에 표시됩니다.';
      }
      
      setExecutionResult(output);
      setShowOutput(true);
    } catch (error) {
      setExecutionResult(`오류: ${error}`);
      setShowOutput(true);
    }
  };

  const nextExercise = () => {
    if (currentIndex < pythonExercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetTyping();
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetTyping();
    }
  };

  useEffect(() => {
    setCurrentExercise(pythonExercises[currentIndex]);
  }, [currentIndex]);

  if (!currentExercise) return null;

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-cyan-400/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cyan-300" />
        </button>
        <StudentHeading size="h1">Python 코드 타이핑</StudentHeading>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {/* 연습 문제 선택 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <StudentText variant="secondary" className="text-lg">
                연습 {currentIndex + 1} / {pythonExercises.length}
              </StudentText>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-cyan-400">난이도:</span>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  currentExercise.difficulty === 'easy' && "bg-green-500/20 text-green-300",
                  currentExercise.difficulty === 'medium' && "bg-yellow-500/20 text-yellow-300",
                  currentExercise.difficulty === 'hard' && "bg-red-500/20 text-red-300"
                )}>
                  {currentExercise.difficulty === 'easy' && '쉬움'}
                  {currentExercise.difficulty === 'medium' && '보통'}
                  {currentExercise.difficulty === 'hard' && '어려움'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevExercise}
                disabled={currentIndex === 0}
                className={cn(
                  "px-3 py-1 rounded text-sm transition-colors",
                  currentIndex === 0 
                    ? "text-cyan-400/40 cursor-not-allowed" 
                    : "text-cyan-300 hover:bg-cyan-400/10"
                )}
              >
                이전
              </button>
              <button
                onClick={nextExercise}
                disabled={currentIndex === pythonExercises.length - 1}
                className={cn(
                  "px-3 py-1 rounded text-sm transition-colors",
                  currentIndex === pythonExercises.length - 1 
                    ? "text-cyan-400/40 cursor-not-allowed" 
                    : "text-cyan-300 hover:bg-cyan-400/10"
                )}
              >
                다음
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* 왼쪽: 문제 설명 및 코드 */}
          <div className="space-y-6">
            {/* 문제 설명 */}
            <StudentCard className="p-6">
              <h3 className="text-xl font-bold text-cyan-100 mb-3">{currentExercise.title}</h3>
              <p className="text-cyan-300 text-sm leading-relaxed">{currentExercise.description}</p>
            </StudentCard>

            {/* 목표 코드 */}
            <StudentCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-cyan-300" />
                <h4 className="text-lg font-bold text-cyan-100">목표 코드</h4>
              </div>
              <pre className="bg-cyan-400/10 p-4 rounded-lg text-sm text-cyan-100 font-mono overflow-x-auto">
                {currentExercise.code}
              </pre>
            </StudentCard>
          </div>

          {/* 오른쪽: 타이핑 및 실행 */}
          <div className="space-y-6">
            {/* 타이핑 영역 */}
            <StudentCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={!isTyping}
                    placeholder={isTyping ? "여기에 코드를 타이핑하세요..." : "시작 버튼을 눌러주세요"}
                    rows={8}
                    className={cn(
                      "flex-1 p-3 text-sm font-mono rounded-lg border transition-colors resize-none",
                      "bg-cyan-400/10 border-cyan-400/30 text-cyan-100",
                      "focus:border-cyan-400 focus:outline-none",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  />
                </div>
                
                <div className="flex gap-2">
                  {!isTyping ? (
                    <button
                      onClick={startTyping}
                      className={cn(
                        "px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105",
                        studentButtonStyles.primary
                      )}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      시작
                    </button>
                  ) : (
                    <button
                      onClick={resetTyping}
                      className="px-6 py-3 rounded-lg font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      재시작
                    </button>
                  )}
                </div>
                
                {/* 진행률 */}
                {isTyping && (
                  <div className="w-full bg-cyan-400/20 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(userInput.length / currentExercise.code.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </StudentCard>

            {/* 실행 결과 */}
            {result && (
              <StudentCard className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-cyan-100 mb-4">타이핑 결과</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300 mb-1">
                        {result.accuracy}%
                      </div>
                      <div className="text-xs text-cyan-400">정확도</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300 mb-1">
                        {result.speed}
                      </div>
                      <div className="text-xs text-cyan-400">타자수/분</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300 mb-1">
                        {result.time}초
                      </div>
                      <div className="text-xs text-cyan-400">소요시간</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={executeCode}
                  className="w-full px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  <Terminal className="w-4 h-4 inline mr-2" />
                  코드 실행하기
                </button>
              </StudentCard>
            )}

            {/* 실행 결과 출력 */}
            {showOutput && (
              <StudentCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-5 h-5 text-cyan-300" />
                  <h4 className="text-lg font-bold text-cyan-100">실행 결과</h4>
                </div>
                <pre className="bg-cyan-400/10 p-4 rounded-lg text-sm text-cyan-100 font-mono overflow-x-auto">
                  {executionResult}
                </pre>
              </StudentCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
