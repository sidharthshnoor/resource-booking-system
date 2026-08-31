import React, { useEffect, useState } from 'react';
import bookingService from '../../services/booking.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';

export default function MyBookings() {
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
        bookingService.getMyBookings(),
        resourceService.getAllResources()
      ]);
      
      const resourceMap = {};
      resourcesRes.resources.forEach(r => {
        resourceMap[r.id] = r;
      });
      setResources(resourceMap);
      
      // Sort newest first
      const sorted = bookingsRes.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingService.cancelBooking(id);
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>My Bookings</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Manage your past and upcoming reservations</p>
      </div>

      <Card noPadding>
        {loading ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading bookings...</div>
        ) : (
          <Table 
            headers={['Resource', 'Date', 'Time', 'Purpose', 'Status', 'Actions']}
            data={bookings}
            emptyMessage="You have no bookings yet."
            renderRow={(booking) => {
              const res = resources[booking.resource_id];
              const startDate = new Date(booking.start_time);
              const endDate = new Date(booking.end_time);
              const isPast = endDate <= new Date();
              
              const canCancel = (booking.status === 'PENDING' || booking.status === 'APPROVED') && !isPast;
              const displayStatus = (booking.status === 'APPROVED' && isPast) ? 'COMPLETED' : booking.status;

              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div style={{ fontWeight: 500 }}>{res?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{res?.location}</div>
                  </TableCell>
                  <TableCell>{format(startDate, 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                  </TableCell>
                  <TableCell>{booking.purpose}</TableCell>
                  <TableCell>
                    <Badge status={displayStatus} />
                  </TableCell>
                  <TableCell>
                    {canCancel && (
                      <Button 
                        variant="ghost" 
                        style={{ color: 'var(--color-status-rejected-text)', padding: '4px 8px' }}
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </Button>
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
