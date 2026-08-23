import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import linaLogo from '../../assets/lina-restaurant-logo.png';

export { linaLogo };

export interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  imgClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showSubtitle = true,
  imgClassName,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    xs: 'h-7',
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-24',
    '2xl': 'h-32',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {!imageError ? (
        <img
          src={linaLogo}
          alt="Lina Restaurant, Lounge & Bar"
          onError={() => setImageError(true)}
          className={cn('object-contain max-w-full transition-transform', sizeStyles[size], imgClassName)}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-serif font-black text-xl border border-primary/40">
            L
          </div>
          <div>
            <div className="font-serif font-black tracking-wider text-on-surface text-base uppercase leading-tight">
              Lina
            </div>
            {showSubtitle && (
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">
                Restaurant & Bar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
