import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';

export default function AuthLayout() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', padding: 'var(--spacing-6)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
            <h2 style={{ color: 'var(--color-primary)' }}>RBS Enterprise</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Resource Booking System</p>
          </div>
          <Outlet />
        </Card>
      </div>
    </div>
  );
}
