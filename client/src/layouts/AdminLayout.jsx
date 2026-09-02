import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  BarChart3,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  User as UserIcon,
  Users,
  Warehouse
} from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-full w-full">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const navGroups = [
    {
      label: 'Main',
      items: [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Resource Management', path: '/admin/resources', icon: <Warehouse size={18} /> },
        { label: 'Booking Management', path: '/admin/bookings', icon: <ClipboardList size={18} /> },
        { label: 'Admin Calendar', path: '/admin/calendar', icon: <Calendar size={18} /> },
      ]
    },
    {
      label: 'Management',
      items: [
        { label: 'User Management', path: '/admin/users', icon: <Users size={18} /> },
        { label: 'Reports & Analytics', path: '/admin/reports', icon: <BarChart3 size={18} /> },
        { label: 'Activity Logs', path: '/admin/activity', icon: <Activity size={18} /> },
      ]
    },
    {
      label: 'System',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
      ]
    }
  ];
  const navItems = navGroups.flatMap(group => group.items);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--color-text-inverse)', fontSize: '1.25rem' }}>RBS Admin</h2>
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--spacing-4) 0', overflowY: 'auto' }}>
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 'var(--spacing-4)' }}>
              <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.42)', padding: '0 var(--spacing-6)', marginBottom: 'var(--spacing-2)' }}>
                {group.label}
              </p>
              {group.items.map(item => {
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
            </div>
          ))}
        </nav>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={20} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Administrator</p>
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
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Admin Area'}
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
