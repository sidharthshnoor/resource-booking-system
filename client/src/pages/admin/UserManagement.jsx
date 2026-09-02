import React, { useEffect, useState } from 'react';
import { Search, Download, Plus } from 'lucide-react';
import adminService from '../../services/admin.service';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [joinedSort, setJoinedSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({ search, role });
      let filteredUsers = response.users || [];
      if (statusFilter !== 'ALL') {
        filteredUsers = filteredUsers.filter(u => u.status === statusFilter);
      }
      if (role !== 'ALL') {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      
      // Sorting
      filteredUsers.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return joinedSort === 'newest' ? timeB - timeA : timeA - timeB;
      });

      setUsers(filteredUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, role, statusFilter, joinedSort]);

  const toggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      alert("You cannot deactivate your own account.");
      return;
    }
    
    const isDeactivating = user.status === 'ACTIVE';
    const confirmMessage = isDeactivating
      ? `Deactivate this user?\n\n${user.name} (${user.email}) will no longer be able to access their account.`
      : `Activate this user?\n\n${user.name} (${user.email}) will regain access to their account.`;
      
    if (!window.confirm(confirmMessage)) return;

    setProcessingId(user.id);
    const newStatus = isDeactivating ? 'DEACTIVATED' : 'ACTIVE';
    try {
      const res = await adminService.updateUserStatus(user.id, newStatus);
      if (res.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus, updated_at: res.updated_at } : u));
        fetchUsers(); // Refresh to ensure data sync
      }
    } catch (err) {
      alert("Failed to update user status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Role,Status,Bookings,Joined\n"
      + users.map(e => `${e.name},${e.email},${e.role},${e.status},${e.booking_count},${format(new Date(e.created_at), 'MMM dd yyyy')}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const deactivatedUsers = users.filter(u => u.status === 'DEACTIVATED').length;

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return (parts[0]?.[0] || '?').toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>User Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review registered users and their booking activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0d9488', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Plus size={16} /> Invite User
          </button>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setStatusFilter('ALL')} 
            style={{ 
              background: statusFilter === 'ALL' ? '#f8fafc' : 'white', 
              color: statusFilter === 'ALL' ? '#0f172a' : '#64748b', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.375rem', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              border: statusFilter === 'ALL' ? '1px solid #cbd5e1' : '1px solid #e2e8f0', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            All ({totalUsers})
          </button>
          
          <button 
            onClick={() => setStatusFilter('ACTIVE')} 
            style={{ 
              background: statusFilter === 'ACTIVE' ? '#ecfdf5' : 'white', 
              color: statusFilter === 'ACTIVE' ? '#059669' : '#64748b', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.375rem', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              border: statusFilter === 'ACTIVE' ? '1px solid #a7f3d0' : '1px solid #e2e8f0', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            Active ({activeUsers})
          </button>
          
          <button 
            onClick={() => setStatusFilter('DEACTIVATED')} 
            style={{ 
              background: statusFilter === 'DEACTIVATED' ? '#fff7ed' : 'white', 
              color: statusFilter === 'DEACTIVATED' ? '#ea580c' : '#64748b', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.375rem', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              border: statusFilter === 'DEACTIVATED' ? '1px solid #fed7aa' : '1px solid #e2e8f0', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            Deactivated ({deactivatedUsers})
          </button>

          <select 
            value={role} 
            onChange={event => setRole(event.target.value)} 
            style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              borderRadius: '0.375rem', 
              padding: '0.5rem 2rem 0.5rem 1rem', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#334155', 
              cursor: 'pointer', 
              outline: 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem top 50%',
              backgroundSize: '0.65rem auto'
            }}>
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search by name or email..." 
              value={search} 
              onChange={event => setSearch(event.target.value)} 
              style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', width: '100%', outline: 'none', fontSize: '0.875rem', color: '#0f172a' }} 
            />
          </div>
          <button style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        <div style={{ overflowX: 'auto' }} className="hide-scrollbar">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>User</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Email</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Role</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Bookings</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Joined</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Last Login</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr key={user.id} style={{ borderBottom: idx !== users.length - 1 ? '1px solid #f1f5f9' : 'none', background: 'white', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                          {getInitials(user.name)}
                        </div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                          {user.name}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: user.role === 'ADMIN' ? '#7c3aed' : '#2563eb', background: user.role === 'ADMIN' ? '#f3e8ff' : '#dbeafe', padding: '4px 8px', borderRadius: '0.25rem' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {user.status === 'ACTIVE' ? (
                          <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '0.25rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#ea580c', background: '#fff7ed', padding: '4px 8px', borderRadius: '0.25rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316' }}></span> Deactivated
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#334155' }}>
                        {user.booking_count}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#334155' }}>
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#334155' }}>
                        {user.last_login ? (
                          <span>{format(new Date(user.last_login), 'MMM dd, yyyy')}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {currentUser?.id === user.id ? (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '6px 0' }}>Current Admin</span>
                        ) : (
                          <button 
                            onClick={() => toggleStatus(user)}
                            disabled={processingId === user.id}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '0.375rem',
                              border: user.status === 'ACTIVE' ? '1px solid #fdba74' : '1px solid #6ee7b7',
                              background: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: processingId === user.id ? 'not-allowed' : 'pointer',
                              opacity: processingId === user.id ? 0.5 : 1,
                              color: user.status === 'ACTIVE' ? '#ea580c' : '#059669',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination placeholder matching the design */}
        {!loading && users.length > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            <div>Showing 1 to {users.length} of {users.length} users</div>
          </div>
        )}
      </div>
    </div>
  );
}