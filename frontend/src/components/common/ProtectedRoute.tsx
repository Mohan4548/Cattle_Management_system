import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoadingScreen } from './LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
          ⚠️
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Access Denied</h2>
        <p className="text-slate-400 mt-2 max-w-md text-sm">
          Your role (<span className="capitalize font-bold text-emerald-400">{user.role}</span>) does not have authorization to view this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <Outlet />;
};
