import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">이용약관</h1>
          <p className="text-slate-400">최종 업데이트: 2024년 12월 19일</p>
        </div>

        {/* 내용 */}
        <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제1조 (목적)</h2>
            <p className="text-slate-300 mb-6">
              이 약관은 코딩메이커(중마)와 광양코딩(창덕)이 제공하는 온라인 교육 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제2조 (정의)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
              <ul className="space-y-1">
                <li>• <strong>"서비스"</strong>란 회사가 제공하는 온라인 프로그래밍 교육, 타자 연습, 학습 관리 등의 서비스를 의미합니다.</li>
                <li>• <strong>"이용자"</strong>란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>• <strong>"회원"</strong>이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                <li>• <strong>"비회원"</strong>이란 회원에 가입하지 않고 서비스를 이용하는 자를 말합니다.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</p>
              <p className="mb-2">2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.</p>
              <p>3. 이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단할 수 있습니다.</p>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제4조 (서비스의 제공)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="space-y-1">
                <li>• 프로그래밍 기초 교육</li>
                <li>• 웹 개발 과정</li>
                <li>• 타자 연습 프로그램</li>
                <li>• 코딩 테스트 및 평가</li>
                <li>• 학습 진도 관리</li>
                <li>• 온라인 커뮤니티</li>
                <li>• 기타 회사가 정하는 서비스</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제5조 (서비스의 중단)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
              <p>2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</p>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제6조 (회원가입)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</p>
              <p className="mb-2">2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:</p>
              <ul className="space-y-1 ml-4">
                <li>• 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>• 등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>• 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제7조 (회원 탈퇴 및 자격 상실 등)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.</p>
              <p className="mb-2">2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:</p>
              <ul className="space-y-1 ml-4">
                <li>• 가입 신청 시에 허위 내용을 등록한 경우</li>
                <li>• 서비스를 이용하여 구입한 재화 등의 대금, 기타 서비스 이용에 관련하여 회원이 부담하는 채무를 기일에 지급하지 않는 경우</li>
                <li>• 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                <li>• 서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제8조 (이용자의 의무)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="space-y-1">
                <li>• 신청 또는 변경시 허위 내용의 등록</li>
                <li>• 타인의 정보 도용</li>
                <li>• 서비스에 게시된 정보의 변경</li>
                <li>• 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>• 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>• 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>• 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제9조 (저작권의 귀속 및 이용제한)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</p>
              <p className="mb-2">2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</p>
              <p>3. 회사는 약정에 따라 이용자에게 귀속된 저작권을 사용하는 경우 당해 이용자에게 통보하여야 합니다.</p>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제10조 (면책조항)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
              <p className="mb-2">2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
              <p>3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며 그 밖에 서비스를 통하여 얻은 자료로 인한 손해에 관하여는 책임을 지지 않습니다.</p>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제11조 (분쟁해결)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</p>
              <p>2. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 이용자의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다.</p>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">제12조 (준거법 및 관할법원)</h2>
            <div className="text-slate-300 mb-6">
              <p className="mb-2">1. 이 약관의 해석과 적용 및 회사와 이용자 간의 분쟁에 관하여는 대한민국 법을 적용합니다.</p>
              <p>2. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</p>
            </div>

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
