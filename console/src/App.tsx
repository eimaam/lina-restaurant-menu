import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard, GuestGuard, RoleGuard } from './guards/AuthGuard';
import { AdminLayout } from './components/layout/AdminLayout';
import { UserRole } from '@lina/types';

// Admin Management Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage';
import { BannerManagementPage } from './pages/BannerManagementPage';
import { StaffManagementPage } from './pages/StaffManagementPage';
import { QRCodePage } from './pages/QRCodePage';

export default function App() {
  return (
    <AuthProvider>
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
            <Route path="/qr" element={<QRCodePage />} />

            {/* Super Admin Only Routes */}
            <Route element={<RoleGuard roles={[UserRole.Admin]} />}>
              <Route path="/staff" element={<StaffManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
