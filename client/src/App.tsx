import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ScrollToTopButton } from '@lina/ui';

// Public Guest Pages
import { LandingPage } from './pages/LandingPage';
import { MenuCatalogPage } from './pages/MenuCatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <ScrollToTopOnNavigate />
        <Routes>
          {/* Customer Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuCatalogPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ScrollToTopButton />
      </CartProvider>
    </SettingsProvider>
  );
}
