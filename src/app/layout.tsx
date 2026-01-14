import type { Metadata } from 'next';
import { IBM_Plex_Sans_KR, Noto_Sans_KR, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { BackgroundWrapper } from '@/components/common/background-wrapper';
import { LayoutWrapper } from '@/components/common/layout-wrapper';
import { SupabaseProvider } from './providers';

const bodyFont = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  preload: true,
  display: 'swap',
});
const headlineFont = IBM_Plex_Sans_KR({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-headline',
  preload: true,
  display: 'swap',
});
const codeFont = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  preload: true,
  display: 'swap',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://coducation.co.kr'), // 실제 도메인으로 변경 완료
  title: {
    default: 'Coducation - 코딩으로 세상을 교육하다',
    template: '%s | Coducation',
  },
  description:
    '코딩 교육의 새로운 시작, Coducation. 광양 코딩메이커 학원의 온라인 교육 및 관리 시스템입니다.',
  keywords: [
    '코딩',
    '코딩교육',
    '광양코딩',
    '코딩메이커',
    'Coducation',
    '타자연습',
    '프로그래밍',
    '자바스크립트',
    '파이썬',
  ],
  authors: [{ name: 'Coding Maker' }],
  creator: 'Coding Maker',
  publisher: 'Coding Maker',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://coducation.co.kr',
    title: 'Coducation - 코딩으로 세상을 교육하다',
    description:
      '코딩 교육의 새로운 시작, Coducation. 광양 코딩메이커 학원의 온라인 교육 및 관리 시스템입니다.',
    siteName: 'Coducation',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Coducation - 코딩으로 세상을 교육하다',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coducation - 코딩으로 세상을 교육하다',
    description:
      '코딩 교육의 새로운 시작, Coducation. 광양 코딩메이커 학원의 온라인 교육 및 관리 시스템입니다.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  verification: {
    // google: 'your-google-verification-code',
    // naver: 'your-naver-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className="dark">
      <head>
        <meta name="autocomplete" content="off" />
        <meta name="form-autocomplete" content="off" />
      </head>
      <body
        className={cn(
          'min-h-screen font-body antialiased text-foreground',
          bodyFont.variable,
          headlineFont.variable,
          codeFont.variable
        )}
      >
        <BackgroundWrapper />
        <div className="relative z-0 flex min-h-screen flex-col">
          <LayoutWrapper>
            <SupabaseProvider>
              <main className="flex-1">{children}</main>
            </SupabaseProvider>
          </LayoutWrapper>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
