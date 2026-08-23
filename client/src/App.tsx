import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AuthGuard, GuestGuard, RoleGuard } from './guards/AuthGuard';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { MenuCatalogPage } from './pages/MenuCatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { MenuManagementPage } from './pages/admin/MenuManagementPage';
import { OrdersHistoryPage } from './pages/admin/OrdersHistoryPage';
import { BannerManagementPage } from './pages/admin/BannerManagementPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { QRCodePage } from './pages/admin/QRCodePage';
import { UserRole } from './types';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuCatalogPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Admin Login Route (Guest Only) */}
          <Route element={<GuestGuard />}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Route>

          {/* Protected Admin Portal */}
          <Route element={<AuthGuard />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="orders" element={<OrdersHistoryPage />} />
              <Route path="banners" element={<BannerManagementPage />} />
              <Route path="qr" element={<QRCodePage />} />

              {/* Admin Only Route */}
              <Route element={<RoleGuard roles={[UserRole.Admin]} />}>
                <Route path="staff" element={<StaffManagementPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
