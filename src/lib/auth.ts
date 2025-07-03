import { cookies } from 'next/headers';

export type User = {
  id: string;
  name: string;
  username: string;
  role: 'student' | 'parent' | 'teacher' | 'admin_main' | 'admin_sub';
};

export const mockUsers: Record<string, User> = {
  student: {
    id: 'student1',
    name: '김민준',
    username: 'student',
    role: 'student',
  },
  parent: {
    id: 'parent1',
    name: '김민준 부모님',
    username: 'parent',
    role: 'parent',
  },
  teacher: {
    id: 'teacher1',
    name: '박선생',
    username: 'teacher',
    role: 'teacher',
  },
  admin: {
    id: 'admin1',
    name: '관리자',
    username: 'admin',
    role: 'admin_main',
  },
};


// This function simulates fetching the currently authenticated user.
// In a real application, this would involve checking a session, cookie, or token.
export async function getAuthenticatedUser(): Promise<User | null> {
  const username = cookies().get('username')?.value;
  
  if (username && mockUsers[username]) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockUsers[username];
  }

  return null;
}
