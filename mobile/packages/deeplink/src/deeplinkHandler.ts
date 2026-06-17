import * as Linking from 'expo-linking';

export type DeepLinkRoute =
  | { screen: 'RideDetail'; params: { rideId: string } }
  | { screen: 'PaymentDetail'; params: { paymentId: string } }
  | { screen: 'PromoCode'; params: { code: string } }
  | { screen: 'Profile' }
  | { screen: 'Wallet' }
  | { screen: 'Support' }
  | { screen: 'Earnings' }
  | { screen: 'Restaurant'; params: { restaurantId: string } }
  | { screen: 'OrderDetail'; params: { orderId: string } };

const routeMap: Record<string, (path: string) => DeepLinkRoute | null> = {
  'ride': (id) => ({ screen: 'RideDetail', params: { rideId: id } }),
  'payment': (id) => ({ screen: 'PaymentDetail', params: { paymentId: id } }),
  'promo': (code) => ({ screen: 'PromoCode', params: { code } }),
  'profile': () => ({ screen: 'Profile' }),
  'wallet': () => ({ screen: 'Wallet' }),
  'support': () => ({ screen: 'Support' }),
  'earnings': () => ({ screen: 'Earnings' }),
  'restaurant': (id) => ({ screen: 'Restaurant', params: { restaurantId: id } }),
  'order': (id) => ({ screen: 'OrderDetail', params: { orderId: id } }),
};

export function parseDeepLink(url: string): DeepLinkRoute | null {
  const { hostname, path, queryParams } = Linking.parse(url);
  const segments = (path || '').split('/').filter(Boolean);
  if (segments.length === 0 && routeMap[hostname || '']) {
    return routeMap[hostname || '']('');
  }
  if (segments.length > 0 && routeMap[segments[0]]) {
    return routeMap[segments[0]](segments[1] || '');
  }
  return null;
}

export function createDeepLink(route: string, params?: Record<string, string>): string {
  const prefix = 'easyryde://';
  if (!params) return prefix + route;
  const paramStr = Object.values(params)[0] || '';
  return prefix + route + '/' + paramStr;
}
