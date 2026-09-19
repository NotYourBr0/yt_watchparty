import React from 'react';

interface AvatarProps {
  username: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getColorFromHash = (name: string) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({ username, className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const bgColor = getColorFromHash(username);

  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-medium ${bgColor} ${sizes[size]} ${className}`}
      title={username}
    >
      {getInitials(username || '?')}
    </div>
  );
};
