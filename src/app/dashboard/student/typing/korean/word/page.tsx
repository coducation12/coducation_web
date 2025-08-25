'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, BookOpen, Keyboard, Hand } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
  wordsCompleted: number;
}

// 키보드 레이아웃 정의
const keyboardLayout = {
  korean: [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
  ],
  english: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ]
};

export default function KoreanWordPage() {
  const router = useRouter();
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [completedWords, setCompletedWords] = useState<number>(0);
  const [totalCharacters, setTotalCharacters] = useState<number>(0);
  const [correctCharacters, setCorrectCharacters] = useState<number>(0);
  const [nextKey, setNextKey] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
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

  const resetTyping = () => {
    setUserInput('');
    setResult(null);
    setStartTime(null);
    setCurrentWordIndex(0);
    setCompletedWords(0);
    setTotalCharacters(0);
    setCorrectCharacters(0);
    updateNextKey('');
    setHasStarted(false);
  };

  const updateNextKey = (input: string) => {
    const currentWord = currentWords[currentWordIndex];
    if (!currentWord) return;
    
    if (input.length < currentWord.length) {
      setNextKey(currentWord[input.length]);
    } else {
      setNextKey('');
    }
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    updateNextKey(value);
    
    // 첫 번째 입력 시 타이머 시작
    if (!hasStarted && value.length > 0) {
      setStartTime(Date.now());
      setHasStarted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const currentWord = currentWords[currentWordIndex];
      if (!currentWord) return;
      
      if (userInput === currentWord) {
        // 올바른 단어 입력 시 다음 단어로
        setCompletedWords(prev => prev + 1);
        setTotalCharacters(prev => prev + currentWord.length);
        setCorrectCharacters(prev => prev + currentWord.length);
        
        if (currentWordIndex < currentWords.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setUserInput('');
          updateNextKey('');
        } else {
          // 모든 단어 완료
          setTimeout(calculateResult, 500);
        }
      } else {
        // 잘못된 단어 입력 시 입력 초기화
        setUserInput('');
      }
    }
  };

  const changeCategory = (category: keyof typeof wordCategories) => {
    setCurrentCategory(category);
    resetTyping();
  };

  useEffect(() => {
    setCurrentWords(wordCategories[currentCategory]);
  }, [currentCategory]);

  const currentWord = currentWords[currentWordIndex];

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

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
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
          {/* 메인 연습 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 타겟 단어 */}
            <div className="lg:col-span-2">
              <StudentCard className="p-8 h-80 flex flex-col">
                <div className="text-center mb-6 flex-1 flex items-center justify-center">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-6xl font-mono text-cyan-300 leading-relaxed" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                      {currentWord || '연습 완료!'}
                    </div>
                    {currentWordIndex < currentWords.length - 1 && (
                      <div className="text-lg font-mono text-cyan-400/30 leading-relaxed">
                        다음: {currentWords[currentWordIndex + 1]}
                      </div>
                    )}
                  </div>
                </div>

                {/* 입력 필드 */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={currentWordIndex >= currentWords.length}
                        placeholder="단어를 타이핑하세요..."
                        className={cn(
                          "flex-1 p-3 text-lg font-mono rounded-lg border transition-colors",
                          "bg-cyan-400/10 border-cyan-400/30 text-cyan-100",
                          "focus:border-cyan-400 focus:outline-none",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      />
                      <button
                        onClick={resetTyping}
                        className="px-6 py-3 rounded-lg font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        재시작
                      </button>
                    </div>
                    
                    {/* 진행률 */}
                    {hasStarted && (
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
                </div>
              </StudentCard>
            </div>
          </div>

          {/* 가상 키보드 */}
          <StudentCard className="mb-6 p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-cyan-100 mb-2">가상 키보드</h3>
              {nextKey && (
                <div className="text-sm text-cyan-400 mb-2">
                  다음 입력할 키: <span className="text-cyan-200 font-bold">{nextKey}</span>
                </div>
              )}
            </div>
            
            {/* 키보드 레이아웃 */}
            <div className="flex flex-col items-center space-y-3">
              {keyboardLayout.korean.map((row, rowIndex) => (
                <div key={rowIndex} className="flex space-x-2">
                  {row.map((key) => (
                    <div
                      key={key}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 relative",
                        key === nextKey
                          ? "border-red-400 bg-red-400/20 text-red-200 shadow-[0_0_15px_0_rgba(239,68,68,0.50)]"
                          : "border-cyan-400/30 bg-cyan-400/10 text-cyan-400/70"
                      )}
                    >
                      {key}
                      {/* 손가락 위치 표시 */}
                      {key === nextKey && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <Hand className="w-6 h-6 text-red-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
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
