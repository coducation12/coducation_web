'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Keyboard, Globe, Hand, Turtle, X } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface TypingResult {
  accuracy: number;
  speed: number;
  time: number;
  totalKeyPresses: number;
}

// 각 자리별 연습 시퀀스 (50개씩)
const koreanPositionSequences = {
  'basic': [
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ', ';', 'ㅁ', 'ㄴ'],
    ['ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ', ';', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ'],
    ['ㅓ', 'ㅏ', 'ㅣ', ';', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ'],
    ['ㅣ', ';', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ', ';'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ', ';', 'ㅁ', 'ㄴ']
  ],
  'left-upper': [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ'],
    ['ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ'],
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ'],
    ['ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ'],
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅂ', 'ㅈ']
  ],
  'right-upper': [
    ['ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ'],
    ['ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ'],
    ['ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅕ', 'ㅑ']
  ],
  'left-lower': [
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ'],
    ['ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ'],
    ['ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅌ']
  ],
  'right-lower': [
    ['ㅡ', ',', '.', '/', 'ㅡ', ',', '.', '/', 'ㅡ', ','],
    ['.', '/', 'ㅡ', ',', '.', '/', 'ㅡ', ',', '.', '/'],
    ['ㅡ', ',', '.', '/', 'ㅡ', ',', '.', '/', 'ㅡ', ','],
    ['.', '/', 'ㅡ', ',', '.', '/', 'ㅡ', ',', '.', '/'],
    ['ㅡ', ',', '.', '/', 'ㅡ', ',', '.', '/', 'ㅡ', ',']
  ],
  'center': [
    ['ㅅ', 'ㅛ', 'ㅎ', 'ㅗ', 'ㅠ', 'ㅜ', 'ㅅ', 'ㅛ', 'ㅎ', 'ㅗ'],
    ['ㅠ', 'ㅜ', 'ㅅ', 'ㅛ', 'ㅎ', 'ㅗ', 'ㅠ', 'ㅜ', 'ㅅ', 'ㅛ'],
    ['ㅎ', 'ㅗ', 'ㅠ', 'ㅜ', 'ㅅ', 'ㅛ', 'ㅎ', 'ㅗ', 'ㅠ', 'ㅜ'],
    ['ㅅ', 'ㅛ', 'ㅎ', 'ㅗ', 'ㅠ', 'ㅜ', 'ㅅ', 'ㅛ', 'ㅎ', 'ㅗ'],
    ['ㅠ', 'ㅜ', 'ㅅ', 'ㅛ', 'ㅎ', 'ㅗ', 'ㅠ', 'ㅜ', 'ㅅ', 'ㅛ']
  ]
};

const englishPositionSequences = {
  'basic': [
    ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'a', 's'],
    ['d', 'f', 'j', 'k', 'l', ';', 'a', 's', 'd', 'f'],
    ['j', 'k', 'l', ';', 'a', 's', 'd', 'f', 'j', 'k'],
    ['l', ';', 'a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'a', 's']
  ],
  'left-upper': [
    ['q', 'w', 'e', 'r', 'q', 'w', 'e', 'r', 'q', 'w'],
    ['e', 'r', 'q', 'w', 'e', 'r', 'q', 'w', 'e', 'r'],
    ['q', 'w', 'e', 'r', 'q', 'w', 'e', 'r', 'q', 'w'],
    ['e', 'r', 'q', 'w', 'e', 'r', 'q', 'w', 'e', 'r'],
    ['q', 'w', 'e', 'r', 'q', 'w', 'e', 'r', 'q', 'w']
  ],
  'right-upper': [
    ['u', 'i', 'o', 'p', 'u', 'i', 'o', 'p', 'u', 'i'],
    ['o', 'p', 'u', 'i', 'o', 'p', 'u', 'i', 'o', 'p'],
    ['u', 'i', 'o', 'p', 'u', 'i', 'o', 'p', 'u', 'i'],
    ['o', 'p', 'u', 'i', 'o', 'p', 'u', 'i', 'o', 'p'],
    ['u', 'i', 'o', 'p', 'u', 'i', 'o', 'p', 'u', 'i']
  ],
  'left-lower': [
    ['z', 'x', 'c', 'v', 'z', 'x', 'c', 'v', 'z', 'x'],
    ['c', 'v', 'z', 'x', 'c', 'v', 'z', 'x', 'c', 'v'],
    ['z', 'x', 'c', 'v', 'z', 'x', 'c', 'v', 'z', 'x'],
    ['c', 'v', 'z', 'x', 'c', 'v', 'z', 'x', 'c', 'v'],
    ['z', 'x', 'c', 'v', 'z', 'x', 'c', 'v', 'z', 'x']
  ],
  'right-lower': [
    ['m', ',', '.', '/', 'm', ',', '.', '/', 'm', ','],
    ['.', '/', 'm', ',', '.', '/', 'm', ',', '.', '/'],
    ['m', ',', '.', '/', 'm', ',', '.', '/', 'm', ','],
    ['.', '/', 'm', ',', '.', '/', 'm', ',', '.', '/'],
    ['m', ',', '.', '/', 'm', ',', '.', '/', 'm', ',']
  ],
  'center': [
    ['t', 'y', 'g', 'h', 'b', 'n', 't', 'y', 'g', 'h'],
    ['b', 'n', 't', 'y', 'g', 'h', 'b', 'n', 't', 'y'],
    ['g', 'h', 'b', 'n', 't', 'y', 'g', 'h', 'b', 'n'],
    ['t', 'y', 'g', 'h', 'b', 'n', 't', 'y', 'g', 'h'],
    ['b', 'n', 't', 'y', 'g', 'h', 'b', 'n', 't', 'y']
  ]
};

export default function KoreanBasicPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'korean' | 'english'>('korean');
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeyPresses, setTotalKeyPresses] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<'basic' | 'left-upper' | 'right-upper' | 'left-lower' | 'right-lower' | 'center'>('basic');
  const [currentChar, setCurrentChar] = useState('');
  const [nextChar, setNextChar] = useState('');
  const [isWrong, setIsWrong] = useState(false); // 틀렸을 때 표시할 상태
  const [blinkCount, setBlinkCount] = useState(0); // 깜박임 횟수

  // 현재 자리에서 순서대로 진행
  const getCurrentSequence = (): string[] => {
    const sequences = language === 'korean' 
      ? koreanPositionSequences[currentPosition] 
      : englishPositionSequences[currentPosition];
    
    return sequences[currentCharIndex % sequences.length];
  };

  // 2단계 연습을 위한 단어 구성 함수
  const getWordFromPreviousPositions = (): string => {
    const positions: ('basic' | 'left-upper' | 'right-upper' | 'left-lower' | 'right-lower' | 'center')[] = ['basic', 'left-upper', 'right-upper', 'left-lower', 'right-lower', 'center'];
    const currentPosIndex = positions.indexOf(currentPosition);
    
    if (currentPosIndex === 0) {
      // 기본자리는 이전 자리가 없으므로 현재 자리만
      const currentSequence = getCurrentSequence();
      const charIndexInSequence = Math.floor(currentCharIndex / 5);
      const charIndex = charIndexInSequence % currentSequence.length;
      return currentSequence[charIndex];
    }
    
    // 이전 자리들을 포함하여 단어 구성
    const previousPositions = positions.slice(0, currentPosIndex + 1);
    const word = previousPositions.map(pos => {
      const posSequences = language === 'korean' 
        ? koreanPositionSequences[pos] 
        : englishPositionSequences[pos];
      const randomSequence = posSequences[Math.floor(Math.random() * posSequences.length)];
      return randomSequence[Math.floor(Math.random() * randomSequence.length)];
    });
    
    return word.join('');
  };

  // 현재 입력할 글자와 다음 글자 업데이트 (2단계 구성)
  const updateCurrentAndNextChar = useCallback(() => {
    let currentCharValue: string;
    let nextCharValue: string;
    
    if (currentCharIndex < 50) {
      // 1단계: 해당 자리만 연습
      const currentSequence = getCurrentSequence();
      const charIndexInSequence = Math.floor(currentCharIndex / 5);
      const charIndex = charIndexInSequence % currentSequence.length;
      currentCharValue = currentSequence[charIndex];
      
      // 다음 시퀀스 준비
      const nextSequenceIndex = (currentCharIndex + 1) % 5;
      const nextSequence = language === 'korean' 
        ? koreanPositionSequences[currentPosition] 
        : englishPositionSequences[currentPosition];
      const nextSequenceArray = nextSequence[nextSequenceIndex];
      const nextCharIndex = Math.floor((currentCharIndex + 1) / 5) % nextSequenceArray.length;
      nextCharValue = nextSequenceArray[nextCharIndex];
    } else {
      // 2단계: 이전 자리들을 포함한 단어 구성
      currentCharValue = getWordFromPreviousPositions();
      
      // 다음 단어 준비
      const nextIndex = currentCharIndex + 1;
      if (nextIndex < 100) {
        nextCharValue = getWordFromPreviousPositions();
      } else {
        nextCharValue = '';
      }
    }
    
    setCurrentChar(currentCharValue);
    setNextChar(nextCharValue);
  }, [language, currentPosition, currentCharIndex]);

  // 초기화 시 순서대로 시작
  useEffect(() => {
    updateCurrentAndNextChar();
  }, [updateCurrentAndNextChar]);

  const calculateResult = useCallback(() => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    const totalCharacters = 100; // 2단계 총 100개 연습
    const correctCharacters = inputHistory.length;
    
    const accuracy = Math.round((correctCharacters / totalCharacters) * 100);
    const speed = Math.round(totalCharacters / timeElapsed * 60);
    
    setResult({
      accuracy,
      speed,
      time: Math.round(timeElapsed),
      totalKeyPresses: totalKeyPresses
    });
    setShowResultModal(true);
  }, [startTime, inputHistory.length, totalKeyPresses]);

  // 다음 자리로 진행하는 함수 (2단계 시스템)
  const moveToNextPosition = useCallback(() => {
    const nextIndex = currentCharIndex + 1;
    
    if (nextIndex >= 100) {
      // 100개 연습 완료 시 결과 계산
      calculateResult();
    } else {
      // 다음 순서로 진행
      setCurrentCharIndex(nextIndex);
      
      // 현재 입력할 자리를 다음 자리 값으로 설정
      setCurrentChar(nextChar);
      
      // 새로운 다음 자리 준비
      if (nextIndex < 50) {
        // 1단계: 해당 자리만 연습
        const nextSequenceIndex = nextIndex % 5;
        const nextSequence = language === 'korean' 
          ? koreanPositionSequences[currentPosition] 
          : englishPositionSequences[currentPosition];
        const nextSequenceArray = nextSequence[nextSequenceIndex];
        const nextCharIndex = Math.floor(nextIndex / 5) % nextSequenceArray.length;
        setNextChar(nextSequenceArray[nextCharIndex]);
      } else {
        // 2단계: 이전 자리들을 포함한 단어 구성
        const nextWord = getWordFromPreviousPositions();
        setNextChar(nextWord);
      }
      
      setInputHistory([]);
    }
  }, [currentCharIndex, nextChar, language, currentPosition, calculateResult]);

  // 자리 변경 시 새로운 순서 시작
  const handlePositionChange = (position: 'basic' | 'left-upper' | 'right-upper' | 'left-lower' | 'right-lower' | 'center') => {
    setCurrentPosition(position);
    setCurrentCharIndex(0);
    setInputHistory([]);
    updateCurrentAndNextChar();
  };

  // 언어 변경 시에도 새로운 순서 시작
  const changeLanguage = () => {
    setLanguage(language === 'korean' ? 'english' : 'korean');
    setCurrentCharIndex(0);
    setInputHistory([]);
    updateCurrentAndNextChar();
  };

  const resetTyping = () => {
    setCurrentCharIndex(0);
    setInputHistory([]);
    setStartTime(null);
    setTotalKeyPresses(0);
    setResult(null);
    setHasStarted(false);
    setShowResultModal(false);
    // 새로운 순서 시작
    updateCurrentAndNextChar();
  };

  const handleKeyPress = useCallback((key: string) => {
    // 모든 키 입력을 카운트
    setTotalKeyPresses(prev => prev + 1);
    
    if (key === currentChar) {
      // 올바른 입력
      setInputHistory(prev => [...prev, key]);
      
      // 첫 번째 입력 시 타이머 시작
      setHasStarted(prev => {
        if (!prev) {
          setStartTime(Date.now());
          return true;
        }
        return prev;
      });
      
      // 현재 문자 완료 시 다음 순서로 진행
      setTimeout(() => {
        moveToNextPosition();
      }, 100);
    } else {
      // 틀린 입력 시 입력된 값만 초기화 (현재 문자 인덱스는 유지)
      setInputHistory([]);
      
      // 2번 깜박이는 애니메이션
      let count = 0;
      const blinkInterval = setInterval(() => {
        setIsWrong(prev => !prev);
        count++;
        if (count >= 4) { // 2번 깜박임 (on/off 4번)
          clearInterval(blinkInterval);
          setIsWrong(false); // 마지막에 정상 상태로 복원
        }
      }, 100); // 100ms 간격으로 깜박임
      
      // currentCharIndex는 변경하지 않음 - 현재 문자에서 계속 시도
    }
  }, [currentChar, currentCharIndex, updateCurrentAndNextChar, calculateResult, moveToNextPosition]);

  const isKeyHighlighted = (key: string) => {
    if (key === currentChar) return 'current';
    return 'normal';
  };

  // 키보드 이벤트를 전역으로 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 특수 키는 제외 (Ctrl, Alt, F1-F12 등)
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      
      let key = event.key;
      
      // 한글 입력 처리
      if (language === 'korean') {
        // 한글 모드일 때는 event.key가 한글로 나옴
        if (key.length === 1 && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(key)) {
          console.log('한글 입력 감지:', key);
        } else if (event.code.startsWith('Key') || event.code.startsWith('Digit')) {
          // 영문 키를 눌렀을 때 해당 키의 한글 매핑
          const keyMap: { [key: string]: string } = {
            'KeyQ': 'ㅂ', 'KeyW': 'ㅈ', 'KeyE': 'ㄷ', 'KeyR': 'ㄱ', 'KeyT': 'ㅅ',
            'KeyY': 'ㅛ', 'KeyU': 'ㅕ', 'KeyI': 'ㅑ', 'KeyO': 'ㅐ', 'KeyP': 'ㅔ',
            'KeyA': 'ㅁ', 'KeyS': 'ㄴ', 'KeyD': 'ㅇ', 'KeyF': 'ㄹ', 'KeyG': 'ㅎ',
            'KeyH': 'ㅗ', 'KeyJ': 'ㅓ', 'KeyK': 'ㅏ', 'KeyL': 'ㅣ',
            'KeyZ': 'ㅋ', 'KeyX': 'ㅌ', 'KeyC': 'ㅊ', 'KeyV': 'ㅍ',
            'KeyB': 'ㅠ', 'KeyN': 'ㅜ', 'KeyM': 'ㅡ'
          };
          
          if (keyMap[event.code]) {
            key = keyMap[event.code];
            console.log('영문 키를 한글로 변환:', event.code, '→', key);
          }
        }
      }
      
      console.log('키보드 입력 감지:', key, '원본:', event.key, '코드:', event.code);
      handleKeyPress(key);
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress, language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* 사이버틱한 기하학적 패턴 배경 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 border-2 border-cyan-400 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-cyan-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-cyan-400 transform rotate-12 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-cyan-300 transform rotate-45 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 border border-cyan-300 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-500/30"
          >
            <ArrowLeft className="w-6 h-6 text-cyan-400" />
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            자리연습
          </h1>
          <div className="w-16"></div>
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

          {/* 연습할 자리 선택 */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { id: 'basic' as const, name: '기본자리' },
                { id: 'left-upper' as const, name: '왼손윗자리' },
                { id: 'right-upper' as const, name: '오른손윗자리' },
                { id: 'left-lower' as const, name: '왼손아래자리' },
                { id: 'right-lower' as const, name: '오른손아래자리' },
                { id: 'center' as const, name: '가운데자리' }
              ].map((position) => (
                <button
                  key={position.id}
                  onClick={() => handlePositionChange(position.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 border",
                    currentPosition === position.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border-cyan-400"
                      : "bg-slate-800/60 text-cyan-300 border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400"
                  )}
                >
                  {position.name}
                </button>
              ))}
            </div>
          </div>

          {/* 메인 연습 영역 */}
          <div className="flex-1 flex flex-col items-center justify-center mb-8">
            {/* 현재 입력할 글자와 다음 글자 */}
            <div className="flex items-center justify-center gap-6 mb-8 relative">
              {/* 현재 입력할 글자 - 항상 중앙에 */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-12 shadow-2xl shadow-cyan-500/25 border border-cyan-400/50 transition-all duration-200">
                <div className="text-center">
                  <div className={cn(
                    "text-sm mb-4 opacity-80",
                    isWrong ? "text-red-800" : "text-cyan-100"
                  )}>
                    {isWrong ? "틀렸습니다!" : "입력할 자리"}
                  </div>
                  <div className={cn(
                    "text-8xl font-bold leading-none transition-colors duration-150",
                    isWrong ? "text-red-800" : "text-white"
                  )}>
                    {currentChar}
                  </div>
                </div>
              </div>

              {/* 다음 입력할 글자 - 오른쪽에 작게 */}
              {nextChar && (
                <div className="bg-transparent rounded-2xl p-6 border border-slate-600/50 absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[120%]">
                  <div className="text-center">
                    <div className="text-slate-400 text-xs mb-2 opacity-80">다음 자리</div>
                    <div className="text-slate-300 text-4xl font-bold leading-none">
                      {nextChar}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 진행 상황 제거 - 입력 기록 표시 불필요 */}

            {/* 가상 키보드 */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-cyan-500/30">
              {/* 키보드 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-300 font-medium">가상 키보드</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>

              {/* 실제 키보드와 동일한 레이아웃 */}
              <div className="flex flex-col items-center">
                {/* 첫 번째 행: 숫자와 기호 */}
                <div className="flex space-x-1 mb-3">
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

                {/* 두 번째 행: Tab과 자음/모음 */}
                <div className="flex space-x-1 mb-3">
                  <div className="w-16 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Tab
                  </div>
                  {['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'].map((key, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                        isKeyHighlighted(key) === 'current' && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                        isKeyHighlighted(key) === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                    </div>
                  ))}
                  {['{ [', '} ]'].map((key, index) => (
                    <div key={index} className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                      <span className="font-bold text-sm">{key.split(' ')[1]}</span>
                    </div>
                  ))}
                  <div className="w-16 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    <span className="text-cyan-400 text-xs">|</span>
                    <span className="font-bold text-sm">\</span>
                  </div>
                </div>

                {/* 세 번째 행: Caps Lock과 자음/모음, Enter */}
                <div className="flex space-x-1 mb-3 justify-center">
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Caps
                  </div>
                  {['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'].map((key, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                        isKeyHighlighted(key) === 'current' && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                        isKeyHighlighted(key) === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    <span className="text-cyan-400 text-xs">:</span>
                    <span className="font-bold text-sm">;</span>
                  </div>
                  <div className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    <span className="text-cyan-400 text-xs">"</span>
                    <span className="font-bold text-sm">'</span>
                  </div>
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    ↵
                  </div>
                </div>

                {/* 네 번째 행: Shift와 자음/모음, 기호 */}
                <div className="flex space-x-1 mb-3 justify-center">
                  <div className="w-24 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    ⇧
                  </div>
                  {['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'].map((key, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                        isKeyHighlighted(key) === 'current' && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                        isKeyHighlighted(key) === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                    </div>
                  ))}
                  {['< ,', '> .', '? /'].map((key, index) => (
                    <div key={index} className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                      <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                      <span className="font-bold text-sm">{key.split(' ')[1]}</span>
                    </div>
                  ))}
                  <div className="w-24 h-12 rounded-lg border-2 flex items-center justify-end pr-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    ⇧
                  </div>
                </div>

                {/* 다섯 번째 행: 기능키들 */}
                <div className="flex space-x-1 justify-center">
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-600 text-cyan-200 shadow-sm hover:bg-slate-500 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Ctrl
                  </div>
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-600 text-cyan-200 shadow-sm hover:bg-slate-500 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Alt
                  </div>
                  <div className="w-80 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-600 text-cyan-200 shadow-sm hover:bg-slate-500 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Space
                  </div>
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-600 text-cyan-200 shadow-sm hover:bg-slate-500 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Alt
                  </div>
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-600 text-cyan-200 shadow-sm hover:bg-slate-500 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    Ctrl
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 모달 */}
      {showResultModal && result && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">연습 완료! 🎉</h3>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-300 hover:text-cyan-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {result.accuracy}%
                  </div>
                  <div className="text-sm text-cyan-300">정확도</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {result.speed}
                  </div>
                  <div className="text-sm text-cyan-300">타자수/분</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {result.time}초
                  </div>
                  <div className="text-sm text-cyan-300">소요시간</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {result.totalKeyPresses}
                  </div>
                  <div className="text-sm text-cyan-300">총 타수</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/25"
                >
                  계속하기
                </button>
                <button
                  onClick={resetTyping}
                  className="flex-1 px-4 py-3 bg-slate-700 text-cyan-300 rounded-lg font-medium hover:bg-slate-600 transition-colors border border-cyan-500/30"
                >
                  다시 연습
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
