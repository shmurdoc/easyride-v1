export const COLORS = {
  bg: '#0a0a0a',
  bgGradientStart: '#0a0a0a',
  bgGradientEnd: '#1a1a1a',
  surface: '#141414',
  surfaceElevated: '#1c1c1c',
  surfaceLight: '#242424',
  primary: '#D4AF37',
  primaryLight: '#E8C84A',
  primaryDark: '#B8960F',
  primaryGlow: 'rgba(212, 175, 55, 0.3)',
  text: '#FFFFFF',
  textSecondary: '#E8E8E8',
  textMuted: '#8A8A8E',
  textDim: '#5A5A5E',
  success: '#00D68F',
  successGlow: 'rgba(0, 214, 143, 0.25)',
  error: '#FF3B5C',
  errorGlow: 'rgba(255, 59, 92, 0.25)',
  warning: '#FFB800',
  info: '#5E9EFF',
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderFocus: 'rgba(212, 175, 55, 0.4)',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
  gold: '#D4AF37',
  silver: '#C0C0C0',
  platinum: '#E5E4E2',
  peach: '#F5C882',
  warmBg: '#2A1F14',
  tileBg: '#1C1510',
  tileBorder: '#3A2E20',
} as const;

export const GRADIENTS = {
  primary: ['#D4AF37', '#E8C84A', '#D4AF37'] as const,
  primaryDark: ['#B8960F', '#D4AF37'] as const,
  surface: ['#141414', '#1c1c1c'] as const,
  surfaceElevated: ['#1c1c1c', '#242424'] as const,
  background: ['#0a0a0a', '#1a1a1a'] as const,
  shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] as const,
  goldShimmer: ['rgba(212,175,55,0)', 'rgba(212,175,55,0.15)', 'rgba(212,175,55,0)'] as const,
  glow: ['rgba(212,175,55,0.2)', 'rgba(212,175,55,0)'] as const,
} as const;

export const GLASS = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  blur: 20,
  saturation: 1.8,
} as const;

export const TYPOGRAPHY = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  h1: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 26, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28, letterSpacing: 0 },
  h4: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24, letterSpacing: 0.2 },
  body: { fontSize: 18, fontWeight: '400' as const, lineHeight: 27 },
  bodySmall: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  xs: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22, letterSpacing: 0.5 },
  buttonLarge: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24, letterSpacing: 0.5 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18, letterSpacing: 0.8 },
  price: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.5 },
  eta: { fontSize: 42, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -1 },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
  tile: 20,
} as const;

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  moderate: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glowSuccess: {
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  glowError: {
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const BORDERS = {
  standard: { borderWidth: 1, borderColor: COLORS.border, borderStyle: 'solid' as const },
  light: { borderWidth: 1, borderColor: COLORS.borderLight, borderStyle: 'solid' as const },
  focus: { borderWidth: 1.5, borderColor: COLORS.borderFocus, borderStyle: 'solid' as const },
  glass: { borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: 'solid' as const },
} as const;

export const RIDE_CATEGORIES = [
  { id: 'economy', name: 'Economy', baseFare: 25, perKm: 12, perMin: 2 },
  { id: 'standard', name: 'Standard', baseFare: 35, perKm: 15, perMin: 3 },
  { id: 'premium', name: 'Premium', baseFare: 55, perKm: 22, perMin: 5 },
  { id: 'xl', name: 'XL', baseFare: 45, perKm: 18, perMin: 4 },
] as const;

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'payfast', name: 'PayFast' },
  { id: 'ozow', name: 'Ozow EFT' },
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
  searching: COLORS.primary,
  accepted: COLORS.text,
  arrived: COLORS.success,
  in_progress: COLORS.text,
  completed: COLORS.success,
  cancelled: COLORS.error,
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
