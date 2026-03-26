'use client';

import { Keyboard, Globe } from 'lucide-react';
import { StudentHeading, StudentCard, StudentText } from "../components/StudentThemeProvider";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
}

function CategoryCard({ title, description, icon, onClick, isSelected }: CategoryCardProps) {
  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105",
        isSelected
          ? "ring-4 ring-cyan-400 shadow-[0_0_30px_0_rgba(0,255,255,0.50)] scale-105"
          : "hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_20px_0_rgba(0,255,255,0.30)]"
      )}
      onClick={onClick}
    >
      <StudentCard className={cn(
        "transition-all duration-300",
        isSelected && "bg-cyan-400/20 border-cyan-400/50"
      )}>
        <div className="text-center p-4 lg:p-6">
          <div className={cn(
            "w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 transition-colors duration-300",
            isSelected ? "text-cyan-200" : "text-cyan-300"
          )}>
            {icon}
          </div>
          <h3 className={cn(
            "text-lg lg:text-xl font-bold mb-2 transition-colors duration-300",
            isSelected ? "text-cyan-100" : "text-cyan-100"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-sm transition-colors duration-300",
            isSelected ? "text-cyan-200" : "text-cyan-300"
          )}>
            {description}
          </p>
        </div>
      </StudentCard>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function TypingPage() {
  const [selectedCategory, setSelectedCategory] = useState<'korean' | 'english' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const handleCategorySelect = (category: 'korean' | 'english') => {
    if (selectedCategory === category) return; // 같은 카테고리 재선택 방지

    if (selectedCategory) {
      // 이미 선택된 카테고리가 있을 때 애니메이션 실행
      setIsAnimating(true);
      setTimeout(() => {
        setSelectedCategory(category);
        setAnimationKey(prev => prev + 1);
        setIsAnimating(false);
      }, 300); // 위로 올라가는 애니메이션 시간
    } else {
      // 처음 선택할 때는 바로 표시
      setSelectedCategory(category);
      setAnimationKey(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 pt-20 lg:pt-6">
      <StudentHeading size="h1" className="mb-6 lg:mb-8 text-center text-3xl lg:text-4xl">타자연습</StudentHeading>

      <div className="max-w-4xl mx-auto w-full">
        {/* 메인 카테고리 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 justify-center max-w-2xl mx-auto">
          <CategoryCard
            title="한글 타이핑"
            description="자리연습, 낱말연습, 단문연습"
            icon={<Keyboard className="w-full h-full" />}
            onClick={() => handleCategorySelect('korean')}
            isSelected={selectedCategory === 'korean'}
          />

          <CategoryCard
            title="영어 타이핑"
            description="자리연습, 낱말연습, 단문연습"
            icon={<Globe className="w-full h-full" />}
            onClick={() => handleCategorySelect('english')}
            isSelected={selectedCategory === 'english'}
          />
        </div>

        {/* 선택된 카테고리에 따른 세부 카드들 - 애니메이션 적용 */}
        {selectedCategory && (
          <div
            key={animationKey}
            className={cn(
              "mt-8 transition-all duration-300",
              isAnimating ? "animate-slideUp" : "animate-slideDown"
            )}
          >
            {/* 한글/영어 타이핑 세부 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-center max-w-4xl mx-auto">
              <a href={`/dashboard/student/typing/basic?language=${selectedCategory}`} className="block group">
                <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                  <div className="text-center p-4 lg:p-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                      <span className="text-3xl lg:text-4xl">⌨️</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">자리연습</h3>
                    <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">
                      {selectedCategory === 'korean' ? '한글 자리 연습' : '영어 자리 연습'}
                    </p>
                  </div>
                </StudentCard>
              </a>

              <a href={`/dashboard/student/typing/word?language=${selectedCategory}`} className="block group">
                <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                  <div className="text-center p-4 lg:p-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                      <span className="text-3xl lg:text-4xl">📝</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">낱말연습</h3>
                    <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">
                      {selectedCategory === 'korean' ? '한글 낱말 연습' : '영어 낱말 연습'}
                    </p>
                  </div>
                </StudentCard>
              </a>

              <a href={`/dashboard/student/typing/sentence?language=${selectedCategory}`} className="block group">
                <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                  <div className="text-center p-4 lg:p-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                      <span className="text-3xl lg:text-4xl">📚</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">단문연습</h3>
                    <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">
                      {selectedCategory === 'korean' ? '한글 단문 연습' : '영어 단문 연습'}
                    </p>
                  </div>
                </StudentCard>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 애니메이션 CSS */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 1000px;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
            max-height: 1000px;
          }
          to {
            opacity: 0;
            transform: translateY(-30px);
            max-height: 0;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
