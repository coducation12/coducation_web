'use client';
import { Book, ExternalLink, Calendar, Info, X, Zap, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { StudentSectionTitle, StudentText } from "./StudentThemeProvider";
import { getStudentProgress, createPortfolioEntry } from "@/lib/actions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CourseRecordModal from "../../teacher/components/student-progress/CourseRecordModal";
import { useToast } from "@/hooks/use-toast";

interface PortfolioItem {
  id: string;
  title: string;
  name?: string; 
  description?: string;
  url?: string;
  imageUrl?: string;
  size?: number;
  uploadedAt: string;
  date?: string; 
  parentTitle: string;
}

export function Achievements({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [rawProgress, setRawProgress] = useState<any[]>([]); // 코스 선택용 원본 데이터
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, [studentId]);

  async function fetchPortfolio() {
    setIsLoading(true);
    try {
      const result = await getStudentProgress(studentId);
      
      if (!result.success) throw new Error(result.error);
      
      const progress = (result.data?.learning_progress as any[]) || [];
      setRawProgress(progress);

      const items = progress.flatMap(p => 
        (p.results || []).map((r: any) => ({ 
          ...r, 
          parentTitle: p.title,
          title: r.title || r.name || '제목 없음'
        }))
      ).sort((a, b) => new Date(b.uploadedAt || b.date || 0).getTime() - new Date(a.uploadedAt || a.date || 0).getTime());
      
      setPortfolioItems(items);
    } catch (e) {
      console.error('포트폴리오 조회 실패:', e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleRecordSuccess = async (progressId: string, newItem: any, share: boolean) => {
    try {
      // 학생이 직접 기록하는 경우 즉시 서버에 저장
      const result = await createPortfolioEntry(
        studentId,
        progressId,
        {
          title: newItem.title,
          description: newItem.description,
          imageUrl: newItem.imageUrl,
          url: newItem.url
        },
        share
      );

      if (result.success) {
        toast({ title: "저장 완료", description: "나의 포트폴리오에 성공적으로 추가되었습니다." });
        fetchPortfolio(); // 목록 새로고침
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "저장 실패", description: error.message || "오류가 발생했습니다.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-full bg-fuchsia-900/10 rounded-2xl border border-fuchsia-500/10"></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0 px-1">
        <StudentSectionTitle icon={<Zap className="w-5 h-5 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(192,38,211,0.5)]" />}>
          포트폴리오
        </StudentSectionTitle>
        <Button 
          onClick={() => setIsRecordModalOpen(true)}
          className="h-8 bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg flex items-center gap-1.5 px-3 transition-all group active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic pt-0.5">작품 기록하기</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-simple-cyan pr-2 space-y-2.5">
        {portfolioItems.length === 0 ? (
          <div className="h-full flex items-center justify-center border border-dashed border-fuchsia-500/10 rounded-xl bg-fuchsia-950/5">
             <StudentText variant="muted" className="text-xs text-center px-4">
              아직 완성된 작품이 없네요.<br/>
              열심히 학습해서 멋진 포트폴리오를 채워보세요!
             </StudentText>
          </div>
        ) : (
          portfolioItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className="flex items-center justify-between p-4 bg-slate-900/30 border border-fuchsia-500/10 rounded-2xl hover:bg-fuchsia-500/10 hover:border-fuchsia-500/40 transition-all group cursor-pointer active:scale-[0.98]"
            >
              <div className="min-w-0 mr-4">
                <h4 className="text-sm font-black text-fuchsia-100 group-hover:text-white truncate italic tracking-tight">{item.title}</h4>
                <div className="text-[10px] text-fuchsia-500/40 font-bold uppercase tracking-widest mt-0.5">{item.parentTitle}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-fuchsia-500/40 font-mono">
                  <Calendar className="w-3 h-3" />
                  {(item.uploadedAt || item.date || '').split('T')[0]}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 작품 기록 모달 (학생 자가 기록용) */}
      {isRecordModalOpen && (
        <CourseRecordModal 
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          studentId={studentId}
          progressId="" // 선택 모드
          courseTitle="" 
          courses={rawProgress}
          onSuccess={handleRecordSuccess}
        />
      )}

      {/* 포트폴리오 상세 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#0c0410] border-fuchsia-500/30 text-fuchsia-50 shadow-[0_0_40px_rgba(192,38,211,0.15)] overflow-hidden">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="px-2 py-1 bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/30">
                    <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">{selectedItem.parentTitle}</span>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-black italic text-fuchsia-50 tracking-tight leading-none mb-1">
                  작품 상세보기
                </DialogTitle>
                <DialogDescription className="text-fuchsia-500/60 font-medium flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {(selectedItem.uploadedAt || selectedItem.date || '').split('T')[0]}에 기록됨
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* 메인 이미지 */}
                {selectedItem.imageUrl ? (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-fuchsia-500/20 bg-black/40 flex items-center justify-center group min-h-[200px]">
                    <img 
                      src={selectedItem.imageUrl} 
                      alt={selectedItem.title} 
                      className="max-w-full max-h-[500px] object-contain transition-transform duration-700 group-hover:scale-[1.02]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-fuchsia-950/20 border border-dashed border-fuchsia-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-fuchsia-500/40">
                    <Book className="w-12 h-12 stroke-[1]" />
                    <span className="text-xs font-bold uppercase tracking-wider">이미지 없음</span>
                  </div>
                )}

                {/* 상세 설명 */}
                {selectedItem.description && (
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-fuchsia-500/10">
                    <h5 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info className="w-3 h-3" /> 상세 설명
                    </h5>
                    <p className="text-sm text-fuchsia-100/80 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.description}
                    </p>
                  </div>
                )}

                {/* 링크 & 닫기 */}
                <div className="flex items-center gap-3">
                  {selectedItem.url && (
                    <Button 
                      onClick={() => window.open(selectedItem.url, '_blank')}
                      className="flex-1 h-12 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl gap-2 font-black shadow-[0_4px_15px_rgba(192,38,211,0.3)]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      작품 링크 보기
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)}
                    className="h-12 px-6 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/10 rounded-xl font-bold"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
