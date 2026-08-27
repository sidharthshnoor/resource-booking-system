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
                    <Badge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    {isPending && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAction(booking.id, 'approve')}
                          style={{ padding: '4px 8px', minWidth: 0, backgroundColor: 'var(--color-success)', color: 'white' }}
                          title="Approve"
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          onClick={() => handleAction(booking.id, 'reject')}
                          style={{ padding: '4px 8px', minWidth: 0, backgroundColor: 'var(--color-error)', color: 'white' }}
                          title="Reject"
                        >
                          <X size={16} />
                        </Button>
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
