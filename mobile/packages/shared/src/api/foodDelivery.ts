import { api } from './client';
import type { PaginatedResponse } from '../types';

export interface Restaurant {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  phone?: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisine_type?: string;
  price_range: string;
  delivery_fee: number;
  minimum_order: number;
  estimated_delivery_minutes: number;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  rating_count: number;
  total_orders: number;
  menu_items_count?: number;
}

export interface RestaurantCategory {
  id: string;
  name: string;
  sort_order: number;
  menu_items: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: number;
  calories?: number;
}

export interface FoodOrder {
  id: string;
  tenant_id: string;
  restaurant_id: string;
  customer_id: string;
  driver_id?: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tip_amount: number;
  total_amount: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_notes?: string;
  estimated_delivery_at?: string;
  actual_delivery_at?: string;
  payment_method: string;
  payment_status: string;
  rating?: number;
  rating_comment?: string;
  items: FoodOrderItem[];
  restaurant?: Restaurant;
  customer?: any;
  driver?: any;
  created_at: string;
}

export interface FoodOrderItem {
  id: string;
  menu_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  line_total: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export const foodDelivery = {
  restaurants: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Restaurant>>('/food/restaurants', params),

  restaurant: (id: string) =>
    api.get<Restaurant & { categories: RestaurantCategory[] }>(`/food/restaurants/${id}`),

  menu: (restaurantId: string) =>
    api.get<RestaurantCategory[]>(`/food/restaurants/${restaurantId}/menu`),

  createOrder: (restaurantId: string, data: {
    items: { menu_item_id: string; quantity: number; special_instructions?: string }[];
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    delivery_notes?: string;
    payment_method: string;
    tip_amount?: number;
  }) => api.post<FoodOrder>(`/food/restaurants/${restaurantId}/order`, data),

  myOrders: (params?: Record<string, string>) =>
    api.get<FoodOrder[]>('/food/orders', params),

  getOrder: (id: string) =>
    api.get<FoodOrder>(`/food/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    api.post<FoodOrder>(`/food/orders/${id}/cancel`, { reason }),

  rateOrder: (id: string, rating: number, comment?: string) =>
    api.post<FoodOrder>(`/food/orders/${id}/rate`, { rating, comment }),

  driverOrders: (params?: Record<string, string>) =>
    api.get<FoodOrder[]>('/driver/food/orders', params),

  updateOrderStatus: (id: string, status: string) =>
    api.post<FoodOrder>(`/driver/food/orders/${id}/status`, { status }),
};
