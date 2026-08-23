import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatNaira } from '../../lib/utils';

export const FloatingCartBar: React.FC = () => {
  const { totalItemsCount, subtotal } = useCart();

  if (totalItemsCount === 0) return null;

  return (
    <div className="fixed bottom-5 inset-x-4 max-w-md mx-auto z-40 animate-fade-in-up">
      <Link
        to="/checkout"
        className="flex items-center justify-between p-4 bg-secondary text-on-secondary rounded-2xl border border-primary/40 hover:bg-secondary-hover active:scale-98 transition-all shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
            <ShoppingBag size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-primary-fixed uppercase tracking-wider">
              {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'} in Cart
            </div>
            <div className="font-serif font-black text-base text-white">
              {formatNaira(subtotal)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs">
          <span>Checkout</span>
          <ArrowRight size={14} />
        </div>
      </Link>
    </div>
  );
};
