import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Image as ImageIcon,
  ClipboardList,
  Users,
  QrCode,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Menu & Stock', path: '/admin/menu', icon: <UtensilsCrossed size={18} /> },
    { label: 'Orders Log', path: '/admin/orders', icon: <ClipboardList size={18} /> },
    { label: 'Banners & Promos', path: '/admin/banners', icon: <ImageIcon size={18} /> },
    ...(isAdmin
      ? [{ label: 'Staff Management', path: '/admin/staff', icon: <Users size={18} /> }]
      : []),
    { label: 'Table QR Generator', path: '/admin/qr', icon: <QrCode size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-outline-variant bg-surface-container-low shrink-0 select-none">
        {/* Top Brand */}
        <div className="h-16 flex items-center px-6 border-b border-outline-variant">
          <Link to="/admin">
            <Logo size="sm" />
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-surface rounded-2xl border border-outline-variant">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-on-surface truncate">{user?.name || 'Staff User'}</div>
              <div className="text-[11px] text-on-surface-variant truncate">{user?.email}</div>
            </div>
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              {isAdmin ? 'Admin' : 'Staff'}
            </Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-outline-variant space-y-2">
          <Link
            to="/menu"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2 text-xs font-semibold text-primary bg-primary-container/40 rounded-xl hover:bg-primary-container transition-all"
          >
            <span>Live Digital Menu</span>
            <ExternalLink size={14} />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-semibold text-error hover:bg-error-container/40 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-surface flex flex-col h-full z-10 border-r border-outline-variant p-4">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium',
                      isActive
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-outline-variant space-y-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-semibold text-error hover:bg-error-container/40 rounded-xl transition-all cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-outline-variant bg-surface glass-header sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container"
            >
              <MenuIcon size={20} />
            </button>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
            {isAdmin ? 'Admin' : 'Staff'}
          </Badge>
        </header>

        {/* Body Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
