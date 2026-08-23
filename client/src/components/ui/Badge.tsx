import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className,
}) => {
  const variants = {
    primary: 'bg-primary-container text-on-primary-container border-primary/20',
    secondary: 'bg-secondary-container text-on-secondary-container border-secondary/20',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-error-container text-on-error-container border-error/20',
    outline: 'bg-transparent text-on-surface border-outline-variant',
    neutral: 'bg-surface-container text-on-surface-variant border-outline-variant/60',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide',
    md: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
