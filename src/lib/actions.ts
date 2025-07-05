'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { mockUsers } from '@/lib/auth'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string;

  // In a real app, you'd validate the password.
  // For this mock, we only check if the username exists.
  if (username && mockUsers[username]) {
    const cookieStore = await cookies();
    cookieStore.set('username', username, { httpOnly: true, path: '/' })
    redirect('/dashboard')
  } else {
    redirect('/login?error=true')
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('username')
  redirect('/login')
}
