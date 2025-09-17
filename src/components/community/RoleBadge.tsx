'use client';

import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, BADGE_COLOR_MAP } from '@/lib/community-constants';

interface RoleBadgeProps {
  role: 'student' | 'parent' | 'teacher' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-1 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export function RoleBadge({ role, size = 'md', className = '' }: RoleBadgeProps) {
  return (
    <Badge className={`${BADGE_COLOR_MAP[role]} ${sizeClasses[size]} font-bold ${className}`}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}
