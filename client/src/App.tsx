import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

// Public Guest Pages
import { LandingPage } from './pages/LandingPage';
import { MenuCatalogPage } from './pages/MenuCatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Customer Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuCatalogPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}
