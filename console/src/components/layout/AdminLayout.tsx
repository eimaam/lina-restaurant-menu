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
  FileText,
  Shield,
  User,
  Sparkles,
  ChevronRight,
  Circle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo, Badge, cn } from '@lina/ui';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin, isDeveloper } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNavItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Menu & Stock', path: '/menu', icon: <UtensilsCrossed size={18} /> },
    { label: 'Orders Log', path: '/orders', icon: <ClipboardList size={18} /> },
    { label: 'Banners & Promos', path: '/banners', icon: <ImageIcon size={18} /> },
  ];

  const adminNavItems = isAdmin
    ? [
      { label: 'Staff Management', path: '/staff', icon: <Users size={18} /> },
      { label: 'Printable Menu PDF', path: '/menu-pdf', icon: <FileText size={18} /> },
    ]
    : [];

  const devNavItems = isDeveloper
    ? [{ label: 'Table QR Generator', path: '/qr', icon: <QrCode size={18} /> }]
    : [];

  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'https://linarestaurantandbar.com.ng';

  const roleLabel = isDeveloper ? 'Developer' : user?.role === 'admin' ? 'Admin' : 'Staff';
  const roleBadgeVariant = isDeveloper ? 'primary' : user?.role === 'admin' ? 'secondary' : 'neutral';

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface flex">
      {/* ── Fixed Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-outline-variant bg-[#FAF7F2] shrink-0 select-none z-30">
        {/* Top Brand & Live Status */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-outline-variant bg-white">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 mt-3.5 mb-2 bg-white rounded-xl border border-outline-variant shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#161311] text-primary flex items-center justify-center font-serif font-black text-sm border border-primary/30 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-on-surface truncate">{user?.name || 'Staff Member'}</div>
              <div className="text-[10px] text-on-surface-variant truncate">{user?.email}</div>
            </div>
            <Badge variant={roleBadgeVariant} size="sm" className="shrink-0">
              {roleLabel}
            </Badge>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-none">
          {/* Main Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
              Operations
            </div>
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group',
                    isActive
                      ? 'bg-[#161311] text-[#FAF7F2] font-bold shadow-xs'
                      : 'text-on-surface hover:text-[#161311] hover:bg-white border border-transparent hover:border-outline-variant/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={13} className="text-primary" />}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {adminNavItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-outline-variant/60">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                Administration
              </div>
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group',
                      isActive
                        ? 'bg-[#161311] text-[#FAF7F2] font-bold shadow-xs'
                        : 'text-on-surface hover:text-[#161311] hover:bg-white border border-transparent hover:border-outline-variant/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={13} className="text-primary" />}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Developer Section */}
          {devNavItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-outline-variant/60">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-primary font-mono mb-1">
                Developer Exclusive
              </div>
              {devNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group',
                      isActive
                        ? 'bg-[#161311] text-[#FAF7F2] font-bold shadow-xs'
                        : 'text-on-surface hover:text-[#161311] hover:bg-white border border-transparent hover:border-outline-variant/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-primary' : 'text-primary/70 group-hover:text-primary'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={13} className="text-primary" />}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3.5 border-t border-outline-variant bg-white space-y-2">
          <a
            href={clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
          >
            <span>Live Guest Menu</span>
            <ExternalLink size={13} />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Overlay Drawer Navigation ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-[#FAF7F2] flex flex-col h-full z-10 border-r border-outline-variant shadow-2xl">
            {/* Mobile Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-outline-variant bg-white">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile User Card */}
            <div className="p-3.5 mx-3 my-3 bg-white rounded-xl border border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#161311] text-primary flex items-center justify-center font-serif font-black text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-on-surface truncate">{user?.name || 'Staff User'}</div>
                  <div className="text-[10px] text-on-surface-variant truncate">{user?.email}</div>
                </div>
                <Badge variant={roleBadgeVariant} size="sm">
                  {roleLabel}
                </Badge>
              </div>
            </div>

            {/* Mobile Navigation List */}
            <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
              <div className="space-y-1">
                {[...mainNavItems, ...adminNavItems, ...devNavItems].map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-[#161311] text-[#FAF7F2] font-bold shadow-xs'
                          : 'text-on-surface hover:bg-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-primary' : 'text-on-surface-variant'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={13} className="text-primary" />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Mobile Bottom Sign Out */}
            <div className="p-3.5 border-t border-outline-variant bg-white space-y-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Column (Independently Scrolling) ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-outline-variant bg-[#FAF7F2] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-on-surface hover:bg-white border border-outline-variant/60"
            >
              <MenuIcon size={18} />
            </button>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <Badge variant={roleBadgeVariant} size="sm">
            {roleLabel}
          </Badge>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
