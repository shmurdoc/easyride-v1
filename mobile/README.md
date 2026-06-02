# EasyRyde Mobile Apps

React Native (Expo) mobile applications for the EasyRyde ride-hailing platform.

## Apps

### Rider App (`apps/rider`)
- Book rides with real-time tracking
- Multiple ride categories (Economy, Standard, Premium, XL)
- In-ride chat with driver
- Wallet & multiple payment methods (Cash, PayFast, Ozow)
- Ride history & ratings

### Driver App (`apps/driver`)
- Go online/offline with GPS tracking
- Accept/decline ride requests
- Real-time navigation to pickup & dropoff
- Earnings dashboard & trip history
- In-ride chat with rider

### Admin App (`apps/admin`)
- Dashboard with real-time stats
- Manage users & drivers
- Approve/reject driver applications
- View all rides with status filters
- Platform settings management

## Setup

```bash
cd mobile
npm install
npx expo start --platform ios
npx expo start --platform android
```

## Environment Variables

Create `.env` in each app directory:

```
EXPO_PUBLIC_API_URL=http://your-api-url/api
EXPO_PUBLIC_SOCKET_URL=http://your-socket-url
```

## Structure

```
mobile/
├── packages/shared/    # Shared types, API client, hooks, utils
├── apps/rider/         # Rider app
├── apps/driver/        # Driver app
└── apps/admin/         # Admin app
```

## Tech Stack

- React Native 0.74
- Expo ~51
- React Navigation 6
- Socket.io Client
- TypeScript 5.5
