import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          {/* 학원 정보 */}
          <div className="flex items-center gap-3">
            <Code2 className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <span className="font-semibold">코딩메이커(중마) | 광양코딩(창덕)</span>
              <span className="text-muted-foreground ml-2">전남 광양시</span>
            </div>
          </div>

          {/* 연락처 및 저작권 */}
          <div className="text-sm text-muted-foreground">
            <span>📞 061-745-3355</span>
            <span className="mx-2">•</span>
            <span>🕒 평일 14:00-19:00</span>
            <span className="mx-2">•</span>
            <span>&copy; 2024 Coducation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
