import type { ReactNode, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  compact?: boolean;
}

export function GlassCard({ children, hover = false, compact = false, className = '', ...props }: GlassCardProps) {
  return (
    <div
      className={`glass ${hover ? 'glass-hover cursor-pointer' : ''} ${compact ? 'p-4 md:p-5' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
