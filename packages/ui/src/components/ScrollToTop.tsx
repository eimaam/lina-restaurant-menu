import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  threshold = 300,
  className,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        'fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#161311] text-primary border border-primary/40 shadow-xl hover:bg-[#2E2722] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer animate-fade-in-up',
        className
      )}
    >
      <ChevronUp size={20} className="stroke-[2.5]" />
    </button>
  );
};
