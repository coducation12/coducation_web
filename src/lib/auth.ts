import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';

export const mockUsers: Record<string, User> = {
  student: {
    id: 'student1',
    username: 'student',
    name: '김민준',
    role: 'student',
    created_at: new Date().toISOString(),
  },
  parent: {
    id: 'parent1',
    username: 'parent',
    name: '김민준 부모님',
    role: 'parent',
    created_at: new Date().toISOString(),
  },
  teacher: {
    id: 'teacher1',
    username: 'teacher',
    name: '박선생',
    role: 'teacher',
    created_at: new Date().toISOString(),
  },
  admin: {
    id: 'admin1',
    username: 'admin',
    name: '관리자',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
};

// This function simulates fetching the currently authenticated user.
// In a real application, this would involve checking a session, cookie, or token.
export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value;
  
  if (username && mockUsers[username]) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockUsers[username];
  }

  return null;
}
