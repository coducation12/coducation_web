'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';
import { saveTypingResult } from '@/lib/actions';
import { koreanSentences, englishSentences } from '@/constants/typing-data';

// 한글 자모 분해 함수
function decomposeHangul(char: string): string[] {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) {
    // 완성형 한글이 아닌 경우 (자음, 모음 등)
    return [char];
  }

  const choseong = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const jungseong = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const jongseong = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;

  const result = [choseong[cho], jungseong[jung]];
  if (jong > 0) {
    result.push(jongseong[jong]);
  }

  return result;
}

interface TypingResult {
  accuracy: number;
  speed: number;
  wpm?: number;
  time: number;
  totalKeyPresses: number;
  actualCharacters?: number;
}

interface WordTiming {
  word: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  cpm?: number;
}

// 한글 단문 50개 목록

export const dynamic = 'force-dynamic';

export default function SentencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLanguage = searchParams.get('language') as 'korean' | 'english' || 'korean';

  const [language, setLanguage] = useState<'korean' | 'english'>(initialLanguage);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [correctHistory, setCorrectHistory] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeyPresses, setTotalKeyPresses] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const [showResultModal, setShowResultModal] = useState(false);
  const [lastWordCPM, setLastWordCPM] = useState<number | null>(null);

  const [currentChar, setCurrentChar] = useState('');
  const [nextChar, setNextChar] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [currentWord, setCurrentWord] = useState('');

  const [userInput, setUserInput] = useState('');
  const [currentJamoIndex, setCurrentJamoIndex] = useState(0);
  const [currentJamos, setCurrentJamos] = useState<string[]>([]);

  const [isComposing, setIsComposing] = useState(false);
  const [compositionData, setCompositionData] = useState('');

  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [currentWordStartTime, setCurrentWordStartTime] = useState<number | null>(null);
  const wordStartTimeRef = useRef<number | null>(null);

  const generateRandomSentences = (language: 'korean' | 'english') => {
    const sentencePool = language === 'korean' ? koreanSentences : englishSentences;
    const shuffled = [...sentencePool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20); // 20개 문장 선택
  };

  const [words, setWords] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWords(generateRandomSentences(language));
  }, [language]);

  const getCurrentItem = useCallback((): string => {
    if (!words.length) return '';
    return words[currentCharIndex % words.length];
  }, [currentCharIndex, words]);

  const getNextItem = useCallback((): string => {
    const nextIndex = currentCharIndex + 1;
    if (nextIndex >= 20 || !words.length) return '';
    return words[nextIndex % words.length];
  }, [currentCharIndex, words]);

  const calculateResult = useCallback(async (
    finalInputHistory?: string[],
    finalCorrectHistory?: boolean[],
    finalWordTimings?: WordTiming[],
    finalKeyPresses?: number
  ) => {
    // 인자로 전달된 값이 있으면 사용, 없으면 상태값 사용 (React 상태 업데이트 지연 대응)
    const currentInputHistory = finalInputHistory || inputHistory;
    const currentCorrectHistory = finalCorrectHistory || correctHistory;
    const currentWordTimings = finalWordTimings || wordTimings;
    const currentKeyPresses = finalKeyPresses || totalKeyPresses;

    const totalItems = currentInputHistory.length;
    const correctItems = currentCorrectHistory.filter(Boolean).length;
    const accuracy = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;

    let averageCPM = 0;
    if (currentWordTimings.length > 0) {
      const validTimings = currentWordTimings.filter(timing => timing.cpm && timing.cpm > 0);
      if (validTimings.length > 0) {
        const totalCPM = validTimings.reduce((sum, timing) => sum + (timing.cpm || 0), 0);
        averageCPM = Math.round(totalCPM / validTimings.length);
      }
    }

    let finalCPM = 0;
    let finalWPM = 0;
    if (accuracy > 0) {
      const accuracyRatio = accuracy / 100;
      finalCPM = Math.round(averageCPM * accuracyRatio);
      finalWPM = Math.round(finalCPM / 5);
    }

    const totalTimeMinutes = startTime ? (Date.now() - startTime) / (1000 * 60) : 0;
    const clampedTimeMinutes = Math.max(0.1, totalTimeMinutes);

    let totalTypedCharacters = 0;
    for (let i = 0; i < currentInputHistory.length; i++) {
      const inputWord = currentInputHistory[i] || '';
      if (language === 'korean') {
        totalTypedCharacters += inputWord.split('').reduce((sum, char) => {
          return sum + decomposeHangul(char).length;
        }, 0);
      } else {
        totalTypedCharacters += inputWord.length;
      }
    }

    const resultData = {
      accuracy,
      speed: finalCPM,
      wpm: finalWPM,
      time: Math.round(clampedTimeMinutes * 60),
      totalKeyPresses: currentKeyPresses,
      actualCharacters: totalTypedCharacters
    };

    try {
      await saveTypingResult({
        accuracy: resultData.accuracy,
        speed: resultData.speed,
        wpm: resultData.wpm,
        time: resultData.time,
        language: language
      });
    } catch (error) {
      console.error('타자연습 결과 저장 실패:', error);
    }

    setResult(resultData);
    setShowResultModal(true);
  }, [inputHistory, correctHistory, totalKeyPresses, startTime, language, wordTimings]);

  const moveToNextPosition = useCallback((
    finalInputHistory?: string[],
    finalCorrectHistory?: boolean[],
    finalWordTimings?: WordTiming[],
    finalKeyPresses?: number
  ) => {
    const nextIndex = currentCharIndex + 1;
    if (nextIndex >= 20) {
      calculateResult(finalInputHistory, finalCorrectHistory, finalWordTimings, finalKeyPresses);
    } else {
      setCurrentCharIndex(nextIndex);
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 0);
    }
  }, [currentCharIndex, calculateResult]);

  const setIMEHint = useCallback((targetLanguage: 'korean' | 'english') => {
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.setAttribute('lang', targetLanguage === 'korean' ? 'ko' : 'en');
      inputElement.setAttribute('inputmode', 'text');
      if ('setInputMethodHint' in inputElement) {
        (inputElement as any).setInputMethodHint(targetLanguage === 'korean' ? 'korean' : 'english');
      }
      inputElement.blur();
      setTimeout(() => inputElement.focus(), 50);
    }
  }, []);

  const setIMELanguage = useCallback((targetLanguage: 'korean' | 'english') => {
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.setAttribute('lang', targetLanguage === 'korean' ? 'ko' : 'en');
      inputElement.setAttribute('inputmode', 'text');
    }
    setIMEHint(targetLanguage);
  }, [setIMEHint]);

  const updateCurrentAndNextChar = useCallback(() => {
    const currentItem = getCurrentItem();
    const nextItem = getNextItem();
    setCurrentChar(currentItem);
    setNextChar(nextItem);
    setCurrentWord(currentItem);
    setIMELanguage(language);

    if (language === 'korean' && currentItem) {
      const decomposed = currentItem.split('').flatMap(char => decomposeHangul(char));
      setCurrentJamos(decomposed);
      setCurrentJamoIndex(0);
    } else {
      setCurrentJamos([]);
      setCurrentJamoIndex(0);
    }
  }, [getCurrentItem, getNextItem, language, currentCharIndex, setIMELanguage]);

  useEffect(() => {
    updateCurrentAndNextChar();
  }, [language, currentCharIndex, updateCurrentAndNextChar]);

  const resetTyping = () => {
    setCurrentCharIndex(0);
    setInputHistory([]);
    setCorrectHistory([]);
    setStartTime(null);
    setTotalKeyPresses(0);
    setResult(null);
    setHasStarted(false);
    setShowResultModal(false);
    setUserInput('');
    setWordTimings([]);
    setCurrentWordStartTime(null);
    wordStartTimeRef.current = null;
    setCurrentJamoIndex(0);
    setCurrentJamos([]);
    setIsComposing(false);
    setCompositionData('');
    setLastWordCPM(null);
    setWords(generateRandomSentences(language));
  };

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionUpdate = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setCompositionData(e.data);
    if (language === 'korean' && currentJamos.length > 0) {
      const currentInput = e.currentTarget.value;
      const inputJamos = currentInput.split('').flatMap(char => decomposeHangul(char));
      const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
      setCurrentJamoIndex(newIndex);
    }
  }, [language, currentJamos]);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    setCompositionData('');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setUserInput(inputValue);

    if (!startTime && inputValue.length > 0) {
      setStartTime(Date.now());
    }

    if (!wordStartTimeRef.current && inputValue.length > 0) {
      const wordStartTime = Date.now();
      wordStartTimeRef.current = wordStartTime;
      setCurrentWordStartTime(wordStartTime);
    }

    if (!hasStarted && inputValue.length > 0) {
      setHasStarted(true);
    }

    if (!isComposing) {
      if (language === 'korean' && currentJamos.length > 0) {
        const inputJamos = inputValue.split('').flatMap(char => decomposeHangul(char));
        const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
        setCurrentJamoIndex(newIndex);
      }
      setIsWrong(false);
    } else {
      if (language === 'korean' && currentJamos.length > 0) {
        const inputJamos = inputValue.split('').flatMap(char => decomposeHangul(char));
        const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
        setCurrentJamoIndex(newIndex);
      }
    }
  }, [isComposing, language, currentJamos, startTime, userInput, hasStarted]);

  const checkWordInput = useCallback(() => {
    const isCorrect = userInput.trim() === currentWord;
    let keyPressCount = 0;
    if (language === 'korean') {
      keyPressCount = userInput.split('').flatMap(char => decomposeHangul(char)).length;
    } else {
      keyPressCount = userInput.length;
    }
    
    // 최신 상태값 계산 (React 상태 지연 방지용)
    const nextTotalKeyPresses = totalKeyPresses + keyPressCount;
    setTotalKeyPresses(nextTotalKeyPresses);

    const endTime = Date.now();
    let wordCPM = 0;
    let updatedWordTimings = [...wordTimings];

    if (wordStartTimeRef.current) {
      const duration = endTime - wordStartTimeRef.current;
      let characterCount = 0;
      if (language === 'korean') {
        characterCount = currentWord.split('').flatMap(char => decomposeHangul(char)).length;
      } else {
        characterCount = currentWord.length;
      }
      const durationMinutes = duration / (1000 * 60);
      const correctCharCount = userInput.split('').reduce((count, char, index) => {
        return count + (char === currentWord[index] ? 1 : 0);
      }, 0);
      const accuracyRatio = correctCharCount / currentWord.length;

      if (accuracyRatio < 0.5) {
        wordCPM = 0;
      } else {
        wordCPM = durationMinutes > 0 ? Math.round(characterCount / durationMinutes) : 0;
      }

      const wordTiming: WordTiming = {
        word: currentWord,
        startTime: wordStartTimeRef.current,
        endTime: endTime,
        duration: duration,
        cpm: wordCPM
      };
      updatedWordTimings.push(wordTiming);
      setWordTimings(updatedWordTimings);
    }

    setLastWordCPM(wordCPM);
    
    const nextInputHistory = [...inputHistory, userInput];
    const nextCorrectHistory = [...correctHistory, isCorrect];
    
    setInputHistory(nextInputHistory);
    setCorrectHistory(nextCorrectHistory);
    setUserInput('');
    setIsWrong(false);
    setCurrentWordStartTime(null);
    wordStartTimeRef.current = null;
    
    // 최신 데이터를 인자로 전달하여 레이스 컨디션 방지
    moveToNextPosition(nextInputHistory, nextCorrectHistory, updatedWordTimings, nextTotalKeyPresses);
  }, [userInput, currentWord, totalKeyPresses, inputHistory, correctHistory, wordTimings, moveToNextPosition, language]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showResultModal) return;
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement && document.activeElement !== inputElement) {
        inputElement.focus();
      }

      if (event.key === 'Enter' || event.key === ' ') { 
        const currentSentence = words[currentCharIndex];
        const completionRate = userInput.length / (currentSentence?.length || 1);
        
        // 90% 이상 입력했을 때만 다음으로 넘어감 (부정행위 방지 및 단문 특성 반영)
        if (completionRate >= 0.9) {
          event.preventDefault();
          event.stopPropagation();
          checkWordInput();
        } else if (event.key === 'Enter') {
          // 엔터 키의 경우 기존처럼 항상 방지하고, 90% 미만이면 무시
          event.preventDefault();
          event.stopPropagation();
        }
        // 스페이스바의 경우 90% 미만이면 그대로 문장 내 공백으로 입력되도록 통과시킴
      }
    };

    const handleClick = () => {
      if (!showResultModal) {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          setTimeout(() => inputElement.focus(), 0);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !showResultModal) {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          setTimeout(() => inputElement.focus(), 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkWordInput, userInput, showResultModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIMELanguage(language);
    }, 200);
    return () => clearTimeout(timer);
  }, [language, setIMELanguage]);

  return (
    <div className="h-screen overflow-y-auto scrollbar-hide bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 border-2 border-cyan-400 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-cyan-400 transform rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-2 pt-14 sm:p-4 sm:pt-16 lg:p-6 lg:pt-6">
        <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-4">
          <button
            onClick={() => router.back()}
            className="p-1 px-2 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-500/30"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            단문연습
          </h1>
          <div className="flex items-center gap-2">
            <div className="text-[10px] sm:text-xs text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
              {language === 'korean' ? '한글 모드' : '영어 모드'}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400">
              한영전환: <span className="text-cyan-400 font-mono">한/영</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col pt-2 sm:pt-4 lg:pt-8 px-2 sm:px-6 min-h-0">
          {mounted && words.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center mb-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 min-h-0">
              <div className="mb-1 sm:mb-2 text-center h-4 flex items-center justify-center">
                {lastWordCPM !== null ? (
                  <div className="text-cyan-400 text-base sm:text-lg font-bold">
                    {lastWordCPM} CPM
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
              </div>

              {/* 문장 박스 영역 (예제 4개 + 현재 1개) */}
              <div className="w-full mb-2 sm:mb-4 lg:mb-6 bg-slate-800/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-8 xl:p-10 border border-cyan-500/20 shadow-2xl overflow-hidden self-stretch transition-all duration-500 flex-1 flex flex-col min-h-0">
                {/* 예제 문장들 (공간 부족 시 먼저 줄어들거나 가려지는 영역) */}
                <div className="flex-1 min-h-0 flex flex-col-reverse gap-1 sm:gap-2 transition-all duration-500 overflow-hidden">
                  {[1, 2, 3, 4].map((offset) => {
                    const targetIndex = currentCharIndex + offset;
                    const hasWord = targetIndex < words.length;

                    const opacity = 1 - (offset * 0.2);
                    const scale = 1 - (offset * 0.05);

                    return (
                      <div
                        key={offset}
                        className="font-mono text-xs sm:text-xl font-medium leading-normal whitespace-nowrap text-left text-white/20 transition-all duration-500 min-h-[1.2em] sm:min-h-[1.5em]"
                        style={{
                          opacity: hasWord ? opacity : 0,
                          transform: `scale(${scale})`,
                          transformOrigin: 'left bottom',
                        }}
                      >
                        {hasWord ? words[targetIndex] : '\u00A0'}
                      </div>
                    );
                  })}
                </div>

                {/* 현재 입력 중인 문장과 그 아래의 입력창 (항상 보여야 하는 핵심 영역) */}
                <div className="flex-shrink-0 relative mt-2 pt-2 sm:mt-4 sm:pt-4 border-t border-cyan-500/20 overflow-hidden">
                    <div
                      className={cn(
                        "font-mono text-base sm:text-2xl lg:text-3xl font-medium leading-normal whitespace-nowrap transition-all duration-300 text-left",
                        isWrong ? "text-red-300 scale-[1.01]" : "text-white/40"
                      )}
                    >
                      {words[currentCharIndex]}
                    </div>

                    <div
                      className="font-mono text-base sm:text-2xl lg:text-3xl font-medium leading-normal whitespace-nowrap min-h-[1.2em] flex text-left items-center tracking-normal mt-1 sm:mt-2"
                    >
                      {userInput.split('').map((char, index) => {
                        const isCorrect = index < words[currentCharIndex].length && char === words[currentCharIndex][index];
                        return (
                          <span
                            key={index}
                            className={cn(
                              "transition-colors duration-200",
                              isCorrect ? "text-white" : "text-red-400"
                            )}
                            style={{ whiteSpace: 'pre' }}
                          >
                            {char}
                          </span>
                        );
                      })}
                      <span className="inline-block w-0.5 h-[1.1em] bg-cyan-400 animate-pulse ml-0.5 align-middle self-center"></span>
                    </div>
                  </div>


                <input
                  ref={(input) => {
                    if (input && !showResultModal) {
                      input.focus();
                    }
                  }}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onCompositionStart={handleCompositionStart}
                  onCompositionUpdate={handleCompositionUpdate}
                  onCompositionEnd={handleCompositionEnd}
                  onBlur={(e) => {
                    if (!showResultModal) {
                      setTimeout(() => e.target.focus(), 0);
                    }
                  }}
                  lang={language === 'korean' ? 'ko' : 'en'}
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="opacity-0 absolute -left-9999px"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  key={currentCharIndex}
                />
              </div>

              <div className="hidden lg:block bg-slate-800/90 backdrop-blur-sm rounded-xl xl:rounded-3xl p-2 xl:p-4 shadow-2xl border border-cyan-500/30 w-full max-w-5xl mx-auto animate-in fade-in-0 slide-in-from-bottom-2 duration-700 delay-200">
                <div className="mb-1.5 sm:mb-3">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-cyan-300 text-[10px] sm:text-xs">단문 연습</span>
                    <span className="text-cyan-300 text-[10px] sm:text-xs">{currentCharIndex + 1} / 20</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCharIndex + 1) / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex keyboard-row-gap mb-1 sm:mb-2">
                    <div className="responsive-key rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      ~
                    </div>
                    {['! 1', '@ 2', '# 3', '$ 4', '% 5', '^ 6', '& 7', '* 8', '( 9', ') 0'].map((key, index) => (
                      <div key={index} className="responsive-key rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                        <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                        <span className="font-bold text-sm">{key.split(' ')[1]}</span>
                      </div>
                    ))}
                    <div className="responsive-key rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      <span className="text-cyan-400 text-xs">-</span>
                      <span className="font-bold text-sm">-</span>
                    </div>
                    <div className="responsive-key rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      <span className="text-cyan-400 text-xs">+</span>
                      <span className="font-bold text-sm">=</span>
                    </div>
                    <div className="responsive-key-wide w-20 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      ⌫
                    </div>
                  </div>

                  <div className="flex keyboard-row-gap mb-1 sm:mb-2">
                    <div className="responsive-key-wide w-16 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      Tab
                    </div>
                    {(language === 'korean' ? ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'] : ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']).map((key, index) => {
                      let targetKey = '';
                      if (language === 'korean' && currentJamos.length > 0) {
                        targetKey = currentJamos[currentJamoIndex];
                      } else if (language === 'english') {
                        targetKey = currentWord[userInput.length]?.toUpperCase() || '';
                      }

                      return (
                        <div
                          key={index}
                          className={cn(
                            "responsive-key rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200",
                            key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                            key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300"
                          )}
                        >
                          {key}
                        </div>
                      );
                    })}
                    {['{ [', '} ]'].map((key, index) => (
                      <div key={index} className="responsive-key rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                        <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                        <span className="font-bold text-sm">{key.split(' ')[1]}</span>
                      </div>
                    ))}
                    <div className="responsive-key-wide w-16 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                      <span className="text-cyan-400 text-xs">|</span>
                      <span className="font-bold text-sm">\</span>
                    </div>
                  </div>

                  <div className="flex keyboard-row-gap mb-1 sm:mb-2 justify-center">
                    <div className="responsive-key-wide w-20 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Caps
                    </div>
                    {(language === 'korean' ? ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'] : ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']).map((key, index) => {
                      let targetKey = '';
                      if (language === 'korean' && currentJamos.length > 0) {
                        targetKey = currentJamos[currentJamoIndex];
                      } else if (language === 'english') {
                        targetKey = currentWord[userInput.length]?.toUpperCase() || '';
                      }

                      return (
                        <div
                          key={index}
                          className={cn(
                            "responsive-key rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200",
                            key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                            key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300"
                          )}
                        >
                          {key}
                        </div>
                      );
                    })}
                    <div className="responsive-key rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                      <span className="text-cyan-400 text-xs">:</span>
                      <span className="font-bold text-sm">;</span>
                    </div>
                    <div className="responsive-key rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                      <span className="text-cyan-400 text-xs">"</span>
                      <span className="font-bold text-sm">'</span>
                    </div>
                    <div className="responsive-key-wide w-20 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      ↵
                    </div>
                  </div>

                  <div className="flex keyboard-row-gap mb-1 sm:mb-2 justify-center">
                    <div className="responsive-key-wide w-24 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Shift
                    </div>
                    {(language === 'korean' ? ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'] : ['Z', 'X', 'C', 'V', 'B', 'N', 'M']).map((key, index) => {
                      let targetKey = '';
                      if (language === 'korean' && currentJamos.length > 0) {
                        targetKey = currentJamos[currentJamoIndex];
                      } else if (language === 'english') {
                        targetKey = currentWord[userInput.length]?.toUpperCase() || '';
                      }

                      return (
                        <div
                          key={index}
                          className={cn(
                            "responsive-key rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200",
                            key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                            key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300"
                          )}
                        >
                          {key}
                        </div>
                      );
                    })}
                    <div className="responsive-key-wide w-36 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Shift
                    </div>
                  </div>

                  <div className="flex space-x-1 justify-center">
                    <div className="responsive-key-wide w-16 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Ctrl
                    </div>
                    <div className="responsive-key-wide w-16 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Alt
                    </div>
                    <div
                      className={cn(
                        "responsive-key-wide w-72 rounded-lg border-2 flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-200",
                        (language === 'korean' ? (currentJamos[currentJamoIndex] === ' ') : (currentWord[userInput.length] === ' '))
                          ? "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105"
                          : "border-cyan-500/50 bg-slate-700 text-cyan-300"
                      )}
                    >
                      Space
                    </div>
                    <div className="responsive-key-wide w-16 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Alt
                    </div>
                    <div className="responsive-key-wide w-16 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Ctrl
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-cyan-400 animate-pulse text-xl font-mono">Loading...</div>
            </div>
          )}
        </div>
      </div>

      {showResultModal && result && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-cyan-500/30">
            <div className="flex items-center justify-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">연습 완료! 🎉</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{result.accuracy}%</div>
                  <div className="text-sm text-cyan-300">정확도</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{result.speed}</div>
                  <div className="text-sm text-cyan-300">분당 문자수</div>
                </div>
                {result.wpm && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{result.wpm}</div>
                    <div className="text-sm text-green-300">분당 단어수</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{result.time}초</div>
                  <div className="text-sm text-cyan-300">타이핑 시간</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowResultModal(false); resetTyping(); }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
                >
                  다시 연습
                </button>
                <button
                  onClick={() => router.push('/dashboard/student/typing')}
                  className="flex-1 px-4 py-3 bg-slate-700 text-cyan-300 rounded-lg font-medium hover:bg-slate-600 transition-colors border border-cyan-500/30"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
