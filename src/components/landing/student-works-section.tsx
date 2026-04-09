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

export function StudentWorksSection() {
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [displayPosts, setDisplayPosts] = useState<(CommunityPost | null)[]>(Array(12).fill(null));
  const [waitingPool, setWaitingPool] = useState<CommunityPost[]>([]);
  const [nextSlot, setNextSlot] = useState(0);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getMainDisplayPosts();
        // 이미지가 있는 포스트만 필터링
        const filteredPosts = posts.filter(p => p.images && p.images.length > 0);
        setAllPosts(filteredPosts);
        
        // 초기 표시 데이터 설정 (최대 12개)
        const initialCount = 12;
        const initial = filteredPosts.slice(0, initialCount);
        const waiting = filteredPosts.slice(initialCount);
        
        setDisplayPosts(initial);
        setWaitingPool(waiting);
      } catch (error) {
        console.error('Failed to fetch student works:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 공평한 순환 교체 로직 (Fair Rotation)
  useEffect(() => {
    if (allPosts.length <= 12 || waitingPool.length === 0) return;
    
    // 4~6초 사이의 랜덤한 간격으로 교체 (약간의 변동성을 주어 더 자연스럽게 보임)
    const randomDelay = 4000 + Math.random() * 2000;
    
    const timeout = setTimeout(() => {
      // 1. 대기열의 첫 번째 게시물 가져오기
      const [nextPost, ...remainingPool] = waitingPool;
      
      setDisplayPosts(prev => {
        const nextDisplay = [...prev];
        const currentPostInSlot = nextDisplay[nextSlot];
        
        // 2. 현재 슬롯에 새로운 게시물 배치
        nextDisplay[nextSlot] = nextPost;
        
        // 3. 기존 게시물을 대기열 끝으로 이동 (자동으로 중복 방지 및 순환 구조 형성)
        if (currentPostInSlot) {
          setWaitingPool([...remainingPool, currentPostInSlot]);
        } else {
          setWaitingPool(remainingPool);
        }
        
        return nextDisplay;
      });
      
      // 4. 다음 교체할 슬롯 결정 (0~11 순차 순환 - 모든 슬롯 공평하게 교체)
      setNextSlot(prev => (prev + 1) % 12);
      
    }, randomDelay);

    return () => clearTimeout(timeout);
  }, [allPosts.length, waitingPool, nextSlot]);

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
