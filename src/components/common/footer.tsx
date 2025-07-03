import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-8 md:h-20 md:py-0">
        {/* 왼쪽: Coducation 로고/이름 및 2024 문구 */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg font-bold">Coducation</span>
          </div>
          <span className="text-s text-muted-foreground">&copy; 2024 Coducation. All Rights Reserved.</span>
        </div>
        {/* 오른쪽: 코딩메이커 학원 */}
        <div className="flex flex-col items-end">
          <span className="text-sm text-muted-foreground">코딩메이커 학원 (전남 광양)</span>
        </div>
      </div>
    </footer>
  );
}
