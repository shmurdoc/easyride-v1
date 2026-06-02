import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/Toast';
import Layout from '@/components/Layout';
import LoginScreen from '@/pages/LoginScreen';
import DashboardScreen from '@/pages/DashboardScreen';
import RidesScreen from '@/pages/RidesScreen';
import DriversScreen from '@/pages/DriversScreen';
import UsersScreen from '@/pages/UsersScreen';
import PaymentsScreen from '@/pages/PaymentsScreen';
import PricingScreen from '@/pages/PricingScreen';
import ReportsScreen from '@/pages/ReportsScreen';
import SettingsScreen from '@/pages/SettingsScreen';
import LiveMapScreen from '@/pages/LiveMapScreen';
import NotFoundScreen from '@/pages/NotFoundScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardScreen />} />
            <Route path="rides" element={<RidesScreen />} />
            <Route path="drivers" element={<DriversScreen />} />
            <Route path="users" element={<UsersScreen />} />
            <Route path="payments" element={<PaymentsScreen />} />
            <Route path="pricing" element={<PricingScreen />} />
            <Route path="reports" element={<ReportsScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route path="map" element={<LiveMapScreen />} />
          </Route>
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
