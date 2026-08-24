import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard, GuestGuard, RoleGuard } from './guards/AuthGuard';
import { AdminLayout } from './components/layout/AdminLayout';
import { UserRole } from '@lina/types';
import { ScrollToTopButton } from '@lina/ui';

// Management Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage';
import { BannerManagementPage } from './pages/BannerManagementPage';
import { StaffManagementPage } from './pages/StaffManagementPage';
import { QRCodePage } from './pages/QRCodePage';
import { MenuPdfPage } from './pages/MenuPdfPage';

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTopOnNavigate />
      <Routes>
        {/* Unauthenticated Login Route */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<AdminLoginPage />} />
        </Route>

        {/* Protected Console Portal */}
        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/menu" element={<MenuManagementPage />} />
            <Route path="/orders" element={<OrdersHistoryPage />} />
            <Route path="/banners" element={<BannerManagementPage />} />

            {/* Admin & Developer Routes */}
            <Route element={<RoleGuard roles={[UserRole.Admin, UserRole.Developer]} />}>
              <Route path="/staff" element={<StaffManagementPage />} />
              <Route path="/menu-pdf" element={<MenuPdfPage />} />
            </Route>

            {/* Developer ONLY Route */}
            <Route element={<RoleGuard roles={[UserRole.Developer]} />}>
              <Route path="/qr" element={<QRCodePage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollToTopButton />
    </AuthProvider>
  );
}
