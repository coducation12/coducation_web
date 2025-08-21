'use client';

import { Keyboard, Globe, Code } from 'lucide-react';
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
        <div className="text-center p-6">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 transition-colors duration-300",
            isSelected ? "text-cyan-200" : "text-cyan-300"
          )}>
            {icon}
          </div>
          <h3 className={cn(
            "text-xl font-bold mb-2 transition-colors duration-300",
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

export default function TypingPage() {
  const [selectedCategory, setSelectedCategory] = useState<'korean' | 'english' | 'code' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const handleCategorySelect = (category: 'korean' | 'english' | 'code') => {
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
    <div className="w-full h-full flex flex-col p-6">
      <StudentHeading size="h1" className="mb-8 text-center">타자연습</StudentHeading>
      
      <div className="max-w-4xl mx-auto w-full">
        {/* 메인 카테고리 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CategoryCard
            title="한글 타이핑"
            description="자리연습, 낱말연습, 문장연습"
            icon={<Keyboard className="w-full h-full" />}
            onClick={() => handleCategorySelect('korean')}
            isSelected={selectedCategory === 'korean'}
          />
          
          <CategoryCard
            title="영어 타이핑"
            description="자리연습, 낱말연습, 문장연습"
            icon={<Globe className="w-full h-full" />}
            onClick={() => handleCategorySelect('english')}
            isSelected={selectedCategory === 'english'}
          />
          
          <CategoryCard
            title="코드 타이핑"
            description="6가지 프로그래밍 언어"
            icon={<Code className="w-full h-full" />}
            onClick={() => handleCategorySelect('code')}
            isSelected={selectedCategory === 'code'}
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
            {(selectedCategory === 'korean' || selectedCategory === 'english') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href={`/dashboard/student/typing/${selectedCategory}/basic`} className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">⌨️</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">자리연습</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">
                        {selectedCategory === 'korean' ? '한글 자음과 모음의 기본 위치를 익혀보세요' : '영어 알파벳의 기본 위치를 익혀보세요'}
                      </p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href={`/dashboard/student/typing/${selectedCategory}/word`} className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">📝</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">낱말연습</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">
                        {selectedCategory === 'korean' ? '한글 단어를 타이핑하여 어휘력을 키워보세요' : '영어 단어를 타이핑하여 어휘력을 키워보세요'}
                      </p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href={`/dashboard/student/typing/${selectedCategory}/sentence`} className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">📖</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">문장연습</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">
                        {selectedCategory === 'korean' ? '긴 문장을 타이핑하여 실력을 향상시켜보세요' : '긴 영어 문장을 타이핑하여 실력을 향상시켜보세요'}
                      </p>
                    </div>
                  </StudentCard>
                </a>
              </div>
            )}

            {/* 코드 타이핑 언어 선택 카드들 */}
            {selectedCategory === 'code' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="/dashboard/student/typing/code/c" className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">🔷</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">C언어</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">C언어 코드를 타이핑하고 실행해보세요</p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href="/dashboard/student/typing/code/python" className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">🐍</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">Python</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">파이썬 코드를 타이핑하고 실행해보세요</p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href="/dashboard/student/typing/code/java" className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">☕</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">Java</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">자바 코드를 타이핑하고 실행해보세요</p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href="/dashboard/student/typing/code/javascript" className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">🟨</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">JavaScript</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">자바스크립트 코드를 타이핑하고 실행해보세요</p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href="/dashboard/student/typing/code/html" className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">🌐</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">HTML</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">HTML 코드를 타이핑하고 결과를 확인해보세요</p>
                    </div>
                  </StudentCard>
                </a>
                
                <a href="/dashboard/student/typing/code/css" className="block group">
                  <StudentCard className="cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400 hover:shadow-[0_0_30px_0_rgba(0,255,255,0.40)] group-hover:bg-cyan-400/10">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 transition-colors duration-300 group-hover:text-cyan-50">CSS</h3>
                      <p className="text-cyan-300 text-sm transition-colors duration-300 group-hover:text-cyan-200">CSS 코드를 타이핑하고 스타일을 적용해보세요</p>
                    </div>
                  </StudentCard>
                </a>
              </div>
            )}
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
