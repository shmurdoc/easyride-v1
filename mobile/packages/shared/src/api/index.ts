import { api } from './client';
export { api };
import type {
  User, Ride, Payment, Wallet, WalletTransaction, Rating,
  PromoCode, Delivery, PaginatedResponse, PlatformConfig, DriverLocation,
} from '../types';

export const auth = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone_number: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ user: User }>('/auth/me').then(r => r.user),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),
};

export const users = {
  get: (id: string) => api.get<User>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
};

export const rides = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Ride>>('/rides', params),

  get: (id: string) => api.get<Ride>(`/rides/${id}`),

  create: (data: {
    category: string;
    pickup_lat: number;
    pickup_lng: number;
    pickup_address: string;
    dropoff_lat: number;
    dropoff_lng: number;
    dropoff_address: string;
    payment_method: string;
    promo_code?: string;
  }) => api.post<{ ride: Ride }>('/rides', data).then(r => r.ride),

  cancel: (id: string, reason?: string) =>
    api.post<Ride>(`/rides/${id}/cancel`, { cancellation_reason: reason }),

  rate: (id: string, score: number, comment?: string) =>
    api.post<Rating>(`/rides/${id}/rate`, { score, comment }),

  applyPromo: (id: string, code: string) =>
    api.post(`/rides/${id}/apply-promo`, { code }),

  current: () => api.get<Ride | null>('/rides/current'),

  updateLocation: (id: string, lat: number, lng: number) =>
    api.post(`/rides/${id}/location`, { latitude: lat, longitude: lng }),
};

export const drivers = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<User>>('/drivers', params),

  get: (id: string) => api.get<User>(`/drivers/${id}`),

  updateProfile: (data: Record<string, unknown>) =>
    api.put('/drivers/profile', data),

  registerVehicle: (data: {
    make: string; model: string; year: number;
    color: string; license_plate: string; category: string;
  }) => api.post('/drivers/vehicle', data),

  updateVehicle: (data: {
    make: string; model: string; year: number;
    color: string; license_plate: string; category: string;
  }) => api.post('/drivers/vehicle', data),

  toggleOnline: () => api.post<{ is_online: boolean }>('/drivers/toggle-online'),

  earnings: () => api.get<{
    total_earnings: number;
    today_earnings: number;
    pending_payout: number;
    total_trips: number;
    recent_transactions: WalletTransaction[];
  }>('/drivers/earnings'),

  trips: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Ride>>('/drivers/trips', params),

  nearbyRides: (radius?: number) =>
    api.get<Ride[]>('/drivers/nearby-rides', radius ? { radius: String(radius) } : undefined),

  updateLocation: (lat: number, lng: number) =>
    api.post('/drivers/location', { latitude: lat, longitude: lng }),
};

export const notifications = {
  registerToken: (token: string) =>
    api.post('/notifications/register-token', { token }),
};

export const payments = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Payment>>('/payments', params),

  get: (id: string) => api.get<Payment>(`/payments/${id}`),

  methods: () => api.get<{ methods: { id: string; name: string; available: boolean }[] }>('/payments/methods'),

  processRide: (rideId: string, method: string) =>
    api.post<{
      payment: Payment;
      message: string;
      redirect_url?: string;
      client_secret?: string;
      payment_intent_id?: string;
    }>(`/payments/rides/${rideId}/pay`, { method }),
};

export const wallet = {
  get: () => api.get<Wallet>('/wallet'),

  transactions: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<WalletTransaction>>('/wallet/transactions', params),

  deposit: (amount: number, method: string) =>
    api.post('/wallet/deposit', { amount, payment_method: method }),

  withdraw: (amount: number) =>
    api.post('/wallet/withdraw', { amount }),
};

export const ratings = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Rating>>('/ratings', params),

  given: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Rating>>('/ratings/given', params),
};

export const promoCodes = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<PromoCode>>('/promo-codes', params),

  validate: (code: string, rideAmount?: number) =>
    api.post<{ valid: boolean; discount: number; promo_code?: PromoCode }>('/promo-codes/validate', { code, ride_amount: rideAmount }),
};

export const deliveries = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Delivery>>('/deliveries', params),

  get: (id: string) => api.get<Delivery>(`/deliveries/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<Delivery>('/deliveries', data),

  updateStatus: (id: string, status: string) =>
    api.put<Delivery>(`/deliveries/${id}/status`, { status }),
};

export const config = {
  get: () => api.get<PlatformConfig>('/config'),
};

export const admin = {
  dashboard: () => api.get<{
    total_users: number;
    total_drivers: number;
    total_rides: number;
    active_rides: number;
    total_revenue: number;
    rides_today: number;
    completed_today: number;
    revenue_today: number;
  }>('/admin/dashboard'),

  users: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<User>>('/admin/users', params),

  rides: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Ride>>('/admin/rides', params),

  drivers: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<User>>('/admin/drivers', params),

  approveDriver: (id: string) => api.post(`/admin/drivers/${id}/approve`),

  rejectDriver: (id: string) => api.post(`/admin/drivers/${id}/reject`),

  settings: () => api.get('/admin/settings'),

  updateSettings: (data: { key: string; value: unknown; description?: string }) =>
    api.post('/admin/settings', data),
};

export const reports = {
  dashboard: (days?: number) =>
    api.get('/admin/reports/dashboard', days ? { days: String(days) } : undefined),

  revenue: (params?: Record<string, string>) =>
    api.get('/admin/reports/revenue', params),

  drivers: () => api.get('/admin/reports/drivers'),
};

export { foodDelivery } from './foodDelivery';
