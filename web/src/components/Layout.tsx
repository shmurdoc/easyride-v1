import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink-50/40">
      <Sidebar onLogout={logout} userName={user?.name || 'Admin'} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
