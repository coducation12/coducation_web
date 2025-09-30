'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export function UserAvatar({ src, name, role, size = 'md', className = '' }: UserAvatarProps) {
  // 관리자인 경우 로고 이미지 사용
  const avatarSrc = role === 'admin' ? '/logo.png' : src;
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={avatarSrc} alt={`${name}의 프로필`} />
      <AvatarFallback className="text-xs bg-cyan-900 text-cyan-100">
        <User className={iconSizes[size]} />
      </AvatarFallback>
    </Avatar>
  );
}
