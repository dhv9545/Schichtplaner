import React from 'react';
import { Utensils, Wine, ConciergeBell } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '', size = 'sm' }) => {
  const normalized = role.toLowerCase();

  let colorClasses = 'bg-slate-700/60 text-slate-300 border-slate-600/50';
  let Icon = ConciergeBell;

  if (normalized.includes('service')) {
    colorClasses = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    Icon = ConciergeBell;
  } else if (normalized.includes('kitchen')) {
    colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    Icon = Utensils;
  } else if (normalized.includes('bar')) {
    colorClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    Icon = Wine;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${colorClasses} ${sizeClasses} ${className}`}
    >
      <Icon size={iconSize} />
      <span>{role}</span>
    </span>
  );
};
