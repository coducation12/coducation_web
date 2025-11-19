
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900">
      <div className="container py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* 왼쪽: 학원 정보 */}
          <div className="space-y-1">
            <div className="text-sm leading-tight flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">코딩메이커(중마)</span>
              <span className="text-muted-foreground text-sm">061-745-3355</span>
              {/* 모바일에서만 운영시간 표시 */}
              <span className="md:hidden text-muted-foreground text-xs">운영시간: 평일 14:00 - 19:00</span>
            </div>
            <div className="text-sm leading-tight flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">광양코딩(창덕)</span>
              <span className="text-muted-foreground text-sm">061-911-1101</span>
            </div>
          </div>

          {/* 중앙: Coducation 및 정책 */}
          <div className="text-center space-y-1">
            <div className="font-bold text-lg text-primary">Coducation</div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-cyan-400 transition-colors">
                정보보호방침
              </Link>
              <span>•</span>
              <Link href="/terms-of-service" className="hover:text-cyan-400 transition-colors">
                이용약관
              </Link>
            </div>
          </div>

          {/* 오른쪽: 운영시간 (데스크톱만) */}
          <div className="hidden md:block text-right">
            <div className="text-sm font-semibold">운영시간</div>
            <div className="text-xs text-muted-foreground">평일 14:00 - 19:00</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
