'use server'

import { supabase, supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

import type { CommunityPost, CommunityComment } from '@/types/community';

// 현재 로그인된 사용자 정보 가져오기
async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  return { userId, userRole };
}

// 모든 게시글 가져오기 (페이지네이션 및 검색 지원)
export async function getCommunityPosts(page: number = 1, limit: number = 10, searchQuery?: string): Promise<{ posts: CommunityPost[], totalCount: number, totalPages: number }> {
  const { userId } = await getCurrentUser();

  // 검색 조건 설정
  let query = supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false);

  // 검색어가 있으면 제목, 내용, 작성자 이름에서 검색
  if (searchQuery && searchQuery.trim()) {
    query = query.or(`title.ilike.%${searchQuery.trim()}%,content.ilike.%${searchQuery.trim()}%,users.name.ilike.%${searchQuery.trim()}%`);
  }

  // 전체 게시글 수 가져오기
  const { count: totalCount } = await query;

  const totalPages = Math.ceil((totalCount || 0) / limit);
  const offset = (page - 1) * limit;

  // 게시글 데이터 가져오기
  let postsQuery = supabase
    .from('community_posts')
    .select(`
      id,
      title,
      content,
      images,
      user_id,
      created_at,
      users!community_posts_user_id_fkey (
        name,
        role,
        profile_image_url
      )
    `)
    .eq('is_deleted', false);

  // 검색어가 있으면 제목, 내용, 작성자 이름에서 검색
  if (searchQuery && searchQuery.trim()) {
    postsQuery = postsQuery.or(`title.ilike.%${searchQuery.trim()}%,content.ilike.%${searchQuery.trim()}%,users.name.ilike.%${searchQuery.trim()}%`);
  }

  const { data: posts, error } = await postsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], totalCount: 0, totalPages: 0 };
  }

  // 클라이언트 사이드에서 관리자 게시글을 최상단으로 정렬
  const sortedPosts = posts.sort((a: any, b: any) => {
    // 관리자 게시글을 최상단에 배치
    if (a.users?.role === 'admin' && b.users?.role !== 'admin') return -1;
    if (a.users?.role !== 'admin' && b.users?.role === 'admin') return 1;
    // 같은 타입 내에서는 최신순
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 모든 게시글의 댓글 수를 한 번에 가져오기
  const postIds = sortedPosts.map((post: any) => post.id);
  const { data: commentCounts } = await supabase
    .from('community_comments')
    .select('post_id')
    .in('post_id', postIds)
    .eq('is_deleted', false);

  // 댓글 수를 게시글 ID별로 그룹화
  const commentCountMap = commentCounts?.reduce((acc: any, comment: any) => {
    acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // 게시글 데이터와 댓글 수 결합
  const postsWithCounts = sortedPosts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    images: post.images || [],
    user_id: post.user_id,
    author: {
      id: post.user_id,
      name: post.users?.name || '익명',
      role: post.users?.role || 'student',
      avatar: undefined,
      profile_image_url: post.users?.profile_image_url
    },
    created_at: post.created_at,
    comments_count: commentCountMap[post.id] || 0
  }));

  return {
    posts: postsWithCounts,
    totalCount: totalCount || 0,
    totalPages
  };
}

// 특정 게시글 가져오기
export async function getCommunityPost(postId: string): Promise<CommunityPost | null> {
  const { data: post, error } = await supabase
    .from('community_posts')
    .select(`
      id,
      title,
      content,
      images,
      user_id,
      created_at,
      users!community_posts_user_id_fkey (
        name,
        role,
        profile_image_url
      )
    `)
    .eq('id', postId)
    .eq('is_deleted', false)
    .single();

  if (error || !post) {
    console.error('Error fetching post:', error);
    return null;
  }

  // 댓글 수 가져오기
  const { count: commentsCount } = await supabase
    .from('community_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post.id)
    .eq('is_deleted', false);

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    images: post.images || [],
    user_id: post.user_id,
    author: {
      id: post.user_id,
      name: post.users?.name || '익명',
      role: post.users?.role || 'student',
      avatar: undefined,
      profile_image_url: post.users?.profile_image_url
    },
    created_at: post.created_at,
    comments_count: commentsCount || 0
  };
}

// 게시글 생성
export async function createCommunityPost(title: string, content: string, images?: string[]) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  // 한국 시간으로 현재 시각 계산
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString();

  const { data, error } = await supabaseAdmin
    .from('community_posts')
    .insert({
      title,
      content,
      images: images || [],
      user_id: userId,
      created_at: kstTime
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw new Error('게시글 작성에 실패했습니다.');
  }

  return data;
}

// 게시글의 댓글 가져오기
export async function getCommunityComments(postId: string): Promise<CommunityComment[]> {
  const { data: comments, error } = await supabase
    .from('community_comments')
    .select(`
      id,
      content,
      post_id,
      user_id,
      created_at,
      users!community_comments_user_id_fkey (
        name,
        role,
        profile_image_url
      )
    `)
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return comments.map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    post_id: comment.post_id,
    user_id: comment.user_id,
    author: {
      id: comment.user_id,
      name: comment.users?.name || '익명',
      role: comment.users?.role || 'student',
      avatar: undefined,
      profile_image_url: comment.users?.profile_image_url
    },
    created_at: comment.created_at
  }));
}

// 댓글 생성
export async function createCommunityComment(postId: string, content: string) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  // 한국 시간으로 현재 시각 계산
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString();

  const { data, error } = await supabaseAdmin
    .from('community_comments')
    .insert({
      post_id: postId,
      content,
      user_id: userId,
      created_at: kstTime
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw new Error('댓글 작성에 실패했습니다.');
  }

  return data;
}

// 게시글 삭제 (소프트 삭제)
export async function deleteCommunityPost(postId: string) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  // 게시글 소유자 확인
  const { data: post } = await supabaseAdmin
    .from('community_posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (!post || post.user_id !== userId) {
    throw new Error('게시글을 삭제할 권한이 없습니다.');
  }

  const { error } = await supabaseAdmin
    .from('community_posts')
    .update({ is_deleted: true })
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw new Error('게시글 삭제에 실패했습니다.');
  }
}

// 댓글 삭제 (소프트 삭제)
export async function deleteCommunityComment(commentId: string) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  // 댓글 소유자 확인
  const { data: comment } = await supabaseAdmin
    .from('community_comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (!comment || comment.user_id !== userId) {
    throw new Error('댓글을 삭제할 권한이 없습니다.');
  }

  const { error } = await supabaseAdmin
    .from('community_comments')
    .update({ is_deleted: true })
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw new Error('댓글 삭제에 실패했습니다.');
  }
}
