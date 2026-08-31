import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/booking.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, resourcesRes] = await Promise.all([
          bookingService.getMyBookings(),
          resourceService.getAllResources()
        ]);
        
        // Show only upcoming/recent
        const now = new Date();
        const sorted = bookingsRes.bookings
          .filter(b => b.status !== 'CANCELLED' && new Date(b.end_time) > now)
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 3);
          
        setRecentBookings(sorted);
        setResources(resourcesRes.resources.slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Welcome back, {user?.name.split(' ')[0]}</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          You have {recentBookings.length} upcoming bookings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
        
        {/* Upcoming Bookings */}
        <Card>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 style={{ margin: 0 }}>Upcoming Bookings</h3>
            <Link to="/app/bookings" className="text-label" style={{ fontWeight: 600 }}>View All</Link>
          </div>
          
          {recentBookings.length === 0 ? (
            <div style={{ padding: 'var(--spacing-6) 0', textAlign: 'center', color: 'var(--color-text-placeholder)' }}>
              <CalendarIcon size={32} style={{ margin: '0 auto var(--spacing-2)' }} opacity={0.5} />
              <p>No upcoming bookings</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentBookings.map(booking => {
                const resource = resources.find(r => r.id === booking.resource_id);
                return (
                  <div key={booking.id} style={{ padding: 'var(--spacing-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-2)' }}>
                      <span style={{ fontWeight: 500 }}>{resource?.name || 'Unknown Resource'}</span>
                      <Badge status={booking.status} />
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>
                      <CalendarIcon size={14} />
                      {format(new Date(booking.start_time), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      <Clock size={14} />
                      {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions / Available Resources */}
        <Card>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 style={{ margin: 0 }}>Popular Resources</h3>
            <Link to="/app/resources" className="text-label" style={{ fontWeight: 600 }}>Browse All</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {resources.map(resource => (
              <div key={resource.id} className="flex justify-between items-center" style={{ padding: 'var(--spacing-3) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{resource.name}</h4>
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                    <MapPin size={12} />
                    {resource.location}
                  </div>
                </div>
                <Link to={`/app/resources`}>
                  <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Book</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
