import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import Card from '../../components/ui/Card';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminService.getAllBookings();
      const bookings = res.bookings;
      
      setStats({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        approved: bookings.filter(b => b.status === 'APPROVED').length,
        rejected: bookings.filter(b => b.status === 'REJECTED').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        backgroundColor: `${color}20`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '0 0 4px 0' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{value}</h3>
      </div>
    </Card>
  );

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Overview of system activity and booking requests.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-6)' }}>
        <StatCard title="Total Bookings" value={stats.total} icon={<Users size={24} />} color="var(--color-primary)" />
        <StatCard title="Pending Approvals" value={stats.pending} icon={<Clock size={24} />} color="var(--color-status-pending-text)" />
        <StatCard title="Approved" value={stats.approved} icon={<CheckCircle size={24} />} color="var(--color-status-approved-text)" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle size={24} />} color="var(--color-status-rejected-text)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-6)' }}>
        <Card>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 style={{ margin: 0 }}>Action Required</h3>
            <Link to="/admin/bookings" className="text-label" style={{ fontWeight: 600 }}>Review All</Link>
          </div>
          
          {stats.pending > 0 ? (
            <div style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--color-status-pending-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-status-pending-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>{stats.pending} booking requests</strong> are awaiting your approval.
              </div>
              <Link to="/admin/bookings">
                <button style={{ padding: '6px 12px', background: 'var(--color-status-pending-text)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500 }}>
                  Review
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ padding: 'var(--spacing-6) 0', textAlign: 'center', color: 'var(--color-text-placeholder)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto var(--spacing-2)' }} opacity={0.5} />
              <p>All caught up! No pending requests.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
