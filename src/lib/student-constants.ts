export interface CertificateInfo {
  name: string;
  organization: string;
}

export const CERTIFICATE_GROUPS = [
  {
    organization: 'KPC한국생산성본부',
    certificates: ['ITQ 한글', 'ITQ 엑셀', 'ITQ 파워포인트', 'GTQ 포토샵', 'GTQ 일러스트', 'SW코딩자격', 'ERP정보관리사']
  },
  {
    organization: 'YBM IT',
    certificates: ['COS 1급', 'COS 2급', 'COS 3급', 'COS Pro 1급', 'COS Pro 2급', 'MOS Excel', 'MOS PowerPoint']
  },
  {
    organization: '대한상공회의소',
    certificates: ['컴퓨터활용능력 1급', '컴퓨터활용능력 2급', '워드프로세서', '전산회계운용사']
  },
  {
    organization: '한국산업인력공단',
    certificates: ['정보처리기능사', '정보처리기사', '정보보안기능사', '웹디자인기능사', '전자계산기기능사']
  },
  {
    organization: '데이터자격검정(Kdata)',
    certificates: ['ADsP (데이터분석준전문가)', 'SQLD (SQL개발자)', 'DAsP (데이터아키텍처준전문가)']
  },
  {
    organization: '한국정보통신진흥협회(KAIT)',
    certificates: ['리눅스마스터 1급', '리눅스마스터 2급', '파이썬마스터', '디지털정보활용능력(DIAT)']
  },
  {
    organization: '기타/민간',
    certificates: ['네트워크관리사 2급', 'PCCP (프로그래머스)', '코딩전문가자격', '기타']
  }
];

export const TYPING_LANGUAGES = [
  { id: 'ko', label: '한글' },
  { id: 'en', label: '영문' }
];
