'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityPost } from '@/types/community';
import { getMainDisplayPosts } from '@/lib/community';
import Image from 'next/image';

const maskName = (name: string) => {
  if (!name) return '';
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '○';
  return name[0] + '○' + name.slice(2);
};

// 배열 무작위 셔플 (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function StudentWorksSection() {
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [displayPosts, setDisplayPosts] = useState<(CommunityPost | null)[]>(Array(12).fill(null));
  const [waitingPool, setWaitingPool] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 랜덤 교체를 위해 0~11번 인덱스를 섞어 관리
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [indexPointer, setIndexPointer] = useState(0);

  // 데이터 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getMainDisplayPosts();
        // 이미지가 있는 포스트만 필터링
        const filteredPosts = posts.filter(p => p.images && p.images.length > 0);
        
        // 초기 데이터 무작위 셔플
        const shuffledAll = shuffleArray(filteredPosts);
        setAllPosts(shuffledAll);
        
        // 초기 표시 데이터 설정 (무작위 12개)
        const initialCount = 12;
        const initial = shuffledAll.slice(0, initialCount);
        const waiting = shuffledAll.slice(initialCount);
        
        setDisplayPosts(initial);
        setWaitingPool(waiting);

        // 교체할 인덱스 순서 초기화
        setShuffledIndices(shuffleArray(Array.from({ length: 12 }, (_, i) => i)));
      } catch (error) {
        console.error('Failed to fetch student works:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 공평한 랜덤 교체 로직 (Fair Random Rotation)
  useEffect(() => {
    if (allPosts.length <= 12 || waitingPool.length === 0 || shuffledIndices.length === 0) return;
    
    // 4~6초 사이의 랜덤한 간격으로 교체
    const randomDelay = 4000 + Math.random() * 2000;
    
    const timeout = setTimeout(() => {
      // 1. 현재 랜덤 순서에 해당하는 슬롯 번호 가져오기
      const targetSlot = shuffledIndices[indexPointer];
      
      // 2. 대기열의 첫 번째 게시물 가져오기
      const [nextPost, ...remainingPool] = waitingPool;
      
      setDisplayPosts(prev => {
        const nextDisplay = [...prev];
        const currentPostInSlot = nextDisplay[targetSlot];
        
        // 3. 해당 슬롯에 새로운 게시물 배치
        nextDisplay[targetSlot] = nextPost;
        
        // 4. 기존 게시물을 대기열 끝으로 이동 (중복 방지 순환 구조)
        if (currentPostInSlot) {
          setWaitingPool([...remainingPool, currentPostInSlot]);
        } else {
          setWaitingPool(remainingPool);
        }
        
        return nextDisplay;
      });
      
      // 5. 다음 교체 위치 결정 (인덱스 포인터 이동 및 필요시 재셔플)
      setIndexPointer(prev => {
        const next = prev + 1;
        if (next >= 12) {
          setShuffledIndices(shuffleArray(Array.from({ length: 12 }, (_, i) => i)));
          return 0;
        }
        return next;
      });
      
    }, randomDelay);

    return () => clearTimeout(timeout);
  }, [allPosts.length, waitingPool, shuffledIndices, indexPointer]);

  if (loading) {
    return (
      <section id="student-works" className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-pulse text-cyan-400 text-xl font-bold">
            LOADING STUDENT WORKS...
          </div>
        </div>
      </section>
    );
  }

  // 표시할 게시글이 아예 없는 경우 섹션을 숨김 (또는 안내 문구)
  if (allPosts.length === 0) {
    return null;
  }

  return (
    <section id="student-works" className="container w-full py-16 md:py-32 lg:py-52">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter font-headline"
          >
            학생 작품 갤러리
          </motion.h2>
          <p className="max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground mx-auto">
            코딩메이커 학생들의 빛나는 열정과 노력이 담긴 결과물들입니다. <br />
            매일 한 단계씩 성장하며 완성해가는 우리 학생들의 작품을 확인해보세요.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
          {displayPosts.map((post, index) => (
            <div key={index} className="aspect-square relative overflow-hidden group border border-cyan-400/20 bg-cyan-900/10 rounded-lg">
              <AnimatePresence mode="wait">
                {post ? (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={post.images?.[0] || '/placeholder-work.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 text-center">
                        <div className="text-[8px] md:text-xs text-cyan-400 font-bold mb-0.5 sm:mb-1 opacity-70 truncate px-1 sm:px-2">
                           {post.title}
                        </div>
                        <div className="text-[10px] sm:text-sm md:text-lg font-bold text-white tracking-widest leading-tight">
                          {maskName(post.author.name)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div key={`empty-${index}`} className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border border-cyan-500/20 rounded-full animate-ping"></div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
