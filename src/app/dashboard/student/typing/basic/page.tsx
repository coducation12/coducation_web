'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Keyboard, Globe, Hand, Turtle, X } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText, studentButtonStyles } from "../../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';

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

// 배열을 랜덤하게 섞는 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shift를 눌러야 하는 한글 자모 정의
const shiftKoreanKeys = ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅒ', 'ㅖ'];

// Shift를 눌러야 하는 기호들 정의
const shiftSymbolKeys = [':', '"', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', '<', '>', '?'];

// 쌍자음/쌍모음을 기본 자음/모음으로 변환하는 맵
const shiftToBaseKeyMap: { [key: string]: string } = {
  'ㅃ': 'ㅂ',
  'ㅉ': 'ㅈ', 
  'ㄸ': 'ㄷ',
  'ㄲ': 'ㄱ',
  'ㅆ': 'ㅅ',
  'ㅒ': 'ㅐ',
  'ㅖ': 'ㅔ'
};

// 기호들의 Shift + 기본키 맵
const symbolToBaseKeyMap: { [key: string]: string } = {
  ':': ';',
  '"': "'",
  '!': '1',
  '@': '2', 
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  '_': '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  '<': ',',
  '>': '.',
  '?': '/'
};

// Shift가 필요한 키인지 확인하는 함수
function requiresShift(key: string): boolean {
  return shiftKoreanKeys.includes(key) || shiftSymbolKeys.includes(key);
}

// 쌍자음/쌍모음 또는 기호의 기본 키를 반환하는 함수
function getBaseKey(key: string): string {
  return shiftToBaseKeyMap[key] || symbolToBaseKeyMap[key] || key;
}

// 각 자리별 기본 글자들 정의
const koreanKeysByPosition = {
  'basic': ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ',';'],
  'left-upper': ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ','ㄲ','ㅉ','ㄸ','ㄲ','ㅁ','ㄴ','ㅇ','ㄹ'],
  'right-upper': ['ㅕ', 'ㅑ', 'ㅐ', 'ㅔ','ㅓ','ㅏ','ㅣ',';',':'],
  'left-lower': ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ','ㅁ','ㄴ','ㅇ','ㄹ'],
  'right-lower': ['ㅡ',',','.','/','?','ㅓ','ㅏ','ㅣ',';'],
  'center': ['ㅅ','ㅆ', 'ㅎ', 'ㅠ', 'ㅛ', 'ㅗ', 'ㅜ']
};

// 각 자리별 영어 키 정의
const englishKeysByPosition = {
  'basic': ['a', 's', 'd', 'f', 'j', 'k', 'l'],
  'left-upper': ['q', 'w', 'e', 'r', 'a','s','d','f'],
  'right-upper': ['u', 'i', 'o', 'p','j','k','l',';'],
  'left-lower': ['z', 'x', 'c', 'v','a','s','d','f'],
  'right-lower': ['b', 'n', 'm', ',', '.', '/', '?','j','k','l',';'],
  'center': ['g', 'h','t','y','b','n']
};

// 각 자리별로 랜덤하게 섞인 연습 시퀀스 생성 (50개씩) - 연속 중복 방지
const generateRandomSequences = (language: 'korean' | 'english') => {
  const sequences: { [key: string]: string[] } = {};
  const keysByPosition = language === 'korean' ? koreanKeysByPosition : englishKeysByPosition;
  
  Object.keys(keysByPosition).forEach(position => {
    const keys = keysByPosition[position as keyof typeof keysByPosition];
    const sequence: string[] = [];
    
    // 첫 번째 키는 랜덤으로 선택
    if (keys.length > 0) {
      sequence.push(keys[Math.floor(Math.random() * keys.length)]);
    }
    
    // 나머지 49개의 글자 생성 (연속 중복 방지)
    for (let i = 1; i < 50; i++) {
      const lastKey = sequence[i - 1];
      let availableKeys = keys.filter(key => key !== lastKey);
      
      // 만약 키가 1개뿐이라면 그대로 사용
      if (availableKeys.length === 0) {
        availableKeys = keys;
      }
      
      const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
      sequence.push(randomKey);
    }
    
    sequences[position] = sequence;
  });
  
  return sequences;
};

// 2단계 연습을 위한 의미있는 단어 시퀀스 (한글)
const koreanWordSequences = {
    // basic: 자음 [ㅁ ㄴ ㅇ ㄹ], 모음 [ㅓ ㅏ ㅣ] — 2~4글자
    basic: [
      ['나라', '나리', '나날', '아마', '아라리'],
      ['엄마', '아니', '이리', '이마', '어미'],
      ['어림', '어린', '어머니', '어린이', '머리'],
      ['미리', '마리', '머리말', '나라말', '나라일'],
      ['아리랑', '아리아', '이나라', '아이', '나라님'],
      ['이마', '아리아리', '이랑', '이나미', '마리아'],
      ['마마', '맘마', '어이', '이너마', '나라니'],
      ['어머니', '어마이', '너랑나랑', '나날', '엄니'],
      ['어마니', '어머나', '이이', '이미나', '이랑'],
      ['아리말', '나라', '아리마', '이리말', '남아']
    ],
  
    // left-upper: basic + 자음 [ㅂ ㅈ ㄷ ㄱ ㅃ ㅉ ㄸ ㄲ], 모음은 그대로 [ㅓ ㅏ ㅣ]
    'left-upper': [
      ['바다', '나비', '바리', '가라', '가락'],
      ['다리', '다리미', '머리띠', '나락', '미담'],
      ['이바지', '나라님', '미라', '바가지', '가마'],
      ['머리말', '아다다', '나라말이', '바닥', '가림'],
      ['바람', '바람기', '다짐', '가방', '가가린'],
      ['가마니', '다가다', '나락', '가락질', '바리바리'],
      ['미닫이', '가리다', '다가림', '나라일', '가마'],
      ['가리마', '바람이', '다리미', '바람막', '가지마'],
      ['미닫이문', '가마일', '나라님말', '다각', '가라'],
      ['바라지', '다리가지', '가락국', '바가지질', '가마돌']
    ],
  
    // right-upper: 위까지 + 모음 [ㅕ ㅑ ㅐ ㅔ] (※ ㅖ/ㅒ는 아직 X)
    'right-upper': [
      ['여자', '여름', '여리', '여러명', '여닫다'],
      ['개나리', '개방', '개량', '개선', '개량미'],
      ['게자리', '게장', '게재', '게마대', '게살'],
      ['냉면', '냉각', '냉매', '냄비', '냉담'],
      ['레벨', '레일', '레로', '레로레로', '레거'],
      ['재래', '재가', '재갈', '재담', '재량'],
      ['여정', '여지', '여객', '여건', '여명'],
      ['자객', '자례', '자력', '자래', '자령'],
      ['대개', '대강', '대략', '대량', '대각'],
      ['라면', '라멘', '레저', '레전더리', '애미나이']
    ],
  
    // left-lower: 위까지 + 자음 [ㅋ ㅌ ㅊ ㅍ] (모음은 여전히 ㅓ/ㅏ/ㅣ/ㅕ/ㅑ/ㅐ/ㅔ)
    'left-lower': [
      ['카레', '칼날', '칼자루', '칼질', '카렌'],
      ['타자', '타자기', '타락', '타박', '타령'],
      ['차례', '차림', '차장', '차질', '차별'],
      ['치마', '치맛자락', '치장', '치열', '치밀'],
      ['피리', '피난', '피폐', '피날레', '피라미'],
      ['카레빵', '차림', '차림집', '타작', '타격'],
      ['타재', '타이', '타입', '타자판', '타자력'],
      ['치정', '치레', '치기', '치대다', '치례'],
      ['피살', '피세', '피식', '피신', '피심'],
      ['카리나', '카레집', '차림표', '타진', '타집']
    ],
  
    // right-lower: 위까지 + 모음 [ㅡ] (여전히 ㅗ/ㅜ/ㅠ/ㅛ는 아직 X)
    'right-lower': [
      ['그늘', '그릇', '그림', '그리다', '느림'],
      ['느긋', '느끼다', '느름', '드리다', '뜨다'],
      ['뜨개', '뜨내기', '뜨락', '끄덕', '끄다'],
      ['드늦다', '드넓다', '드높다', '드러나다', '드러내다'],
      ['드러눕다', '느릿느릿', '느린걸음', '드르렁', '드러내다'],
      ['브리핑', '프린트', '프리즘', '프리뷰', '크기'],
      ['크다', '크게', '큰길', '큰집', '큰일'],
      ['끝나다', '끈기', '끈적', '끈질기다', '끈'],
      ['뜨뜻미지근', '드르륵', '드므질', '느루', '느르다'],
      ['드문드문', '드름', '브리지', '프리즘', '크림']
    ],
  
    // center: 위까지 + 자음 [ㅅ ㅆ ㅎ] + 모음 [ㅗ ㅛ ㅠ ㅜ] — 자판 완성
    center: [
      ['소리', '소금', '소문', '소원', '소망'],
      ['호수', '호흡', '호감', '호평', '호선'],
      ['수리', '수락', '수업', '수법', '수면'],
      ['휴가', '휴지', '휴식', '휴대', '휴양'],
      ['유리', '유행', '유학', '유리병', '유산'],
      ['요리', '요금', '요새', '요정', '요약'],
      ['효도', '효심', '효자', '효율', '효모'],
      ['술집', '술잔', '손짓', '손잡이', '손수'],
      ['소나기', '소나무', '소중한', '소환', '소화'],
      ['후회', '후속', '후유증', '유튜브', '요요현상']
    ]
  };
// 영어 단어 풀 정의 (각 자리별로 실제 사용되는 단어들)
const englishWordSequences = {
    // basic = a,s,d,f,j,k,l  (일반 + 스크래블 허용 단어 혼합)
    basic: [
      ['as','ad','lad','sad','fad'],
      ['add','all','lass','fall','asks'],
      ['ask','asks','alas','salad','salsa'],
      ['flak','flaks','flask','flasks','lads'],
      ['fads','adds','allal','dada','alfalfa'],   // allal: 사전 등재 방언/고유어, alfalfa: 일반
      ['dal','sal','fas','alfa','alfas'],        // dal(렌틸콩), sal(나무/염), alfa(=alpha 변형)
      ['skald','skalds','lass','salsas','salads'],
      ['aslaf','fall','ladas','dals','aflaj'],   // aflaj(=falaj 복수, 사전 등재 아라비아계 일반어
      ['faals','safal','alals','aslad','salal'], // salal(식물, 일반)
      ['sad','falla','kallas','flad','lalla']    // 방언/스크래블 허용 표기 포함
    ],
  
    // leftupper = q,w,e,r (+ basic 포함) — 전부 일반 단어
    leftupper: [
      ['war','raw','wear','rear','dear'],
      ['weird','weed','read','ward','ware'],
      ['were','wears','readers','reads','weir'],
      ['rare','rear','dread','rawer','rawer'],
      ['swerve','swerve','reward','rawer','reseed'], // 중복 방지 위해 아래 줄 대체
      ['swerve','reward','rewear','reware','reseed'],
      ['sewer','rawer','rawer','reed','weed'],       // rawer 중복 많아 교체
      ['sewer','wearer','drawer','reader','rewed'],
      ['weeded','weeder','reseed','reward','rewear'],
      ['weave','weaver','wearer','rawer','drawer']
    ],
  
    // rightupper = u,i,o,p (+ leftupper + basic 포함) — 전부 일반 단어
    rightupper: [
      ['pair','paid','pail','pier','pied'],
      ['pure','pore','pour','ripe','ride'],
      ['pipe','pill','pool','poll','pupa'],
      ['into','unit','iron','soup','pour'],
      ['pouring','piping','rioted','ironed','indoor'],
      ['audio','opioid','opioid','popup','popup'], // 중복 교체
      ['audio','opioid','potion','union','pilot'],
      ['riots','prior','priori','prion','indoor'], // priori 허용(철학/수학 용어)
      ['piano','opium','input','union','polio'],
      ['pious','odour','odour','group','roup']    // odour(BrE), 중복 교체
    ],
  
    // leftlower = z,x,c,v (+ rightupper 등 모두 포함) — 전부 일반 단어
    leftlower: [
      ['vex','vexed','vivid','civic','civic'],
      ['cave','caves','caved','cavia','caviar'], // cavia(쥐과 속명, 일반 사전 표기)
      ['zinc','zany','zone','zoned','zones'],
      ['vice','vices','vividly','cavil','cavil'],
      ['civil','civics','civvy','civicly','civic'], // civvy(평상복)
      ['vac','vacuity','vacua','vacuole','vaccine'],
      ['cavilers','caviler','cavil','cavils','caving'],
      ['convivial','conviviality','vocal','vocalic','vocalic'], // 너무 길거나 9+ → 교체
      ['vocal','vocalic','covalent','covalent','vocalism'],    // 8자 이하 유지, 중복 교체
      ['xenial','xenia','xenic','xenon','xylol']               // xylol(자일롤, 화학명)
    ],
  
    // rightlower = m , . / ? (+ leftlower까지 포함)
    // 구두점은 실제 영어단어 구성에는 사용하지 않으므로 'm'을 중심으로 구성
    rightlower: [
      ['man','men','mom','mem','mad'],
      ['made','make','meal','mail','mall'],
      ['main','mean','mine','mini','mind'],
      ['mend','mild','milk','mill','mill'],
      ['monk','mock','mono','mono','monk'], // 중복 교체
      ['monk','month','money','monic','monad'],
      ['mania','media','median','medial','madam'],
      ['animal','amend','amends','amid','amide'],
      ['median','medial','monads','monism','monies'],
      ['mailman','landman','sandman','madmen','landmine'] // 8자 이내
    ],
  
    // center = t,y,g,h,b,n (+ rightlower까지 포함) — 전부 일반 단어
    center: [
      ['bat','bet','bit','but','bot'],
      ['ten','tan','ton','tun','tin'],
      ['bang','bangs','bangin','binge','bing'],
      ['thing','thine','then','than','thin'],
      ['tongue','tonguey','tonging','tinning','binning'], // tonguey 드묾 → 교체
      ['tongue','tongs','tonging','tinning','binning'],
      ['night','nightly','ninth','thinly','tiny'],
      ['bright','bring','bring','briny','binary'], // 중복 교체
      ['bright','briny','binary','tangy','tinny'],
      ['anything','anything','bathing','batting','biting'] // 중복 교체
    ]
  };
  

// 단어 시퀀스를 랜덤하게 생성 (50개씩) - 연속 중복 방지
const generateRandomWords = (language: 'korean' | 'english') => {
  const words: { [key: string]: string[] } = {};
  const wordsByPosition = language === 'korean' ? koreanWordSequences : englishWordSequences;
  
  Object.keys(wordsByPosition).forEach(position => {
    const wordPool = wordsByPosition[position as keyof typeof wordsByPosition];
    const sequence: string[] = [];
    
    if (language === 'korean') {
      // 한글은 2차원 배열을 1차원으로 변환 후 중복 방지 선택
      const allWords = (wordPool as string[][]).flat();
      
      if (allWords.length > 0) {
        // 첫 번째 단어는 랜덤으로 선택
        sequence.push(allWords[Math.floor(Math.random() * allWords.length)]);
        
        // 나머지 49개 단어 생성 (연속 중복 방지)
        for (let i = 1; i < 50; i++) {
          const lastWord = sequence[i - 1];
          let availableWords = allWords.filter(word => word !== lastWord);
          
          // 만약 단어가 1개뿐이라면 그대로 사용
          if (availableWords.length === 0) {
            availableWords = allWords;
          }
          
          const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
          sequence.push(randomWord);
        }
      }
      
      words[position] = sequence;
    } else {
      // 영어는 단어 풀에서 연속 중복 방지하여 선택 (2차원 배열을 1차원으로 변환)
      const wordArray = (wordPool as string[][]).flat();
      
      if (wordArray.length > 0) {
        // 첫 번째 단어는 랜덤으로 선택
        sequence.push(wordArray[Math.floor(Math.random() * wordArray.length)]);
        
        // 나머지 49개 단어 생성 (연속 중복 방지)
        for (let i = 1; i < 50; i++) {
          const lastWord = sequence[i - 1];
          let availableWords = wordArray.filter(word => word !== lastWord);
          
          // 만약 단어가 1개뿐이라면 그대로 사용
          if (availableWords.length === 0) {
            availableWords = wordArray;
          }
          
          const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
          sequence.push(randomWord);
        }
      }
      
      words[position] = sequence;
    }
  });
  
  return words;
};

export default function BasicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLanguage = searchParams.get('language') as 'korean' | 'english' || 'korean';
  
  const [language, setLanguage] = useState<'korean' | 'english'>(initialLanguage);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeyPresses, setTotalKeyPresses] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  // 일시정지 관련 상태
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0); // 누적 일시정지 시간
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<'basic' | 'left-upper' | 'right-upper' | 'left-lower' | 'right-lower' | 'center'>('basic');
  const [currentChar, setCurrentChar] = useState('');
  const [nextChar, setNextChar] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [currentWordProgress, setCurrentWordProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  
  // 단어 연습을 위한 새로운 상태들
  const [userInput, setUserInput] = useState(''); // 사용자가 입력하는 단어
  const [currentJamoIndex, setCurrentJamoIndex] = useState(0); // 현재 입력해야 할 자모 인덱스
  const [currentJamos, setCurrentJamos] = useState<string[]>([]); // 현재 단어의 자모 분해 결과
  
  // 각 항목별 입력 시간 측정을 위한 상태들
  const [currentItemStartTime, setCurrentItemStartTime] = useState<number | null>(null);
  
  // 단어연습 부분 전용 타이밍 시스템
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [currentWordStartTime, setCurrentWordStartTime] = useState<number | null>(null);
  const wordStartTimeRef = useRef<number | null>(null);
  const [lastWordCPM, setLastWordCPM] = useState<number | null>(null);
  const [wordCorrectHistory, setWordCorrectHistory] = useState<boolean[]>([]);

  // 현재 언어에 따른 시퀀스 생성
  const [sequences, setSequences] = useState(() => generateRandomSequences(language));
  const [words, setWords] = useState(() => generateRandomWords(language));

  // 현재 입력할 글자/단어 가져오기 (단순화된 로직)
  const getCurrentItem = useCallback((): string => {
    if (currentCharIndex < 50) {
      // 1단계: 개별 글자 연습
      return sequences[currentPosition][currentCharIndex % sequences[currentPosition].length];
    } else {
      // 2단계: 단어 연습
      const wordIndex = currentCharIndex - 50;
      return words[currentPosition][wordIndex % words[currentPosition].length];
    }
  }, [language, currentPosition, currentCharIndex, sequences, words]);

  // 다음 입력할 글자/단어 가져오기
  const getNextItem = useCallback((): string => {
    const nextIndex = currentCharIndex + 1;
    if (nextIndex >= 100) return '';
    
    if (nextIndex < 50) {
      // 1단계: 개별 글자 연습
      return sequences[currentPosition][nextIndex % sequences[currentPosition].length];
    } else {
      // 2단계: 단어 연습
      const wordIndex = nextIndex - 50;
      return words[currentPosition][wordIndex % words[currentPosition].length];
    }
  }, [currentPosition, currentCharIndex, sequences, words]);

  // 현재 글자/단어와 다음 글자/단어 업데이트 (단순화)
  const updateCurrentAndNextChar = useCallback(() => {
    const currentItem = getCurrentItem();
    const nextItem = getNextItem();
    
    setCurrentChar(currentItem);
    setNextChar(nextItem);
    setCurrentWord(currentItem);
    setCurrentWordProgress(0);
    
    // 2단계(단어 연습)일 때 한글 자모 분해
    if (currentCharIndex >= 50 && language === 'korean' && currentItem) {
      const decomposed = currentItem.split('').flatMap(char => decomposeHangul(char));
      setCurrentJamos(decomposed);
      setCurrentJamoIndex(0);

    } else {
      setCurrentJamos([]);
      setCurrentJamoIndex(0);
    }
  }, [getCurrentItem, getNextItem, currentCharIndex, language]);

  // 현재 상태가 변경될 때마다 자동 업데이트
  useEffect(() => {
    updateCurrentAndNextChar();
  }, [language, currentPosition, currentCharIndex, updateCurrentAndNextChar]);

  // 언어 변경 시 시퀀스 재생성
  useEffect(() => {
    setSequences(generateRandomSequences(language));
    setWords(generateRandomWords(language));
  }, [language]);

  // 일시정지 감지 (3초 이상 입력이 없으면 일시정지)
  useEffect(() => {
    if (!hasStarted || !lastActivityTime) return;

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivityTime;
      
      if (inactiveTime > 3000 && !isPaused) {
        // 3초 이상 비활성 상태이고 아직 일시정지 상태가 아니면 일시정지
        setIsPaused(true);
        setPauseStartTime(now - 3000); // 3초 전부터 일시정지로 간주
      }
    };

    const interval = setInterval(checkInactivity, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, lastActivityTime, isPaused]);

  // 입력 재개 시 일시정지 해제
  const resumeTyping = useCallback(() => {
    if (isPaused && pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setPausedTime(prev => prev + pauseDuration);
      setIsPaused(false);
      setPauseStartTime(null);
    }
    setLastActivityTime(Date.now());
  }, [isPaused, pauseStartTime]);

  const calculateResult = useCallback(() => {
    // 단어연습 부분만의 결과 계산 (currentCharIndex >= 50인 부분)
    const wordPracticeCount = Math.max(0, currentCharIndex - 50); // 완료한 단어 수
    const wordCorrectCount = wordCorrectHistory.filter(Boolean).length; // 맞힌 단어 수
    
    // 단어연습 정확도 계산
    const wordAccuracy = wordPracticeCount > 0 ? Math.round((wordCorrectCount / wordPracticeCount) * 100) : 0;
    
    // 전체 경과 시간 계산 (분 단위) - 일시정지 시간 제외
    const rawTimeMinutes = startTime ? (Date.now() - startTime) / (1000 * 60) : 0;
    const adjustedPausedTimeMinutes = pausedTime / (1000 * 60);
    const totalTimeMinutes = Math.max(0.1, rawTimeMinutes - adjustedPausedTimeMinutes); // 최소 0.1분으로 설정
    
    // 실제 완료한 문자 수 계산 (더 정확한 방식)
    let actualCharacters = 0;
    
    // 1단계: 완료한 글자 수 (50개 중 완료한 만큼)
    if (currentCharIndex >= 50) {
      actualCharacters += 50; // 1단계 모두 완료
    } else {
      actualCharacters += currentCharIndex; // 1단계 부분 완료
    }
    
    // 2단계: 완료한 단어의 실제 문자 수
    if (currentCharIndex >= 50) {
      // 2단계에서 완료한 단어들의 문자 수 합계
      const stage2Items = Math.min(currentCharIndex - 50, 50);
      for (let i = 0; i < stage2Items; i++) {
        const wordIndex = 50 + i;
        const word = getCurrentItem(); // 실제 단어 가져오기 로직 필요
        if (language === 'korean') {
          // 한글의 경우 자모 수로 계산
          actualCharacters += word.split('').reduce((sum, char) => {
            return sum + decomposeHangul(char).length;
          }, 0);
        } else {
          // 영어의 경우 글자 수로 계산
          actualCharacters += word.length;
        }
      }
    }
    
    // 단어연습 부분의 개별 단어 타수들의 평균으로 CPM 계산
    let averageCPM = 0;
    if (wordTimings.length > 0) {
      // 유효한 타이밍 데이터만 필터링 (0이 아닌 CPM)
      const validTimings = wordTimings.filter(timing => timing.cpm && timing.cpm > 0);
      
      if (validTimings.length > 0) {
        const totalCPM = validTimings.reduce((sum, timing) => sum + (timing.cpm || 0), 0);
        averageCPM = Math.round(totalCPM / validTimings.length);
      }
    }
    
    // 정확도가 50% 미만이면 CPM/WPM을 0으로 설정
    let finalCPM = 0;
    let finalWPM = 0;
    
    if (wordAccuracy >= 50) {
      // CPM 상한선 설정 (현실적인 범위)
      const cappedCPM = Math.min(averageCPM, 800);
      
      // 정확도에 따른 패널티 적용 (정확도가 낮을수록 패널티)
      const accuracyMultiplier = Math.max(0.3, wordAccuracy / 100); // 최소 30%는 유지
      finalCPM = Math.round(cappedCPM * accuracyMultiplier);
      
      // WPM 계산 (5글자 = 1단어 기준)
      finalWPM = Math.round(finalCPM / 5);
    }
    
    setResult({
      accuracy: wordAccuracy,
      speed: finalCPM,
      wpm: finalWPM,
      time: Math.round(totalTimeMinutes * 60),
      totalKeyPresses: totalKeyPresses,
      actualCharacters: wordTimings.length
    });
    setShowResultModal(true);
  }, [wordTimings, wordCorrectHistory, totalKeyPresses, startTime, pausedTime, currentCharIndex, language]);

  // 다음 자리로 진행하는 함수 (단순화)
  const moveToNextPosition = useCallback(() => {
    const nextIndex = currentCharIndex + 1;
    
    if (nextIndex >= 100) {
      // 100개 연습 완료 시 결과 계산
      calculateResult();
    } else {
      // 다음 순서로 진행
      setCurrentCharIndex(nextIndex);
      setInputHistory([]);
    }
  }, [currentCharIndex, calculateResult]);

  // 자리 변경 시 초기화
  const handlePositionChange = (position: 'basic' | 'left-upper' | 'right-upper' | 'left-lower' | 'right-lower' | 'center') => {
    setCurrentPosition(position);
    setCurrentCharIndex(0);
    setInputHistory([]);
    setCurrentWordProgress(0);
    setUserInput('');
    setCurrentItemStartTime(null);
    setCurrentJamoIndex(0);
    setCurrentJamos([]);
    // 일시정지 상태 초기화
    setIsPaused(false);
    setPausedTime(0);
    setLastActivityTime(null);
    setPauseStartTime(null);
    setStartTime(null);
    setHasStarted(false);
    // 단어별 타이밍 상태 초기화
    setWordTimings([]);
    setCurrentWordStartTime(null);
    wordStartTimeRef.current = null;
    setLastWordCPM(null);
    setWordCorrectHistory([]);
  };

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

  // 언어 변경 시 초기화
  const changeLanguage = () => {
    const newLanguage = language === 'korean' ? 'english' : 'korean';
    setLanguage(newLanguage);
    setCurrentCharIndex(0);
    setInputHistory([]);
    setCurrentWordProgress(0);
    setUserInput('');
    setCurrentItemStartTime(null);
    setCurrentJamoIndex(0);
    setCurrentJamos([]);
    // 일시정지 상태 초기화
    setIsPaused(false);
    setPausedTime(0);
    setLastActivityTime(null);
    setPauseStartTime(null);
    setStartTime(null);
    setHasStarted(false);
    // 단어별 타이밍 상태 초기화
    setWordTimings([]);
    setCurrentWordStartTime(null);
    wordStartTimeRef.current = null;
    setLastWordCPM(null);
    setWordCorrectHistory([]);
    
    // IME 상태 힌트 설정
    setTimeout(() => setIMEHint(newLanguage), 100);
  };

  // 연습 초기화
  const resetTyping = () => {
    setCurrentCharIndex(0);
    setInputHistory([]);
    setStartTime(null);
    setTotalKeyPresses(0);
    setResult(null);
    setHasStarted(false);
    setShowResultModal(false);
    setCurrentWordProgress(0);
    setUserInput('');
    setCurrentItemStartTime(null);
    setCurrentJamoIndex(0);
    setCurrentJamos([]);
    // 일시정지 상태 초기화
    setIsPaused(false);
    setPausedTime(0);
    setLastActivityTime(null);
    setPauseStartTime(null);
    // 단어별 타이밍 상태 초기화
    setWordTimings([]);
    setCurrentWordStartTime(null);
    wordStartTimeRef.current = null;
    setLastWordCPM(null);
    setWordCorrectHistory([]);
  };

  // 단어 입력 처리 함수
  const handleWordInput = useCallback((input: string) => {
    // 입력 활동 재개 (일시정지 해제)
    resumeTyping();
    
    // 단어 입력 중에는 타수를 카운트하지 않음 (완성 시에만 카운트)
    
    // 한글의 경우 자모 인덱스 업데이트 (입력 길이와 관계없이 항상 업데이트)
    if (language === 'korean' && currentJamos.length > 0) {
      // 입력된 글자 수에 따라 자모 인덱스 계산
      const inputJamos = input.split('').flatMap(char => decomposeHangul(char));
      const newIndex = Math.min(inputJamos.length, currentJamos.length - 1);
      setCurrentJamoIndex(newIndex);

    }
    
    // 연습 시작 시간 설정 (첫 입력시에만)
    if (!startTime && input.length === 1 && userInput.length === 0) {
      setStartTime(Date.now());
    }
    
    // 단어연습 부분에서만 단어별 타이밍 측정 (currentCharIndex >= 50)
    if (currentCharIndex >= 50) {
      // 단어 입력 시작 시간 설정 (첫 키 입력 시점)
      if (!wordStartTimeRef.current && input.length > 0) {
        const wordStartTime = Date.now();
        wordStartTimeRef.current = wordStartTime;
        setCurrentWordStartTime(wordStartTime);
      }
    }
    
    setUserInput(input);
    
    // 전체 연습에서 첫 번째 입력 시 전체 시작 표시
    if (!hasStarted && input.length > 0) {
      setHasStarted(true);
    }
    
    // 입력 중에는 에러 상태 초기화 (실시간 피드백 제거)
    setIsWrong(false);
  }, [currentWord, hasStarted, userInput, language, currentJamos, resumeTyping]);

  // 단어 확인 함수 (엔터나 스페이스바 입력 시)
  const checkWordInput = useCallback(() => {
    const isCorrect = userInput.trim() === currentWord;
    
    // 단어연습 부분에서만 타이밍 계산 (currentCharIndex >= 50)
    if (currentCharIndex >= 50 && wordStartTimeRef.current) {
      const endTime = Date.now();
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
      const wordCPM = durationMinutes > 0 ? Math.round(characterCount / durationMinutes) : 0;
      
      const wordTiming: WordTiming = {
        word: currentWord,
        startTime: wordStartTimeRef.current,
        endTime: endTime,
        duration: duration,
        cpm: wordCPM
      };
      
      setWordTimings(prev => [...prev, wordTiming]);
      setLastWordCPM(wordCPM);
      
      // 단어연습 정답 여부 기록
      setWordCorrectHistory(prev => [...prev, isCorrect]);
    }
    
    if (isCorrect) {
      // 정답! 언어에 따라 타수 계산
      let keyPressCount = 0;
      if (language === 'korean') {
        // 한글은 자모 개수로 계산 (예: "안녕하세요" = 12타)
        keyPressCount = currentWord.split('').flatMap(char => decomposeHangul(char)).length;
      } else {
        // 영어는 글자 개수로 계산
        keyPressCount = currentWord.length;
      }
      setTotalKeyPresses(prev => prev + keyPressCount);
      
      setInputHistory(prev => [...prev, userInput]);
      setUserInput('');
      setIsWrong(false);
      setCurrentItemStartTime(null);
      wordStartTimeRef.current = null; // 다음 단어를 위해 초기화
      
      setTimeout(() => {
        moveToNextPosition();
      }, 200);
    } else {
      // 틀렸을 때는 개별 글자 색상으로 피드백 (전체 isWrong 상태는 사용하지 않음)
      // 사용자가 다시 입력할 수 있도록 그대로 유지
    }
  }, [userInput, currentWord, currentItemStartTime, moveToNextPosition, currentCharIndex, language]);

  const handleKeyPress = useCallback((key: string) => {
    if (currentCharIndex < 50) {
      // 입력 활동 재개 (일시정지 해제)
      resumeTyping();
      
      // 1단계: 한 글자씩 입력 (모든 키 입력을 카운트)
      setTotalKeyPresses(prev => prev + 1);
      
      // 연습 시작 시간 설정 (첫 입력시에만)
      if (!startTime) {
        setStartTime(Date.now());
      }
      
      // 전체 연습에서 첫 번째 입력 시 전체 시작 표시
      if (!hasStarted) {
        setHasStarted(true);
      }
      
      const isCorrect = key === currentChar;
      
      if (isCorrect) {
        // 올바른 입력
        setInputHistory(prev => [...prev, key]);
        setIsWrong(false);
        setCurrentItemStartTime(null);
        
        // 1단계에서 바로 다음으로 진행
        setTimeout(() => {
          moveToNextPosition();
        }, 100);
      } else {
        // 틀린 입력 시 초기화 및 깜박임 효과
        setInputHistory([]);
        
        // 2번 깜박이는 애니메이션
        let count = 0;
        const blinkInterval = setInterval(() => {
          setIsWrong(prev => !prev);
          count++;
          if (count >= 4) {
            clearInterval(blinkInterval);
            setIsWrong(false);
          }
        }, 100);
      }
    }
    // 2단계(단어 연습)는 이제 handleWordInput으로 처리
  }, [currentChar, currentCharIndex, hasStarted, currentItemStartTime, moveToNextPosition, resumeTyping]);

  // 각 자리별 키 매핑 정의
  const positionKeyMaps = {
    korean: {
      'basic': ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ', ';'],
      'left-upper': ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ'],
      'right-upper': ['ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
      'left-lower': ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
      'right-lower': ['ㅡ', ',', '.', '/'],
      'center': ['ㅅ', 'ㅎ', 'ㅛ', 'ㅗ', 'ㅠ', 'ㅜ']
    },
    english: {
      'basic': ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
      'left-upper': ['Q', 'W', 'E', 'R'],
      'right-upper': ['U', 'I', 'O', 'P'],
      'left-lower': ['Z', 'X', 'C', 'V'],
      'right-lower': ['M', ',', '.', '/'],
      'center': ['T', 'Y', 'G', 'H', 'B', 'N']
    }
  };

  const isKeyHighlighted = (key: string) => {
    let targetKey = '';
    
    // 2단계(단어 연습) 중에는 현재 입력해야 할 자모를 하이라이트
    if (currentCharIndex >= 50) {
      if (language === 'korean' && currentJamos.length > 0) {
        targetKey = currentJamos[currentJamoIndex];
      } else if (language === 'english') {
        targetKey = currentWord[userInput.length]?.toUpperCase() || '';
      }
    } else {
      // 1단계(개별 글자 연습) 중에는 현재 글자를 하이라이트
      targetKey = currentChar;
    }
    
    // 현재 입력해야 할 키와 정확히 일치하는 경우
    if (key === targetKey) return 'current';
    
    // 쌍자음/쌍모음 또는 기호의 경우 기본 키도 하이라이트
    if (requiresShift(targetKey) && key === getBaseKey(targetKey)) {
      return 'current';
    }
    
    // Shift 키 하이라이트 (Shift가 필요한 키인 경우)
    if (key === 'Shift' && requiresShift(targetKey)) {
      return 'shift';
    }
    
    // 현재 선택된 자리의 키들에 대한 파란색 하이라이트
    const currentPositionKeys = positionKeyMaps[language][currentPosition];
    if (currentPositionKeys.includes(key)) {
      return 'position';
    }
    
    return 'normal';
  };

  // 키보드 이벤트를 전역으로 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 2단계(단어 연습) 중에는 엔터와 스페이스바만 처리
      if (currentCharIndex >= 50) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          checkWordInput();
        }
        return;
      }
      
      // 특수 키는 제외 (Ctrl, Alt, F1-F12 등)
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      
      let key = event.key;
      
      // 한글 입력 처리
      if (language === 'korean') {
        // 한글 모드일 때는 event.key가 한글로 나옴
        if (key.length === 1 && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(key)) {
          // 한글 자모나 완성된 글자가 입력된 경우 그대로 사용
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
          
          // Shift + 키 조합으로 쌍자음/쌍모음 처리
          const shiftKeyMap: { [key: string]: string } = {
            'KeyQ': 'ㅃ', 'KeyW': 'ㅉ', 'KeyE': 'ㄸ', 'KeyR': 'ㄲ', 'KeyT': 'ㅆ',
            'KeyO': 'ㅒ', 'KeyP': 'ㅖ'
          };
          
          if (event.shiftKey && shiftKeyMap[event.code]) {
            key = shiftKeyMap[event.code];
          } else if (keyMap[event.code]) {
            key = keyMap[event.code];
          }
        }
      }
      

      handleKeyPress(key);
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress, language, currentCharIndex, checkWordInput]);

  // 전역 자동 포커스 시스템 (단어연습 부분에서만)
  useEffect(() => {
    if (currentCharIndex < 50) return; // 자리연습 부분에서는 적용하지 않음
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showResultModal) return;
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement && document.activeElement !== inputElement) {
        inputElement.focus();
      }
      // Enter나 Space 키 처리는 기존 handleKeyPress에서 처리됨
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
  }, [currentCharIndex, showResultModal]);

  // 페이지 로드 시 IME 힌트 설정
  useEffect(() => {
    setTimeout(() => setIMEHint(language), 200);
  }, [language, setIMEHint]);

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

      <div className="relative z-10 w-full h-full flex flex-col p-6 pt-20 lg:pt-6">
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
          <div className="flex justify-center lg:justify-end mb-6">
            <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-cyan-500/30">
              <button
                onClick={() => changeLanguage()}
                className={cn(
                  "px-4 lg:px-6 py-2 rounded-full font-medium transition-all duration-200",
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
                  "px-4 lg:px-6 py-2 rounded-full font-medium transition-all duration-200",
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
            {/* 이전 단어 CPM 표시 (단어연습 부분에서만, 고정 공간) */}
            {currentCharIndex >= 50 && (
              <div className="mb-4 text-center h-10 flex items-center justify-center">
                {lastWordCPM !== null ? (
                  <div className="text-cyan-400 text-2xl font-bold">
                    {lastWordCPM} CPM
                  </div>
                ) : (
                  <div className="h-8"></div> // 빈 공간 유지
                )}
              </div>
            )}
            
            {/* 현재 입력할 글자와 다음 글자 */}
            <div className="flex items-center justify-center gap-6 mb-8 relative">
              {/* 현재 입력할 글자 - 항상 중앙에 (반응형) */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-cyan-500/25 border border-cyan-400/50 transition-all duration-200">
                <div className="text-center">
                  <div className={cn(
                    "text-sm mb-4 opacity-80",
                    isWrong ? "text-red-800" : "text-cyan-100"
                  )}>
                    {isWrong ? "틀렸습니다!" : currentCharIndex < 10 ? "입력할 자리" : "입력할 단어"}
                  </div>
                  <div className={cn(
                    "text-6xl lg:text-8xl font-bold leading-none transition-colors duration-150",
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


            
            {/* 단어 입력 필드 */}
            {currentCharIndex >= 50 && (
              <div className="mb-6 text-center">
                <div className="bg-transparent">
                  {/* 입력 필드 */}
                  <div className="mb-4">
                    {/* 글자별 표시를 위한 커스텀 입력 디스플레이 */}
                    <div className="w-full max-w-2xl mx-auto px-2 py-2 text-center text-4xl lg:text-6xl font-bold min-h-[60px] lg:min-h-[80px] flex items-center justify-center">
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
                      type="text"
                      value={userInput}
                      onChange={(e) => handleWordInput(e.target.value)}
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
                    />
                  </div>
                  
                  {/* 입력 안내 */}
                  <div className="text-slate-400 text-sm">
                    단어 입력 후 <span className="text-cyan-400">Enter</span> 또는 <span className="text-cyan-400">Space</span>를 눌러주세요
                  </div>
                </div>
              </div>
            )}

            {/* 가상 키보드 (모바일에서 숨김) */}
            <div className="hidden lg:block bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-cyan-500/30">
              {/* 진행도 막대바 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cyan-300 text-sm">
                    {currentCharIndex < 50 ? '1단계: 자리 연습' : '2단계: 단어 연습'}
                  </span>
                  <div className="flex items-center gap-3">
                    {isPaused && (
                      <div className="flex items-center gap-1 text-orange-400 text-sm">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        일시정지됨
                      </div>
                    )}
                    <span className="text-cyan-300 text-sm">
                      {currentCharIndex + 1} / 100
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCharIndex + 1) / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 키보드 헤더 */}
              <div className="flex flex-col mb-6">
                <div className="flex items-center justify-between mb-4">
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
                  {(language === 'korean' ? ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'] : ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']).map((key, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                        isKeyHighlighted(key) === 'current' && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                        isKeyHighlighted(key) === 'position' && "border-blue-400 bg-blue-400/20 text-blue-300 shadow-[0_0_10px_0_rgba(59,130,246,0.4)]",
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
                  {(language === 'korean' ? ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'] : ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']).map((key, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                        isKeyHighlighted(key) === 'current' && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                        isKeyHighlighted(key) === 'position' && "border-blue-400 bg-blue-400/20 text-blue-300 shadow-[0_0_10px_0_rgba(59,130,246,0.4)]",
                        isKeyHighlighted(key) === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                    </div>
                  ))}
                  <div 
                    onClick={() => handleKeyPress(';')}
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                      (isKeyHighlighted(';') === 'current' || isKeyHighlighted(':') === 'current') && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                      isKeyHighlighted(';') === 'position' && "border-blue-400 bg-blue-400/20 text-blue-300 shadow-[0_0_10px_0_rgba(59,130,246,0.4)]",
                      (isKeyHighlighted(';') === 'normal' && isKeyHighlighted(':') === 'normal' && isKeyHighlighted(';') !== 'position') && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                    )}
                  >
                    <span className="text-cyan-400 text-xs">:</span>
                    <span className="font-bold text-sm">;</span>
                  </div>
                  <div 
                    onClick={() => handleKeyPress("'")}
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                      (isKeyHighlighted("'") === 'current' || isKeyHighlighted('"') === 'current') && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                      (isKeyHighlighted("'") === 'normal' && isKeyHighlighted('"') === 'normal') && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                    )}
                  >
                    <span className="text-cyan-400 text-xs">"</span>
                    <span className="font-bold text-sm">'</span>
                  </div>
                  <div className="w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold border-cyan-500/50 bg-slate-700 text-cyan-300 shadow-sm hover:bg-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                    ↵
                  </div>
                </div>

                {/* 네 번째 행: Shift와 자음/모음, 기호 */}
                <div className="flex space-x-1 mb-3 justify-center">
                  <div className={cn(
                    "w-24 h-12 rounded-lg border-2 flex items-center justify-start pl-2 text-xs font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                    isKeyHighlighted('Shift') === 'shift' && "border-orange-400 bg-orange-400/20 text-orange-300 shadow-[0_0_15px_0_rgba(251,146,60,0.5)] scale-105",
                    isKeyHighlighted('Shift') === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                  )}>
                    ⇧
                  </div>
                  {(language === 'korean' ? ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'] : ['Z', 'X', 'C', 'V', 'B', 'N', 'M']).map((key, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                        isKeyHighlighted(key) === 'current' && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                        isKeyHighlighted(key) === 'position' && "border-blue-400 bg-blue-400/20 text-blue-300 shadow-[0_0_10px_0_rgba(59,130,246,0.4)]",
                        isKeyHighlighted(key) === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                      )}
                    >
                      {key}
                    </div>
                  ))}
                  {['< ,', '> .', '? /'].map((key, index) => {
                    const baseKey = key.split(' ')[1]; // ',', '.', '/' 추출
                    const shiftKey = key.split(' ')[0]; // '<', '>', '?' 추출
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleKeyPress(baseKey)}
                        className={cn(
                          "w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                          (isKeyHighlighted(baseKey) === 'current' || isKeyHighlighted(shiftKey) === 'current') && "border-pink-400 bg-pink-400/20 text-pink-300 shadow-[0_0_15px_0_rgba(236,72,153,0.5)] scale-105",
                          isKeyHighlighted(baseKey) === 'position' && "border-blue-400 bg-blue-400/20 text-blue-300 shadow-[0_0_10px_0_rgba(59,130,246,0.4)]",
                          (isKeyHighlighted(baseKey) === 'normal' && isKeyHighlighted(shiftKey) === 'normal' && isKeyHighlighted(baseKey) !== 'position') && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                        )}
                      >
                        <span className="text-cyan-400 text-xs">{shiftKey}</span>
                        <span className="font-bold text-sm">{baseKey}</span>
                      </div>
                    );
                  })}
                  <div className={cn(
                    "w-24 h-12 rounded-lg border-2 flex items-center justify-end pr-2 text-xs font-bold shadow-sm hover:bg-slate-600 transition-all duration-200 cursor-pointer",
                    isKeyHighlighted('Shift') === 'shift' && "border-orange-400 bg-orange-400/20 text-orange-300 shadow-[0_0_15px_0_rgba(251,146,60,0.5)] scale-105",
                    isKeyHighlighted('Shift') === 'normal' && "border-cyan-500/50 bg-slate-700 text-cyan-300 hover:border-cyan-400"
                  )}>
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
                    완료 항목 비율
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
                    일시정지 시간 제외
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
