import React from 'react';
import { Plus, Minus, SlidersHorizontal, Flame, Sparkles, ShoppingBag } from 'lucide-react';
import type { MenuItemResponse } from '@lina/types';
import { formatNaira, Badge } from '@lina/ui';
import { useCart } from '../../contexts/CartContext';

interface MenuCardProps {
  item: MenuItemResponse;
  onSelect: (item: MenuItemResponse) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const { getItemQuantity, addItem, incrementItem, decrementItem } = useCart();
  const isAvailable = item.isAvailable;
  const cartQuantity = getItemQuantity(item._id);

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

  const handleSimpleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCustomizations) {
      onSelect(item);
    } else {
      addItem(item, 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCustomizations) {
      onSelect(item);
    } else {
      incrementItem(item._id);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    decrementItem(item._id);
  };

  return (
    <div
      className={`group relative rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 ${
        !isAvailable
          ? 'border-outline-variant/40 opacity-60 bg-surface-container-low'
          : cartQuantity > 0
          ? 'bg-[#FAF7F2] border-primary/60 shadow-ambient ring-1 ring-primary/30'
          : 'bg-surface-container-lowest border-outline-variant/70 hover:border-primary/50 hover:shadow-ambient hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Top Badges & Cart Indicator */}
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

          <div className="flex items-center gap-1.5">
            {cartQuantity > 0 && isAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-bold shadow-xs animate-scale-in">
                <ShoppingBag size={11} />
                <span>{cartQuantity} in cart</span>
              </span>
            )}

            {!isAvailable && (
              <Badge variant="error" size="sm">
                Sold Out
              </Badge>
            )}
          </div>
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

      {/* Bottom Row: Price & Action Controls */}
      <div className="pt-4 mt-3 border-t border-surface-container flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
            {item.hasSizes ? 'From' : 'Price'}
          </div>
          <div className="font-serif font-black text-base sm:text-lg text-secondary">
            {displayPrice}
          </div>
        </div>

        {/* Action Button / Quantity Controls */}
        {isAvailable && cartQuantity > 0 && !hasCustomizations ? (
          /* Inline Quantity Stepper for Simple Items */
          <div className="inline-flex items-center bg-[#161311] text-[#FAF7F2] rounded-2xl p-1 shadow-sm border border-[#3D332A]">
            <button
              onClick={handleDecrement}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-on-primary-variant hover:text-primary hover:bg-[#2E2722] active:scale-90 transition-all cursor-pointer"
              title="Reduce quantity or remove"
            >
              <Minus size={14} />
            </button>
            <span className="px-2.5 text-xs font-bold font-mono text-primary">
              {cartQuantity}
            </span>
            <button
              onClick={handleIncrement}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-on-primary-variant hover:text-primary hover:bg-[#2E2722] active:scale-90 transition-all cursor-pointer"
              title="Add one more"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          /* Standard Add / Options Button */
          <button
            onClick={handleSimpleAdd}
            disabled={!isAvailable}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
              isAvailable
                ? hasCustomizations
                  ? cartQuantity > 0
                    ? 'bg-secondary text-on-secondary shadow-wine'
                    : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary border border-primary/30 shadow-xs'
                  : 'bg-primary hover:bg-primary-hover text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
            }`}
          >
            {hasCustomizations ? (
              <>
                <SlidersHorizontal size={14} />
                <span>{cartQuantity > 0 ? `Edit (${cartQuantity})` : 'Options'}</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
