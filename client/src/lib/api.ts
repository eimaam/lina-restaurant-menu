import axios from 'axios';
import type {
  MenuCategoryResponse,
  MenuItemResponse,
  BannerResponse,
  OrderResponse,
} from '@lina/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public Menu & Ordering APIs
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
