import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import InteractiveCalendar from '../../components/ui/InteractiveCalendar';

export default function AdminCalendar() {
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
      
      // Only show approved or pending on the calendar, ignore rejected/cancelled
      setBookings(bookingsRes.bookings.filter(b => b.status === 'APPROVED' || b.status === 'PENDING'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Master Schedule</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>View all approved and pending bookings across the system.</p>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading schedule...</div>
        ) : (
          <InteractiveCalendar bookings={bookings} resources={resources} isAdmin={true} />
        )}
      </Card>
    </div>
  );
}
