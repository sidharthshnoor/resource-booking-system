import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import bookingService from '../../services/booking.service';
import { Info, MapPin, Users, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';

export default function ResourceDetails({ resource, isOpen, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [resourceBookings, setResourceBookings] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(new Date());

  useEffect(() => {
    if (isOpen && resource) {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resource]);

  const fetchAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const res = await bookingService.getResourceBookings(resource.id);
      setResourceBookings(res.bookings || []);
    } catch (err) {
      console.error('Failed to load availability', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      setError('Please fill in all fields');
      return;
    }

    const startDateTimeStr = `${formData.date}T${formData.startTime}`;
    const endDateTimeStr = `${formData.date}T${formData.endTime}`;
    
    const startDateObj = new Date(startDateTimeStr);
    const endDateObj = new Date(endDateTimeStr);
    const now = new Date();

    if (startDateObj < now) {
      setError('Bookings cannot be made for a time that has already passed.');
      return;
    }

    if (startDateObj >= endDateObj) {
      setError('End time must be after start time');
      return;
    }

    // Overlap validation
    const hasOverlap = resourceBookings.some(b => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return startDateObj < bEnd && endDateObj > bStart;
    });

    if (hasOverlap) {
      setError('This resource is already booked during the selected time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await bookingService.createBooking({
        resource_id: resource.id,
        start_time: startDateObj.toISOString(),
        end_time: endDateObj.toISOString(),
        purpose: formData.purpose
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/app/bookings');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to schedule booking');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Booking Confirmed">
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <h3 style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-2)' }}>Success!</h3>
          <p>Your booking request for {resource.name} has been submitted.</p>
        </div>
      </Modal>
    );
  }

  const renderAvailability = () => {
    const dayBookings = resourceBookings.filter(b => isSameDay(new Date(b.start_time), availabilityDate));

    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-gray-100 p-2 rounded" style={{ backgroundColor: 'var(--color-surface-muted)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}>
          <Button variant="ghost" type="button" onClick={() => setAvailabilityDate(subDays(availabilityDate, 1))} style={{ padding: 'var(--spacing-2)' }}>
            <ChevronLeft size={20} />
          </Button>
          <div style={{ fontWeight: 600 }}>{format(availabilityDate, 'MMMM d, yyyy')}</div>
          <Button variant="ghost" type="button" onClick={() => setAvailabilityDate(addDays(availabilityDate, 1))} style={{ padding: 'var(--spacing-2)' }}>
            <ChevronRight size={20} />
          </Button>
        </div>

        <div style={{ minHeight: '250px', maxHeight: '400px', overflowY: 'auto' }}>
          {availabilityLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>Loading availability...</div>
          ) : dayBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>Available all day</div>
          ) : (
            <div className="flex flex-col gap-2">
              {dayBookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map(b => (
                <div key={b.id} style={{ 
                  padding: 'var(--spacing-3)', 
                  backgroundColor: 'var(--color-status-rejected-bg)', 
                  borderLeft: '4px solid var(--color-status-rejected-text)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-status-rejected-text)' }}>
                    {format(new Date(b.start_time), 'h:mm a')} - {format(new Date(b.end_time), 'h:mm a')}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Occupied</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const footer = (
    <div className="flex justify-between items-center w-full">
      <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
      <div className="flex gap-2">
        <Button variant="outline" type="button" onClick={() => setAvailabilityMode(!availabilityMode)}>
          {availabilityMode ? 'Back to Booking' : 'View Availability'}
        </Button>
        {!availabilityMode && <Button isLoading={loading} type="submit" form="booking-form">Submit Booking</Button>}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={availabilityMode ? `Availability: ${resource.name}` : `Schedule: ${resource.name}`} footer={footer}>
      <div className="flex flex-col gap-6">
        
        {/* Resource Summary */}
        <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: '0 0 var(--spacing-2) 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{resource.description}</p>
          <div className="flex gap-4" style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
            <span className="flex items-center gap-1"><MapPin size={14}/> {resource.location}</span>
            <span className="flex items-center gap-1"><Users size={14}/> {resource.capacity}</span>
            <span className="flex items-center gap-1"><Info size={14}/> {resource.type}</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-status-rejected-bg)', color: 'var(--color-status-rejected-text)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {availabilityMode ? (
          renderAvailability()
        ) : (
          /* Booking Form */
          <form id="booking-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input 
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            
            <div className="flex gap-4">
              <Input 
                label="Start Time"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
              <Input 
                label="End Time"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <Input 
              label="Purpose"
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g. Quarterly Planning Meeting"
              required
            />
          </form>
        )}
      </div>
    </Modal>
  );
}
