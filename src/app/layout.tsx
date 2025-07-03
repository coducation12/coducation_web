import type { Metadata } from 'next';
import { Orbitron, Rajdhani, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { cn } from '@/lib/utils';

const bodyFont = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});
const headlineFont = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-headline',
});
const codeFont = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
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
          'min-h-screen bg-background font-body antialiased',
          bodyFont.variable,
          headlineFont.variable,
          codeFont.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
