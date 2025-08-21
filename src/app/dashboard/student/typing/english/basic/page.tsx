'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Globe, Keyboard } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
}

export default function EnglishBasicPage() {
  const router = useRouter();
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<'korean' | 'english'>('english');
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

  const startTyping = () => {
    setIsTyping(true);
    setStartTime(Date.now());
    setUserInput('');
    setResult(null);
    setCurrentIndex(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const resetTyping = () => {
    setIsTyping(false);
    setUserInput('');
    setResult(null);
    setStartTime(null);
    setCurrentIndex(0);
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
    
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    // 타이핑 완료 체크
    if (value.length === currentText.length) {
      calculateResult();
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

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
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
          {/* 연습 텍스트 */}
          <StudentCard className="mb-6 p-8">
            <div className="text-center">
              <div className="text-3xl font-mono text-cyan-100 mb-4 leading-relaxed">
                {currentText}
              </div>
              <div className="text-sm text-cyan-400">
                총 {currentText.length}자
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
                  disabled={!isTyping}
                  placeholder={isTyping ? "여기에 타이핑하세요..." : "시작 버튼을 눌러주세요"}
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
                <div className="w-full bg-cyan-400/20 rounded-full h-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(userInput.length / currentText.length) * 100}%` }}
                  />
                </div>
              )}
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
