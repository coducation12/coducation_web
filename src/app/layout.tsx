import type { Metadata } from 'next';
import { IBM_Plex_Sans_KR, Noto_Sans_KR, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { BackgroundWrapper } from '@/components/common/background-wrapper';
import { LayoutWrapper } from '@/components/common/layout-wrapper';

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
  title: 'Coducation - 코딩으로 세상을 교육하다',
  description:
    '전남 광양 코딩메이커 학원 | 코딩 교육의 새로운 시작, Coducation',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className="dark">
      <head />
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
            <main className="flex-1">{children}</main>
          </LayoutWrapper>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
