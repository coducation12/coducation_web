import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 학원 정보 */}
          <div className="flex items-center gap-3">
            <Code2 className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">코딩메이커(중마) | 광양코딩(창덕)</p>
              <p className="text-muted-foreground">전남 광양시</p>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="text-sm text-muted-foreground">
            <p>📞 061-745-3355</p>
            <p>🕒 평일 14:00 - 19:00</p>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t mt-4 pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; 2024 Coducation. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
