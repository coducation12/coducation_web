import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">정보보호방침</h1>
          <p className="text-slate-400">최종 업데이트: 2024년 12월 19일</p>
        </div>

        {/* 내용 */}
        <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">1. 개인정보 수집 및 이용 목적</h2>
            <p className="text-slate-300 mb-6">
              코딩메이커(중마)와 광양코딩(창덕)은 다음과 같은 목적으로 개인정보를 수집 및 이용합니다:
            </p>
            <ul className="text-slate-300 mb-6 space-y-2">
              <li>• 회원가입 및 본인 확인</li>
              <li>• 교육 서비스 제공 및 관리</li>
              <li>• 학습 진도 및 성취도 추적</li>
              <li>• 고객 상담 및 문의 응답</li>
              <li>• 서비스 개선 및 신규 서비스 개발</li>
            </ul>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">2. 수집하는 개인정보 항목</h2>
            <div className="text-slate-300 mb-6">
              <h3 className="text-lg font-medium mb-2">필수 정보:</h3>
              <ul className="space-y-1 mb-4">
                <li>• 이름, 생년월일, 성별</li>
                <li>• 연락처 (전화번호, 이메일)</li>
                <li>• 주소 (학원 위치 기반 서비스 제공용)</li>
                <li>• 학부모 정보 (미성년자 회원의 경우)</li>
              </ul>
              <h3 className="text-lg font-medium mb-2">자동 수집 정보:</h3>
              <ul className="space-y-1">
                <li>• IP 주소, 접속 로그, 쿠키</li>
                <li>• 학습 진도, 타자 연습 기록</li>
                <li>• 서비스 이용 기록</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">3. 개인정보 보유 및 이용 기간</h2>
            <p className="text-slate-300 mb-6">
              개인정보는 수집 및 이용 목적이 달성된 후에는 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:
            </p>
            <ul className="text-slate-300 mb-6 space-y-2">
              <li>• <strong>회원 정보:</strong> 회원 탈퇴 시까지</li>
              <li>• <strong>학습 기록:</strong> 교육 과정 완료 후 3년</li>
              <li>• <strong>상담 기록:</strong> 상담 완료 후 3년</li>
              <li>• <strong>법령에 의한 보존:</strong> 관련 법령에 따라 보존 의무가 있는 경우</li>
            </ul>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">4. 개인정보 제3자 제공</h2>
            <p className="text-slate-300 mb-6">
              우리는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
            </p>
            <ul className="text-slate-300 mb-6 space-y-2">
              <li>• 이용자가 사전에 동의한 경우</li>
              <li>• 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>• 통계작성, 학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 식별할 수 없는 형태로 제공하는 경우</li>
            </ul>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">5. 개인정보 처리의 위탁</h2>
            <p className="text-slate-300 mb-6">
              우리는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
            </p>
            <ul className="text-slate-300 mb-6 space-y-2">
              <li>• <strong>클라우드 서비스:</strong> Amazon Web Services (AWS)</li>
              <li>• <strong>데이터베이스:</strong> Supabase</li>
              <li>• <strong>이메일 서비스:</strong> Google Workspace</li>
            </ul>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">6. 개인정보의 안전성 확보 조치</h2>
            <p className="text-slate-300 mb-6">
              우리는 개인정보의 안전성 확보를 위해 다음과 같은 기술적/관리적 대책을 마련하고 있습니다:
            </p>
            <ul className="text-slate-300 mb-6 space-y-2">
              <li>• 개인정보 암호화</li>
              <li>• 해킹 등에 대비한 기술적 대책</li>
              <li>• 개인정보에 대한 접근 제한</li>
              <li>• 접속기록의 보관 및 위변조 방지</li>
              <li>• 개인정보의 안전한 저장</li>
              <li>• 비인가자에 대한 출입 통제</li>
            </ul>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">7. 개인정보 보호책임자</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p><strong>개인정보 보호책임자:</strong> 김코딩</p>
                <p><strong>연락처:</strong> 061-745-3355</p>
                <p><strong>이메일:</strong> privacy@coducation.com</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">8. 개인정보 처리방침의 변경</h2>
            <p className="text-slate-300 mb-6">
              이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>

            <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-300 text-sm">
                <strong>문의사항이 있으시면 언제든지 연락주시기 바랍니다.</strong><br />
                코딩메이커(중마): 061-745-3355 | 광양코딩(창덕): 010-1234-5678
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
