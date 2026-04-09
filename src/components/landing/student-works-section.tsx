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
  const [displayPosts, setDisplayPosts] = useState<(CommunityPost | null)[]>(Array(8).fill(null));
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getMainDisplayPosts();
        // 이미지가 있는 포스트만 필터링
        const filteredPosts = posts.filter(p => p.images && p.images.length > 0);
        setAllPosts(filteredPosts);
        
        // 초기 표시 데이터 설정 (최대 8개)
        const initial = Array(8).fill(null).map((_, i) => filteredPosts[i] || null);
        setDisplayPosts(initial);
      } catch (error) {
        console.error('Failed to fetch student works:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 랜덤 교체 로직
  useEffect(() => {
    if (allPosts.length <= 8) return;

    const interval = setInterval(() => {
      // 0~7 사이의 랜덤 인덱스 선택 (교체할 슬롯)
      const slotIndex = Math.floor(Math.random() * 8);
      
      // 현재 메인에 없는 포스트들 중에서 랜덤으로 하나 선택
      const currentIds = new Set(displayPosts.filter(p => p !== null).map(p => p?.id));
      const pool = allPosts.filter(p => !currentIds.has(p.id));
      
      if (pool.length > 0) {
        const nextPost = pool[Math.floor(Math.random() * pool.length)];
        
        setDisplayPosts(prev => {
          const next = [...prev];
          next[slotIndex] = nextPost;
          return next;
        });
      }
    }, 4000); // 4초마다 하나씩 교체

    return () => clearInterval(interval);
  }, [allPosts, displayPosts]);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                      <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                        <div className="text-[10px] md:text-xs text-cyan-400 font-bold mb-1 opacity-70 truncate px-2">
                           {post.title}
                        </div>
                        <div className="text-sm md:text-lg font-bold text-white tracking-widest">
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
