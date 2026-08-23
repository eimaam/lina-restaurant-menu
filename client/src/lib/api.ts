import axios from 'axios';
import type {
  MenuCategoryResponse,
  MenuItemResponse,
  BannerResponse,
  OrderResponse,
  UserResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lina_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Public Menu & Banner APIs ──
export const publicApi = {
  getCategories: async (): Promise<MenuCategoryResponse[]> => {
    const res = await api.get('/menu/categories');
    return res.data.data;
  },

  getMenuItems: async (params?: {
    categoryId?: string;
    search?: string;
    isAvailable?: boolean;
    isChefSpecial?: boolean;
  }): Promise<{ items: MenuItemResponse[]; total: number }> => {
    const res = await api.get('/menu/items', { params });
    return res.data.data;
  },

  getBanners: async (): Promise<BannerResponse[]> => {
    const res = await api.get('/banners');
    return res.data.data;
  },

  logOrder: async (orderPayload: any): Promise<OrderResponse> => {
    const res = await api.post('/orders', orderPayload);
    return res.data.data;
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },
};

// ── Admin & Staff APIs ──
export const adminApi = {
  // Menu & Categories
  createCategory: async (data: any) => (await api.post('/menu/categories', data)).data,
  updateCategory: async (id: string, data: any) => (await api.put(`/menu/categories/${id}`, data)).data,
  deleteCategory: async (id: string) => (await api.delete(`/menu/categories/${id}`)).data,

  createMenuItem: async (data: any) => (await api.post('/menu/items', data)).data,
  updateMenuItem: async (id: string, data: any) => (await api.put(`/menu/items/${id}`, data)).data,
  deleteMenuItem: async (id: string) => (await api.delete(`/menu/items/${id}`)).data,
  toggleItemAvailability: async (id: string) => (await api.patch(`/menu/items/${id}/toggle-availability`)).data,

  // Banners
  getAllBanners: async (): Promise<BannerResponse[]> => {
    const res = await api.get('/banners?includeInactive=true');
    return res.data.data;
  },
  createBanner: async (data: any) => (await api.post('/banners', data)).data,
  updateBanner: async (id: string, data: any) => (await api.put(`/banners/${id}`, data)).data,
  toggleBannerActive: async (id: string) => (await api.patch(`/banners/${id}/toggle-active`)).data,
  deleteBanner: async (id: string) => (await api.delete(`/banners/${id}`)).data,

  // Orders & Analytics
  getOrders: async (params?: any): Promise<{ orders: OrderResponse[]; total: number }> => {
    const res = await api.get('/orders', { params });
    return res.data.data;
  },
  updateOrderStatus: async (id: string, status: string) =>
    (await api.patch(`/orders/${id}/status`, { status })).data,
  getOrderStats: async () => (await api.get('/orders/stats')).data.data,

  // Staff User Management (Admin Only)
  getUsers: async (): Promise<UserResponse[]> => (await api.get('/users')).data.data,
  createUser: async (data: any) => (await api.post('/users', data)).data,
  resetPassword: async (id: string, newPassword: string) =>
    (await api.patch(`/users/${id}/reset-password`, { newPassword })).data,
  toggleUserStatus: async (id: string) => (await api.patch(`/users/${id}/toggle-status`)).data,
  deleteUser: async (id: string) => (await api.delete(`/users/${id}`)).data,
};
