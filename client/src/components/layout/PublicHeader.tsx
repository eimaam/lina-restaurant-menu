import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Logo, WhatsAppIcon, cn } from '@lina/ui';
import { useCart } from '../../contexts/CartContext';

export const PublicHeader: React.FC = () => {
  const location = useLocation();
  const { totalItemsCount, subtotal } = useCart();

  const isMenu = location.pathname === '/menu';

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-[#D9D2C5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="hover:opacity-95 transition-opacity">
          <Logo size="md" />
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider font-bold text-on-surface-variant">
          <Link
            to="/"
            className={cn(
              'hover:text-primary transition-colors',
              location.pathname === '/' && 'text-primary font-extrabold'
            )}
          >
            Home
          </Link>
          <Link
            to="/menu"
            className={cn(
              'hover:text-primary transition-colors flex items-center gap-1.5',
              isMenu && 'text-primary font-extrabold'
            )}
          >
            Digital Menu
            <span className="bg-primary/15 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md">
              Live
            </span>
          </Link>
          <a
            href="https://wa.me/2349165196622?text=Hello%20Lina%20Restaurant%2C%20I%20would%20like%20to%20reserve%20a%20table%20%2F%20VIP%20lounge."
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors flex items-center gap-1.5 text-on-surface font-semibold"
          >
            <WhatsAppIcon size={15} className="text-[#25D366]" />
            <span>Reservations</span>
          </a>
        </nav>

        {/* Right Actions: Cart */}
        <div className="flex items-center gap-3">
          <Link
            to="/checkout"
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all select-none',
              totalItemsCount > 0
                ? 'bg-primary hover:bg-primary-hover text-on-primary border-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
            )}
          >
            <div className="relative">
              <ShoppingBag size={18} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-secondary text-on-secondary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-surface">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold hidden sm:inline">
              {totalItemsCount > 0 ? `₦${subtotal.toLocaleString('en-NG')}` : 'Cart'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
