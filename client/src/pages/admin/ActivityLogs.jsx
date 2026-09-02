import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import adminService from '../../services/admin.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';

export default function ActivityLogs() {
  const [events, setEvents] = useState(null);
  useEffect(() => { Promise.all([adminService.getAllBookings(), resourceService.getAllResources()]).then(([bookings, resources]) => { const bookingEvents = bookings.bookings.map(item => ({ id: `booking-${item.id}`, label: `Booking ${item.status.toLowerCase()}`, detail: `${item.user_name || 'User'} requested ${item.resource_name || 'a resource'}`, date: item.updated_at || item.created_at })); const resourceEvents = resources.resources.map(item => ({ id: `resource-${item.id}`, label: 'Resource available', detail: `${item.name} - ${item.location}`, date: item.updated_at || item.created_at })); setEvents([...bookingEvents, ...resourceEvents].sort((a, b) => new Date(b.date) - new Date(a.date))); }).catch(console.error); }, []);
  if (!events) return <div>Loading activity...</div>;
  return <div className="flex flex-col gap-6"><div><h1 style={{ marginBottom: 'var(--spacing-2)' }}>Activity Logs</h1><p style={{ color: 'var(--color-text-secondary)' }}>Recent booking and resource activity available from the existing system records.</p></div><Card>{events.length ? events.map(event => <div key={event.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}><div style={{ color: 'var(--color-secondary)' }}><Activity size={18} /></div><div style={{ flex: 1 }}><strong style={{ display: 'block' }}>{event.label}</strong><span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{event.detail}</span></div><time style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{new Date(event.date).toLocaleString()}</time></div>) : <p>No activity recorded yet.</p>}</Card></div>;
}