'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';
import { saveTypingResult } from '@/lib/actions';

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
const koreanSentences = [
  '살아야 한다. 살아야 비로소 보이는 것들이 있다.',
  '재능은 꽃피우는 것, 센스는 갈고 닦는 것.',
  '나는 아직 아무것도 아니야. 그래서 계속 나아간다.',
  '중요한 건 결과가 아닌, 그 과정이다.',
  '사람이 언제 죽는다고 생각하나. 사람들에게 잊혀졌을 때다.',
  '등가교환, 그것이 이 세계의 법칙이다.',
  '우리는 답을 찾을 것이다. 늘 그래왔듯이.',
  '우리가 누군지는 우리가 하는 선택에 달려 있다.',
  '지금 이 순간이, 나를 바꾸는 시작이다.',
  '포기하지 않는 게 가장 큰 재능이다.',
  '남이 전한 한계에 나를 맞출 필요는 없다.',
  '호의가 계속되면, 그게 권리인 줄 알아요.',
  '중요한 건 꺾이지 않는 마음이다.',
  '진정한 자유는 모든 것을 잃었을 때 찾아온다.',
  '기적은 노력의 또 다른 이름이다.',
  '사랑은 누군가를 너보다 먼저 생각하는 거야.',
  '오늘을 잡아라. 인생을 특별하게 만들어라.',
  '용기는 두려움이 없는 게 아니라, 이겨내는 것이다.',
  '할 수 있다고 믿는 순간, 이미 절반은 성공한 거야.',
  '가는 말이 고와야 오는 말이 곱다는 사실을 기억하자.',
  '천 리 길도 한 걸음부터 시작한다는 마음으로 임하자.',
  '세 살 버릇 여든까지 간다는 말처럼 습관이 중요하다.',
  '고생 끝에 낙이 온다는 믿음으로 오늘을 견뎌내자.',
  '돌다리도 두들겨 보고 건너라는 말은 언제나 유효하다.',
  '벼는 익을수록 고개를 숙이듯 겸손한 자세를 갖추자.',
  '티끌 모아 태산이라는 말처럼 작은 노력이 큰 결과를 만든다.',
  '실패는 성공의 어머니이며 우리를 더 강하게 만든다.',
  '일찍 일어나는 새가 벌레를 잡는다는 부지런함을 배우자.',
  '백지장도 맞들면 낫다는 말처럼 협력의 가치를 알자.',
  '시작이 반이라는 말처럼 용기 있게 첫걸음을 내딛자.',
  '너 자신을 알라. 그것이 지혜의 시작이다.',
  '생각하는 대로 살지 않으면 사는 대로 생각하게 된다.',
  '내일 지구의 종말이 올지라도 나는 사과나무를 심겠다.',
  '꿈을 꿀 수 있다면 그것을 이룰 수도 있다.',
  '가장 위대한 영광은 넘어질 때마다 일어나는 것이다.',
  '지식보다 중요한 것은 상상력이라는 사실을 기억해.',
  '행복은 이미 만들어진 것이 아니라 당신의 행동에서 나온다.',
  '최후의 웃음을 웃는 자가 가장 잘 웃는 자이다.',
  '인생은 짧고 예술은 길다는 말은 영원한 진리이다.',
  '하늘은 스스로 돕는 자를 돕는다는 사실을 잊지 마라.',
  '어제는 역사이고 내일은 미스터리이며 오늘은 선물이다.',
  '과거는 아플 수 있지만, 도망치거나 배울 수 있어.',
  '무한한 공간, 저 너머로 함께 나아가자!',
  '역경 속에 피어나는 꽃이 가장 귀하고 아름다운 법이다.',
  '기억해, 너는 세상을 빛낼 수 있는 소중한 존재야.',
  '길은 잃어도 상관없어. 다시 찾으면 되니까.',
  '매일이 행복하진 않지만, 행복한 일은 매일 있어.',
  '가장 어두운 밤도 결국 끝나고 해가 뜰 것이다.',
  '끝까지 해보기 전까지는 늘 불가능해 보이기 마련이다.',
  '인생은 가까이서 보면 비극이지만 멀리서 보면 희극이다.'
];

const englishSentences = [
  'A barking dog never bites.',
  'Practice makes perfect in everything we do.',
  'Actions speak louder than words in every situation.',
  'Don\'t judge a book by its cover at first sight.',
  'Every cloud has a silver lining if you look closely.',
  'The early bird catches the worm every single morning.',
  'Success is the sum of small efforts repeated daily.',
  'To infinity and beyond, let\'s go on an adventure!',
  'The flower that blooms in adversity is the most rare.',
  'Life is like a box of chocolates, you never know.',
  'The past can hurt, but you can learn from it.',
  'It is not our abilities that show who we truly are.',
  'May the Force be with you in all your journeys.',
  'Happiness can be found even in the darkest of times.',
  'Everything you can imagine is real in your mind.',
  'Stay hungry, stay foolish, and keep moving forward.',
  'The only way to do great work is to love what you do.',
  'Believe you can and you are halfway there already.',
  'Your time is limited, so do not waste it living someone else\'s life.',
  'The best way to predict the future is to create it.',
  'You are going to need a bigger boat for this journey.',
  'Here is looking at you, kid, in the middle of the night.',
  'I am the king of the world, standing on the edge.',
  'My precious, the one ring to rule them all and find them.',
  'Elementary, my dear Watson, the solution is right here.',
  'Houston, we have a problem, but we will find a solution.',
  'There is no place like home, no matter where you go.',
  'Keep your friends close, but your enemies even closer.',
  'Why so serious? Let us put a smile on that face.',
  'I am your father, join me and rule the galaxy together.',
  'Just keep swimming, just keep swimming into the deep blue.',
  'Oh yes, the past can hurt, but you can learn from it.',
  'Ohana means family, and family means nobody gets left behind.',
  'The cold never bothered me anyway, in this winter land.',
  'To be or not to be, that is the ultimate question.',
  'A rolling stone gathers no moss as it moves along.',
  'A stitch in time saves nine, so fix it while you can.',
  'All that glitters is not gold, so look beneath the surface.',
  'Honesty is the best policy in every corner of life.',
  'Where there is a will, there is a way to achieve it.',
  'Knowledge is power, but wisdom is using it correctly.',
  'Laughter is the best medicine for a weary soul.',
  'Rome was not built in a day, so be patient with yourself.',
  'Better late than never, but better never late at all.',
  'Beauty is in the eye of the beholder, always remember.',
  'I think, therefore I am, a conscious being in this world.',
  'The only thing I know is that I know nothing at all.',
  'What does not kill us makes us stronger in the end.',
  'An unexamined life is not worth living for any man.',
  'Carpe Diem. Seize the day and make your life extraordinary.'
];

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

  const calculateResult = useCallback(async () => {
    const totalItems = inputHistory.length;
    const correctItems = correctHistory.filter(Boolean).length;
    const accuracy = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;

    let averageCPM = 0;
    if (wordTimings.length > 0) {
      const validTimings = wordTimings.filter(timing => timing.cpm && timing.cpm > 0);
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
    for (let i = 0; i < inputHistory.length; i++) {
      const inputWord = inputHistory[i] || '';
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
      totalKeyPresses: totalKeyPresses,
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

  const moveToNextPosition = useCallback(() => {
    const nextIndex = currentCharIndex + 1;
    if (nextIndex >= 20) {
      calculateResult();
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
    setTotalKeyPresses(prev => prev + keyPressCount);

    const endTime = Date.now();
    let wordCPM = 0;

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
      setWordTimings(prev => [...prev, wordTiming]);
    } else {
      wordCPM = 60;
    }

    setLastWordCPM(wordCPM);
    setInputHistory(prev => [...prev, userInput]);
    setCorrectHistory(prev => [...prev, isCorrect]);
    setUserInput('');
    setIsWrong(false);
    setCurrentWordStartTime(null);
    wordStartTimeRef.current = null;
    moveToNextPosition();
  }, [userInput, currentWord, currentWordStartTime, moveToNextPosition, language]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showResultModal) return;
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement && document.activeElement !== inputElement) {
        inputElement.focus();
      }

      if (event.key === 'Enter') { // 단문 연습에서는 스페이스바를 허용하고 엔터로만 넘어감
        event.preventDefault();
        event.stopPropagation();
        if (userInput.trim().length > 0) {
          checkWordInput();
        }
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

      <div className="relative z-10 w-full h-full flex flex-col p-3 pt-16 sm:p-4 sm:pt-18 lg:p-6 lg:pt-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 sm:p-2 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-500/30"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            단문연습
          </h1>
          <div className="flex items-center gap-2">
            <div className="text-xs text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
              {language === 'korean' ? '한글 모드' : '영어 모드'}
            </div>
            <div className="text-xs text-slate-400">
              한영전환: <span className="text-cyan-400 font-mono">한/영</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col pt-8">
          {mounted && words.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-start mb-1 sm:mb-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="mb-4 text-center h-4 sm:h-5 lg:h-6 flex items-center justify-center">
                {lastWordCPM !== null ? (
                  <div className="text-cyan-400 text-lg sm:text-xl font-bold">
                    {lastWordCPM} CPM
                  </div>
                ) : (
                  <div className="h-4 sm:h-5 lg:h-6"></div>
                )}
              </div>

              {/* 문장 박스 영역 (5개 문장 노출) */}
              <div className="w-full max-w-5xl mx-auto mb-10 bg-slate-800/40 backdrop-blur-md rounded-3xl p-10 lg:p-14 border border-cyan-500/20 shadow-2xl overflow-hidden">
                <div className="flex flex-col-reverse gap-4 transition-all duration-500">
                  {/* 현재 입력 중인 문장과 그 아래의 입력창 */}
                  <div className="relative mt-4 pt-4 border-t border-cyan-500/20 overflow-hidden">
                    <div 
                      className={cn(
                        "font-mono text-xl sm:text-2xl lg:text-3xl font-medium leading-normal whitespace-nowrap transition-all duration-300 text-left",
                        isWrong ? "text-red-300 scale-[1.01]" : "text-white/40"
                      )}
                    >
                      {words[currentCharIndex]}
                    </div>

                    <div 
                      className="font-mono text-xl sm:text-2xl lg:text-3xl font-medium leading-normal whitespace-nowrap min-h-[1.2em] flex text-left items-center tracking-normal mt-2"
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

                  {[1, 2, 3, 4].map((offset) => {
                    const targetIndex = currentCharIndex + offset;
                    if (targetIndex >= words.length) return null;

                    const opacity = 1 - (offset * 0.2);
                    const scale = 1 - (offset * 0.05);

                    return (
                      <div
                        key={targetIndex}
                        className="font-mono text-lg sm:text-xl lg:text-2xl font-medium leading-normal whitespace-nowrap text-left text-white/20 transition-all duration-500"
                        style={{
                          opacity: opacity,
                          transform: `scale(${scale})`,
                          transformOrigin: 'left bottom',
                        }}
                      >
                        {words[targetIndex]}
                      </div>
                    );
                  })}
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

              <div className="hidden lg:block bg-slate-800/90 backdrop-blur-sm rounded-2xl xl:rounded-3xl p-3 xl:p-4 shadow-2xl border border-cyan-500/30 w-full max-w-4xl animate-in fade-in-0 slide-in-from-bottom-2 duration-700 delay-200">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-300 text-sm">단문 연습</span>
                    <span className="text-cyan-300 text-sm">{currentCharIndex + 1} / 20</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCharIndex + 1) / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex space-x-1 mb-2">
                    <div className="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      ~
                    </div>
                    {['! 1', '@ 2', '# 3', '$ 4', '% 5', '^ 6', '& 7', '* 8', '( 9', ') 0'].map((key, index) => (
                      <div key={index} className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                        <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                        <span className="font-bold text-sm">{key.split(' ')[1]}</span>
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      <span className="text-cyan-400 text-xs">-</span>
                      <span className="font-bold text-sm">-</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      <span className="text-cyan-400 text-xs">+</span>
                      <span className="font-bold text-sm">=</span>
                    </div>
                    <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      ⌫
                    </div>
                  </div>

                  <div className="flex space-x-1 mb-2">
                    <div className="w-16 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
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
                            "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200",
                            key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                            key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300"
                          )}
                        >
                          {key}
                        </div>
                      );
                    })}
                    {['{ [', '} ]'].map((key, index) => (
                      <div key={index} className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                        <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                        <span className="font-bold text-sm">{key.split(' ')[1]}</span>
                      </div>
                    ))}
                    <div className="w-16 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                      <span className="text-cyan-400 text-xs">|</span>
                      <span className="font-bold text-sm">\</span>
                    </div>
                  </div>

                  <div className="flex space-x-1 mb-2 justify-center">
                    <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
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
                            "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200",
                            key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                            key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300"
                          )}
                        >
                          {key}
                        </div>
                      );
                    })}
                    <div className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                      <span className="text-cyan-400 text-xs">:</span>
                      <span className="font-bold text-sm">;</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 cursor-pointer">
                      <span className="text-cyan-400 text-xs">"</span>
                      <span className="font-bold text-sm">'</span>
                    </div>
                    <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      ↵
                    </div>
                  </div>

                  <div className="flex space-x-1 mb-2 justify-center">
                    <div className="w-24 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
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
                            "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200",
                            key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                            key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300"
                          )}
                        >
                          {key}
                        </div>
                      );
                    })}
                    <div className="w-36 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Shift
                    </div>
                  </div>

                  <div className="flex space-x-1 justify-center">
                    <div className="w-16 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Ctrl
                    </div>
                    <div className="w-16 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Alt
                    </div>
                    <div
                      className={cn(
                        "w-72 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-200",
                        (language === 'korean' ? (currentJamos[currentJamoIndex] === ' ') : (currentWord[userInput.length] === ' '))
                          ? "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105"
                          : "border-cyan-500/50 bg-slate-700 text-cyan-300"
                      )}
                    >
                      Space
                    </div>
                    <div className="w-16 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
                      Alt
                    </div>
                    <div className="w-16 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300">
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
