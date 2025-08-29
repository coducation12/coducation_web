'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, FileText, Keyboard, Hand } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
  sentencesCompleted: number;
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

export default function SentencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLanguage = searchParams.get('language') as 'korean' | 'english' || 'korean';
  
  const [language, setLanguage] = useState<'korean' | 'english'>(initialLanguage);
  const [currentSentences, setCurrentSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [completedSentences, setCompletedSentences] = useState<number>(0);
  const [totalCharacters, setTotalCharacters] = useState<number>(0);
  const [correctCharacters, setCorrectCharacters] = useState<number>(0);
  const [nextKey, setNextKey] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 한글 문장연습 문장들 (카테고리별)
  const koreanSentenceCategories = {
    '일상': [
      '오늘은 날씨가 참 좋습니다.',
      '내일 친구와 영화를 볼 예정입니다.',
      '가족과 함께 저녁 식사를 했습니다.',
      '새로운 책을 읽기 시작했습니다.',
      '주말에 공원에서 산책을 했습니다.',
      '맛있는 음식을 요리해 보았습니다.'
    ],
    '학습': [
      '컴퓨터 프로그래밍을 배우고 있습니다.',
      '새로운 언어를 익히는 것은 재미있습니다.',
      '도서관에서 공부하는 시간이 즐겁습니다.',
      '온라인 강의를 듣고 있습니다.',
      '시험 준비를 열심히 하고 있습니다.',
      '새로운 기술을 배우는 것이 좋습니다.'
    ],
    '여행': [
      '여름휴가로 바다에 다녀왔습니다.',
      '산에 올라가서 아름다운 경치를 보았습니다.',
      '새로운 도시를 탐험하는 것이 즐겁습니다.',
      '전통 문화를 체험해 보았습니다.',
      '맛있는 지역 음식을 맛보았습니다.',
      '여행에서 좋은 추억을 만들었습니다.'
    ]
  };

  // 영어 문장연습 문장들 (카테고리별)
  const englishSentenceCategories = {
    'Daily Life': [
      'The weather is really nice today.',
      'I am planning to watch a movie tomorrow.',
      'We had dinner together with family.',
      'I started reading a new book recently.',
      'We took a walk in the park last weekend.',
      'I tried cooking a delicious meal today.'
    ],
    'Learning': [
      'I am learning computer programming now.',
      'Learning a new language is very interesting.',
      'I enjoy studying in the library.',
      'I am taking online courses these days.',
      'I am preparing hard for the exam.',
      'Learning new skills is always good.'
    ],
    'Travel': [
      'We went to the beach for summer vacation.',
      'We climbed the mountain and saw beautiful views.',
      'Exploring new cities is always exciting.',
      'We experienced traditional culture there.',
      'We tasted delicious local food.',
      'We made wonderful memories during the trip.'
    ]
  };

  const sentenceCategories = language === 'korean' ? koreanSentenceCategories : englishSentenceCategories;
  const [currentCategory, setCurrentCategory] = useState<string>(Object.keys(sentenceCategories)[0]);

  const resetTyping = () => {
    setUserInput('');
    setResult(null);
    setStartTime(null);
    setCurrentSentenceIndex(0);
    setCompletedSentences(0);
    setTotalCharacters(0);
    setCorrectCharacters(0);
    updateNextKey('');
    setHasStarted(false);
  };

  const updateNextKey = (input: string) => {
    const currentSentence = currentSentences[currentSentenceIndex];
    if (!currentSentence) return;
    
    if (input.length < currentSentence.length) {
      setNextKey(currentSentence[input.length]);
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
      sentencesCompleted: completedSentences
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
      const currentSentence = currentSentences[currentSentenceIndex];
      if (!currentSentence) return;
      
      if (userInput === currentSentence) {
        // 올바른 문장 입력 시 다음 문장으로
        setCompletedSentences(prev => prev + 1);
        setTotalCharacters(prev => prev + currentSentence.length);
        setCorrectCharacters(prev => prev + currentSentence.length);
        
        if (currentSentenceIndex < currentSentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
          setUserInput('');
          updateNextKey('');
        } else {
          // 모든 문장 완료
          setTimeout(calculateResult, 500);
        }
      } else {
        // 잘못된 문장 입력 시 입력 초기화
        setUserInput('');
      }
    }
  };

  const changeCategory = (category: string) => {
    setCurrentCategory(category);
    resetTyping();
  };

  const changeLanguage = () => {
    const newLanguage = language === 'korean' ? 'english' : 'korean';
    setLanguage(newLanguage);
    const newSentenceCategories = newLanguage === 'korean' ? koreanSentenceCategories : englishSentenceCategories;
    setCurrentCategory(Object.keys(newSentenceCategories)[0]);
    resetTyping();
  };

  useEffect(() => {
    const categories = language === 'korean' ? koreanSentenceCategories : englishSentenceCategories;
    setCurrentSentences(categories[currentCategory as keyof typeof categories] || []);
  }, [currentCategory, language]);

  const currentSentence = currentSentences[currentSentenceIndex];

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-cyan-400/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cyan-300" />
        </button>
        <StudentHeading size="h1">문장연습</StudentHeading>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {/* 언어 선택 */}
        <div className="flex justify-end mb-6">
          <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-cyan-500/30">
            <button
              onClick={() => changeLanguage()}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all duration-200",
                language === 'korean'
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-cyan-300 hover:text-cyan-100"
              )}
            >
              한국어
            </button>
            <button
              onClick={() => changeLanguage()}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all duration-200",
                language === 'english'
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-cyan-300 hover:text-cyan-100"
              )}
            >
              ENG
            </button>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6">
          <StudentText variant="secondary" className="text-lg mb-4">카테고리 선택</StudentText>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Object.keys(sentenceCategories).map((category) => (
              <button
                key={category}
                onClick={() => changeCategory(category)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
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
            {/* 타겟 문장 */}
            <div className="lg:col-span-2">
              <StudentCard className="p-8 h-80 flex flex-col">
                <div className="text-center mb-6 flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-2xl font-mono text-cyan-300 leading-relaxed text-center max-w-4xl" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                      {currentSentence || '연습 완료!'}
                    </div>
                    {currentSentenceIndex < currentSentences.length - 1 && (
                      <div className="text-sm font-mono text-cyan-400/30 leading-relaxed text-center">
                        다음: {currentSentences[currentSentenceIndex + 1]}
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
                        disabled={currentSentenceIndex >= currentSentences.length}
                        placeholder="문장을 타이핑하세요..."
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
                            style={{ width: `${(completedSentences / currentSentences.length) * 100}%` }}
                          />
                        </div>
                        <div className="text-sm text-cyan-400 text-center">
                          완료된 문장: {completedSentences} / {currentSentences.length}
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
              {keyboardLayout[language].map((row, rowIndex) => (
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
                      {result.sentencesCompleted}
                    </div>
                    <div className="text-sm text-cyan-400">완료 문장</div>
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
