import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900">
      <div className="container py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* 왼쪽: 학원 정보 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">코딩메이커(중마)</span>
              <span className="text-xs text-muted-foreground">061-745-3355</span>
            </div>
            <div className="text-sm text-muted-foreground">
              광양코딩(창덕) 010-1234-5678
            </div>
          </div>

          {/* 중앙: Coducation 및 정책 */}
          <div className="text-center space-y-1">
            <div className="font-bold text-lg text-primary">Coducation</div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>정보보호방침</span>
              <span>•</span>
              <span>이용약관</span>
            </div>
          </div>

          {/* 오른쪽: 운영시간 */}
          <div className="text-right">
            <div className="text-sm font-semibold">운영시간</div>
            <div className="text-xs text-muted-foreground">평일 14:00 - 19:00</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
