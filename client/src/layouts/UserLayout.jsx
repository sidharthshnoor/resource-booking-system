import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Search, LogOut, User as UserIcon } from 'lucide-react';

export default function UserLayout() {
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-full w-full">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Browse Resources', path: '/app/resources', icon: <Search size={20} /> },
    { label: 'My Bookings', path: '/app/bookings', icon: <Calendar size={20} /> },
    { label: 'My Calendar', path: '/app/calendar', icon: <Calendar size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--color-text-inverse)', fontSize: '1.25rem' }}>RBS Enterprise</h2>
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--spacing-4) 0' }}>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            const linkStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-3) var(--spacing-6)',
              color: isActive ? 'var(--color-secondary-bg)' : 'rgba(255,255,255,0.7)',
              backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'transparent',
              borderLeft: `4px solid ${isActive ? 'var(--color-secondary-bg)' : 'transparent'}`,
              textDecoration: 'none',
              fontWeight: isActive ? '500' : '400',
              transition: 'all 0.2s',
            };
            
            return (
              <Link key={item.path} to={item.path} style={linkStyle}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={20} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>User</p>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 'var(--spacing-2)', 
              padding: 'var(--spacing-2)',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Application'}
          </h2>
        </header>
        <div className="page-content">
          <div className="container">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
