import React, { useState } from 'react';
import { cn } from '../lib/utils';
import linaLogo from '../assets/lina-restaurant-logo.png';

export { linaLogo };

export interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  imgClassName?: string;
}

const sizeConfig: Record<
  NonNullable<LogoProps['size']>,
  { heightPx: number; maxHClass: string; maxWClass: string }
> = {
  xs: { heightPx: 28, maxHClass: 'max-h-[28px]', maxWClass: 'max-w-[100px]' },
  sm: { heightPx: 36, maxHClass: 'max-h-[36px]', maxWClass: 'max-w-[130px]' },
  md: { heightPx: 44, maxHClass: 'max-h-[44px]', maxWClass: 'max-w-[160px]' },
  lg: { heightPx: 64, maxHClass: 'max-h-[64px]', maxWClass: 'max-w-[220px]' },
  xl: { heightPx: 96, maxHClass: 'max-h-[96px]', maxWClass: 'max-w-[320px]' },
  '2xl': { heightPx: 128, maxHClass: 'max-h-[128px]', maxWClass: 'max-w-[400px]' },
};

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showSubtitle = true,
  imgClassName,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const cfg = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none shrink-0', className)}>
      {!imageError ? (
        <img
          src={linaLogo}
          alt="Lina Restaurant, Lounge & Bar"
          onError={() => setImageError(true)}
          style={{
            height: `${cfg.heightPx}px`,
            width: 'auto',
            maxHeight: `${cfg.heightPx}px`,
          }}
          className={cn(
            'object-contain w-auto block transition-transform shrink-0',
            cfg.maxHClass,
            cfg.maxWClass,
            imgClassName
          )}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div
            style={{ width: `${cfg.heightPx}px`, height: `${cfg.heightPx}px` }}
            className="rounded-xl bg-secondary flex items-center justify-center text-primary font-serif font-black text-xl border border-primary/40"
          >
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
