'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, BookOpen } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
  wordsCompleted: number;
}

export default function KoreanWordPage() {
  const router = useRouter();
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [completedWords, setCompletedWords] = useState<number>(0);
  const [totalCharacters, setTotalCharacters] = useState<number>(0);
  const [correctCharacters, setCorrectCharacters] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 한글 낱말연습 단어들 (카테고리별)
  const wordCategories = {
    '가족': ['아버지', '어머니', '형제', '자매', '할아버지', '할머니', '삼촌', '이모'],
    '동물': ['강아지', '고양이', '토끼', '사자', '호랑이', '코끼리', '기린', '펭귄'],
    '음식': ['김치', '비빔밥', '불고기', '삼겹살', '된장찌개', '순두부', '떡볶이', '치킨'],
    '색깔': ['빨간색', '파란색', '노란색', '초록색', '보라색', '주황색', '분홍색', '검은색'],
    '감정': ['기쁨', '슬픔', '화남', '사랑', '미움', '놀람', '두려움', '희망'],
    '직업': ['의사', '교사', '경찰', '소방관', '기자', '변호사', '회사원', '농부']
  };

  const [currentCategory, setCurrentCategory] = useState<keyof typeof wordCategories>('가족');

  const startTyping = () => {
    setIsTyping(true);
    setStartTime(Date.now());
    setUserInput('');
    setResult(null);
    setCurrentWordIndex(0);
    setCompletedWords(0);
    setTotalCharacters(0);
    setCorrectCharacters(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const resetTyping = () => {
    setIsTyping(false);
    setUserInput('');
    setResult(null);
    setStartTime(null);
    setCurrentWordIndex(0);
    setCompletedWords(0);
    setTotalCharacters(0);
    setCorrectCharacters(0);
  };

  const calculateResult = () => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    
    setResult({
      accuracy: Math.round((correctCharacters / totalCharacters) * 100),
      speed: Math.round(totalCharacters / timeElapsed * 60),
      time: Math.round(timeElapsed),
      wordsCompleted: completedWords
    });
    
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    const currentWord = currentWords[currentWordIndex];
    if (!currentWord) return;
    
    // 현재 단어 완료 체크
    if (value === currentWord) {
      setCompletedWords(prev => prev + 1);
      setTotalCharacters(prev => prev + currentWord.length);
      setCorrectCharacters(prev => prev + currentWord.length);
      
      // 다음 단어로 이동
      if (currentWordIndex < currentWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setUserInput('');
      } else {
        // 모든 단어 완료
        setTimeout(calculateResult, 500);
      }
    } else {
      // 오타 체크
      const correctChars = [...currentWord].filter((char, index) => 
        value[index] === char
      ).length;
      setCorrectCharacters(prev => prev + (correctChars - (value.length > currentWord.length ? currentWord.length : value.length)));
    }
  };

  const changeCategory = (category: keyof typeof wordCategories) => {
    setCurrentCategory(category);
    resetTyping();
  };

  useEffect(() => {
    setCurrentWords(wordCategories[currentCategory]);
  }, [currentCategory]);

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-cyan-400/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cyan-300" />
        </button>
        <StudentHeading size="h1">한글 낱말연습</StudentHeading>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* 카테고리 선택 */}
        <div className="mb-6">
          <StudentText variant="secondary" className="text-lg mb-4">카테고리 선택</StudentText>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.keys(wordCategories).map((category) => (
              <button
                key={category}
                onClick={() => changeCategory(category as keyof typeof wordCategories)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentCategory === category
                    ? "bg-cyan-400 text-cyan-900"
                    : "bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 연습 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 현재 단어 */}
          <StudentCard className="mb-6 p-8">
            <div className="text-center">
              <div className="text-4xl font-mono text-cyan-100 mb-4">
                {currentWords[currentWordIndex] || '연습 완료!'}
              </div>
              <div className="text-sm text-cyan-400">
                {currentWordIndex + 1} / {currentWords.length} 단어
              </div>
            </div>
          </StudentCard>

          {/* 입력 영역 */}
          <StudentCard className="mb-6 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={!isTyping || currentWordIndex >= currentWords.length}
                  placeholder={isTyping ? "단어를 타이핑하세요..." : "시작 버튼을 눌러주세요"}
                  className={cn(
                    "flex-1 p-3 text-lg font-mono rounded-lg border transition-colors",
                    "bg-cyan-400/10 border-cyan-400/30 text-cyan-100",
                    "focus:border-cyan-400 focus:outline-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
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
              </div>
              
              {/* 진행률 */}
              {isTyping && (
                <div className="space-y-2">
                  <div className="w-full bg-cyan-400/20 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedWords / currentWords.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-cyan-400 text-center">
                    완료된 단어: {completedWords} / {currentWords.length}
                  </div>
                </div>
              )}
            </div>
          </StudentCard>

          {/* 결과 */}
          {result && (
            <StudentCard className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-cyan-100 mb-4">연습 결과</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-2">
                      {result.accuracy}%
                    </div>
                    <div className="text-sm text-cyan-400">정확도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-2">
                      {result.speed}
                    </div>
                    <div className="text-sm text-cyan-400">타자수/분</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-2">
                      {result.time}초
                    </div>
                    <div className="text-sm text-cyan-400">소요시간</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-2">
                      {result.wordsCompleted}
                    </div>
                    <div className="text-sm text-cyan-400">완료 단어</div>
                  </div>
                </div>
              </div>
            </StudentCard>
          )}
        </div>
      </div>
    </div>
  );
}
