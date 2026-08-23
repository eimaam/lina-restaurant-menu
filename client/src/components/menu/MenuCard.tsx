import React from 'react';
import { Plus, SlidersHorizontal, Flame, Sparkles } from 'lucide-react';
import type { MenuItemResponse } from '@lina/types';
import { formatNaira, Badge } from '@lina/ui';

interface MenuCardProps {
  item: MenuItemResponse;
  onSelect: (item: MenuItemResponse) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const isAvailable = item.isAvailable;

  // Compute displayed price
  let displayPrice = formatNaira(item.basePrice);
  if (item.hasSizes && item.sizes && item.sizes.length > 0) {
    const minPrice = Math.min(...item.sizes.map((s) => s.price));
    const maxPrice = Math.max(...item.sizes.map((s) => s.price));
    displayPrice =
      minPrice === maxPrice
        ? formatNaira(minPrice)
        : `${formatNaira(minPrice)} - ${formatNaira(maxPrice)}`;
  }

  const hasCustomizations =
    (item.hasSizes && item.sizes && item.sizes.length > 0) ||
    (item.optionGroups && item.optionGroups.length > 0);

  return (
    <div
      className={`group relative bg-surface-container-lowest rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 ${
        isAvailable
          ? 'border-outline-variant/70 hover:border-primary/50 hover:shadow-ambient hover:-translate-y-1'
          : 'border-outline-variant/40 opacity-60 bg-surface-container-low'
      }`}
    >
      <div>
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.isChefSpecial && (
              <Badge variant="secondary" size="sm" className="gap-1">
                <Sparkles size={11} className="text-secondary" /> Chef's Special
              </Badge>
            )}
            {item.tags?.includes('spicy') && (
              <Badge variant="error" size="sm" className="gap-1">
                <Flame size={11} className="text-error" /> Spicy
              </Badge>
            )}
          </div>

          {!isAvailable && (
            <Badge variant="error" size="sm">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Item Title & Description */}
        <h3 className="font-serif font-bold text-lg text-on-surface group-hover:text-primary transition-colors leading-snug">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-on-surface-variant/90 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Bottom Row: Price & Action */}
      <div className="pt-4 mt-3 border-t border-surface-container flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
            {item.hasSizes ? 'From' : 'Price'}
          </div>
          <div className="font-serif font-black text-base sm:text-lg text-secondary">
            {displayPrice}
          </div>
        </div>

        <button
          onClick={() => onSelect(item)}
          disabled={!isAvailable}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
            isAvailable
              ? hasCustomizations
                ? 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary border border-primary/30 shadow-xs'
                : 'bg-primary hover:bg-primary-hover text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
          }`}
        >
          {hasCustomizations ? (
            <>
              <SlidersHorizontal size={14} />
              <span>Options</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
