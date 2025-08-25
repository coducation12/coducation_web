'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Globe, Keyboard, Hand } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
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

export default function EnglishBasicPage() {
  const router = useRouter();
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<'korean' | 'english'>('english');
  const [nextKey, setNextKey] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 한글 자리연습 텍스트들
  const koreanTexts = [
    'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ',
    'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ',
    'ㄱㅏㄴㅏㄷㅏㄹㅏㅁㅏㅂㅏㅅㅏ',
    'ㅇㅏㅈㅏㅊㅏㅋㅏㅌㅏㅍㅏㅎㅏ',
    '가나다라마바사아자차카타파하',
    '각낙닥락막박삭악작착칵탁팍학',
    '간난단란만반산안잔찬칸탄판한',
    '갈날달랄말발살알잘찰칼탈팔할'
  ];

  // 영어 자리연습 텍스트들
  const englishTexts = [
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiopasdfghjklzxcvbnm',
    'the quick brown fox jumps over',
    'pack my box with five dozen',
    'how vexingly quick daft zebras jump',
    'sphinx of black quartz judge my vow',
    'crazy fredrick bought many very exquisite',
    'amazingly few discotheques provide jukeboxes'
  ];

  const resetTyping = () => {
    setUserInput('');
    setResult(null);
    setStartTime(null);
    setCurrentIndex(0);
    updateNextKey('');
    setHasStarted(false);
  };

  const updateNextKey = (input: string) => {
    if (input.length < currentText.length) {
      setNextKey(currentText[input.length]);
    } else {
      setNextKey('');
    }
  };

  const calculateResult = () => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    const totalCharacters = currentText.length;
    const correctCharacters = [...currentText].filter((char, index) => 
      userInput[index] === char
    ).length;
    
    const accuracy = Math.round((correctCharacters / totalCharacters) * 100);
    const speed = Math.round(totalCharacters / timeElapsed * 60);
    
    setResult({
      accuracy,
      speed,
      time: Math.round(timeElapsed)
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
      const currentChar = currentText[userInput.length];
      if (userInput === currentChar) {
        // 올바른 문자 입력 시 다음 문자로
        if (userInput.length < currentText.length) {
          setUserInput('');
          updateNextKey('');
        } else {
          // 모든 문자 완료
          calculateResult();
        }
      } else {
        // 잘못된 문자 입력 시 입력 초기화
        setUserInput('');
      }
    }
  };

  const nextText = () => {
    const texts = language === 'korean' ? koreanTexts : englishTexts;
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetTyping();
    }
  };

  const prevText = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTyping();
    }
  };

  const changeLanguage = (newLanguage: 'korean' | 'english') => {
    setLanguage(newLanguage);
    setCurrentIndex(0);
    resetTyping();
  };

  useEffect(() => {
    const texts = language === 'korean' ? koreanTexts : englishTexts;
    setCurrentText(texts[currentIndex]);
  }, [currentIndex, language]);

  const currentTexts = language === 'korean' ? koreanTexts : englishTexts;

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-cyan-400/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cyan-300" />
        </button>
        <StudentHeading size="h1">자리연습</StudentHeading>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {/* 언어 선택 */}
        <div className="mb-6">
          <StudentText variant="secondary" className="text-lg mb-4">언어 선택</StudentText>
          <div className="flex gap-4">
            <button
              onClick={() => changeLanguage('korean')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                language === 'korean'
                  ? "bg-cyan-400 text-cyan-900"
                  : "bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
              )}
            >
              <Keyboard className="w-5 h-5" />
              한글
            </button>
            <button
              onClick={() => changeLanguage('english')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                language === 'english'
                  ? "bg-cyan-400 text-cyan-900"
                  : "bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
              )}
            >
              <Globe className="w-5 h-5" />
              영어
            </button>
          </div>
        </div>

        {/* 연습 텍스트 선택 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <StudentText variant="secondary" className="text-lg">
              연습 {currentIndex + 1} / {currentTexts.length}
            </StudentText>
            <div className="flex gap-2">
              <button
                onClick={prevText}
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
                onClick={nextText}
                disabled={currentIndex === currentTexts.length - 1}
                className={cn(
                  "px-3 py-1 rounded text-sm transition-colors",
                  currentIndex === currentTexts.length - 1 
                    ? "text-cyan-400/40 cursor-not-allowed" 
                    : "text-cyan-300 hover:bg-cyan-400/10"
                )}
              >
                다음
              </button>
            </div>
          </div>
        </div>

        {/* 연습 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 메인 연습 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 타겟 텍스트 */}
            <div className="lg:col-span-2">
              <StudentCard className="p-8 h-80 flex flex-col">
                <div className="text-center mb-6 flex-1 flex items-center justify-center">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-6xl font-mono text-cyan-300 leading-relaxed" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                      {currentText[userInput.length] || '완료!'}
                    </div>
                    {userInput.length < currentText.length - 1 && (
                      <div className="text-lg font-mono text-cyan-400/30 leading-relaxed">
                        다음: {currentText[userInput.length + 1]}
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
                        placeholder="여기에 타이핑하세요..."
                        className={cn(
                          "flex-1 p-3 text-lg font-mono rounded-lg border transition-colors",
                          "bg-cyan-400/10 border-cyan-400/30 text-cyan-100",
                          "focus:border-cyan-400 focus:outline-none"
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
                      <div className="w-full bg-cyan-400/20 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(userInput.length / currentText.length) * 100}%` }}
                        />
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
                <div className="grid grid-cols-3 gap-6">
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
                </div>
              </div>
            </StudentCard>
          )}
        </div>
      </div>
    </div>
  );
}
