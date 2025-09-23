import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 학원 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Coducation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              코딩메이커 학원
              <br />
              전남 광양시
            </p>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold">연락처</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📞 061-123-4567</p>
              <p>📧 info@coducation.com</p>
              <p>🕒 평일 14:00 - 22:00</p>
            </div>
          </div>

          {/* 교육 과정 */}
          <div className="space-y-4">
            <h3 className="font-semibold">교육 과정</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• 프로그래밍 기초</p>
              <p>• 웹 개발</p>
              <p>• 타자 연습</p>
              <p>• 코딩 테스트</p>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="space-y-4">
            <h3 className="font-semibold">빠른 링크</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• 수강 신청</p>
              <p>• 커리큘럼</p>
              <p>• 공지사항</p>
              <p>• 문의하기</p>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Coducation. All Rights Reserved.</p>
          <p className="mt-2">개인정보처리방침 | 이용약관</p>
        </div>
      </div>
    </footer>
  );
}
