import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { BannerResponse } from '@lina/types';

interface BannersCarouselProps {
  banners: BannerResponse[];
}

export const BannersCarousel: React.FC<BannersCarouselProps> = ({ banners }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const activeBanner = banners[currentIdx];

  return (
    <div className="relative overflow-hidden rounded-xl bg-tertiary text-on-secondary p-6 sm:p-8 border border-primary/30 transition-all">

      <div className="relative z-10 max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary-fixed text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-primary" />
          <span>Lina Featured Specials</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-on-secondary leading-tight">
          {activeBanner.title}
        </h2>

        {activeBanner.subtitle && (
          <p className="text-sm sm:text-base text-surface-container leading-relaxed">
            {activeBanner.subtitle}
          </p>
        )}

        {activeBanner.actionLink && (
          <div className="pt-2">
            <a
              href={activeBanner.actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-lg shadow-xs transition-all"
            >
              <span>Discover Special</span>
              <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIdx ? 'w-6 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
