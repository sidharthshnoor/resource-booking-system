import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
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
  Warehouse,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();
  const { organization } = useOrganization();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center h-full w-full">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/org/${organization.slug}/login`} replace />;
  }

  if (user.organization_id !== organization.id) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You are not authorized to view this organization's data.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={`/org/${organization.slug}/app/dashboard`} replace />;
  }

  const navGroups = [
    {
      label: 'Main',
      items: [
        { label: 'Admin Dashboard', path: `/org/${organization.slug}/admin/dashboard`, icon: <LayoutDashboard size={18} /> },
        { label: 'Resource Management', path: `/org/${organization.slug}/admin/resources`, icon: <Warehouse size={18} /> },
        { label: 'Booking Management', path: `/org/${organization.slug}/admin/bookings`, icon: <ClipboardList size={18} /> },
        { label: 'Admin Calendar', path: `/org/${organization.slug}/admin/calendar`, icon: <Calendar size={18} /> },
      ]
    },
    {
      label: 'Management',
      items: [
        { label: 'User Management', path: `/org/${organization.slug}/admin/users`, icon: <Users size={18} /> },
        { label: 'Reports & Analytics', path: `/org/${organization.slug}/admin/reports`, icon: <BarChart3 size={18} /> },
        { label: 'Activity Logs', path: `/org/${organization.slug}/admin/activity`, icon: <Activity size={18} /> },
      ]
    },
    {
      label: 'System',
      items: [
        { label: 'Settings', path: `/org/${organization.slug}/admin/settings`, icon: <Settings size={18} /> },
      ]
    }
  ];
  
  const navItems = navGroups.flatMap(group => group.items);
  const currentTitle = navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Admin Area';

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'mobile-open' : ''}`} 
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {organization?.logo ? (
            <img src={organization.logo} alt={organization.name} style={{ height: '32px', objectFit: 'contain' }} />
          ) : (
            <h2 className="sidebar-header-text" style={{ color: 'var(--color-text-inverse)', fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>{organization.name} Admin</h2>
          )}
          {/* Mobile close button inside sidebar */}
          <button className="md:hidden" onClick={() => setIsMobileSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: window.innerWidth <= 1024 ? 'block' : 'none' }}>
            <X size={20} />
          </button>
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--spacing-4) 0', overflowY: 'auto' }} className="hide-scrollbar">
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 'var(--spacing-4)' }}>
              <p className="text-label-sm sidebar-group-label" style={{ color: 'rgba(255,255,255,0.42)', padding: '0 var(--spacing-6)', marginBottom: 'var(--spacing-2)', whiteSpace: 'nowrap' }}>
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
                  whiteSpace: 'nowrap'
                };
                
                return (
                  <Link key={item.path} to={item.path} style={linkStyle} className="sidebar-nav-item" title={item.label}>
                    <div style={{ flexShrink: 0 }}>{item.icon}</div>
                    <span className="sidebar-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4 sidebar-user-info" style={{ whiteSpace: 'nowrap' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserIcon size={20} color="white" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="sidebar-nav-item"
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Logout"
          >
            <div style={{ flexShrink: 0 }}><LogOut size={16} /></div>
            <span className="sidebar-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button 
            onClick={toggleSidebar}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-primary)',
              borderRadius: '4px'
            }}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentTitle}
          </h2>
        </header>
        <div className="page-content">
          <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
