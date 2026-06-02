export const COLORS = {
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const RIDE_CATEGORIES = [
  { id: 'economy', name: 'Economy', icon: '🚗', baseFare: 15, perKm: 8, perMin: 1.5 },
  { id: 'standard', name: 'Standard', icon: '🚙', baseFare: 25, perKm: 12, perMin: 2 },
  { id: 'premium', name: 'Premium', icon: '🏎️', baseFare: 40, perKm: 18, perMin: 3 },
  { id: 'xl', name: 'XL', icon: '🚐', baseFare: 35, perKm: 15, perMin: 2.5 },
] as const;

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'wallet', name: 'Wallet', icon: '👛' },
  { id: 'payfast', name: 'PayFast', icon: '💳' },
  { id: 'ozow', name: 'Ozow EFT', icon: '🏦' },
] as const;

export const RIDE_STATUS_LABELS: Record<string, string> = {
  searching: 'Finding driver...',
  accepted: 'Driver assigned',
  arrived: 'Driver has arrived',
  in_progress: 'Ride in progress',
  completed: 'Ride completed',
  cancelled: 'Ride cancelled',
};

export const RIDE_STATUS_COLORS: Record<string, string> = {
  searching: '#F59E0B',
  accepted: '#3B82F6',
  arrived: '#10B981',
  in_progress: '#1E40AF',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export const API_TIMEOUT = 15000;

export const PHALABORWA_CENTER = {
  latitude: -23.9470,
  longitude: 31.0830,
} as const;

export const MAP_REGION = {
  latitude: PHALABORWA_CENTER.latitude,
  longitude: PHALABORWA_CENTER.longitude,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
} as const;
