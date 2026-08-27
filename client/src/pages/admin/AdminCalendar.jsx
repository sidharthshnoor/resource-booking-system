import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export default function AdminCalendar() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [currentDate] = useState(new Date());

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
      
      // Only show approved or pending on the calendar, ignore rejected/cancelled
      setBookings(bookingsRes.bookings.filter(b => b.status === 'APPROVED' || b.status === 'PENDING'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dayBookings = bookings.filter(b => isSameDay(new Date(b.start_time), date));
      
      days.push(
        <div key={i} style={{ flex: 1, borderRight: i < 6 ? '1px solid var(--color-border)' : 'none', minWidth: '160px' }}>
          <div style={{ padding: 'var(--spacing-3)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
            <div style={{ fontWeight: 600 }}>{format(date, 'EEEE')}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{format(date, 'MMM d')}</div>
          </div>
          
          <div style={{ padding: 'var(--spacing-2)', minHeight: '600px', backgroundColor: 'var(--color-background)' }}>
            {dayBookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map(booking => {
              const res = resources[booking.resource_id];
              const isPending = booking.status === 'PENDING';
              return (
                <div 
                  key={booking.id} 
                  style={{ 
                    padding: 'var(--spacing-2)', 
                    marginBottom: 'var(--spacing-2)', 
                    backgroundColor: isPending ? 'var(--color-status-pending-bg)' : 'var(--color-surface)',
                    border: `1px solid ${isPending ? 'var(--color-status-pending-text)' : 'var(--color-primary)'}`,
                    borderLeft: `4px solid ${isPending ? 'var(--color-status-pending-text)' : 'var(--color-primary)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: '2px' }}>{res?.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>User: {booking.user_id}</div>
                  {isPending && <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'var(--color-status-pending-text)' }}>PENDING</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex" style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        {days}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Master Schedule</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>View all approved and pending bookings across the system.</p>
      </div>

      <Card noPadding>
        {loading ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading schedule...</div>
        ) : (
          renderWeekView()
        )}
      </Card>
    </div>
  );
}
