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

// 한글 단어 500개 목록
const koreanWords = [
  '가방', '가위', '가을', '가족', '가지', '간식', '갈비', '감기', '감자', '감사',
  '강물', '강아지', '개구리', '개미', '거리', '거북이', '거울', '건강', '건물', '게임',
  '겨울', '결혼', '경찰', '경제', '계산', '계획', '고기', '고래', '고양이', '고추',
  '곡식', '골목', '공간', '공기', '공부', '공원', '공장', '과일', '나라', '나무',
  '나비', '나이', '나중', '낙지', '난로', '날개', '날씨', '남자', '남편', '낭만',
  '내일', '냄비', '냄새', '노래', '노인', '논문', '놀이터', '농사', '농장', '누나',
  '눈물', '뉴스', '능력', '늘봄', '내복', '낙관', '나락', '나루', '내외', '냉면',
  '낙원', '노을', '노랑', '노선', '다리', '다방', '다리미', '다섯', '단계', '단어',
  '달력', '달빛', '닭고기', '답장', '당근', '대문', '대학', '대화', '대표', '대한',
  '더위', '도구', '도시', '도움', '돈', '돌', '동물', '동네', '동전', '동화',
  '돼지', '두부', '두유', '두통', '드라마', '들판', '등불', '등산', '등잔', '디자인',
  '라디오', '라면', '라벨', '라이터', '라운드', '라일락', '라이벌', '라켓', '라이브', '락커',
  '램프', '레몬', '레벨', '레스토랑', '렌즈', '로봇', '로켓', '로망', '로션', '롯데',
  '루머', '리듬', '리더', '리모콘', '리본', '리스트', '리포트', '라운지', '라틴', '레일',
  '레고', '레인지', '라텍스', '레이스', '레드', '라운드', '마당', '마늘', '마라톤', '마법',
  '마술', '마음', '마을', '마이크', '마차', '마크', '막대', '만남', '만두', '만화',
  '만족', '말', '말씀', '말투', '망고', '망원경', '맛집', '매듭', '매력', '매일',
  '매점', '매출', '맥주', '맨션', '머리', '머리카락', '먼지', '메뉴', '메달', '메모',
  '메시지', '메이크업', '바구니', '바나나', '바늘', '바다', '바닥', '바람', '바위', '바지',
  '바탕', '박물관', '박사', '반대', '발견', '발목', '발표', '밤하늘', '밥그릇', '밥상',
  '방송', '방학', '방법', '배구', '배낭', '배달', '배우', '배추', '백과', '백신',
  '버스', '버튼', '번역', '번호', '벌금', '벌레', '법원', '법칙', '사과', '사람',
  '시장', '소문', '숲속', '사랑', '사막', '사슴', '사실', '사전', '사진', '사회',
  '사탕', '사투리', '사원', '사이', '사장', '사정', '사촌', '사표', '사업', '상자',
  '상처', '상태', '상추', '상품', '상황', '새벽', '새소리', '새집', '생활', '생일',
  '생각', '생명', '서랍', '서점', '아이', '아기', '아빠', '아저씨', '아줌마', '아침',
  '아파트', '아프다', '아시아', '아이스', '악기', '안경', '안내', '안방', '안전', '안쪽',
  '안팎', '알약', '알코올', '알림', '암벽', '앞길', '애인', '야구', '야채', '약속',
  '양말', '양식', '양파', '얘기', '어깨', '어머니', '어제', '언덕', '언어', '얼굴',
  '자격', '자극', '자기', '자네', '자녀', '자동차', '자랑', '자료', '자리', '자막',
  '자매', '자부심', '자세', '자연', '자원', '자율', '자전거', '자정', '자존심', '자주',
  '작가', '작문', '작업', '작용', '작품', '잔디', '잔소리', '잡지', '장갑', '장기',
  '장난', '장례', '장비', '장소', '장식', '장인', '차고', '차량', '차림', '차별',
  '차선', '차원', '차표', '차이', '차장', '차질', '차칸', '차트', '차합', '차향',
  '착각', '찬물', '찬송', '찰흙', '참새', '참치', '참가', '참조', '참외', '참전',
  '참패', '찻집', '챔피언', '책상', '책임', '책자', '철도', '철학', '철판', '청소',
  '카메라', '카드', '카톡', '케이블', '케이크', '케이팝', '커피', '컴퓨터', '컨트롤', '컬러',
  '컬럼', '컵라면', '코끼리', '코러스', '코미디', '코스', '코치', '코트', '코팅', '콘서트',
  '콜라', '콜센터', '쿠키', '쿠폰', '퀴즈', '퀵서비스', '퀸', '퀀텀', '클래스', '클럽',
  '타자', '타이머', '타이어', '타입', '타자기', '타투', '타이틀', '타워', '타협', '탁구',
  '탁자', '탄생', '탄소', '탈출', '탐험', '탑승', '태권도', '태도', '태양', '태풍',
  '택배', '택시', '테니스', '테이블', '테이프', '텍스트', '토끼', '토론', '토마토', '튜브',
  '파도', '파란', '파란색', '파리', '파인애플', '파일', '파출소', '판단', '판사', '팔꿈치',
  '팔도', '팔월', '팝송', '패션', '팩스', '팬더', '페인트', '펜', '펜션', '편지',
  '평가', '평소', '평양', '포도', '포스터', '포장', '포함', '폰트', '표정', '표현',
  '학교', '학생', '하늘', '하루', '하지만', '하품', '하얀색', '하다', '한글', '한복',
  '한식', '한옥', '한자', '할머니', '할아버지', '합격', '항공', '항구', '항상', '항해',
  '해답', '해물', '해변', '해석', '해양', '해외', '해일', '해커', '해커톤', '핸드폰',
  '헬기', '헬스', '혁명', '현관', '현대', '현실', '청년', '청춘', '체육', '체험',
  '캐릭터', '카센터', '타이핑', '택일', '프린터', '프로그램', '휴가', '휴지', '휴식', '휴대폰'
];

// 영어 단어 500개 목록
const englishWords = [
  'apple', 'bread', 'pizza', 'coffee', 'sugar', 'water', 'milk', 'juice', 'rice', 'meat',
  'fish', 'pasta', 'noodle', 'salad', 'soup', 'cake', 'candy', 'cookie', 'cheese', 'butter',
  'toast', 'honey', 'jam', 'egg', 'lunch', 'dinner', 'snack', 'drink', 'meal', 'fruit',
  'banana', 'grape', 'peach', 'melon', 'pear', 'plum', 'berry', 'lemon', 'orange', 'onion',
  'carrot', 'potato', 'tomato', 'pepper', 'garlic', 'ginger', 'beef', 'pork', 'chicken', 'lamb',
  'dog', 'cat', 'bird', 'duck', 'cow', 'pig', 'sheep', 'horse', 'lion', 'tiger',
  'bear', 'wolf', 'fox', 'deer', 'rabbit', 'monkey', 'mouse', 'rat', 'frog', 'snake',
  'whale', 'shark', 'dolphin', 'seal', 'crab', 'ant', 'bee', 'butterfly', 'spider', 'tree',
  'leaf', 'flower', 'grass', 'plant', 'seed', 'root', 'branch', 'wood', 'forest', 'river',
  'lake', 'pond', 'sea', 'ocean', 'island', 'mountain', 'valley', 'hill', 'beach', 'house',
  'home', 'room', 'yard', 'garden', 'park', 'school', 'class', 'office', 'store', 'shop',
  'market', 'mall', 'bank', 'hotel', 'motel', 'cafe', 'bar', 'club', 'cinema', 'theater',
  'museum', 'library', 'station', 'airport', 'harbor', 'bridge', 'road', 'street', 'alley', 'hall',
  'church', 'temple', 'palace', 'castle', 'tower', 'roomy', 'loft', 'shed', 'barn', 'factory',
  'farm', 'field', 'court', 'clinic', 'hospital', 'kitchen', 'bath', 'toilet', 'man', 'woman',
  'boy', 'girl', 'baby', 'child', 'parent', 'father', 'mother', 'brother', 'sister', 'uncle',
  'aunt', 'cousin', 'friend', 'neighbor', 'teacher', 'student', 'doctor', 'nurse', 'police', 'pilot',
  'driver', 'farmer', 'worker', 'chef', 'cook', 'singer', 'actor', 'artist', 'writer', 'poet',
  'judge', 'lawyer', 'clerk', 'mayor', 'leader', 'coach', 'guide', 'guard', 'army', 'soldier',
  'king', 'queen', 'prince', 'princess', 'president', 'doctorate', 'monk', 'nun', 'pen', 'pencil',
  'eraser', 'paper', 'book', 'notebook', 'bag', 'box', 'clock', 'watch', 'phone', 'radio',
  'camera', 'video', 'tv', 'lamp', 'light', 'fan', 'bell', 'ring', 'cup', 'glass',
  'plate', 'bowl', 'fork', 'spoon', 'knife', 'chair', 'table', 'desk', 'sofa', 'bed',
  'pillow', 'blanket', 'sheet', 'shoes', 'shirt', 'pants', 'coat', 'dress', 'hat', 'cap',
  'mask', 'ball', 'toy', 'game', 'dice', 'card', 'coin', 'day', 'week', 'month',
  'year', 'hour', 'minute', 'second', 'time', 'spring', 'summer', 'autumn', 'winter', 'season',
  'holiday', 'vacation', 'trip', 'travel', 'tour', 'event', 'party', 'festival', 'birthday', 'wedding',
  'meeting', 'lesson', 'course', 'test', 'exam', 'quiz', 'score', 'grade', 'level', 'stage',
  'match', 'round', 'final', 'start', 'begin', 'end', 'stop', 'finish', 'early', 'late',
  'soon', 'now', 'past', 'future', 'run', 'walk', 'jump', 'sit', 'stand', 'sleep',
  'wake', 'eat', 'read', 'write', 'draw', 'sing', 'play', 'work', 'study', 'learn',
  'teach', 'think', 'know', 'find', 'lose', 'open', 'close', 'move', 'turn', 'push',
  'pull', 'help', 'save', 'make', 'build', 'create', 'break', 'fix', 'call', 'show',
  'look', 'see', 'hear', 'speak', 'talk', 'say', 'smile', 'cry', 'laugh', 'love',
  'big', 'small', 'long', 'short', 'fast', 'slow', 'hot', 'cold', 'warm', 'cool',
  'happy', 'sad', 'angry', 'glad', 'good', 'bad', 'new', 'old', 'young', 'true',
  'false', 'right', 'wrong', 'easy', 'hard', 'soft', 'loud', 'quiet', 'bright', 'dark',
  'clean', 'dirty', 'empty', 'full', 'rich', 'poor', 'kind', 'mean', 'nice', 'funny',
  'serious', 'strong', 'weak', 'smart', 'dull', 'safe', 'danger'
];

export default function WordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLanguage = searchParams.get('language') as 'korean' | 'english' || 'korean';
  
  const [language, setLanguage] = useState<'korean' | 'english'>(initialLanguage);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [correctHistory, setCorrectHistory] = useState<boolean[]>([]); // 정답 여부 기록
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeyPresses, setTotalKeyPresses] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [showResultModal, setShowResultModal] = useState(false);
  
  // 이전 단어의 CPM 표시용
  const [lastWordCPM, setLastWordCPM] = useState<number | null>(null);

  const [currentChar, setCurrentChar] = useState('');
  const [nextChar, setNextChar] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  
  // 단어 연습을 위한 상태들
  const [userInput, setUserInput] = useState('');
  const [currentJamoIndex, setCurrentJamoIndex] = useState(0);
  const [currentJamos, setCurrentJamos] = useState<string[]>([]);
  
  // 한글 조합 상태 관리
  const [isComposing, setIsComposing] = useState(false);
  const [compositionData, setCompositionData] = useState('');
  
  // 각 단어별 입력 시간 측정을 위한 상태들
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [currentWordStartTime, setCurrentWordStartTime] = useState<number | null>(null);
  const wordStartTimeRef = useRef<number | null>(null); // 즉시 값 추적용

  // 500개 단어 풀에서 50개 랜덤 선택
  const generateRandomWords = (language: 'korean' | 'english') => {
    const wordPool = language === 'korean' ? koreanWords : englishWords;
    
    // 500개 풀에서 50개 랜덤 선택 (연속 중복 방지)
    const sequence: string[] = [];
    
    if (wordPool.length > 0) {
      // 첫 번째 단어는 랜덤으로 선택
      sequence.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
      
      // 나머지 49개 단어 생성 (연속 중복 방지)
      for (let i = 1; i < 50; i++) {
        const lastWord = sequence[i - 1];
        let availableWords = wordPool.filter(word => word !== lastWord);
        
        // 만약 사용 가능한 단어가 없다면 전체 풀에서 선택
        if (availableWords.length === 0) {
          availableWords = wordPool;
        }
        
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        sequence.push(randomWord);
      }
    }
    
    return sequence;
  };

  // 현재 언어에 따른 단어 생성
  const [words, setWords] = useState(() => generateRandomWords(language));

  // 현재 입력할 단어 가져오기
  const getCurrentItem = useCallback((): string => {
    return words[currentCharIndex % words.length];
  }, [currentCharIndex, words]);

  // 다음 입력할 단어 가져오기
  const getNextItem = useCallback((): string => {
    const nextIndex = currentCharIndex + 1;
    if (nextIndex >= 50) return '';
    
    return words[nextIndex % words.length];
  }, [currentCharIndex, words]);




  // 언어 변경 시 단어 재생성
  useEffect(() => {
    setWords(generateRandomWords(language));
  }, [language]);



  const calculateResult = useCallback(async () => {
    const totalItems = inputHistory.length; // 실제 시도한 단어 수
    const correctItems = correctHistory.filter(Boolean).length; // 맞힌 단어 수
    
    // 정확도 계산 (맞힌 단어 / 시도한 단어)
    const accuracy = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;
    
    // 개별 단어 타수들의 평균으로 CPM 계산
    let averageCPM = 0;
    if (wordTimings.length > 0) {
      // 유효한 타이밍 데이터만 필터링 (0이 아닌 CPM)
      const validTimings = wordTimings.filter(timing => timing.cpm && timing.cpm > 0);
      
      if (validTimings.length > 0) {
        const totalCPM = validTimings.reduce((sum, timing) => sum + (timing.cpm || 0), 0);
        averageCPM = Math.round(totalCPM / validTimings.length);
      }
    }
    
    // 정확도에 따른 CPM 계산 (정확도 × 평균 CPM)
    let finalCPM = 0;
    let finalWPM = 0;
    
    if (accuracy > 0) {
      // 정확도를 소수로 변환 (예: 80% → 0.8)
      const accuracyRatio = accuracy / 100;
      
      // 평균 CPM에 정확도를 곱함
      finalCPM = Math.round(averageCPM * accuracyRatio);
      
      // WPM 계산 (5글자 = 1단어 기준)
      finalWPM = Math.round(finalCPM / 5);
    }
    
    // 전체 연습 시간 계산 (결과 표시용)
    const totalTimeMinutes = startTime ? (Date.now() - startTime) / (1000 * 60) : 0;
    const clampedTimeMinutes = Math.max(0.1, totalTimeMinutes);
    
    // 실제 입력한 모든 문자 수 계산 (디버그 정보용)
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
    
    // 타자연습 결과를 데이터베이스에 저장
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

  // 다음 단어로 진행하는 함수
  const moveToNextPosition = useCallback(() => {
    const nextIndex = currentCharIndex + 1;
    
    if (nextIndex >= 50) {
      calculateResult();
    } else {
      setCurrentCharIndex(nextIndex);
      // inputHistory와 correctHistory는 유지해야 함 (전체 결과 계산을 위해)
      

      
      // 다음 단어로 넘어갈 때 즉시 입력 필드에 포커스
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 0);
    }
  }, [currentCharIndex, calculateResult]);

  // IME 상태 힌트 함수
  const setIMEHint = useCallback((targetLanguage: 'korean' | 'english') => {
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      // 언어별 속성 설정
      inputElement.setAttribute('lang', targetLanguage === 'korean' ? 'ko' : 'en');
      inputElement.setAttribute('inputmode', 'text');
      
      // 브라우저에 IME 변경 힌트 제공 (일부 브라우저에서 지원)
      if ('setInputMethodHint' in inputElement) {
        (inputElement as any).setInputMethodHint(targetLanguage === 'korean' ? 'korean' : 'english');
      }
      
      // 포커스를 다시 설정하여 IME 변경 감지 도움
      inputElement.blur();
      setTimeout(() => inputElement.focus(), 50);
    }
  }, []);

  // IME 힌트만 설정 (자동 전환은 브라우저 제한으로 불가능)
  const setIMELanguage = useCallback((targetLanguage: 'korean' | 'english') => {
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.setAttribute('lang', targetLanguage === 'korean' ? 'ko' : 'en');
      inputElement.setAttribute('inputmode', 'text');
    }
    setIMEHint(targetLanguage);
  }, [setIMEHint]);

  // 현재 단어와 다음 단어 업데이트
  const updateCurrentAndNextChar = useCallback(() => {
    const currentItem = getCurrentItem();
    const nextItem = getNextItem();
    
    setCurrentChar(currentItem);
    setNextChar(nextItem);
    setCurrentWord(currentItem);
    
    // IME 힌트 설정 (자동 전환은 브라우저 제한으로 불가능)
    setIMELanguage(language);
    
    // 한글 자모 분해
    if (language === 'korean' && currentItem) {
      const decomposed = currentItem.split('').flatMap(char => decomposeHangul(char));
      setCurrentJamos(decomposed);
      setCurrentJamoIndex(0);
    } else {
      setCurrentJamos([]);
      setCurrentJamoIndex(0);
    }
  }, [getCurrentItem, getNextItem, language, currentCharIndex, setIMELanguage]);

  // 현재 상태가 변경될 때마다 자동 업데이트
  useEffect(() => {
    updateCurrentAndNextChar();
  }, [language, currentCharIndex, updateCurrentAndNextChar]);

  // 연습 초기화
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
    
    // 새로운 단어 세트 생성
    setWords(generateRandomWords(language));
  };

  // 한글 조합 시작
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  // 한글 조합 중
  const handleCompositionUpdate = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setCompositionData(e.data);
    

    
    // 한글의 경우 자모 인덱스 업데이트 (조합 중인 데이터 기준)
    if (language === 'korean' && currentJamos.length > 0) {
      const currentInput = e.currentTarget.value;
      const inputJamos = currentInput.split('').flatMap(char => decomposeHangul(char));
      const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
      setCurrentJamoIndex(newIndex);
    }
  }, [language, currentJamos]);

  // 한글 조합 완료
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    setCompositionData('');
    
    // 조합 완료 후 onChange가 다시 호출되므로 여기서는 상태만 변경
  }, []);

  // 단어 입력 처리 함수 (조합 중이 아닐 때만 처리)
  const handleWordInput = useCallback((input: string) => {
    // 한글 조합 중일 때는 처리하지 않음
    if (isComposing) return;
    

    
    // 한글의 경우 자모 인덱스 업데이트
    if (language === 'korean' && currentJamos.length > 0) {
      const inputJamos = input.split('').flatMap(char => decomposeHangul(char));
      const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
      setCurrentJamoIndex(newIndex);
    }
    
    // 연습 시작 시간 설정
    if (!startTime && input.length === 1 && userInput.length === 0) {
      setStartTime(Date.now());
    }
    
    setUserInput(input);
    
    if (!hasStarted && input.length > 0) {
      setHasStarted(true);
    }
    
    setIsWrong(false);
  }, [currentWord, hasStarted, userInput, language, currentJamos, isComposing]);

    // 입력 변경 처리 (onChange 이벤트용)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    

    
        // 항상 화면에 입력된 텍스트를 표시
    setUserInput(inputValue);
    
    // 연습 시작 시간 설정 (조합 상태와 무관하게)
    if (!startTime && inputValue.length > 0) {
      setStartTime(Date.now());
    }
    
    // 단어 입력 시작 시간 설정 (첫 키 입력 시점, 조합 상태와 무관하게)
    if (!wordStartTimeRef.current && inputValue.length > 0) {
      const wordStartTime = Date.now();
      wordStartTimeRef.current = wordStartTime;
      setCurrentWordStartTime(wordStartTime);
    }
    
    if (!hasStarted && inputValue.length > 0) {
      setHasStarted(true);
    }
    
    // 조합 중이 아닐 때만 자모 인덱스 업데이트
    if (!isComposing) {
      // 한글의 경우 자모 인덱스 업데이트
      if (language === 'korean' && currentJamos.length > 0) {
        const inputJamos = inputValue.split('').flatMap(char => decomposeHangul(char));
        const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
        setCurrentJamoIndex(newIndex);
      }
      
      setIsWrong(false);
    } else {
      // 조합 중일 때도 자모 인덱스는 업데이트 (시각적 피드백용)
      if (language === 'korean' && currentJamos.length > 0) {
        const inputJamos = inputValue.split('').flatMap(char => decomposeHangul(char));
        const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
        setCurrentJamoIndex(newIndex);
      }
    }
  }, [isComposing, language, currentJamos, startTime, userInput, hasStarted]);

        // 단어 확인 함수 (틀려도 넘어가도록 수정)
  const checkWordInput = useCallback(() => {
    const isCorrect = userInput.trim() === currentWord;
    
    // 키 입력 수 계산
    let keyPressCount = 0;
    if (language === 'korean') {
      keyPressCount = userInput.split('').flatMap(char => decomposeHangul(char)).length;
        } else {
      keyPressCount = userInput.length;
    }
    setTotalKeyPresses(prev => prev + keyPressCount);
    
    // 단어별 타이밍 계산 및 기록
    const endTime = Date.now();
    let wordCPM = 0;
    
    if (wordStartTimeRef.current) {
      const duration = endTime - wordStartTimeRef.current;
      
      // 단어의 문자 수 계산 (CPM 계산용)
      let characterCount = 0;
      if (language === 'korean') {
        characterCount = currentWord.split('').flatMap(char => decomposeHangul(char)).length;
        } else {
        characterCount = currentWord.length;
      }
      
      // 개별 단어의 CPM 계산 (분당 문자 수)
      const durationMinutes = duration / (1000 * 60);
      
      // 절반 이상 틀렸으면 CPM을 0으로 설정
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
      // fallback: 시간 설정이 안 된 경우 기본값
      wordCPM = 60;
    }
    
    // 이전 단어의 CPM을 다음 단어 표시용으로 설정
    setLastWordCPM(wordCPM);
    
    // 입력 기록과 정답 여부 기록
    setInputHistory(prev => [...prev, userInput]);
    setCorrectHistory(prev => [...prev, isCorrect]);
    
          setUserInput('');
    setIsWrong(false);
    setCurrentWordStartTime(null); // 다음 단어를 위해 초기화
    wordStartTimeRef.current = null; // ref도 초기화
    
    // 딜레이 제거 - 즉시 다음 단어로 이동
    moveToNextPosition();
  }, [userInput, currentWord, currentWordStartTime, moveToNextPosition, language]);

  // 전역 키보드 이벤트 처리 및 자동 포커스
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 결과 모달이 열려있으면 키보드 이벤트 무시
      if (showResultModal) return;
      
      // 입력 필드에 포커스가 없으면 자동으로 포커스
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement && document.activeElement !== inputElement) {
        inputElement.focus();
      }
      
      // Enter나 Space 키 처리
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        
        // 입력이 있을 때만 단어 확인
        if (userInput.trim().length > 0) {
          checkWordInput();
        }
      }
    };

    const handleClick = () => {
      // 브라우저 내부 어디를 클릭해도 input에 포커스 (결과 모달이 열려있지 않을 때만)
      if (!showResultModal) {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          setTimeout(() => inputElement.focus(), 0);
        }
      }
    };

    const handleVisibilityChange = () => {
      // 탭이 다시 활성화되었을 때 input에 포커스
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

  // 페이지 로드 시 IME 힌트 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      setIMELanguage(language);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [language, setIMELanguage]);

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

      <div className="relative z-10 w-full h-full flex flex-col p-3 pt-16 sm:p-4 sm:pt-18 lg:p-6 lg:pt-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <button
          onClick={() => router.back()}
            className="p-1.5 sm:p-2 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-500/30"
        >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
        </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            낱말연습
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

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">



          {/* 메인 연습 영역 */}
          <div className="flex-1 flex flex-col items-center justify-center mb-1 sm:mb-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {/* 이전 단어 CPM 표시 (고정 공간) */}
            <div className="mb-1 text-center h-4 sm:h-5 lg:h-6 flex items-center justify-center">
              {lastWordCPM !== null ? (
                <div className="text-cyan-400 text-lg sm:text-xl font-bold">
                  {lastWordCPM} CPM
                </div>
              ) : (
                <div className="h-4 sm:h-5 lg:h-6"></div> // 빈 공간 유지
              )}
            </div>
            

            
            {/* 현재 입력할 단어와 다음 단어 */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-1 sm:mb-2 relative">
              {/* 현재 입력할 단어 - 항상 중앙에 */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-cyan-500/25 border border-cyan-400/50 transition-all duration-300 animate-in zoom-in-95 fade-in-0 duration-300">
                <div className="text-center">
                  <div className={cn(
                    "text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 opacity-80",
                    isWrong ? "text-red-800" : "text-cyan-100"
                  )}>
                    {isWrong ? "틀렸습니다!" : "입력할 단어"}
                  </div>
                  <div className={cn(
                    "text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold leading-none transition-colors duration-150",
                    isWrong ? "text-red-800" : "text-white"
                  )}>
                    {currentChar}
                  </div>
          </div>
        </div>

              {/* 다음 입력할 단어 - 오른쪽에 작게 */}
              {nextChar && (
                <div className="bg-transparent rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-600/50 absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[100%] sm:translate-x-[120%]">
                  <div className="text-center">
                    <div className="text-slate-400 text-xs mb-1 sm:mb-2 opacity-80">다음 단어</div>
                    <div className="text-slate-300 text-2xl sm:text-3xl lg:text-4xl font-bold leading-none">
                      {nextChar}
                    </div>
                    </div>
                      </div>
                    )}
                  </div>

            {/* 단어 입력창 */}
            <div className="mb-1 sm:mb-2 text-center">
              <div className="bg-transparent">
                {/* 입력 필드 */}
                <div className="mb-1 sm:mb-2">
                  {/* 글자별 표시를 위한 커스텀 입력 디스플레이 */}
                                      <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-2 py-1 sm:py-2 text-center text-2xl sm:text-3xl lg:text-5xl font-bold min-h-[40px] sm:min-h-[50px] lg:min-h-[60px] flex items-center justify-center">
                    {userInput.split('').map((char, index) => {
                      const isCorrect = index < currentWord.length && char === currentWord[index];
                      
                      return (
                        <span
                          key={index}
                          className={cn(
                            "transition-colors duration-200",
                            isCorrect ? "text-white" : "text-red-400"
                          )}
                        >
                          {char}
                        </span>
                      );
                    })}
                    {/* 커서 표시 */}
                    <span className="text-cyan-400 animate-pulse">|</span>
                </div>

                                                          {/* 숨겨진 실제 입력 필드 */}
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
                          // 포커스를 잃으면 즉시 다시 포커스 (결과 모달이 열려있지 않을 때만)
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
                        key={currentCharIndex} // 다음 단어로 넘어갈 때 포커스 재설정
                      />
                    </div>
                    
                                                {/* 입력 안내 */}
                <div className="text-slate-400 text-xs sm:text-sm space-y-1">
                  <div>
                    단어 입력 후 <span className="text-cyan-400">Enter</span> 또는 <span className="text-cyan-400">Space</span>를 눌러주세요
                  </div>
                  <div className="text-slate-500">
                    {language === 'korean' 
                      ? '💡 한글 입력이 안 되면 한/영 키를 눌러주세요'
                      : '💡 English input not working? Press 한/영 key'
                    }
                  </div>
                </div>
                        </div>
                    </div>
                    
          {/* 가상 키보드 (모바일에서 숨김) */}
            <div className="hidden lg:block bg-slate-800/90 backdrop-blur-sm rounded-2xl xl:rounded-3xl p-3 xl:p-4 shadow-2xl border border-cyan-500/30 w-full max-w-4xl animate-in fade-in-0 slide-in-from-bottom-2 duration-700 delay-200">
              {/* 진행도 막대바 */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-300 text-sm">
                    낱말 연습
                  </span>
                  <span className="text-cyan-300 text-sm">
                    {currentCharIndex + 1} / 50
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCharIndex + 1) / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 키보드 헤더 */}
              <div className="flex flex-col mb-3">
                <div className="flex items-center justify-between mb-2">


                        </div>
                      </div>

              {/* 실제 키보드와 동일한 레이아웃 */}
              <div className="flex flex-col items-center">
                {/* 첫 번째 행: 숫자와 기호 */}
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
            
                {/* 두 번째 행: Tab과 자음/모음 */}
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
                          "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                          key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                          key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                        </div>
                    );
                  })}
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
                <div className="flex space-x-1 mb-2 justify-center">
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
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
                          "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                          key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                          key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                        )}
                      >
                        {key}
                      </div>
                    );
                  })}
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
                <div className="flex space-x-1 mb-2 justify-center">
                  <div className="w-24 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    ⇧
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
                          "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                          key === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                          key !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                        </div>
                    );
                  })}
                  {['< ,', '> .', '? /'].map((key, index) => {
                    const baseKey = key.split(' ')[1];
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
                          "w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                          baseKey === targetKey && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                          baseKey !== targetKey && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                        )}
                      >
                        <span className="text-cyan-400 text-xs">{key.split(' ')[0]}</span>
                        <span className="font-bold text-sm">{baseKey}</span>
                      </div>
                    );
                  })}
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
            <div className="flex items-center justify-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">연습 완료! 🎉</h3>
            </div>

            <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {result.accuracy}%
                    </div>
                  <div className="text-sm text-cyan-300">정확도</div>
                  <div className="text-xs text-slate-400 mt-1">
                    완료 단어 비율
                  </div>
                  </div>
                  <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {result.speed}
                    </div>
                  <div className="text-sm text-cyan-300">분당 문자수</div>
                  <div className="text-xs text-slate-400 mt-1">
                    CPM (실제 문자 기준)
                  </div>
                  </div>
                {result.wpm && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {result.wpm}
                    </div>
                    <div className="text-sm text-green-300">분당 단어수</div>
                    <div className="text-xs text-slate-400 mt-1">
                      WPM (5글자 = 1단어)
                    </div>
                  </div>
                )}
                  <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {result.time}초
                    </div>
                  <div className="text-sm text-cyan-300">순 타이핑 시간</div>
                  <div className="text-xs text-slate-400 mt-1">
                    순수 입력 시간
                  </div>
                </div>
              </div>
              

              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    resetTyping();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/25"
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