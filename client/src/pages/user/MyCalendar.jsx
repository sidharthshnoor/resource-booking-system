import React, { useEffect, useState } from 'react';
import bookingService from '../../services/booking.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export default function MyCalendar() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Very basic calendar state (just current week for this demo)
  const [currentDate] = useState(new Date());

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
      setBookings(bookingsRes.bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start Monday
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dayBookings = bookings.filter(b => isSameDay(new Date(b.start_time), date));
      
      days.push(
        <div key={i} style={{ flex: 1, borderRight: i < 6 ? '1px solid var(--color-border)' : 'none', minWidth: '150px' }}>
          <div style={{ padding: 'var(--spacing-3)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
            <div style={{ fontWeight: 600 }}>{format(date, 'EEEE')}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{format(date, 'MMM d')}</div>
          </div>
          
          <div style={{ padding: 'var(--spacing-2)', minHeight: '400px' }}>
            {dayBookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map(booking => {
              const res = resources[booking.resource_id];
              return (
                <div 
                  key={booking.id} 
                  style={{ 
                    padding: 'var(--spacing-2)', 
                    marginBottom: 'var(--spacing-2)', 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-secondary)',
                    borderLeft: '4px solid var(--color-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '2px' }}>
                    {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: '2px' }}>{res?.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {booking.purpose}
                  </div>
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
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>My Schedule</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Weekly view of your upcoming reservations</p>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading schedule...</div>
        ) : (
          renderWeekView()
        )}
      </Card>
    </div>
  );
}
