import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import type { MenuCategoryResponse } from '@lina/types';
import { cn } from '@lina/ui';

interface CategoryPillsProps {
  categories: MenuCategoryResponse[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const totalItemsCount = categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0);

  return (
    <div className="sticky top-16 z-30 bg-[#FAF7F2] border-b border-[#D9D2C5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="relative flex items-center">
          {/* Left Scroll Button (Hidden on Mobile) */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-[#D9D2C5] text-on-surface hover:text-primary hover:border-primary shrink-0 mr-2 shadow-xs transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable Category List */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full scroll-smooth"
          >
            {/* "All Offerings" Button */}
            <button
              onClick={() => onSelectCategory('all')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0 border',
                selectedCategory === 'all'
                  ? 'bg-[#161311] text-[#FAF7F2] border-[#161311] shadow-xs'
                  : 'bg-white text-on-surface border-[#D9D2C5] hover:border-primary hover:text-primary'
              )}
            >
              <Utensils size={13} className={selectedCategory === 'all' ? 'text-primary' : 'text-on-surface-variant'} />
              <span>All Offerings</span>
              {totalItemsCount > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    selectedCategory === 'all'
                      ? 'bg-primary text-on-primary'
                      : 'bg-[#EDE9E1] text-on-surface-variant'
                  )}
                >
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Individual Categories */}
            {categories.map((category) => {
              const isSelected = selectedCategory === category._id;
              return (
                <button
                  key={category._id}
                  onClick={() => onSelectCategory(category._id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0 border',
                    isSelected
                      ? 'bg-[#161311] text-[#FAF7F2] border-[#161311] shadow-xs'
                      : 'bg-white text-on-surface border-[#D9D2C5] hover:border-primary hover:text-primary'
                  )}
                >
                  {category.icon && (
                    <span className="text-sm leading-none">{category.icon}</span>
                  )}
                  <span>{category.name}</span>
                  {category.itemCount !== undefined && category.itemCount > 0 && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-[#EDE9E1] text-on-surface-variant'
                      )}
                    >
                      {category.itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Scroll Button (Hidden on Mobile) */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-[#D9D2C5] text-on-surface hover:text-primary hover:border-primary shrink-0 ml-2 shadow-xs transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
