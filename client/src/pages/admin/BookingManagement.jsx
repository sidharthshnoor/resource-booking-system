import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, resourcesRes] = await Promise.all([
        adminService.getAllBookings(),
        resourceService.getAllResources()
      ]);
      
      const resourceMap = {};
      resourcesRes.resources.forEach(r => {
        resourceMap[r.id] = r;
      });
      setResources(resourceMap);
      
      // Sort pending first, then by date created
      const sorted = bookingsRes.bookings.sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setBookings(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await adminService.approveBooking(id);
      } else {
        await adminService.rejectBooking(id);
      }
      fetchData();
    } catch (err) {
      alert(err.message || `Failed to ${action} booking`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Booking Management</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Review and manage resource reservation requests.</p>
      </div>

      <Card noPadding>
        {loading ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading bookings...</div>
        ) : (
          <Table 
            headers={['ID', 'User', 'Resource', 'Date/Time', 'Purpose', 'Status', 'Actions']}
            data={bookings}
            emptyMessage="No bookings found."
            renderRow={(booking) => {
              const res = resources[booking.resource_id];
              const startDate = new Date(booking.start_time);
              const endDate = new Date(booking.end_time);
              const isPending = booking.status === 'PENDING';
              const isPast = endDate <= new Date();
              const displayStatus = (booking.status === 'APPROVED' && isPast) ? 'COMPLETED' : booking.status;

              return (
                <TableRow key={booking.id} style={{ backgroundColor: isPending ? 'var(--color-status-pending-bg)' : 'transparent' }}>
                  <TableCell style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {booking.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 500 }}>{booking.user_id}</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 500 }}>{res?.name || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>
                    <div>{format(startDate, 'MMM d, yyyy')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>{booking.purpose}</TableCell>
                  <TableCell>
                    <Badge status={displayStatus} />
                  </TableCell>
                  <TableCell>
                    {isPending && (
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleAction(booking.id, 'approve')}
                          title="Approve booking"
                          aria-label="Approve booking"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            padding: 0, 
                            cursor: 'pointer',
                            color: 'var(--color-success, #008a00)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s ease, opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.opacity = '0.8'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        >
                          <Check size={24} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => handleAction(booking.id, 'reject')}
                          title="Reject booking"
                          aria-label="Reject booking"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            padding: 0, 
                            cursor: 'pointer',
                            color: 'var(--color-error, #d32f2f)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s ease, opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.opacity = '0.8'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        >
                          <X size={24} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
