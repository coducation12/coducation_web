'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingBannerProps {
  isActive: boolean;
  imageUrl?: string;
  linkUrl?: string;
}

export default function FloatingBanner({ isActive, imageUrl, linkUrl }: FloatingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // 컴포넌트 마운트 후 애니메이션 효과를 위해 약간의 지연을 주고 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive || !isVisible) return null;

  // 기본 링크 설정
  const finalLinkUrl = linkUrl || "https://hrd-webpage-git-main-coducations-projects.vercel.app/concept-b";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 20 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="fixed top-20 right-4 sm:top-24 sm:right-8 z-50 flex flex-col items-end"
      >
        <div className="scale-[0.5] sm:scale-[0.7] lg:scale-100 origin-top-right">
        {/* 배너 링크 */}
        <a 
          href={finalLinkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`block w-[260px] ${imageUrl ? 'h-auto max-h-[450px]' : 'h-[340px]'} rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group border border-cyan-500/30 bg-slate-900`}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="프로모션 배너" className="w-full h-auto object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-center relative overflow-hidden group-hover:from-cyan-950 group-hover:to-blue-900 transition-colors duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10 transition-transform group-hover:scale-150"></div>
                
                <h3 className="text-2xl font-black text-white mb-2 leading-tight drop-shadow-lg z-10 flex flex-col gap-1">
                    <span className="text-cyan-400 text-base font-bold tracking-wider uppercase bg-cyan-500/10 py-1 px-3 rounded-full self-center border border-cyan-500/20 mb-2">
                      원장 직강
                    </span>
                    국비지원 교육
                </h3>
                <p className="text-cyan-100/70 text-sm font-medium z-10 mb-8 mt-2">
                    전액 국비지원 100%<br/>웹 개발자 취업 완성반
                </p>
                <div className="bg-cyan-600 group-hover:bg-cyan-500 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] z-10 flex items-center gap-2">
                    모집 요강 보기
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
            </div>
          )}
        </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
