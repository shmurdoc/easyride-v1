import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function NotFoundScreen() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const home = isAuthenticated ? '/' : '/login';
  return (
    <div className="min-h-screen relative overflow-hidden bg-ink-950 text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-mesh-dark opacity-70" aria-hidden />
      <div className="relative z-10 max-w-lg w-full text-center animate-scale-in">
        <div className="text-[8rem] sm:text-[10rem] font-display font-black leading-none bg-gradient-to-br from-primary-300 via-accent-300 to-warn-300 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold mt-2">Wrong turn.</h1>
        <p className="text-ink-300 mt-3 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-ink-200 hover:bg-white/10 transition-colors"
          >
            ← Go back
          </button>
          <Link
            to={home}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:from-primary-400 hover:to-primary-600 transition-all shadow-glow-primary"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
          </Link>
        </div>
      </div>
    </div>
  );
}
