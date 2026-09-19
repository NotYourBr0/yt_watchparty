import React from 'react';
import { Role } from '@shared/types';

interface BadgeProps {
  role: Role;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ role, className = '' }) => {
  const styles = {
    [Role.HOST]: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    [Role.MODERATOR]: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    [Role.PARTICIPANT]: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[role]} ${className}`}>
      {role.toLowerCase()}
    </span>
  );
};
