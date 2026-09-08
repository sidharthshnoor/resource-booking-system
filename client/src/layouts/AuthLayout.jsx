import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import Card from '../components/ui/Card';

export default function AuthLayout() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { organization } = useOrganization();
  const location = useLocation();
  const isLoginPage = location.pathname.endsWith('/login');
  const isRegisterPage = location.pathname.endsWith('/register');

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
      return <Navigate to={`/org/${organization.slug}/admin/dashboard`} replace />;
    }
    return <Navigate to={`/org/${organization.slug}/app/dashboard`} replace />;
  }

  if (isLoginPage || isRegisterPage) {
    return (
      <div className="auth-page">
        <div className={`auth-panel ${isLoginPage ? 'is-login' : 'is-register'}`}>
          
          <main className="auth-form-panel">
            <div className="auth-form-shell">
              <Outlet />
            </div>
          </main>

          <aside className="auth-visual-panel" aria-label="Brand panel">
            <div className="auth-visual-panel-inner">
              {organization?.logo ? (
                <img src={organization.logo} alt={organization.name} className="h-16 mb-6 object-contain" />
              ) : (
                <h1 className="auth-brand-title">{organization.name}</h1>
              )}
              <p className="auth-brand-subtitle">Resource Booking System</p>

              <div className="auth-brand-divider" aria-hidden="true" />

              <p className="auth-brand-tagline">
                Streamline your resource management and booking experience
              </p>
            </div>

            <div className="auth-brand-footer">© 2026 RBS Enterprise. All rights reserved.</div>
          </aside>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', padding: 'var(--spacing-6)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
            {organization?.logo ? (
              <img src={organization.logo} alt={organization.name} className="h-12 mx-auto mb-2 object-contain" />
            ) : (
              <h2 style={{ color: 'var(--color-primary)' }}>{organization.name}</h2>
            )}
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Resource Booking System</p>
          </div>
          <Outlet />
        </Card>
      </div>
    </div>
  );
}
