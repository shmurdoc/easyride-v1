export interface User {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone_number: string;
  role: 'rider' | 'driver' | 'admin' | 'super-admin';
  is_active: boolean;
  is_online?: boolean;
  current_latitude?: number;
  current_longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  license_number?: string;
  license_expiry?: string;
  id_number?: string;
  is_verified: boolean;
  is_approved: boolean;
  average_rating: number;
  rating_count: number;
  total_trips: number;
  total_earnings: number;
}

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  category: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Ride {
  id: string;
  tenant_id: string;
  rider_id: string;
  driver_id?: string;
  status: RideStatus;
  category: RideCategory;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  dropoff_address: string;
  distance_km?: number;
  duration_minutes?: number;
  base_fare?: number;
  per_km_fare?: number;
  surge_multiplier: number;
  total_fare?: number;
  promo_code_id?: string;
  discount_amount?: number;
  payment_method?: string;
  payment_status?: string;
  driver_eta?: number;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  created_at: string;
  updated_at: string;
  rider?: User;
  driver?: User;
  payment?: Payment;
}

export type RideStatus =
  | 'searching'
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RideCategory = 'economy' | 'standard' | 'premium' | 'xl' | 'delivery';

export interface Payment {
  id: string;
  ride_id: string;
  payer_id: string;
  payee_id?: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  platform_fee: number;
  driver_payout?: number;
  paid_at?: string;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Wallet {
  id: string;
  user_id: string;
  tenant_id?: string;
  balance: number;
  pending_balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string;
  reference_id: string;
  description: string;
  created_at: string;
}

export interface Rating {
  id: string;
  ride_id: string;
  rater_id: string;
  ratee_id: string;
  score: number;
  comment?: string;
  rater?: User;
  ratee?: User;
  ride?: Ride;
  created_at: string;
}

export interface PromoCode {
  id: string;
  tenant_id?: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_ride_amount: number;
  max_discount: number;
  max_uses: number;
  used_count: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface Delivery {
  id: string;
  tenant_id: string;
  sender_id: string;
  driver_id?: string;
  ride_id?: string;
  status: DeliveryStatus;
  item_description: string;
  item_value?: number;
  recipient_name: string;
  recipient_phone: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  payment_method: string;
  payment_status: string;
  fare_amount?: number;
  notes?: string;
  picked_up_at?: string;
  delivered_at?: string;
  created_at: string;
  sender?: User;
  driver?: User;
}

export type DeliveryStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  distance?: number;
  timestamp?: number;
}

export interface PlatformConfig {
  platform: {
    name: string;
    currency: string;
    country: string;
    currency_symbol: string;
  };
  ride_categories: RideCategoryConfig[];
  payment_methods: PaymentMethodConfig[];
  surge: { enabled: boolean; multiplier_cap: number };
  matching: { radius_km: number; timeout_seconds: number };
  features: { ride_hailing: boolean; item_transport: boolean; food_delivery: boolean };
}

export interface RideCategoryConfig {
  id: string;
  name: string;
  base_fare: number;
  per_km: number;
  per_min: number;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}
