import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, User as UserIcon, Menu, X, LayoutDashboard, Search, Bell, ChevronDown } from 'lucide-react';

export default function SuperAdminLayout() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen w-full bg-gray-50 text-gray-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'SUPER_ADMIN') {
    // If they aren't a SUPER_ADMIN, they shouldn't be here.
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white p-8">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Global management interface requires Super Administrator privileges.</p>
          <button 
            onClick={logout}
            className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Global Dashboard', path: '/super-admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Organizations', path: '/super-admin/organizations', icon: <Building2 size={20} /> },
  ];

  const currentTitle = navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Super Admin';

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
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`} style={{ backgroundColor: '#0f172a' }}>
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="sidebar-header-text" style={{ color: '#38bdf8', fontSize: '1.25rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden' }}>RBS Global</h2>
          {/* Mobile close button inside sidebar */}
          <button className="md:hidden" onClick={() => setIsMobileSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: window.innerWidth <= 1024 ? 'block' : 'none' }}>
            <X size={20} />
          </button>
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--spacing-4) 0', overflowY: 'auto' }} className="hide-scrollbar">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path) || (item.path === '/super-admin/organizations' && location.pathname === '/super-admin');
            const linkStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-3) var(--spacing-6)',
              color: isActive ? '#38bdf8' : 'rgba(255,255,255,0.7)',
              backgroundColor: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
              borderLeft: `4px solid ${isActive ? '#38bdf8' : 'transparent'}`,
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
        </nav>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4 sidebar-user-info" style={{ whiteSpace: 'nowrap' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserIcon size={20} color="#38bdf8" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Super Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="sidebar-nav-item hover:bg-slate-800 transition-colors"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 'var(--spacing-2)', 
              padding: 'var(--spacing-2)',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#cbd5e1',
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
      <main className="main-content bg-slate-50">
        <header className="topbar border-b border-slate-200 bg-white">
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
          <div className="super-admin-search">
            <Search size={16} />
            <input
              value={globalSearch}
              onChange={(event) => {
                setGlobalSearch(event.target.value);
                window.dispatchEvent(new CustomEvent('super-admin-search', { detail: event.target.value }));
              }}
              placeholder={location.pathname.includes('/dashboard') ? 'Search organizations, users, or anything...' : 'Search organizations, slug, or keyword...'}
              aria-label="Search organizations"
            />
          </div>
          <div className="super-admin-header-actions">
          </div>
        </header>
        <div className="page-content">
          <div className="container" style={{ maxWidth: '100%', padding: '24px' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
